'use client';

import React, { useState } from 'react';
import { Message } from '../lib/types';
import { parseMarkdownBlocks } from '../lib/markdown';
import { CopyIcon, CheckIcon, RefreshIcon, UserIcon, BotIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  isLatestAssistant?: boolean;
  onRegenerate?: () => void;
}

export function ChatMessage({ message, isLatestAssistant, onRegenerate }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const blocks = parseMarkdownBlocks(message.content);

  return (
    <div
      className={`group w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-zinc-900/40 border-y border-zinc-800/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
            isUser
              ? 'bg-blue-600 text-white shadow-sm'
              : isSystem
              ? 'bg-amber-600 text-white'
              : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
          }`}
        >
          {isUser ? <UserIcon size={16} /> : <BotIcon size={16} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-200">
                {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
              </span>
              {message.model && !isUser && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono text-[10px]">
                  {message.model}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopy(message.content, message.id)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                title="Copy message text"
              >
                {copiedId === message.id ? (
                  <>
                    <CheckIcon size={13} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={13} />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>

              {isLatestAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                  title="Regenerate this response"
                >
                  <RefreshIcon size={13} />
                  <span className="text-[10px]">Retry</span>
                </button>
              )}
            </div>
          </div>

          {/* Rendered content */}
          <div className="text-sm leading-relaxed text-zinc-200 break-words space-y-3">
            {blocks.map((block, idx) => {
              if (block.type === 'code') {
                const codeId = `${message.id}-code-${idx}`;
                return (
                  <div
                    key={idx}
                    className="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-md"
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                      <span>{block.language || 'text'}</span>
                      <button
                        onClick={() => handleCopy(block.content, codeId)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                      >
                        {copiedId === codeId ? (
                          <>
                            <CheckIcon size={12} className="text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon size={12} />
                            <span className="text-[11px]">Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 overflow-x-auto text-xs text-zinc-200 font-mono bg-zinc-950/90 leading-normal">
                      <code>{block.content}</code>
                    </pre>
                  </div>
                );
              }

              if (block.type === 'heading') {
                const Tag = `h${Math.min(block.level || 3, 5)}` as keyof React.JSX.IntrinsicElements;
                return (
                  <Tag
                    key={idx}
                    className={`font-semibold text-zinc-100 ${
                      block.level === 1 ? 'text-lg mt-4 mb-2' : 'text-base mt-3 mb-1'
                    }`}
                  >
                    {block.content}
                  </Tag>
                );
              }

              return (
                <p key={idx} className="whitespace-pre-wrap leading-relaxed text-zinc-200">
                  {block.content}
                </p>
              );
            })}

            {/* Blinking cursor if streaming */}
            {message.isStreaming && (
              <span className="cursor-blink" title="Streaming..." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
