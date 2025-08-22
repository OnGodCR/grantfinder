import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000)
  });
  return res.data[0].embedding as number[];
}

export async function summarizeGrant(fields: {
  title: string;
  description: string;
  eligibility?: string;
}) {
  const system = `You help universities decide if a research grant fits them.
Summarize in 120-180 words. Extract concise eligibility bullets and funding range.
Return JSON: { "summary": string, "eligibility_points": string[], "purpose_one_line": string }`;

  const user = `TITLE: ${fields.title}
DESCRIPTION: ${fields.description}
ELIGIBILITY: ${fields.eligibility || "N/A"}`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const text = chat.choices[0].message.content || "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { summary: text, eligibility_points: [], purpose_one_line: "" };
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0, y = b[i] || 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}
