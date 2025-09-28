// app/api/generate-prompts/route.ts
import { NextResponse } from "next/server";

const PROXI_BASE_URL = process.env.PROXI_BASE_URL || "https://api.ai.it.ufl.edu/v1";
const PROXI_API_KEY  = process.env.PROXI_API_KEY; // put your UF key in .env.local
const PROXI_MODEL    = process.env.PROXI_MODEL || "gpt-3.5-turbo";

const FALLBACK: { optionA: string; optionB: string }[] = [
  { optionA: "Arrive 15 minutes early", optionB: "Stay 15 minutes late" },
  { optionA: "Talk to someone new first", optionB: "Stick with your crew first" },
  { optionA: "Show a project you’re proud of", optionB: "Ask someone about theirs" },
  { optionA: "Eat snacks immediately", optionB: "Save snacks for after" },
  { optionA: "Join the first activity", optionB: "Watch one round before joining" },
  { optionA: "Lead a quick demo", optionB: "Host a quick Q&A" },
];

export async function POST(req: Request) {
  try {
    const { name, description, count = 5, relatedToEvent = true } = await req.json();

    if (!PROXI_API_KEY) {
      return NextResponse.json(
        { prompts: FALLBACK.slice(0, count), usedFallback: true, reason: "Missing PROXI_API_KEY on server" },
        { status: 200 }
      );
    }

    const sys = `You generate pairs of short, punchy "Would You Rather" options.
Return ONLY a JSON array of objects with exactly:
[{ "optionA": "...", "optionB": "..." }, ...] (length = ${count})
Keep each option under 80 characters. No explanations.`;

    const user = relatedToEvent
      ? `Event name: ${name || "(none)"}\nEvent description: ${description || "(none)"}\nMake them on-theme.`
      : `General audience. Not event-specific.`;

    const resp = await fetch(`${PROXI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PROXI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: PROXI_MODEL,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        temperature: 0.8,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text(); // helpful for 401 diagnostics
      console.error("Proxy error:", resp.status, resp.statusText, text);
      return NextResponse.json(
        { prompts: FALLBACK.slice(0, count), usedFallback: true, reason: `Proxy ${resp.status}: ${resp.statusText}` },
        { status: 200 }
      );
    }

    const data = await resp.json();

    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.message ??
      "";

    let prompts: Array<{ optionA: string; optionB: string }> = [];
    try {
      // In case the model wraps JSON in code fences, strip them:
      const cleaned = String(content).replace(/^```json\s*/i, "").replace(/```$/i, "");
      prompts = JSON.parse(cleaned);
    } catch {
      // attempt to extract JSON with a loose regex
      const match = String(content).match(/\[([\s\S]*)\]/);
      if (match) {
        prompts = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { prompts: FALLBACK.slice(0, count), usedFallback: true, reason: "Proxy returned no usable prompts" },
        { status: 200 }
      );
    }

    // Enforce exact length
    const trimmed = prompts.slice(0, count).map(p => ({
      optionA: String(p.optionA ?? "").slice(0, 80),
      optionB: String(p.optionB ?? "").slice(0, 80),
    }));

    return NextResponse.json({ prompts: trimmed, usedFallback: false });
  } catch (e: any) {
    console.error("generate-prompts error:", e);
    return NextResponse.json(
      { prompts: FALLBACK.slice(0, 5), usedFallback: true, reason: e?.message || "Unexpected error" },
      { status: 200 }
    );
  }
}
