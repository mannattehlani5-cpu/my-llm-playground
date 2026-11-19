interface ChatRequestPayload {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export async function POST(req: Request) {
  try {
    const body: ChatRequestPayload = await req.json();
    const {
      messages = [],
      model = 'gpt-4o-mini',
      systemPrompt = '',
      temperature = 0.7,
      maxTokens = 2048,
      topP = 1.0,
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine target provider
    const isAnthropic = model.startsWith('claude');
    const isGemini = model.startsWith('gemini');
    const isGroq = model.startsWith('llama') || model.startsWith('mixtral');
    const isDeepSeek = model.startsWith('deepseek');

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const customBaseUrl = process.env.OPENAI_BASE_URL;

    // Check if we should call live API or simulated response
    let stream: ReadableStream;

    if (isAnthropic && anthropicKey) {
      stream = await handleAnthropicStream({
        apiKey: anthropicKey,
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        topP,
      });
    } else if (isGemini && geminiKey) {
      stream = await handleGeminiStream({
        apiKey: geminiKey,
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        topP,
      });
    } else if (isGroq && groqKey) {
      stream = await handleOpenAICompatibleStream({
        apiKey: groqKey,
        baseUrl: 'https://api.groq.com/openai/v1',
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        topP,
      });
    } else if (isDeepSeek && deepseekKey) {
      stream = await handleOpenAICompatibleStream({
        apiKey: deepseekKey,
        baseUrl: 'https://api.deepseek.com/v1',
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        topP,
      });
    } else if (openaiKey || customBaseUrl) {
      // Standard OpenAI or custom base URL (e.g. Ollama/vLLM/Local)
      stream = await handleOpenAICompatibleStream({
        apiKey: openaiKey || 'no-key-required',
        baseUrl: customBaseUrl || 'https://api.openai.com/v1',
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        topP,
      });
    } else {
      // Provider key not configured: provide intelligent simulation stream
      const missingKeyName = isAnthropic
        ? 'ANTHROPIC_API_KEY'
        : isGemini
        ? 'GEMINI_API_KEY'
        : isGroq
        ? 'GROQ_API_KEY'
        : isDeepSeek
        ? 'DEEPSEEK_API_KEY'
        : 'OPENAI_API_KEY';

      stream = createSimulationStream({
        model,
        missingKeyName,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
      });
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    console.error('Chat API Error:', err);
    const message = err instanceof Error ? err.message : 'An error occurred during chat processing.';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ---------------------------------------------------------
// OpenAI / OpenAI-Compatible Stream Handler
// ---------------------------------------------------------
async function handleOpenAICompatibleStream(opts: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}): Promise<ReadableStream> {
  const fullMessages: Array<{ role: string; content: string }> = [];

  if (opts.systemPrompt && opts.systemPrompt.trim()) {
    fullMessages.push({ role: 'system', content: opts.systemPrompt.trim() });
  }

  for (const m of opts.messages) {
    fullMessages.push({ role: m.role, content: m.content });
  }

  const endpoint = opts.baseUrl.replace(/\/+$/, '') + '/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model,
      messages: fullMessages,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      top_p: opts.topP,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI-compatible API error (${response.status}): ${errorBody}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed === 'data: [DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              continue;
            }

            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const deltaText = json.choices?.[0]?.delta?.content;
                if (deltaText) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: deltaText })}\n\n`)
                  );
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown streaming error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });
}

// ---------------------------------------------------------
// Anthropic Claude Stream Handler
// ---------------------------------------------------------
async function handleAnthropicStream(opts: {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}): Promise<ReadableStream> {
  const anthropicMessages = opts.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model,
      system: opts.systemPrompt || undefined,
      messages: anthropicMessages,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature,
      top_p: opts.topP,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: data.delta.text })}\n\n`)
                  );
                } else if (data.type === 'message_stop') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
              } catch {}
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown streaming error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });
}

// ---------------------------------------------------------
// Google Gemini Stream Handler
// ---------------------------------------------------------
async function handleGeminiStream(opts: {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}): Promise<ReadableStream> {
  const contents = opts.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:streamGenerateContent?alt=sse&key=${opts.apiKey}`;

  const requestBody: {
    contents: typeof contents;
    generationConfig: {
      temperature: number;
      maxOutputTokens: number;
      topP: number;
    };
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
  } = {
    contents,
    generationConfig: {
      temperature: opts.temperature,
      maxOutputTokens: opts.maxTokens,
      topP: opts.topP,
    },
  };

  if (opts.systemPrompt && opts.systemPrompt.trim()) {
    requestBody.systemInstruction = {
      parts: [{ text: opts.systemPrompt.trim() }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Gemini API error (${response.status}): ${errorBody}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textPart) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: textPart })}\n\n`)
                  );
                }
              } catch {}
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown streaming error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });
}

// ---------------------------------------------------------
// Smart Simulated Response Generator (Fallback when no key is set)
// ---------------------------------------------------------
function createSimulationStream(opts: {
  model: string;
  missingKeyName: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}): ReadableStream {
  const encoder = new TextEncoder();
  const lastUserMsg = opts.messages[opts.messages.length - 1]?.content || 'Hello';

  // Construct a realistic, rich demonstration response tailored to their query
  const sampleText = `### 🌟 Playground Simulation Mode Active

> **Note:** The server environment does not have **\`${opts.missingKeyName}\`** configured yet.
> To connect live model calls, add your key to \`.env.local\`:
> \`\`\`env
> ${opts.missingKeyName}=your_api_key_here
> \`\`\`

---

#### ⚙️ Active Playground Configuration
- **Selected Model:** \`${opts.model}\`
- **Temperature:** \`${opts.temperature}\` (Range: 0.0 deterministic – 2.0 creative)
- **Max Tokens:** \`${opts.maxTokens}\`
- **System Prompt:** ${opts.systemPrompt ? `"${opts.systemPrompt.slice(0, 80)}..."` : '_None_'}

---

#### 💬 Response to your message:
> _"${lastUserMsg.length > 90 ? lastUserMsg.slice(0, 90) + '...' : lastUserMsg}"_

Here is an example of code generation and markdown formatting streaming in real-time:

\`\`\`typescript
// Example: Safe Server-Side LLM Call in Next.js
export async function queryModel(prompt: string) {
  const apiKey = process.env.${opts.missingKeyName};
  if (!apiKey) {
    throw new Error("Missing ${opts.missingKeyName} in environment");
  }

  // Model parameters passed from playground:
  console.log("Model:", "${opts.model}");
  console.log("Temperature:", ${opts.temperature});

  return { status: "success", query: prompt };
}
\`\`\`

#### ✅ Key Playground Capabilities Verified:
1. **Server API Route Isolation:** All API credentials remain strictly server-side and never leak to the client browser.
2. **Real-time SSE Streaming:** Tokens are streamed asynchronously chunk-by-chunk.
3. **Session & History Storage:** Conversation history is persisted in your browser's local storage.
4. **Export:** You can export this entire thread as Markdown, JSON, or TXT at any time using the Export button in the top bar.

*Add your \`${opts.missingKeyName}\` to your \`.env.local\` file and restart \`npm run dev\` to switch to live model calls.*`;

  const chunks = sampleText.split(/(\s+)/);

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        if (!chunk) continue;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
        );
        // Realistic token streaming delay
        await new Promise(r => setTimeout(r, 18));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
