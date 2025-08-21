import OpenAI from 'openai';
import { env } from './env.js';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text.slice(0, 8000)
  });
  // Return plain number[] (we store arrays directly in Postgres)
  return res.data[0].embedding as unknown as number[];
}

export async function summarizeGrant(fields: {
  title: string;
  description: string;
  eligibility?: string;
}) {
  const prompt = `You are helping universities quickly decide if a research grant fits them.
Summarize concisely in 120-180 words. Extract bullet eligibility rules and funding range if present.
Return JSON with keys: summary, eligibility_points (array of short bullets), purpose_one_line.`;

  const content = `TITLE: ${fields.title}
DESCRIPTION: ${fields.description}
ELIGIBILITY: ${fields.eligibility || 'N/A'}`;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content }
    ]
  });

  const text = chat.choices[0].message.content || '{}';
  try {
    const json = JSON.parse(text);
    return json;
  } catch {
    return { summary: text, eligibility_points: [], purpose_one_line: "" };
  }
}

// Simple cosine similarity in app (used for ranking search results)
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}
