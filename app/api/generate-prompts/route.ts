// app/api/generate-prompts/route.ts
export const runtime = "edge";

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
  return seeds.slice(0, Math.max(1, count));
}

function extractJsonArray(text: string): Prompt[] {
  // Try codeblock first
  const code = text.match(/```json\s*([\s\S]*?)```/i)?.[1]
           ?? text.match(/```\s*([\s\S]*?)```/i)?.[1]
           ?? text;

  try {
    const parsed = JSON.parse(code);
    if (Array.isArray(parsed)) {
      return parsed
        .map((p) => ({
          optionA: String(p?.optionA ?? "").trim(),
          optionB: String(p?.optionB ?? "").trim(),
        }))
        .filter((p) => p.optionA && p.optionB);
    }
  } catch (e) {
    // ignore; we'll fall back
  }
  return [];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name: string = (body?.name ?? "").toString();
  const description: string = (body?.description ?? "").toString();
  const count: number = Math.max(1, Number(body?.count ?? 5));
  const relatedToEvent: boolean = Boolean(body?.relatedToEvent ?? true);

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        prompts: fallback(count),
        usedFallback: true,
        reason: "Missing OPENAI_API_KEY on server",
      }),
      { headers: { "content-type": "application/json" }, status: 200 }
    );
  }

  const system = `You are a creative event content generator.
Return ONLY a JSON array of objects like:
[
  { "optionA": "...", "optionB": "..." }
]

Rules:
- Produce exactly N pairs (N given by the user).
- Make them fun, punchy, and balanced; each option ≤ ~80 chars.
- Inclusive, safe for general audiences; avoid sensitive/controversial topics.
- No duplicates or near-duplicates.
- Style: lively and concrete, not generic (avoid vague tropes).
- If asked to relate to the event, infer the theme ONLY from the event NAME and DESCRIPTION (e.g., coding, baking, startups, design) and weave it naturally into the options.
- If not asked to relate, generate universally engaging pairs suitable for a mixed audience.
- Output JSON only—no extra commentary.`;

  const relateLine = relatedToEvent
    ? `Relate to the event's theme inferred ONLY from name/description.`
    : `Do NOT tailor to a theme; keep universal.`;

  const user = `Event name: ${name || "(unspecified)"}
Event description: ${description || "(unspecified)"}

${relateLine}
Number of pairs to generate (N): ${count}

Return JSON ONLY.`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.95,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return new Response(
        JSON.stringify({
          prompts: fallback(count),
          usedFallback: true,
          reason: `OpenAI HTTP ${resp.status}: ${errText.slice(0, 200)}`,
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    const prompts = extractJsonArray(text);

    if (!prompts.length) {
      return new Response(
        JSON.stringify({
          prompts: fallback(count),
          usedFallback: true,
          reason: `Model returned non-JSON or empty. First 200 chars: ${text.slice(0, 200)}`,
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    const exact = prompts.slice(0, count);
    while (exact.length < count) exact.push(...fallback(count - exact.length));

    return new Response(
      JSON.stringify({ prompts: exact.slice(0, count), usedFallback: false }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        prompts: fallback(count),
        usedFallback: true,
        reason: `Fetch/Network error: ${e?.message || "unknown"}`,
      }),
      { headers: { "content-type": "application/json" }, status: 200 }
    );
  }
}
