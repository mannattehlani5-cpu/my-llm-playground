'use client';

import React, { useRef, useEffect } from 'react';
import { Message, ModelConfig } from '../lib/types';
import { ChatMessage } from './ChatMessage';
import { STARTER_PROMPTS } from '../lib/presets';
import { SparklesIcon } from './Icons';

interface ChatAreaProps {
  messages: Message[];
  currentModel: ModelConfig;
  isStreaming: boolean;
  onSendPrompt: (prompt: string) => void;
  onRegenerate: () => void;
  error: string | null;
}

export function ChatArea({
  messages,
  currentModel,
  isStreaming,
  onSendPrompt,
  onRegenerate,
  error,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // If there are no messages, show welcoming empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-2">
            <SparklesIcon size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              LLM Playground
            </h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Test frontier models with real-time streaming, adjust temperature and max tokens, customize system prompts, and export conversations.
            </p>
          </div>

          {/* Model info banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ready with model:</span>
            <strong className="text-zinc-200">{currentModel.name}</strong>
            <span className="text-[10px] text-zinc-500">({currentModel.contextWindow} context)</span>
          </div>

          {/* Starter prompt cards */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSendPrompt(item.prompt)}
                className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all text-left group shadow-xs"
              >
                <div className="font-medium text-xs text-zinc-200 group-hover:text-blue-400 transition-colors flex items-center justify-between">
                  <span>{item.title}</span>
                  <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Error banner */}
      {error && (
        <div className="max-w-4xl mx-auto my-3 px-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="divide-y divide-zinc-800/30">
        {messages.map((message, idx) => {
          const isLatestAssistant =
            !isStreaming &&
            message.role === 'assistant' &&
            idx === messages.length - 1;

          return (
            <ChatMessage
              key={message.id}
              message={message}
              isLatestAssistant={isLatestAssistant}
              onRegenerate={onRegenerate}
            />
          );
        })}
      </div>

      <div ref={bottomRef} className="h-6" />
    </div>
  );
}
