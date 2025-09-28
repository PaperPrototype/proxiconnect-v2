// app/api/generate-prompts/route.ts
export const runtime = "nodejs";

type Prompt = { optionA: string; optionB: string };

function fallback(count: number): Prompt[] {
  const seeds: Prompt[] = [
    { optionA: "Arrive 15 minutes early", optionB: "Stay 15 minutes late" },
    { optionA: "Talk to someone new first", optionB: "Stick with your crew first" },
    { optionA: "Show a project you’re proud of", optionB: "Ask someone about theirs" },
    { optionA: "Eat snacks immediately", optionB: "Save snacks for after" },
    { optionA: "Join the first activity", optionB: "Watch one round before joining" },
    { optionA: "Lead a quick demo", optionB: "Host a quick Q&A" },
    { optionA: "Stand front row", optionB: "Find a cozy back seat" },
  ];
  return seeds.slice(0, count);
}

function extractJsonArray(text: string): Prompt[] {
  const code = text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text;
  try {
    const arr = JSON.parse(code);
    if (Array.isArray(arr)) {
      return arr
        .map((p) => ({
          optionA: String(p?.optionA ?? "").trim(),
          optionB: String(p?.optionB ?? "").trim(),
        }))
        .filter((p) => p.optionA && p.optionB);
    }
  } catch {}
  return [];
}

export async function POST(req: Request) {
  const { name = "", description = "", count = 5, relatedToEvent = true } = await req.json();

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ prompts: fallback(count), usedFallback: true, reason: "Missing OPENAI_API_KEY" }),
      { headers: { "content-type": "application/json" } }
    );
  }

  const system = `You generate fun, engaging "Would you rather" questions for live events.
Return ONLY a JSON array like:
[
  { "optionA": "…", "optionB": "…" }
]

Rules:
- Exactly N pairs (N provided).
- Each option is vivid, specific, punchy (≤ ~80 chars).
- Balanced, playful, inclusive. Avoid NSFW/controversial topics.
- No duplicates. Use concrete imagery and variety.
- If relatedToEvent=true: infer ONLY from event name + description and weave the theme naturally.
- If relatedToEvent=false: make them universal.
- Return JSON only—no prose.`;

  const user = `Event name: ${name || "(unspecified)"}
Event description: ${description || "(unspecified)"}
Make related: ${relatedToEvent}
Number of pairs: ${count}`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ prompts: fallback(count), usedFallback: true, reason: `HTTP ${resp.status}` }),
        { headers: { "content-type": "application/json" } }
      );
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const prompts = extractJsonArray(text);

    const exact = prompts.slice(0, count);
    while (exact.length < count) exact.push(...fallback(count - exact.length));

    return new Response(JSON.stringify({ prompts: exact, usedFallback: false }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ prompts: fallback(count), usedFallback: true, reason: err?.message || "Error" }),
      { headers: { "content-type": "application/json" } }
    );
  }
}
