# Polished LLM Playground

An interactive, full-featured Large Language Model (LLM) playground built with Next.js 16 (App Router), React 19, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)

---

## ✨ Features

- **⚡ Real-time SSE Token Streaming:** Token-by-token streaming responses via standard Web Streams and Server-Sent Events (`text/event-stream`), with stop generation control and animated typing indicators.
- **🧠 Multi-Provider Model Selector:** Pre-configured support for frontier models across top providers:
  - **OpenAI:** GPT-4o, GPT-4o mini, o1-mini, GPT-4 Turbo
  - **Anthropic Claude:** Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
  - **Google Gemini:** Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash
  - **Groq / Open-weight:** Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B
  - **DeepSeek:** DeepSeek-V3, DeepSeek-R1
  - **Custom Models:** Support for typing any model ID or custom OpenAI-compatible endpoint (Ollama, vLLM, LM Studio).
- **📝 System Prompt Editor & Presets:** Quick preset personas (*Senior Staff Engineer*, *Concise Problem Solver*, *Socratic Tutor*, *JSON Formatter*, *Creative Writer*) with live character counting.
- **🎛️ Precision Parameter Controls:**
  - **Temperature:** 0.00 (deterministic/code) to 2.00 (creative)
  - **Max Output Tokens:** 64 to 16,384 with quick preset buttons (512, 1024, 2048, 4096)
  - **Top-P (Nucleus Sampling):** 0.05 to 1.00
  - One-click parameter reset to recommended defaults
- **💬 Conversation History & Management:**
  - Auto-saved sessions persisted in browser `localStorage`
  - Inline title editing and deletion
  - Full-text search through past conversations
  - Quick New Chat creation (`Cmd+K` / button)
- **📤 Multi-Format Chat Export:** Export the active thread as **Markdown (`.md`)**, **JSON (`.json`)**, or **Plain Text (`.txt`)**, with live preview and one-click copy to clipboard.
- **🛡️ Server-Side Security Isolation:** All API keys remain strictly in server environment variables (`.env.local`). Browser code never sees API keys or credentials.
- **💡 Built-in Simulation Mode:** If no API keys are provided in `.env.local`, the playground automatically provides realistic streaming responses demonstrating all UI features, parameter bindings, and markdown code formatting out of the box.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys (Optional)
Copy the example environment file to `.env.local`:
```bash
cp .env.example .env.local
```

Add any API keys you wish to use:
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GEMINI_API_KEY=...

# Groq
GROQ_API_KEY=gsk_...

# DeepSeek
DEEPSEEK_API_KEY=sk-...

# Optional: Local / Custom endpoint (Ollama, vLLM, LiteLLM)
# OPENAI_BASE_URL=http://localhost:11434/v1
```

> **Note:** If no API keys are configured, the playground operates in **Simulation Mode** so you can immediately explore and test all UI controls and streaming capabilities.

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port indicated in your console) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Server-side streaming model proxy
│   │   └── status/route.ts    # Secure provider key detection endpoint
│   ├── globals.css            # Base design system & Tailwind classes
│   ├── layout.tsx             # Root layout & typography
│   └── page.tsx               # Main playground state & view orchestration
├── components/
│   ├── ApiKeysModal.tsx       # Provider connection status modal
│   ├── ChatArea.tsx           # Message feed, streaming cursor & empty state
│   ├── ChatInput.tsx          # Auto-growing prompt input with token estimates
│   ├── ChatMessage.tsx        # Message bubbles with markdown & code copy
│   ├── ExportModal.tsx        # Multi-format export dialog
│   ├── Header.tsx             # Navigation bar & status triggers
│   ├── Icons.tsx              # Lightweight SVG icon set
│   ├── SettingsDrawer.tsx     # Model, system prompt & parameter controls
│   └── Sidebar.tsx            # Conversation history with search & renaming
├── lib/
│   ├── markdown.ts            # Markdown parser for code fences & headings
│   ├── models.ts              # Model catalog & default settings
│   ├── presets.ts             # System prompt personas & starter prompts
│   ├── storage.ts             # LocalStorage conversation persistence
│   └── types.ts               # Shared TypeScript schemas
├── scripts/
│   └── build-tailwind.mjs     # Standalone Tailwind CSS compiler
└── .env.example               # Environment variable reference
```
