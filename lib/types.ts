export type Role = 'user' | 'assistant' | 'system';

export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  model?: string;
  usage?: TokenUsage;
  isStreaming?: boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'deepseek' | 'custom';
  providerName: string;
  description: string;
  contextWindow: string;
  maxOutput: number;
  badge?: 'Fast' | 'Flagship' | 'Reasoning' | 'Economy' | 'Code';
  recommendedTemp: number;
}

export interface GenerationSettings {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  settings: GenerationSettings;
}

export interface ApiStatus {
  openai: boolean;
  anthropic: boolean;
  google: boolean;
  groq: boolean;
  deepseek: boolean;
  customBaseUrl?: string;
}
