// Indian plant protein market dataset & matching engine

export type Product = {
  brand: string;
  base: string;
  proteinPerServing: string;
  proteinGrams: number;
  servingGrams: number;
  pricePerKg: number;
  sugars: string;
  sweetener: "None" | "Stevia" | "Monk Fruit" | "Sucralose" | "Stevia + Sucralose" | "Dates + Stevia" | "Organic Stevia";
  gutFriendly: boolean;
  gutNote: string;
  flavors: string[];
  flavorTags: string[];
  thirdParty: string;
  allergens: string[]; // soy, nuts, gluten
  vegan: boolean;
  containsDairy: boolean;
};

export const PRODUCTS: Product[] = [
  {
    brand: "Earthful Honest Plant Protein",
    base: "Pea + Rice (70:30)",
    proteinPerServing: "24g / 30g serving",
    proteinGrams: 24, servingGrams: 30, pricePerKg: 2399,
    sugars: "No added sugar", sweetener: "None", gutFriendly: true,
    gutNote: "Ajwain + Saunf blend",
    flavors: ["Unflavoured", "Chocolate"], flavorTags: ["unflavoured", "chocolate"],
    thirdParty: "Eurofins India", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "The Whole Truth Plant Protein",
    base: "Pea + Rice (70:30)",
    proteinPerServing: "24.5g / 34g serving",
    proteinGrams: 24.5, servingGrams: 34, pricePerKg: 2699,
    sugars: "No added sugar", sweetener: "Stevia", gutFriendly: true,
    gutNote: "Zero industrial gums or stabilisers",
    flavors: ["Dark Chocolate", "Cafe Mocha"], flavorTags: ["chocolate", "coffee"],
    thirdParty: "Arbro", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "Nakpro Soy Isolate",
    base: "100% Soy Isolate",
    proteinPerServing: "27g / 30g serving",
    proteinGrams: 27, servingGrams: 30, pricePerKg: 999,
    sugars: "No added sugar", sweetener: "None", gutFriendly: false,
    gutNote: "Raw high-foaming isolate",
    flavors: ["Unflavoured", "Chocolate"], flavorTags: ["unflavoured", "chocolate"],
    thirdParty: "TUV India", allergens: ["soy"], vegan: true, containsDairy: false,
  },
  {
    brand: "As-It-Is Raw Pea Isolate",
    base: "100% Pea Isolate",
    proteinPerServing: "25g / 30g serving",
    proteinGrams: 25, servingGrams: 30, pricePerKg: 1049,
    sugars: "No added sugar", sweetener: "None", gutFriendly: false,
    gutNote: "Raw unflavoured vegetable fraction",
    flavors: ["Unflavoured"], flavorTags: ["unflavoured"],
    thirdParty: "SGS India", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "Origin Nutrition Premium Vanilla",
    base: "Pea + Rice (65:35)",
    proteinPerServing: "22g / 30g serving",
    proteinGrams: 22, servingGrams: 30, pricePerKg: 2450,
    sugars: "No added sugar", sweetener: "Stevia", gutFriendly: true,
    gutNote: "Protease / Amylase / Lipase enzymes",
    flavors: ["Premium Vanilla", "Luxury Chocolate"], flavorTags: ["vanilla", "chocolate"],
    thirdParty: "Intertek India", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "Cosmix No-Nonsense Cacao",
    base: "Pea + Rice + Pumpkin Seed",
    proteinPerServing: "23g / 32g serving",
    proteinGrams: 23, servingGrams: 32, pricePerKg: 2550,
    sugars: "No added sugar", sweetener: "Organic Stevia", gutFriendly: true,
    gutNote: "Ginger, Mulethi, Triphala adaptogens",
    flavors: ["Cacao Gastro", "Vanilla Ginger"], flavorTags: ["chocolate", "vanilla"],
    thirdParty: "Eurofins", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "MuscleBlaze bGREEN Chocolate",
    base: "Pea + Pumpkin Seed (80:20)",
    proteinPerServing: "25g / 33g serving",
    proteinGrams: 25, servingGrams: 33, pricePerKg: 1999,
    sugars: "No added sugar", sweetener: "Stevia + Sucralose", gutFriendly: true,
    gutNote: "Papain + Bromelain",
    flavors: ["Natural Chocolate", "Cafe Mocha"], flavorTags: ["chocolate", "coffee"],
    thirdParty: "Labdoor USA", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "Fast&Up Plant Protein",
    base: "Pea + Rice (75:25)",
    proteinPerServing: "26g / 34g serving",
    proteinGrams: 26, servingGrams: 34, pricePerKg: 2190,
    sugars: "No added sugar", sweetener: "Stevia", gutFriendly: true,
    gutNote: "Pepzyme AG protease complex",
    flavors: ["Classic Chocolate", "Mango Shake"], flavorTags: ["chocolate", "mango"],
    thirdParty: "Informed Choice UK", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "Oziva Protein & Herbs for Women",
    base: "Pea + Rice",
    proteinPerServing: "22g / 32g serving",
    proteinGrams: 22, servingGrams: 32, pricePerKg: 2109,
    sugars: "No added sugar", sweetener: "Stevia", gutFriendly: true,
    gutNote: "Shatavari, Ginseng, Brahmi extracts",
    flavors: ["Cafe Mocha", "Natural Chocolate"], flavorTags: ["coffee", "chocolate"],
    thirdParty: "Clean Label Project USA", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "Plix Strength Chocolate",
    base: "Pea + Rice",
    proteinPerServing: "25g / 35g serving",
    proteinGrams: 25, servingGrams: 35, pricePerKg: 1499,
    sugars: "No added sugar", sweetener: "Sucralose", gutFriendly: true,
    gutNote: "Plant protease",
    flavors: ["Chocolate", "Cafe Mocha"], flavorTags: ["chocolate", "coffee"],
    thirdParty: "SGS India", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "YogaBar 100% Plant Protein",
    base: "Pea + Chickpea (50:50)",
    proteinPerServing: "21g / 32g serving",
    proteinGrams: 21, servingGrams: 32, pricePerKg: 1850,
    sugars: "No added sugar", sweetener: "Dates + Stevia", gutFriendly: true,
    gutNote: "Fungal protease, natural chickpea texturiser",
    flavors: ["Creamy Chocolate", "Almond Mocha"], flavorTags: ["chocolate", "coffee"],
    thirdParty: "Eurofins", allergens: ["nuts"], vegan: true, containsDairy: false,
  },
  {
    brand: "Boldfit Super Plant Protein",
    base: "Pea + Rice + Pumpkin",
    proteinPerServing: "24g / 34g serving",
    proteinGrams: 24, servingGrams: 34, pricePerKg: 1299,
    sugars: "No added sugar", sweetener: "Sucralose", gutFriendly: true,
    gutNote: "Bromelain / Papain",
    flavors: ["Chocolate Eclair", "Cafe Latte"], flavorTags: ["chocolate", "coffee"],
    thirdParty: "TUV India", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "MyFitFuel Tri-Blend",
    base: "Pea + Rice + Mung Bean",
    proteinPerServing: "25g / 33g serving",
    proteinGrams: 25, servingGrams: 33, pricePerKg: 1599,
    sugars: "No added sugar", sweetener: "Stevia", gutFriendly: true,
    gutNote: "DigeZyme multi-enzyme",
    flavors: ["Rich Chocolate", "Unflavoured"], flavorTags: ["chocolate", "unflavoured"],
    thirdParty: "FSSAI accredited labs", allergens: [], vegan: true, containsDairy: false,
  },
  {
    brand: "HealthKart Vegan Value",
    base: "Pea + Soy",
    proteinPerServing: "22g / 32g serving",
    proteinGrams: 22, servingGrams: 32, pricePerKg: 1199,
    sugars: "No added sugar", sweetener: "Sucralose", gutFriendly: true,
    gutNote: "Papain",
    flavors: ["Chocolate", "Vanilla Spice"], flavorTags: ["chocolate", "vanilla"],
    thirdParty: "HK certified labs", allergens: ["soy"], vegan: true, containsDairy: false,
  },
  {
    brand: "One Good Clean Protein",
    base: "Mung Bean + Pea (60:40)",
    proteinPerServing: "23g / 31g serving",
    proteinGrams: 23, servingGrams: 31, pricePerKg: 1999,
    sugars: "No added sugar", sweetener: "Stevia", gutFriendly: true,
    gutNote: "Protease",
    flavors: ["Smooth Cocoa"], flavorTags: ["chocolate"],
    thirdParty: "SGS India", allergens: [], vegan: true, containsDairy: false,
  },
];

