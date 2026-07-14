import { createServerFn } from "@tanstack/react-start";

type MatchSummary = {
  brand: string;
  base: string;
  proteinPerServing: string;
  pricePerKg: number;
  sweetener: string;
  score: number;
} | null;

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
  top: MatchSummary;
  budget: MatchSummary;
};

export type GeminiRecommendation = {
  headline: string;
  formulation: string;
  dailyProtocol: string;
  marketVerdict: string;
  source: "gemini" | "fallback";
};

function buildPrompt(input: GeminiRecommendationInput): string {
  const { profile, bmi, proteinNeed, top, budget } = input;
  return `You are Oryn — India's premium AI plant-protein architect. Speak with quiet, expert confidence, no hype, no emojis.

USER PROFILE
- Name: ${profile.name}
- Age / Sex: ${profile.age} · ${profile.sex}
- Height / Weight: ${profile.heightCm}cm · ${profile.weightKg}kg (BMI ${bmi})
- Objective: ${profile.objective}
- Activity: ${profile.activity}
- Diet: ${profile.diet}
- Gut: ${profile.gut}
- Sweetener preference: ${profile.sweetener}
- Budget tier: ${profile.budget}
- Allergens to avoid: ${profile.allergens.join(", ") || "none"}
- Preferred flavor tags: ${profile.flavors.join(", ") || "unspecified"}
- Daily protein target (calculated): ${proteinNeed}g
- Habit context: ${profile.habit || "not provided"}

MARKET CROSS-REFERENCE
- Top Indian-market match: ${top ? `${top.brand} · ${top.base} · ${top.proteinPerServing} · ₹${top.pricePerKg}/kg · ${top.sweetener} · score ${top.score}` : "none"}
- Budget alternative: ${budget ? `${budget.brand} · ${budget.base} · ${budget.proteinPerServing} · ₹${budget.pricePerKg}/kg · ${budget.sweetener} · score ${budget.score}` : "none"}

Return STRICT JSON only, no markdown fencing, matching this shape exactly:
{
  "headline": "1 short sentence (max 18 words) addressing ${profile.name.split(" ")[0]} directly.",
  "formulation": "2-3 sentences describing the exact custom Oryn base built for this user (protein blend ratios, enzyme/gut additions, sweetener choice).",
  "dailyProtocol": "2-3 sentences prescribing how to split ${proteinNeed}g across the day, timing, and flavor rotation.",
  "marketVerdict": "2-3 sentences comparing the top and budget Indian-market matches against the custom Oryn formula for this specific body."
}`;
}

function fallback(input: GeminiRecommendationInput): GeminiRecommendation {
  const first = input.profile.name.split(" ")[0] || "there";
  return {
    headline: `${first}, your architecture points to a rotating-base protocol tuned to your gut and objective.`,
    formulation: `A ${input.profile.diet === "vegan" ? "Pea + Rice + Mung" : "Pea + Rice"} base at roughly ${Math.round(input.proteinNeed / 3)}g per serving, paired with a gut-support enzyme layer and ${input.profile.sweetener === "raw" ? "zero sweetener" : input.profile.sweetener === "monk" ? "monk fruit" : "organic stevia"}. Fillers, gums and synthetic stabilisers are removed by design.`,
    dailyProtocol: `Split ${input.proteinNeed}g across 2-3 doses — post-training, mid-morning and (optionally) before sleep. Rotate flavors daily to prevent palate fatigue and preserve adherence over 12+ weeks.`,
    marketVerdict: `Your top Indian-market match (${input.top?.brand ?? "—"}) is closest on macros, and the budget alternative (${input.budget?.brand ?? "—"}) is closest on cost, but both force a single fixed flavor. The custom Oryn formula matches your exact body without that compromise.`,
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
    if (!apiKey) {
      console.error("[Gemini] GEMINI_API_KEY is not configured");
      return fallback(data);
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: buildPrompt(data) }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!res.ok) {
        const body = await res.text();
        console.error(`[Gemini] ${res.status}: ${body}`);
        return fallback(data);
      }

      const payload = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text) return fallback(data);

      const parsed = extractJson(text) as Partial<GeminiRecommendation>;
      return {
        headline: parsed.headline || fallback(data).headline,
        formulation: parsed.formulation || fallback(data).formulation,
        dailyProtocol: parsed.dailyProtocol || fallback(data).dailyProtocol,
        marketVerdict: parsed.marketVerdict || fallback(data).marketVerdict,
        source: "gemini",
      };
    } catch (err) {
      console.error("[Gemini] request failed", err);
      return fallback(data);
    }
  });
