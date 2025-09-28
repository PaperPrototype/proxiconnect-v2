export const runtime = "edge";

type Prompt = { optionA: string; optionB: string };

function fallback(name: string, description: string, n: number): Prompt[] {
  // Safe mock if no API key is present
  const base = `${name} ${description}`.trim() || "this event";
  const seeds = [
    ["Arrive 15 minutes early", "Stay 15 minutes late"],
    ["Talk to someone new", "Stick with your group"],
    ["Join the coding demo", "Join the networking circle"],
    ["Eat snacks first", "Save snacks for later"],
    ["Share a project", "Ask about a project"],
  ];
  return seeds.slice(0, n).map(([A, B]) => ({ optionA: A, optionB: B }));
}

function extractJsonArray(text: string): Prompt[] {
  // Try to pull a JSON array out of the model’s reply
  const codeBlock = text.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] ?? text;
  try {
    const parsed = JSON.parse(codeBlock);
    if (Array.isArray(parsed)) {
      return parsed
        .map((p) => ({
          optionA: String(p.optionA ?? "").trim(),
          optionB: String(p.optionB ?? "").trim(),
        }))
        .filter((p) => p.optionA && p.optionB);
    }
  } catch (_) {}
  return [];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    name = "",
    description = "",
    audience = "",
    tone = "fun, inclusive, all-ages, short",
    count = 5,
  } = body || {};

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // If no key, return fallback data so your UI keeps working in dev.
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ prompts: fallback(name, description, count) }), {
      headers: { "content-type": "application/json" },
    });
  }

  const system = `You are an event content generator. Produce concise, safe, "Would You Rather" pairs tailored to the event. 
Rules:
- Return ONLY a JSON array of objects: [{ "optionA": "...", "optionB": "..." }, ...]
- Each option should be short (max ~80 chars), positive, and appropriate for general audiences.
- No sensitive topics. Keep it playful, inclusive.
- Avoid duplicates and near-duplicates.`;

  const user = `Event name: ${name || "(unspecified)"}
Event description: ${description || "(unspecified)"}
Audience/context: ${audience || "(general audience)"}
Tone: ${tone}
How many pairs: ${count}

Return JSON ONLY.`;

  try {
    // Chat Completions call
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      // If the API errors, fall back gracefully
      return new Response(JSON.stringify({ prompts: fallback(name, description, count) }), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const prompts = extractJsonArray(text);
    if (!prompts.length) {
      return new Response(JSON.stringify({ prompts: fallback(name, description, count) }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ prompts }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ prompts: fallback(name, description, count) }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  }
}
