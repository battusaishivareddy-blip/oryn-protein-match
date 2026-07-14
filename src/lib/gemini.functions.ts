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
    flavors: string[];
    habit: string;
  };
  bmi: number;
  proteinNeed: number;
};

export type GeminiPick = { brand: string; productName: string; why: string };

export type GeminiRecommendation = {
  headline: string;
  dailyProtocol: string;
  marketVerdict: string;
  topMatch: GeminiPick | null;
  budgetMatch: GeminiPick | null;
  source: "gemini" | "fallback";
};

function catalogForPrompt() {
  return PRODUCTS.map((p) =>
    `- ${p.brand} · ${p.productName} | base=${p.base} | ${p.proteinPerServing} | ₹${p.pricePerKg}/kg (${p.priceNote ?? "listed"}) | sweetener=${p.sweetener} | gutFriendly=${p.gutFriendly} | flavors=${p.flavors.join("/")} | note=${p.positioning}`
  ).join("\n");
}

function buildPrompt(input: GeminiRecommendationInput): string {
  const { profile, bmi, proteinNeed } = input;
  return `You are Oryn — India's expert AI plant-protein advisor (July 2026). Speak with quiet confidence, no hype, no emojis.

USER PROFILE
- Name: ${profile.name}  |  ${profile.age}yr · ${profile.sex}
- Body: ${profile.heightCm}cm · ${profile.weightKg}kg (BMI ${bmi})
- Objective: ${profile.objective}  |  Activity: ${profile.activity}  |  Diet: ${profile.diet}
- Gut: ${profile.gut}  |  Sweetener pref: ${profile.sweetener}  |  Budget tier: ${profile.budget}
- Allergens to avoid: ${profile.allergens.join(", ") || "none"}
- Flavor tags requested: ${profile.flavors.join(", ") || "unspecified"}
- Daily protein target (calculated): ${proteinNeed}g
- Supplement history: ${profile.habit || "not provided"}

INDIAN PLANT-PROTEIN CATALOGUE (July 2026 prices, top 20+ brands):
${catalogForPrompt()}

BIAS CORRECTIONS you MUST honor:
- Women + gut issues (bloating/IBS) → strongly favor Cosmix No-Nonsense or Origin Nutrition; do NOT default to Earthful/Nakpro.
- Sweetener = raw/unsweetened → favor AS-IT-IS ONE Pea, Nutrabay Pure, TrueBasics, or Carbamide Forte Pea Isolate.
- Sucralose products (MuscleBlaze, Kapiva, Fast&Up, Nakpro flavored, GNC, Optimum, Nutrabay Gold) are inappropriate for sensitive guts.
- Vary picks across sessions — do NOT default to the same one or two brands for every profile.
- If budget tier is "value" (<₹1,500/kg), pick from GetMyMettle, Nakpro, Nutrabay Pure, AS-IT-IS, Kapiva.
- If luxury tier, use Cosmix, Wellbeing Nutrition, Origin, TrueBasics, Optimum.
- The budgetMatch must be a DIFFERENT brand from topMatch and clearly cheaper per kg.

Return STRICT JSON only (no markdown, no fencing) matching this exact shape:
{
  "headline": "One short sentence (≤18 words) addressed to ${profile.name.split(" ")[0]} — states the market recommendation, not a bespoke formulation.",
  "dailyProtocol": "2-3 sentences prescribing how to split ${proteinNeed}g across the day, timing, and how to rotate flavors to prevent fatigue.",
  "marketVerdict": "2-3 sentences of honest market analysis for this specific body — why the top match wins for them and where the budget alt trades off.",
  "topMatch": { "brand": "<exact brand name from catalogue>", "productName": "<exact product name>", "why": "1-2 sentences on why this specific product fits this body." },
  "budgetMatch": { "brand": "<different brand>", "productName": "<exact product name>", "why": "1-2 sentences on the price/tradeoff." }
}`;
}

function fallback(input: GeminiRecommendationInput): GeminiRecommendation {
  const first = input.profile.name.split(" ")[0] || "there";
  const isWomanGut = input.profile.sex === "female" && (input.profile.gut === "bloating" || input.profile.gut === "ibs");
  const topBrand = isWomanGut ? "Cosmix" : input.profile.budget === "value" ? "GetMyMettle" : "Origin Nutrition";
  const budBrand = input.profile.budget === "value" ? "AS-IT-IS Nutrition" : "Nakpro";
  const findBy = (b: string) => PRODUCTS.find((p) => p.brand === b);
  return {
    headline: `${first}, from what's on Indian shelves right now, ${topBrand} is the closest fit for your body.`,
    dailyProtocol: `Split ${input.proteinNeed}g across 2-3 doses — post-training, mid-morning, optionally pre-sleep. Rotate flavor daily to avoid palate fatigue over 12+ weeks.`,
    marketVerdict: `${topBrand} wins on gut tolerance and label cleanliness for this profile. ${budBrand} is the smart price play if you'd rather save ~30-40% per kg and accept a simpler ingredient story.`,
    topMatch: findBy(topBrand) ? { brand: topBrand, productName: findBy(topBrand)!.productName, why: "Cleanest label match for your gut and sweetener preferences." } : null,
    budgetMatch: findBy(budBrand) ? { brand: budBrand, productName: findBy(budBrand)!.productName, why: "Best macro-per-rupee at your budget tier." } : null,
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
    if (!apiKey) return fallback(data);
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
        topMatch: (parsed.topMatch && parsed.topMatch.brand) ? parsed.topMatch : fb.topMatch,
        budgetMatch: (parsed.budgetMatch && parsed.budgetMatch.brand) ? parsed.budgetMatch : fb.budgetMatch,
        source: "gemini",
      };
    } catch (err) {
      console.error("[Gemini] request failed", err);
      return fallback(data);
    }
  });
