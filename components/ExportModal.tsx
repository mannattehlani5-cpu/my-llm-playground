'use client';

import React, { useState } from 'react';
import { Conversation } from '../lib/types';
import { CloseIcon, DownloadIcon, CopyIcon, CheckIcon } from './Icons';

interface ExportModalProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ conversation, isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'markdown' | 'json' | 'text'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateExportContent = (): string => {
    if (format === 'json') {
      return JSON.stringify(conversation, null, 2);
    }

    if (format === 'markdown') {
      const header = `# ${conversation.title}\n\n` +
        `*Exported on ${new Date().toLocaleString()}*\n` +
        `*Model: ${conversation.settings.model} | Temperature: ${conversation.settings.temperature}*\n\n` +
        (conversation.settings.systemPrompt
          ? `> **System Prompt:**\n> ${conversation.settings.systemPrompt.replace(/\n/g, '\n> ')}\n\n---\n\n`
          : '---\n\n');

      const body = conversation.messages
        .map(m => {
          const author = m.role === 'user' ? '### 👤 User' : '### 🤖 Assistant';
          return `${author}\n\n${m.content}\n`;
        })
        .join('\n---\n\n');

      return header + body;
    }

    // Plain text format
    const lines: string[] = [
      `TITLE: ${conversation.title}`,
      `DATE: ${new Date().toLocaleString()}`,
      `MODEL: ${conversation.settings.model}`,
      '--------------------------------------------------',
      '',
    ];

    if (conversation.settings.systemPrompt) {
      lines.push(`SYSTEM: ${conversation.settings.systemPrompt}`, '');
    }

    for (const m of conversation.messages) {
      lines.push(`${m.role.toUpperCase()}:`, m.content, '');
    }

    return lines.join('\n');
  };

  const content = generateExportContent();

  const handleDownload = () => {
    const extensions = { markdown: 'md', json: 'json', text: 'txt' };
    const ext = extensions[format];
    const mimeTypes = {
      markdown: 'text/markdown;charset=utf-8;',
      json: 'application/json;charset=utf-8;',
      text: 'text/plain;charset=utf-8;',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = conversation.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    link.href = url;
    link.download = `${safeTitle || 'conversation'}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DownloadIcon size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Export Conversation</h2>
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
          {/* Format selection tabs */}
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Choose Format</label>
            <div className="flex gap-2">
              {(['markdown', 'json', 'text'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs capitalize font-medium transition-colors ${
                    format === fmt
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {fmt === 'markdown' ? 'Markdown (.md)' : fmt === 'json' ? 'JSON (.json)' : 'Plain Text (.txt)'}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400">
              <label className="font-medium text-zinc-300">Preview</label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {conversation.messages.length} messages • {content.length} characters
              </span>
            </div>
            <pre className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        </div>

        {/* Actions footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <CopyIcon size={14} />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition-colors"
          >
            <DownloadIcon size={14} />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
