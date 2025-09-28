// app/api/generate-prompts/route.ts
import { NextResponse } from "next/server";

const PROXI_BASE_URL = "https://api.ai.it.ufl.edu/v1";
const PROXI_API_KEY  = "sk-sxvNLvIEC2ib6iVoPUrEyQ"; // put your UF key in .env.local
const PROXI_MODEL    = "gpt-oss-20b";

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

    const sys = `You are a game master creating *short, bold, and debate-worthy* "Would You Rather" questions.

Output rules:
- Return ONLY a JSON array of N objects, each like:
  [{ "optionA": "…", "optionB": "…" }, …]
- Each option must be **ultra short** (max 5 words).
- The two options should feel like rival fandoms, strong lifestyle splits, or absurdly funny opposites that will spark arguments.
- Example style:
  - "Lose Minecraft" vs "Lose Roblox"
  - "Pineapple pizza" vs "No pineapple pizza"
  - "Cats" vs "Dogs"
  - "TikTok" vs "YouTube"
  - "Hot weather" vs "Cold weather"
  - "Be invisible" vs "Fly"
- If "relatedToEvent" is true, anchor questions in the event’s theme (e.g. coding, gaming, baking), but keep them punchy and arguable.
- Keep tone playful, modern, and conversational. Avoid long setups, politics, or anything offensive.
`;

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
