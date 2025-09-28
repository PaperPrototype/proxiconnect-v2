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
  const out: Prompt[] = [];
  while (out.length < Math.max(1, count)) out.push(...seeds);
  return out.slice(0, count);
}

function extractJsonArray(text: string): Prompt[] {
  const code = text.match(/```json\s*([\s\S]*?)```/i)?.[1]
    ?? text.match(/```\s*([\s\S]*?)```/i)?.[1]
    ?? text;
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
  const body = await req.json().catch(() => ({}));
  const name: string = (body?.name ?? "").toString();
  const description: string = (body?.description ?? "").toString();
  const count: number = Math.max(1, Number(body?.count ?? 5));
  const relatedToEvent: boolean = Boolean(body?.relatedToEvent ?? true);

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        usedFallback: true,
        reason: "Missing OPENAI_API_KEY on server",
        prompts: fallback(count),
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
- Produce exactly N pairs (N provided).
- Fun, punchy, ≤80 chars each.
- Inclusive, safe, non-controversial.
- No duplicates.
- Style: lively, concrete.
- If relatedToEvent=true: infer a theme from the event NAME + DESCRIPTION only and weave it in.
- Else: keep questions universally appealing.
- Output JSON only — no commentary.`;

  const relateLine = relatedToEvent
    ? `Relate to the event theme.`
    : `Keep questions general/universal.`;

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
        model: "gpt-oss-20b", // UF/Gemmi model
        temperature: 0.9,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      let reason = `HTTP ${resp.status} ${resp.statusText}`;
      try {
        const err = await resp.json();
        if (err?.error?.message) reason += `: ${err.error.message}`;
      } catch {}
      return new Response(
        JSON.stringify({
          usedFallback: true,
          reason,
          prompts: fallback(count),
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const prompts = extractJsonArray(text);

    if (!prompts.length) {
      return new Response(
        JSON.stringify({
          usedFallback: true,
          reason: "Model returned no parseable JSON",
          prompts: fallback(count),
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    const exact = prompts.slice(0, count);
    while (exact.length < count) exact.push(...fallback(count - exact.length));

    return new Response(JSON.stringify({ prompts: exact }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        usedFallback: true,
        reason: e?.message || "Network error",
        prompts: fallback(count),
      }),
      { headers: { "content-type": "application/json" }, status: 200 }
    );
  }
}
