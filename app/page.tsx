'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, GenerationSettings, Message, ApiStatus } from '../lib/types';
import { getModelById, DEFAULT_SETTINGS } from '../lib/models';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  createNewConversation,
  loadDefaultSettings,
  saveDefaultSettings,
} from '../lib/storage';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { ChatArea } from '../components/ChatArea';
import { ChatInput } from '../components/ChatInput';
import { ExportModal } from '../components/ExportModal';
import { ApiKeysModal } from '../components/ApiKeysModal';

export default function LLMPlaygroundPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = loadConversations();
    if (saved.length > 0) return saved;
    const initial = createNewConversation(loadDefaultSettings());
    return [initial];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedConvs = loadConversations();
    const savedId = loadActiveConversationId();
    if (savedConvs.length > 0) {
      const exists = savedConvs.some(c => c.id === savedId);
      return exists && savedId ? savedId : savedConvs[0].id;
    }
    return null;
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  // UI Drawer / Modal states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isKeysOpen, setIsKeysOpen] = useState(false);

  // Abort controller ref for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch API status on mount
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setApiStatus(data))
      .catch(() => setApiStatus(null));
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  // Save active conversation ID
  useEffect(() => {
    if (activeId) {
      saveActiveConversationId(activeId);
    }
  }, [activeId]);

  // Resolve active conversation
  const activeConversation =
    conversations.find(c => c.id === activeId) || conversations[0] || null;

  const currentSettings = activeConversation?.settings || DEFAULT_SETTINGS;
  const currentModel = getModelById(currentSettings.model);

  // Handle settings change
  const handleSettingsChange = (newSettings: GenerationSettings) => {
    if (!activeConversation) return;

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation.id
          ? { ...c, settings: newSettings, updatedAt: Date.now() }
          : c
      )
    );
    saveDefaultSettings(newSettings);
  };

  // Start a new chat
  const handleNewChat = () => {
    const newConv = createNewConversation(currentSettings);
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
    setInput('');
    setError(null);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    const remaining = conversations.filter(c => c.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewConversation(currentSettings);
      setConversations([fresh]);
      setActiveId(fresh.id);
    } else {
      setConversations(remaining);
      if (activeId === id) {
        setActiveId(remaining[0].id);
      }
    }
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Clear all conversations
  const handleClearAllConversations = () => {
    const fresh = createNewConversation(currentSettings);
    setConversations([fresh]);
    setActiveId(fresh.id);
  };

  // Core stream sender
  const executeChatRequest = useCallback(
    async (
      messagesToSend: Message[],
      targetConversationId: string,
      settings: GenerationSettings
    ) => {
      setError(null);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const assistantMsgId = 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const placeholderAssistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        model: settings.model,
        isStreaming: true,
      };

      // Add empty assistant placeholder message
      setConversations(prev =>
        prev.map(c =>
          c.id === targetConversationId
            ? {
                ...c,
                messages: [...c.messages, placeholderAssistantMsg],
                updatedAt: Date.now(),
              }
            : c
        )
      );

      try {
        const payloadMessages = messagesToSend.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: payloadMessages,
            model: settings.model,
            systemPrompt: settings.systemPrompt,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            topP: settings.topP,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          let parsedError = errText;
          try {
            parsedError = JSON.parse(errText).error || errText;
          } catch {}
          throw new Error(parsedError);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable response body stream received.');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullAccumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed === 'data: [DONE]') {
              break;
            }

            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.error) {
                  throw new Error(data.error);
                }
                if (data.text) {
                  fullAccumulated += data.text;
                  setConversations(prev =>
                    prev.map(c => {
                      if (c.id !== targetConversationId) return c;
                      return {
                        ...c,
                        messages: c.messages.map(m =>
                          m.id === assistantMsgId
                            ? { ...m, content: fullAccumulated }
                            : m
                        ),
                      };
                    })
                  );
                }
              } catch (parseErr: unknown) {
                if (parseErr instanceof Error && !parseErr.message.includes('JSON')) {
                  throw parseErr;
                }
              }
            }
          }
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') {
          // User deliberately clicked Stop; not an error
        } else {
          console.error('Chat generation error:', err);
          const errorMsg = err instanceof Error ? err.message : 'Failed to complete generation.';
          setError(errorMsg);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;

        // Finalize message: clear streaming cursor
        setConversations(prev =>
          prev.map(c => {
            if (c.id !== targetConversationId) return c;
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantMsgId ? { ...m, isStreaming: false } : m
              ),
              updatedAt: Date.now(),
            };
          })
        );
      }
    },
    []
  );

  // Send message
  const handleSendMessage = () => {
    if (!input.trim() || isStreaming || !activeConversation) return;

    const userContent = input.trim();
    setInput('');

    const userMessage: Message = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      role: 'user',
      content: userContent,
      createdAt: Date.now(),
    };

    // Update title from first user message if it's currently untitled
    const isFirstMessage = activeConversation.messages.length === 0;
    const newTitle = isFirstMessage
      ? userContent.length > 32
        ? userContent.slice(0, 32).trim() + '...'
        : userContent
      : activeConversation.title;

    const updatedMessages = [...activeConversation.messages, userMessage];

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation.id
          ? {
              ...c,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    executeChatRequest(updatedMessages, activeConversation.id, currentSettings);
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (isStreaming || !activeConversation) return;

    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;

    // Remove the last assistant message if present
    const filtered = [...msgs];
    if (filtered[filtered.length - 1].role === 'assistant') {
      filtered.pop();
    }

    if (filtered.length === 0) return;

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation.id
          ? { ...c, messages: filtered, updatedAt: Date.now() }
          : c
      )
    );

    executeChatRequest(filtered, activeConversation.id, currentSettings);
  };

  // Starter prompt clicked
  const handleStarterPrompt = (promptText: string) => {
    setInput(promptText);
  };

  if (!activeConversation) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading LLM Playground...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        currentModel={currentModel}
        apiStatus={apiStatus}
        onNewChat={handleNewChat}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenApiKeys={() => setIsKeysOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSidebarOpen={isSidebarOpen}
        isSettingsOpen={isSettingsOpen}
      />

      {/* Main body: Sidebar + Chat + Settings */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Conversation History Sidebar */}
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={id => {
            setActiveId(id);
            setIsSidebarOpen(false);
          }}
          onNew={handleNewChat}
          onDelete={handleDeleteConversation}
          onRename={handleRenameConversation}
          onClearAll={handleClearAllConversations}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center Chat View */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
          <ChatArea
            messages={activeConversation.messages}
            currentModel={currentModel}
            isStreaming={isStreaming}
            onSendPrompt={handleStarterPrompt}
            onRegenerate={handleRegenerate}
            error={error}
          />

          {/* Bottom Chat Input */}
          <ChatInput
            input={input}
            onChange={setInput}
            onSend={handleSendMessage}
            onStop={handleStopGeneration}
            isStreaming={isStreaming}
          />
        </main>

        {/* Right Settings Drawer */}
        <SettingsDrawer
          settings={currentSettings}
          onChange={handleSettingsChange}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>

      {/* Modals */}
      <ExportModal
        conversation={activeConversation}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <ApiKeysModal
        status={apiStatus}
        isOpen={isKeysOpen}
        onClose={() => setIsKeysOpen(false)}
      />
    </div>
  );
}
