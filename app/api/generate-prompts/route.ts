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
  // pad if needed
  const out: Prompt[] = [];
  while (out.length < Math.max(1, count)) {
    out.push(...seeds);
  }
  return out.slice(0, Math.max(1, count));
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

// --- backoff helpers ---
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 600; // starting delay ~0.6s

async function fetchWithRetries(input: RequestInfo, init: RequestInit) {
  let attempt = 0;
  let lastErr: any;

  while (attempt <= MAX_RETRIES) {
    try {
      const resp = await fetch(input, init);

      if (resp.ok) return resp;

      // Retry on 429 and 5xx
      if (resp.status === 429 || (resp.status >= 500 && resp.status <= 599)) {
        attempt++;
        if (attempt > MAX_RETRIES) return resp;

        // Respect Retry-After if provided
        const ra = resp.headers.get("retry-after");
        let delay = ra ? Number(ra) * 1000 : BASE_DELAY_MS * Math.pow(2, attempt - 1);

        // add jitter (±30%)
        const jitter = delay * (Math.random() * 0.6 - 0.3);
        delay = Math.max(300, Math.min(15000, Math.round(delay + jitter)));

        await sleep(delay);
        continue;
      }

      // Non-retryable error: return immediately
      return resp;
    } catch (err) {
      // Network error: retry
      lastErr = err;
      attempt++;
      if (attempt > MAX_RETRIES) throw err;
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  // Shouldn't reach here
  throw lastErr ?? new Error("Unknown error");
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

  // System & user prompts: ONLY use name + description.
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
- Style: lively, specific, and themed when asked (avoid generic "work hard" tropes).
- If asked to relate to the event, infer the theme ONLY from the event NAME and DESCRIPTION (e.g., coding, baking, startups, design) and weave it naturally into the options.
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

  try {
    const resp = await fetchWithRetries("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // cheaper + good quality; stays under rate limits better
        model: "gpt-4o-mini",
        temperature: 0.9,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      // bubble the reason if we can
      let reason = `HTTP ${resp.status} ${resp.statusText}`;
      try {
        const err = await resp.json();
        reason = err?.error?.message ? `${reason}: ${err.error.message}` : reason;
      } catch {}
      return new Response(
        JSON.stringify({ prompts: fallback(count), usedFallback: true, reason }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const prompts = extractJsonArray(text);

    if (!prompts.length) {
      return new Response(
        JSON.stringify({
          prompts: fallback(count),
          usedFallback: true,
          reason: "Model returned no parseable JSON",
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    }

    // Trim or pad to exactly count
    const exact = prompts.slice(0, count);
    while (exact.length < count) exact.push(...fallback(count - exact.length));

    return new Response(JSON.stringify({ prompts: exact.slice(0, count) }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        prompts: fallback(count),
        usedFallback: true,
        reason: err?.message || "Network error",
      }),
      { headers: { "content-type": "application/json" }, status: 200 }
    );
  }
}
