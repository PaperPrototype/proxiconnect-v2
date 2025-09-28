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

function safeParsePrompts(text: string): Prompt[] {
  // Accept:
  // 1) {"prompts":[...]}
  // 2) ```json { "prompts": [...] } ```
  // 3) A bare array [...]
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text.trim();
  try {
    const obj = JSON.parse(fenced);
    if (Array.isArray(obj)) return obj.filter(v => v?.optionA && v?.optionB);
    if (obj && Array.isArray(obj.prompts)) {
      return obj.prompts
        .map((p: any) => ({
          optionA: String(p?.optionA ?? "").trim(),
          optionB: String(p?.optionB ?? "").trim(),
        }))
        .filter((p: Prompt) => p.optionA && p.optionB);
    }
  } catch {
    // ignore
  }
  return [];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name: string = (body?.name ?? "").toString();
  const description: string = (body?.description ?? "").toString();
  const count: number = Math.max(1, Number(body?.count ?? 5));
  const relatedToEvent: boolean = Boolean(
    body?.relatedToEvent ?? true
  );

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    // keep dev/demo working
    return new Response(JSON.stringify({ prompts: fallback(count), from: "fallback:no-key" }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  }

  const system = `You are a creative generator of “Would You Rather” pairs.
Return JSON ONLY in the form:
{"prompts":[{"optionA":"...","optionB":"..."}, ...]}

Rules:
- Return exactly N pairs (N is provided).
- Make them fun, punchy, vivid; each option ≤ ~80 chars.
- Inclusive and safe for general audiences.
- No duplicates or near-duplicates.
- If told to relate to the event, infer the theme ONLY from NAME and DESCRIPTION (e.g., coding, baking, startups, design) and weave it naturally.
- Otherwise, keep them universally engaging.
- No extra commentary; JSON only.`;

  const relateLine = relatedToEvent
    ? `Relate to the event’s theme inferred ONLY from name/description.`
    : `Do NOT tailor to any theme; keep universal.`;

  const user = `Event name: ${name || "(unspecified)"}
Event description: ${description || "(unspecified)"}

${relateLine}
N: ${count}
Respond as: {"prompts":[{"optionA":"...","optionB":"..."}]}`;

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
        // Force JSON object output
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    const rawText = await resp.text(); // capture raw for debugging
    let data: any = null;
    try { data = JSON.parse(rawText); } catch {}

    if (!resp.ok) {
      // Surface the failure so you can see what's wrong in the browser console
      return new Response(
        JSON.stringify({
          prompts: fallback(count),
          from: "fallback:http",
          status: resp.status,
          statusText: resp.statusText,
          raw: rawText?.slice(0, 500),
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    const text = data?.choices?.[0]?.message?.content ?? "";
    const prompts = safeParsePrompts(text);

    if (!prompts.length) {
      return new Response(
        JSON.stringify({ prompts: fallback(count), from: "fallback:parse", raw: text?.slice(0, 500) }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    // Ensure exactly N
    const exact = prompts.slice(0, count);
    while (exact.length < count) exact.push(...fallback(count - exact.length));

    return new Response(JSON.stringify({ prompts: exact.slice(0, count) }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ prompts: fallback(count), from: "fallback:exception", error: String(err?.message || err) }),
      { headers: { "content-type": "application/json" }, status: 200 }
    );
  }
}
