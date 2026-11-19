import { Conversation, GenerationSettings } from './types';
import { DEFAULT_SETTINGS } from './models';

const CONVERSATIONS_STORAGE_KEY = 'llm_playground_conversations_v1';
const ACTIVE_CONVERSATION_KEY = 'llm_playground_active_id_v1';
const SETTINGS_STORAGE_KEY = 'llm_playground_settings_v1';

export function createNewConversation(settings?: Partial<GenerationSettings>): Conversation {
  const now = Date.now();
  return {
    id: 'conv_' + Math.random().toString(36).substring(2, 9) + '_' + now,
    title: 'New Conversation',
    createdAt: now,
    updatedAt: now,
    messages: [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
    },
  };
}

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load conversations from localStorage:', e);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations to localStorage:', e);
  }
}

export function loadActiveConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
  } catch {}
}

export function loadDefaultSettings(): GenerationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveDefaultSettings(settings: GenerationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}
