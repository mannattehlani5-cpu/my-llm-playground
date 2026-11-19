export interface SystemPromptPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  prompt: string;
}

export const SYSTEM_PROMPT_PRESETS: SystemPromptPreset[] = [
  {
    id: 'helpful',
    name: 'Helpful Assistant',
    badge: 'General',
    description: 'Balanced, polite, and comprehensive',
    prompt: 'You are an exceptionally capable, thoughtful, and precise AI assistant. Provide direct, insightful, and well-structured answers with clear explanations and clean formatting.',
  },
  {
    id: 'senior-engineer',
    name: 'Senior Staff Engineer',
    badge: 'Coding',
    description: 'Production-ready code, edge cases, and design patterns',
    prompt: 'You are a Senior Staff Software Engineer and architect. Provide clean, idiomatic, and production-ready code. Explain architectural tradeoffs, computational complexity, security considerations, and edge cases. Prefer concrete implementations over high-level hand-waving.',
  },
  {
    id: 'concise',
    name: 'Concise & Direct',
    badge: 'Productivity',
    description: 'Zero fluff, bullet points, straight to the point',
    prompt: 'You are a razor-sharp, ultra-concise assistant. Answer questions directly without introductory pleasantries, meta-commentary, or concluding filler. Use tight bullet points and concise code snippets.',
  },
  {
    id: 'socratic',
    name: 'Socratic Tutor',
    badge: 'Learning',
    description: 'Guides understanding through thoughtful questions',
    prompt: 'You are a Socratic tutor and mentor. Instead of simply giving direct answers, guide the user to discover solutions step-by-step by asking probing questions, giving gentle hints, and encouraging critical thinking.',
  },
  {
    id: 'json-api',
    name: 'JSON Data Formatter',
    badge: 'Data',
    description: 'Strict schema-compliant raw JSON output only',
    prompt: 'You are an automated API backend that outputs ONLY raw, valid JSON. Never output conversational explanations, markdown code blocks (```json), or trailing text. The output must parse cleanly with JSON.parse().',
  },
  {
    id: 'creative-writer',
    name: 'Creative Storyteller',
    badge: 'Writing',
    description: 'Vivid imagery, emotional resonance, and strong voice',
    prompt: 'You are an evocative, award-winning writer. Use vivid sensory details, compelling narrative arcs, rhythmic pacing, and unexpected metaphors to craft immersive stories and prose.',
  },
];

export const STARTER_PROMPTS = [
  {
    title: 'Explain Quantum Computing',
    desc: 'Explain qubits, superposition, and entanglement with a clear real-world analogy.',
    prompt: 'Explain quantum computing to a software engineer who understands classical computing. Cover superposition, entanglement, and how quantum computers solve specific algorithmic problems like Shor\'s or Grover\'s.',
  },
  {
    title: 'Write a Streaming SSE Route',
    desc: 'Generate a robust Next.js App Router streaming endpoint with Web Streams.',
    prompt: 'Write a complete Next.js 16 App Router route handler in `app/api/stream/route.ts` that implements a Server-Sent Events (SSE) stream using standard Web `ReadableStream`. Include proper headers and client-side consumption code.',
  },
  {
    title: 'System Design Interview: URL Shortener',
    desc: 'Design TinyURL with scaling, base62 encoding, caching, and rate limiting.',
    prompt: 'Design a scalable URL shortening service (like Bitly / TinyURL) handling 100M new URLs per month and 10B reads per month. Outline schema, hash collision strategy (Base62 vs KGS), caching, and database scaling.',
  },
  {
    title: 'Code Review & Security Audit',
    desc: 'Inspect a sensitive auth handler for race conditions and vulnerabilities.',
    prompt: 'Act as a principal security engineer. What are the top 5 subtle vulnerabilities and race conditions to look out for when implementing refresh tokens and session revocation in modern web applications? Provide mitigation strategies.',
  },
];
