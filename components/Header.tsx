'use client';

import React from 'react';
import { ModelConfig, ApiStatus } from '../lib/types';
import {
  SparklesIcon,
  PlusIcon,
  DownloadIcon,
  SlidersIcon,
  MessageSquareIcon,
  KeyIcon,
} from './Icons';

interface HeaderProps {
  currentModel: ModelConfig;
  apiStatus: ApiStatus | null;
  onNewChat: () => void;
  onOpenExport: () => void;
  onOpenApiKeys: () => void;
  onToggleSidebar: () => void;
  onToggleSettings: () => void;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
}

export function Header({
  currentModel,
  apiStatus,
  onNewChat,
  onOpenExport,
  onOpenApiKeys,
  onToggleSidebar,
  onToggleSettings,
  isSidebarOpen,
  isSettingsOpen,
}: HeaderProps) {
  // Count active live providers
  const activeCount = apiStatus
    ? [apiStatus.openai, apiStatus.anthropic, apiStatus.google, apiStatus.groq, apiStatus.deepseek].filter(Boolean).length
    : 0;

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between z-20 flex-shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg border transition-colors ${
            isSidebarOpen
              ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
              : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle conversation history"
        >
          <MessageSquareIcon size={17} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <SparklesIcon size={16} />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100 hidden sm:inline">
            LLM Playground
          </span>
        </div>

        {/* Model badge */}
        <div
          onClick={onToggleSettings}
          className="cursor-pointer hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors"
          title="Click to change model & parameters"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-zinc-200">{currentModel.name}</span>
          <span className="text-[10px] text-zinc-500 font-mono">({currentModel.providerName})</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* API key status indicator button */}
        <button
          onClick={onOpenApiKeys}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs text-zinc-300 transition-colors"
          title="View API Keys & Connection Status"
        >
          <KeyIcon size={14} className={activeCount > 0 ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="hidden sm:inline">
            {activeCount > 0 ? `${activeCount} API Key${activeCount > 1 ? 's' : ''}` : 'Simulation Mode'}
          </span>
        </button>

        {/* Export chat button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
          title="Export current chat (Markdown, JSON, TXT)"
        >
          <DownloadIcon size={15} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* New chat button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors"
          title="Start a new conversation"
        >
          <PlusIcon size={15} />
          <span>New Chat</span>
        </button>

        {/* Settings drawer toggle button */}
        <button
          onClick={onToggleSettings}
          className={`p-2 rounded-lg border transition-colors ${
            isSettingsOpen
              ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
              : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle model parameters & system prompt"
        >
          <SlidersIcon size={17} />
        </button>
      </div>
    </header>
  );
}