// User profile & scoring
export type Profile = {
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  objective: "fat-loss" | "muscle-gain" | "longevity" | "maintenance";
  activity: "sedentary" | "light" | "moderate" | "high";
  diet: "vegan" | "vegetarian" | "flexitarian" | "eggitarian";
  health: string[];
  gut: "pristine" | "bloating" | "lactose" | "ibs";
  sweetener: "stevia" | "monk" | "raw" | "any";
  allergens: string[]; // soy, nuts, gluten
  budget: "value" | "mid" | "luxury" | "any";
  flavors: string[]; // flavor tags
  habit: string;
};

export type FlavorKey =
  | "chocolate" | "vanilla" | "coffee" | "mango" | "cookie" | "strawberry" | "kulfi" | "unflavoured";

export const FLAVOR_LABELS: Record<FlavorKey, string> = {
  chocolate: "Rich Dark Chocolate",
  vanilla: "Classic Madagascan Vanilla",
  coffee: "Roasted Coffee Mocha",
  mango: "Alphonso Mango",
  cookie: "Cookie Crunch",
  strawberry: "Fresh Strawberry",
  kulfi: "Traditional Kulfi",
  unflavoured: "100% Unflavoured Base",
};

export function computeBMI(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return +(weightKg / (m * m)).toFixed(1);
}

