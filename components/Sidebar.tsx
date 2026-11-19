'use client';

import React, { useState } from 'react';
import { Conversation } from '../lib/types';
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  MessageSquareIcon,
  CloseIcon,
  CheckIcon,
} from './Icons';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClearAll,
  isOpen,
  onClose,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const startEditing = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEditing = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Top bar */}
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Conversations
            </span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              {conversations.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onNew}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="New Chat"
            >
              <PlusIcon size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 lg:hidden transition-colors"
              title="Close sidebar"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-2 border-b border-zinc-800/60">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 focus:border-blue-500 focus:outline-none text-xs text-zinc-200 placeholder-zinc-500"
          />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              {search ? 'No conversations match search.' : 'No conversations yet.'}
            </div>
          ) : (
            filtered.map(c => {
              const isActive = c.id === activeId;
              const isEditing = editingId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isActive
                      ? 'bg-zinc-800/90 text-zinc-100 font-medium'
                      : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                    <MessageSquareIcon
                      size={14}
                      className={isActive ? 'text-blue-400 flex-shrink-0' : 'text-zinc-500 flex-shrink-0'}
                    />
                    {isEditing ? (
                      <form
                        onSubmit={e => saveEditing(c.id, e)}
                        className="flex-1 flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={() => saveEditing(c.id)}
                          autoFocus
                          className="w-full px-1 py-0.5 rounded bg-zinc-900 border border-blue-500 text-zinc-100 text-xs focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 hover:text-emerald-400 text-zinc-400"
                        >
                          <CheckIcon size={12} />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{c.title || 'Untitled Chat'}</span>
                    )}
                  </div>

                  {/* Actions on hover */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => startEditing(c, e)}
                        className="p-1 rounded hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200"
                        title="Rename conversation"
                      >
                        <EditIcon size={12} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm('Delete this conversation?')) {
                            onDelete(c.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                        title="Delete conversation"
                      >
                        <TrashIcon size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="p-2 border-t border-zinc-800">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete ALL conversations? This cannot be undone.')) {
                  onClearAll();
                }
              }}
              className="w-full py-1.5 px-2 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <TrashIcon size={13} />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
