import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    google: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    customBaseUrl: process.env.OPENAI_BASE_URL || null,
  };

  return NextResponse.json(status);
}