export function bmiClass(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function computeProteinNeed(p: Profile): number {
  let factor = 0.9;
  if (p.activity === "light") factor = 1.1;
  if (p.activity === "moderate") factor = 1.4;
  if (p.activity === "high") factor = 1.8;
  if (p.objective === "muscle-gain") factor += 0.2;
  if (p.objective === "fat-loss") factor += 0.15;
  return Math.round(p.weightKg * factor);
}

const budgetRange: Record<Profile["budget"], [number, number]> = {
  value: [0, 1500],
  mid: [1500, 2500],
  luxury: [2500, 99999],
  any: [0, 99999],
};

export function scoreProduct(product: Product, p: Profile): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // Hard filters
  if (p.diet === "vegan" && !product.vegan) return { score: 0, reasons: ["Not vegan"] };
  for (const a of p.allergens) {
    if (a !== "none" && product.allergens.includes(a)) {
      return { score: 0, reasons: [`Contains ${a}`] };
    }
  }
  if (p.sweetener === "stevia" && !["None", "Stevia", "Organic Stevia", "Dates + Stevia"].includes(product.sweetener)) {
    return { score: 0, reasons: ["Sweetener mismatch"] };
  }
  if (p.sweetener === "raw" && product.sweetener !== "None") {
    return { score: 0, reasons: ["Not fully unsweetened"] };
  }
  if (p.sweetener === "monk" && product.sweetener !== "None" && product.sweetener !== "Monk Fruit") {
    return { score: 0, reasons: ["Not monk fruit only"] };
  }

  // Gut (25)
  let gut = 0;
  if (p.gut === "pristine") gut = product.gutFriendly ? 25 : 18;
  else if (p.gut === "bloating") gut = product.gutFriendly ? 25 : 8;
  else if (p.gut === "lactose") gut = product.containsDairy ? 0 : 25;
  else if (p.gut === "ibs") gut = product.gutFriendly ? 25 : 4;
  if (gut >= 22) reasons.push("Gut profile aligned");

  // Flavor (20)
  const flavorHits = p.flavors.filter((f) => product.flavorTags.includes(f)).length;
  const flavor = p.flavors.length ? Math.min(20, (flavorHits / p.flavors.length) * 20) : 12;
  if (flavor >= 15) reasons.push("Flavor overlap");

  // Sweetener (15)
  let sweet = 10;
  if (p.sweetener === "any") sweet = 15;
  if (p.sweetener === "stevia" && product.sweetener.includes("Stevia")) sweet = 15;
  if (p.sweetener === "raw" && product.sweetener === "None") sweet = 15;

  // Budget (20)
  const [lo, hi] = budgetRange[p.budget];
  const inTier = product.pricePerKg >= lo && product.pricePerKg <= hi;
  const budget = inTier ? 20 : Math.max(0, 20 - Math.abs(product.pricePerKg - (lo + hi) / 2) / 200);
  if (inTier) reasons.push("In budget tier");

  // Macro density (20)
  const density = product.proteinGrams / product.servingGrams;
  const macro = Math.min(20, density * 25);
  if (density > 0.75) reasons.push("High protein density");

  const score = Math.round(gut + flavor + sweet + budget + macro);
  return { score, reasons };
}

export function findMatches(p: Profile) {
  const scored = PRODUCTS.map((product) => ({ product, ...scoreProduct(product, p) })).filter((r) => r.score > 0);
  scored.sort((a, b) => b.score - a.score);

  const [lo, hi] = budgetRange[p.budget];
  const inTier = scored.filter((s) => s.product.pricePerKg >= lo && s.product.pricePerKg <= hi);
  const cheaper = scored.filter((s) => s.product.pricePerKg < lo);

  const top = inTier[0] ?? scored[0];
  const budget =
    cheaper.length ? cheaper[0] : scored.find((s) => s.product.pricePerKg < (top?.product.pricePerKg ?? 99999)) ?? scored[1];

  return { top, budget };
}
