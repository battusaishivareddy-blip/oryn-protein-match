import { createServerFn } from "@tanstack/react-start";
import { PRODUCTS } from "./oryn-data";

export type GeminiRecommendationInput = {
  profile: {
    name: string;
    age: number;
    sex: string;
    heightCm: number;
    weightKg: number;
    objective: string;
    activity: string;
    diet: string;
    gut: string;
    sweetener: string;
    budget: string;
    allergens: string[];
    flavor: string;
    habit: string;
  };
  bmi: number;
  proteinNeed: number;
  candidatePool: Array<{ brand: string; productName: string; score: number; reasons: string[] }>;
  relaxed: string | null;
};

export type GeminiPick = { brand: string; productName: string; why: string };

export type GeminiRecommendation = {
  headline: string;
  dailyProtocol: string;
  marketVerdict: string;
  idealMatch: GeminiPick | null;
  closeMatch: GeminiPick | null;
  source: "gemini" | "fallback";
};

function catalogForPrompt() {
  return PRODUCTS.map((p) =>
    `- ${p.brand} · ${p.productName} | base=${p.base} | ${p.proteinPerServing} | ₹${p.pricePerKg}/kg | sweetener=${p.sweetener} | gutFriendly=${p.gutFriendly} | flavors=${p.flavors.join("/")} | note=${p.positioning}`
  ).join("\n");
}

function buildPrompt(input: GeminiRecommendationInput): string {
  const { profile, bmi, proteinNeed, candidatePool, relaxed } = input;
  const pool = candidatePool.length
    ? candidatePool.map((c) => `- ${c.brand} · ${c.productName} (rank score ${c.score}) — ${c.reasons.join(", ")}`).join("\n")
    : "(engine returned no candidates)";
  return `You are Oryn — India's expert AI plant-protein advisor (July 2026). Speak with quiet confidence, no hype, no emojis.

USER PROFILE
- Name: ${profile.name}  |  ${profile.age}yr · ${profile.sex}
- Body: ${profile.heightCm}cm · ${profile.weightKg}kg (BMI ${bmi})
- Objective: ${profile.objective}  |  Activity: ${profile.activity}  |  Diet: ${profile.diet}
- Gut: ${profile.gut}  |  Sweetener pref: ${profile.sweetener}  |  Budget tier: ${profile.budget}
- Allergens: ${profile.allergens.join(", ") || "none"}
- Flavor pick: ${profile.flavor || "unspecified"}
- Daily protein target (calculated): ${proteinNeed}g
- Habit context: ${profile.habit || "not provided"}
${relaxed ? `- RELAXED FILTER NOTE: ${relaxed}` : ""}

FILTERED CANDIDATE POOL (already passed hard filters — diet, allergens, gut, sweetener):
${pool}

FULL INDIAN CATALOGUE for reference (July 2026):
${catalogForPrompt()}

RULES
- idealMatch MUST come from the CANDIDATE POOL above — do NOT invent brands or bypass the filters.
- closeMatch MUST be a different brand from idealMatch, also from the candidate pool.
- If flavor pref is set and the ideal brand does NOT offer it (check flavors list), say so plainly in "marketVerdict"; do NOT silently default to Chocolate.
- Vary picks across profiles — avoid always defaulting to Nakpro or Earthful.
- Women + gut issues → Cosmix / Origin / OZiva / Yogabar are stronger picks than Nakpro or MuscleBlaze.

Return STRICT JSON only (no markdown, no fencing), matching this exact shape:
{
  "headline": "One short sentence (≤18 words) addressed to ${profile.name.split(" ")[0]} — states the market recommendation.",
  "dailyProtocol": "2-3 sentences on how to split ${proteinNeed}g across the day, timing, and flavor rotation guidance.",
  "marketVerdict": "2-3 sentences of honest market analysis. If the ideal brand doesn't offer the chosen flavor, say so here.",
  "idealMatch":  { "brand": "<from candidate pool>", "productName": "<exact>", "why": "1-2 sentences on fit." },
  "closeMatch":  { "brand": "<different brand from candidate pool>", "productName": "<exact>", "why": "1-2 sentences on what's different." }
}`;
}

function fallback(input: GeminiRecommendationInput): GeminiRecommendation {
  const first = input.profile.name.split(" ")[0] || "there";
  const pool = input.candidatePool;
  const idealName  = pool[0];
  const closeName  = pool.find((c) => c.brand !== idealName?.brand) ?? pool[1] ?? null;
  const findExact = (brand: string, pn: string) =>
    PRODUCTS.find((p) => p.brand === brand && p.productName === pn);
  const idealP  = idealName  ? findExact(idealName.brand,  idealName.productName)  ?? null : null;
  const closeP  = closeName  ? findExact(closeName.brand,  closeName.productName)  ?? null : null;

  const idealBrand = idealP?.brand ?? "our top pick";
  const closeBrand = closeP?.brand ?? "the runner-up";
  return {
    headline: `${first}, based on your profile, ${idealBrand} is the closest fit from Indian shelves right now.`,
    dailyProtocol: `Split ${input.proteinNeed}g across 2-3 doses — post-training, mid-morning, optionally pre-sleep. Rotate flavor daily to avoid palate fatigue over 12+ weeks.`,
    marketVerdict: `${idealBrand} wins on gut alignment and label cleanliness for your profile. ${closeBrand} is a solid alternative on macros with a slightly different trade-off.`,
    idealMatch: idealP ? { brand: idealP.brand, productName: idealP.productName, why: "Best rank score in your filtered pool." } : null,
    closeMatch: closeP ? { brand: closeP.brand, productName: closeP.productName, why: "Next-best rank score in your filtered pool." } : null,
    source: "fallback",
  };
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in Gemini response");
  return JSON.parse(candidate.slice(start, end + 1));
}

export const getGeminiRecommendation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input as GeminiRecommendationInput)
  .handler(async ({ data }): Promise<GeminiRecommendation> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.error("[Gemini] GEMINI_API_KEY missing — using fallback"); return fallback(data); }
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: buildPrompt(data) }] }],
            generationConfig: { temperature: 0.85, responseMimeType: "application/json" },
          }),
        },
      );
      if (!res.ok) { console.error(`[Gemini] ${res.status}: ${await res.text()}`); return fallback(data); }
      const payload = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text) return fallback(data);
      const parsed = extractJson(text) as Partial<GeminiRecommendation>;
      const fb = fallback(data);
      return {
        headline: parsed.headline || fb.headline,
        dailyProtocol: parsed.dailyProtocol || fb.dailyProtocol,
        marketVerdict: parsed.marketVerdict || fb.marketVerdict,
        idealMatch: parsed.idealMatch?.brand ? parsed.idealMatch : fb.idealMatch,
        closeMatch: parsed.closeMatch?.brand ? parsed.closeMatch : fb.closeMatch,
        source: "gemini",
      };
    } catch (err) {
      console.error("[Gemini] request failed", err);
      return fallback(data);
    }
  });
