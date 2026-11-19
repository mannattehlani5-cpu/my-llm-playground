'use client';

import React, { useRef, useEffect } from 'react';
import { SendIcon, StopIcon } from './Icons';

interface ChatInputProps {
  input: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({
  input,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  const estimatedTokens = Math.ceil(input.trim().length / 4);

  return (
    <div className="w-full bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/80 p-3 sm:p-4 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-lg focus-within:border-blue-500/80 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
            placeholder={
              isStreaming
                ? 'Model is streaming response...'
                : 'Send a message (Shift + Enter for new line)...'
            }
            className="w-full px-4 pt-3 pb-10 rounded-xl bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
          />

          {/* Bottom input toolbar */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Tokens / length info */}
            <div className="text-[11px] text-zinc-500 font-mono pointer-events-auto">
              {input.trim().length > 0 && (
                <span>
                  ~{estimatedTokens} tokens ({input.trim().length} chars)
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow-md shadow-red-500/20 transition-all"
                  title="Stop generation"
                >
                  <StopIcon size={14} />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSend}
                  disabled={!input.trim() || disabled}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shadow-md shadow-blue-500/20 disabled:shadow-none"
                  title="Send message (Enter)"
                >
                  <SendIcon size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-1.5 text-center text-[10px] text-zinc-500">
          Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[9px]">Shift+Enter</kbd> for newline
        </div>
      </div>
    </div>
  );
}
