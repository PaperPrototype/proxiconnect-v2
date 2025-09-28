// app/api/generate-prompts/route.ts
export const runtime = "nodejs"; // ensure server runtime

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
  const body = await req.json().catch(() => ({}));
  const name: string = (body?.name ?? "").toString();
  const description: string = (body?.description ?? "").toString();
  const count: number = Math.max(1, Number(body?.count ?? 5));
  const relatedToEvent: boolean = Boolean(body?.relatedToEvent ?? true);

  // in production this would be an encrypted secret key
  const UF_API_KEY =
    "9ba60c72465dcf7c8d0317b6e5784420190b3248cc291a5559d7988aa3f08858";

  const BASE_URL = "https://api.ai.it.ufl.edu";
  const MODEL = "gpt-3.5-turbo"; // model served by the proxy

  const system = `You generate fun, engaging "Would you rather" questions for live events.
Return ONLY a JSON array like:
[
  { "optionA": "…", "optionB": "…" }
]

Rules:
- Exactly N pairs (N provided by the user).
- Each option is vivid, specific, punchy (≤ ~80 chars).
- Balanced, playful, inclusive. Avoid NSFW/controversial topics.
- No duplicates or near-duplicates.
- Use concrete imagery and variety; avoid generic clichés.
- If relatedToEvent=true: infer the theme ONLY from event name + description (e.g., coding, baking, design) and weave it naturally.
- If relatedToEvent=false: make them universal.
- Return JSON only—no prose.`;

  const user = `Event name: ${name || "(unspecified)"}
Event description: ${description || "(unspecified)"}
Make related: ${relatedToEvent}
Number of pairs: ${count}`;

  try {
    const resp = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${UF_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
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

    // ensure exact length
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
