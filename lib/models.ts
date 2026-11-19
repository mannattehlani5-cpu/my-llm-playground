import { ModelConfig } from './types';

export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    providerName: 'OpenAI',
    description: 'High-intelligence flagship multimodal model for complex reasoning and tasks',
    contextWindow: '128k',
    maxOutput: 4096,
    badge: 'Flagship',
    recommendedTemp: 0.7,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    providerName: 'OpenAI',
    description: 'Fast, cost-efficient small model for everyday reasoning and low latency',
    contextWindow: '128k',
    maxOutput: 4096,
    badge: 'Economy',
    recommendedTemp: 0.7,
  },
  {
    id: 'o1-mini',
    name: 'o1-mini',
    provider: 'openai',
    providerName: 'OpenAI',
    description: 'Faster reasoning model optimized for STEM, math, and code generation',
    contextWindow: '128k',
    maxOutput: 8192,
    badge: 'Reasoning',
    recommendedTemp: 1.0,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    providerName: 'OpenAI',
    description: 'Legacy high-capability model with 128k context support',
    contextWindow: '128k',
    maxOutput: 4096,
    badge: 'Flagship',
    recommendedTemp: 0.7,
  },

  // Anthropic Claude
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    providerName: 'Anthropic',
    description: 'State-of-the-art coding, nuanced writing, and complex system design',
    contextWindow: '200k',
    maxOutput: 8192,
    badge: 'Flagship',
    recommendedTemp: 0.6,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    providerName: 'Anthropic',
    description: 'Next-generation lightning fast model with near-Sonnet reasoning capability',
    contextWindow: '200k',
    maxOutput: 8192,
    badge: 'Fast',
    recommendedTemp: 0.7,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    providerName: 'Anthropic',
    description: 'Deep analytical capability for dense writing, literature, and evaluation',
    contextWindow: '200k',
    maxOutput: 4096,
    badge: 'Flagship',
    recommendedTemp: 0.5,
  },

  // Google Gemini
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    providerName: 'Google',
    description: 'Massive 2M context window with frontier reasoning across multimodal inputs',
    contextWindow: '2M',
    maxOutput: 8192,
    badge: 'Flagship',
    recommendedTemp: 0.7,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    providerName: 'Google',
    description: 'High-frequency ultra-fast model with 1M context window for high throughput',
    contextWindow: '1M',
    maxOutput: 8192,
    badge: 'Fast',
    recommendedTemp: 0.7,
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    providerName: 'Google',
    description: 'Next-generation Gemini multimodal model with enhanced coding and speed',
    contextWindow: '1M',
    maxOutput: 8192,
    badge: 'Fast',
    recommendedTemp: 0.7,
  },

  // Groq / Open Source
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    providerName: 'Groq / Meta',
    description: 'Meta flagship open-weight 70B model running at blazing speed on Groq LPUs',
    contextWindow: '128k',
    maxOutput: 4096,
    badge: 'Fast',
    recommendedTemp: 0.6,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    providerName: 'Groq / Meta',
    description: 'Ultra-low latency open-weight model for rapid prototyping and summaries',
    contextWindow: '128k',
    maxOutput: 4096,
    badge: 'Economy',
    recommendedTemp: 0.7,
  },

  // DeepSeek
  {
    id: 'deepseek-chat',
    name: 'DeepSeek-V3',
    provider: 'deepseek',
    providerName: 'DeepSeek',
    description: 'Powerful Mixture-of-Experts architecture with outstanding general benchmark results',
    contextWindow: '64k',
    maxOutput: 4096,
    badge: 'Flagship',
    recommendedTemp: 0.7,
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek-R1',
    provider: 'deepseek',
    providerName: 'DeepSeek',
    description: 'Open reasoning model with chain-of-thought verification for advanced problem solving',
    contextWindow: '64k',
    maxOutput: 8192,
    badge: 'Reasoning',
    recommendedTemp: 0.6,
  },
];

export const DEFAULT_SETTINGS = {
  model: 'gpt-4o-mini',
  systemPrompt: 'You are an exceptionally capable, thoughtful, and precise AI assistant. Provide direct, insightful, and well-structured answers with clean code examples where applicable.',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
};

export function getModelById(modelId: string): ModelConfig {
  const found = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (found) return found;

  // Fallback for custom or unknown model IDs
  return {
    id: modelId,
    name: modelId,
    provider: 'custom',
    providerName: 'Custom',
    description: 'Custom model endpoint',
    contextWindow: 'Unknown',
    maxOutput: 4096,
    recommendedTemp: 0.7,
  };
}
