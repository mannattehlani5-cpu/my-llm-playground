'use client';

import React from 'react';
import { ApiStatus } from '../lib/types';
import { CloseIcon, KeyIcon, CheckIcon } from './Icons';

interface ApiKeysModalProps {
  status: ApiStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeysModal({ status, isOpen, onClose }: ApiKeysModalProps) {
  if (!isOpen) return null;

  const providers = [
    {
      name: 'OpenAI',
      models: 'gpt-4o, gpt-4o-mini, o1-mini, gpt-4-turbo',
      envVar: 'OPENAI_API_KEY',
      isReady: Boolean(status?.openai),
      url: 'https://platform.openai.com/api-keys',
    },
    {
      name: 'Anthropic Claude',
      models: 'claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus',
      envVar: 'ANTHROPIC_API_KEY',
      isReady: Boolean(status?.anthropic),
      url: 'https://console.anthropic.com/settings/keys',
    },
    {
      name: 'Google Gemini',
      models: 'gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp',
      envVar: 'GEMINI_API_KEY',
      isReady: Boolean(status?.google),
      url: 'https://aistudio.google.com/app/apikey',
    },
    {
      name: 'Groq',
      models: 'llama-3.3-70b, llama-3.1-8b, mixtral-8x7b',
      envVar: 'GROQ_API_KEY',
      isReady: Boolean(status?.groq),
      url: 'https://console.groq.com/keys',
    },
    {
      name: 'DeepSeek',
      models: 'deepseek-chat, deepseek-reasoner',
      envVar: 'DEEPSEEK_API_KEY',
      isReady: Boolean(status?.deepseek),
      url: 'https://platform.deepseek.com/api_keys',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyIcon size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-zinc-100">API Keys & Model Status</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
          {/* Security Banner */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 leading-relaxed space-y-1">
            <div className="font-semibold text-blue-200 flex items-center gap-1.5">
              <span>🛡️ Server-Side Security Isolation</span>
            </div>
            <p className="text-[11px] text-blue-300/90">
              API keys are stored exclusively in your server&apos;s <code>.env.local</code> file and processed by <code>app/api/chat/route.ts</code>. They are <strong>never</strong> exposed to the client browser.
            </p>
          </div>

          {/* Providers List */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-300">Provider Connection Status</label>
            <div className="space-y-2">
              {providers.map(p => (
                <div
                  key={p.name}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-200">{p.name}</span>
                      <code className="text-[10px] text-zinc-500">{p.envVar}</code>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate">{p.models}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.isReady ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium text-[10px]">
                        <CheckIcon size={11} /> Ready
                      </span>
                    ) : (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      >
                        Get Key →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-1.5 text-zinc-400 text-[11px] pt-2">
            <div className="font-medium text-zinc-300">How to add keys:</div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 leading-normal">
              <li>Open or create <code>.env.local</code> in your project root.</li>
              <li>Add your provider keys (e.g. <code>OPENAI_API_KEY=sk-...</code>).</li>
              <li>Restart the Next.js dev server (<code>npm run dev</code>).</li>
            </ol>
            <p className="text-zinc-500 pt-1">
              *When no API key is supplied for a model, the playground operates in high-fidelity <strong>Simulation Mode</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
