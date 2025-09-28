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
  while (out.length < Math.max(1, count)) {
    out.push(...seeds);
  }
  return out.slice(0, Math.max(1, count));
}

function extractJsonArray(text: string): Prompt[] {
  // try to pull the first fenced JSON block; else try the whole string
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
  } catch {
    // ignore and return []
  }
  return [];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name: string = (body?.name ?? "").toString();
  const description: string = (body?.description ?? "").toString();
  const count: number = Math.max(1, Number(body?.count ?? 5));
  const relatedToEvent: boolean = Boolean(
    body?.relatedToEvent === undefined ? true : body?.relatedToEvent
  );

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // No key? Return friendly mock data so dev/demo keeps working.
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

  // System & user prompts: ONLY use name + description.
  const system = `You are a creative event content generator.
Return ONLY a JSON array of objects like:
[
  { "optionA": "...", "optionB": "..." }
]

Rules:
- Produce exactly N pairs (N is provided).
- Make them fun, punchy, and balanced; each option ≤ ~80 chars.
- Inclusive, safe for general audiences; avoid sensitive or controversial topics.
- No duplicates or near-duplicates.
- Style: lively and concrete—avoid vague “be successful / work hard” tropes.
- If asked to relate to the event, infer a single clear theme ONLY from the event NAME and DESCRIPTION (e.g., coding, baking, startups, design) and weave it naturally into the options.
- If not asked to relate, generate universally engaging pairs suitable for a mixed audience.
- Output JSON only—no extra commentary.`;

  const relateLine = relatedToEvent
    ? `Relate the questions to the event's theme inferred ONLY from name/description.`
    : `Do NOT tailor to any theme; keep them universally appealing.`;

  const user = `Event name: ${name || "(unspecified)"}
Event description: ${description || "(unspecified)"}

${relateLine}
Number of pairs to generate (N): ${count}

Return JSON ONLY.`;

  // payload for OpenAI
  const payload = {
    model: "gpt-4o-mini",
    temperature: 0.9,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  try {
    // exponential backoff for 429/5xx
    const maxRetries = 3;
    let attempt = 0;
    let resp: Response | null = null;
    let lastErr: any = null;

    while (attempt < maxRetries) {
      try {
        resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (resp.status === 429 || resp.status >= 500) {
          // Respect Retry-After if present; else 0.5s, 1s, 2s…
          const retryAfter = Number(resp.headers.get("retry-after"));
          const delayMs = !Number.isNaN(retryAfter)
            ? retryAfter * 1000
            : Math.pow(2, attempt) * 500;
          await new Promise((r) => setTimeout(r, delayMs));
          attempt++;
          continue;
        }

        // got a non-429/5xx response; break
        break;
      } catch (e) {
        lastErr = e;
        const delayMs = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, delayMs));
        attempt++;
      }
    }

    if (!resp || !resp.ok) {
      const reason = resp
        ? `HTTP ${resp.status} ${resp.statusText}`
        : (lastErr?.message || "network error");
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
          reason: "empty/invalid JSON from model",
          prompts: fallback(count),
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    // ensure exactly `count`
    const exact = prompts.slice(0, count);
    while (exact.length < count) exact.push(...fallback(count - exact.length));

    return new Response(JSON.stringify({ prompts: exact.slice(0, count) }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        usedFallback: true,
        reason: e?.message || "unknown error",
        prompts: fallback(count),
      }),
      { headers: { "content-type": "application/json" }, status: 200 }
    );
  }
}
