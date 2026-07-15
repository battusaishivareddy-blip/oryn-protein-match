// Indian plant protein market dataset — July 2026
// Sourced from user-provided market intel across brand sites and major
// Indian retailers (Amazon.in, Flipkart, HealthKart, Nutrabay, 1mg, JioMart,
// PharmEasy, bigbasket).

export type Product = {
  brand: string;
  productName: string;
  base: string;
  proteinPerServing: string;
  proteinGrams: number;
  servingGrams: number;
  pricePerKg: number;
  priceNote?: string;
  sugars: string;
  sweetener: string;
  gutFriendly: boolean;
  gutNote: string;
  flavors: string[];
  flavorTags: FlavorKey[];
  thirdParty: string;
  allergens: string[];
  vegan: boolean;
  containsDairy: boolean;
  positioning: string;
};

export type FlavorKey =
  | "chocolate" | "vanilla" | "coffee" | "mango"
  | "cookies" | "strawberry" | "kulfi" | "unflavoured";

export const FLAVOR_LABELS: Record<FlavorKey, string> = {
  chocolate:   "🍫 Chocolate",
  vanilla:     "🌿 Vanilla",
  coffee:      "☕ Coffee",
  mango:       "🥭 Mango",
  cookies:     "🍪 Cookies and Cream",
  strawberry:  "🍓 Strawberry",
  kulfi:       "🍨 Kulfi",
  unflavoured: "🌾 Unflavoured",
};

export const PRODUCTS: Product[] = [
  {
    brand: "Cosmix", productName: "No-Nonsense Plant Protein",
    base: "Pea Isolate + Rice Isolate",
    proteinPerServing: "24g / 32g serving", proteinGrams: 24, servingGrams: 32,
    pricePerKg: 2200, priceNote: "MRP ₹2,750 · SP ₹2,200 (1kg)",
    sugars: "No added sugar", sweetener: "Monk Fruit (Classic = None)",
    gutFriendly: true, gutNote: "Clean-label, monk fruit only, no gums or fillers",
    flavors: ["Indonesian Cacao", "Chikmagalur Mocha", "Kerala Vanilla Bean", "Mint Chocolate Cacao", "Chilli Guava", "Classic Unflavoured"],
    flavorTags: ["chocolate", "coffee", "vanilla", "unflavoured"],
    thirdParty: "Third-party lab tested (India)", allergens: [], vegan: true, containsDairy: false,
    positioning: "Clean-label wellness for sensitive guts & women",
  },
  {
    brand: "OZiva", productName: "Bioactive Plant Protein",
    base: "Pea Isolate + Brown Rice + Mung",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 2299, priceNote: "Verify pack/variant on oziva.in",
    sugars: "No added sugar", sweetener: "No artificial sweetener claimed",
    gutFriendly: true, gutNote: "MDZenPro protease blend + curcumin + B12 + iron",
    flavors: ["Chocolate", "Mango", "Strawberry"],
    flavorTags: ["chocolate", "mango", "strawberry"],
    thirdParty: "Brand tested (Ayurveda-forward)", allergens: [], vegan: true, containsDairy: false,
    positioning: "Ayurveda + wellness, popular with women",
  },
  {
    brand: "OZiva", productName: "Organic Plant Protein (Everyday Fitness)",
    base: "Organic Pea + Brown Rice + Quinoa",
    proteinPerServing: "30g / 40g serving", proteinGrams: 30, servingGrams: 40,
    pricePerKg: 2499, priceNote: "Verify on oziva.in — mixes into roti dough",
    sugars: "No added sugar", sweetener: "None",
    gutFriendly: true, gutNote: "Organic, unflavoured food-integration base",
    flavors: ["Unflavoured"], flavorTags: ["unflavoured"],
    thirdParty: "Organic-certified sources", allergens: [], vegan: true, containsDairy: false,
    positioning: "Organic everyday food-integration protein",
  },
  {
    brand: "MuscleBlaze", productName: "Plant Protein",
    base: "Pea + Pumpkin Seed",
    proteinPerServing: "24g / 32g serving", proteinGrams: 24, servingGrams: 32,
    pricePerKg: 2129, priceNote: "MRP ₹2,849 · SP ₹2,129 (1kg, 25% off)",
    sugars: "No added sugar", sweetener: "Sucralose",
    gutFriendly: false, gutNote: "Sucralose can irritate sensitive guts",
    flavors: ["Rich Chocolate"], flavorTags: ["chocolate"],
    thirdParty: "Labdoor-referenced", allergens: [], vegan: true, containsDairy: false,
    positioning: "Mainstream fitness-focused",
  },
  {
    brand: "Kapiva", productName: "Plant Protein (Vegan)",
    base: "Pea Isolate + Rice Isolate + Fava/Quinoa (varies)",
    proteinPerServing: "24.5g / 33g serving", proteinGrams: 24.5, servingGrams: 33,
    pricePerKg: 1599, priceNote: "MRP ₹1,800 · SP ₹1,599 (1kg)",
    sugars: "No added sugar", sweetener: "Sucralose",
    gutFriendly: false, gutNote: "Sucralose-based",
    flavors: ["Chocolate"], flavorTags: ["chocolate"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Ayurveda-adjacent mid-market",
  },
  {
    brand: "Yogabar", productName: "ProClean Plant Protein",
    base: "Pea + Brown Rice",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 1998, priceNote: "MRP ₹1,299 · SP ₹999 (500g)",
    sugars: "No added sugar", sweetener: "Monk Fruit Extract",
    gutFriendly: true, gutNote: "Monk fruit only, no artificial sweeteners",
    flavors: ["Chocolate", "Coffee", "Unflavoured"],
    flavorTags: ["chocolate", "coffee", "unflavoured"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Clean-label for wellness buyers",
  },
  {
    brand: "Fast&Up", productName: "Plant Protein",
    base: "Pea Isolate + Brown Rice",
    proteinPerServing: "26g / 34g serving", proteinGrams: 26, servingGrams: 34,
    pricePerKg: 1869, priceNote: "MRP ₹3,115 · SP ₹1,869 (1kg, 40% off)",
    sugars: "No added sugar", sweetener: "Sucralose",
    gutFriendly: false, gutNote: "Sucralose-based",
    flavors: ["Rich Chocolate", "Alphonso Mango", "Cookies & Cream", "Kesar Kulfi", "Assorted"],
    flavorTags: ["chocolate", "mango", "cookies", "kulfi"],
    thirdParty: "Sports-nutrition tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Athlete-facing flavor variety",
  },
  {
    brand: "Plix (The Plant Fix)", productName: "Strength Vegan Protein",
    base: "Pea Isolate + Brown Rice",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 1799, priceNote: "Verify live on plixlife.com",
    sugars: "No added sugar", sweetener: "Naturally flavoured, cocoa-based",
    gutFriendly: true, gutNote: "No disclosed artificial sweeteners",
    flavors: ["Chocolate", "Mango", "Vanilla"],
    flavorTags: ["chocolate", "mango", "vanilla"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Trendy DTC wellness",
  },
  {
    brand: "GetMyMettle", productName: "VegPro",
    base: "Pea Isolate + Brown Rice + Mung",
    proteinPerServing: "24g / 32g serving", proteinGrams: 24, servingGrams: 32,
    pricePerKg: 1049, priceNote: "MRP ₹1,749 · SP ₹1,049 (1kg, 40% off)",
    sugars: "No added sugar", sweetener: "Stevia",
    gutFriendly: true, gutNote: "Stevia-only, mung adds gentle amino profile",
    flavors: ["Classic Coffee", "Sunshine Mango", "Chocolate", "Kesar Pista", "Vanilla"],
    flavorTags: ["coffee", "mango", "chocolate", "vanilla"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Value tier with flavor variety",
  },
  {
    brand: "Optimum Nutrition", productName: "Gold Standard 100% Plant",
    base: "Pea + Rice + Fava/Sacha Inchi",
    proteinPerServing: "24g / 32g serving", proteinGrams: 24, servingGrams: 32,
    pricePerKg: 4200, priceNote: "India import — ₹2,500–₹4,500/kg range",
    sugars: "No added sugar", sweetener: "Sucralose",
    gutFriendly: false, gutNote: "Sucralose-based, import formulation",
    flavors: ["Double Rich Chocolate", "French Vanilla Creme"],
    flavorTags: ["chocolate", "vanilla"],
    thirdParty: "Informed Sport (global)", allergens: [], vegan: true, containsDairy: false,
    positioning: "Global premium import — most expensive per kg",
  },
  {
    brand: "Nakpro", productName: "Plant Protein",
    base: "Instantized Pea Isolate + Brown Rice (44:44)",
    proteinPerServing: "25.2g / 33g serving", proteinGrams: 25.2, servingGrams: 33,
    pricePerKg: 1399, priceNote: "MRP ₹2,220 · SP ₹1,399",
    sugars: "No added sugar", sweetener: "Sucralose",
    gutFriendly: false, gutNote: "Sucralose-based, high-density isolate",
    flavors: ["Chocolate", "Mango", "Vanilla", "Cookies & Cream", "Coffee"],
    flavorTags: ["chocolate", "mango", "vanilla", "cookies", "coffee"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "High-macro budget performer",
  },
  {
    brand: "Nutrabay", productName: "Pure 100% Pea Protein Isolate",
    base: "Pea Isolate (single ingredient)",
    proteinPerServing: "25.3g / 30g serving", proteinGrams: 25.3, servingGrams: 30,
    pricePerKg: 1250, priceNote: "Confirm on nutrabay.com",
    sugars: "No added sugar", sweetener: "None",
    gutFriendly: true, gutNote: "Single-ingredient raw isolate, no additives",
    flavors: ["Unflavoured"], flavorTags: ["unflavoured"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Budget-friendly raw single-ingredient",
  },
  {
    brand: "Nutrabay", productName: "Gold 100% Pea Protein",
    base: "Hydrolyzed Pea Isolate",
    proteinPerServing: "25g / 32g serving", proteinGrams: 25, servingGrams: 32,
    pricePerKg: 1799, priceNote: "Confirm on nutrabay.com",
    sugars: "No added sugar", sweetener: "Sucralose",
    gutFriendly: false, gutNote: "Sucralose-based hydrolyzed isolate",
    flavors: ["Rich Chocolate Crème", "French Vanilla", "Cold Coffee"],
    flavorTags: ["chocolate", "vanilla", "coffee"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Mid-tier flavored isolate",
  },
  {
    brand: "Carbamide Forte", productName: "Plant Protein Powder",
    base: "Pea + Brown Rice",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 2450, priceNote: "≈₹2,300–₹2,600/kg — verify mycf.in",
    sugars: "No added sugar", sweetener: "Artificial (unspecified)",
    gutFriendly: false, gutNote: "Undisclosed artificial sweetener",
    flavors: ["Belgian Chocolate", "Alphonso Mango", "Cafe Mocha", "Watermelon", "Pineapple Masala"],
    flavorTags: ["chocolate", "mango", "coffee"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Wide flavor range at mid-premium",
  },
  {
    brand: "Carbamide Forte", productName: "Pea Protein Isolate (Unflavoured)",
    base: "Pea Isolate (single ingredient)",
    proteinPerServing: "30g / 33g serving", proteinGrams: 30, servingGrams: 33,
    pricePerKg: 2600, priceNote: "500g pack — verify mycf.in",
    sugars: "No added sugar", sweetener: "None",
    gutFriendly: true, gutNote: "Raw single-ingredient isolate",
    flavors: ["Unflavoured"], flavorTags: ["unflavoured"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Raw high-macro isolate",
  },
  {
    brand: "TrueBasics", productName: "Clean Plant Protein",
    base: "Pea Isolate + Brown Rice",
    proteinPerServing: "24g / 32g serving", proteinGrams: 24, servingGrams: 32,
    pricePerKg: 2499, priceNote: "MRP ₹2,799 · SP ₹2,499",
    sugars: "No added sugar", sweetener: "None — cocoa + natural flavour only",
    gutFriendly: true, gutNote: "No added sweetener at all, ultra-clean label",
    flavors: ["Chocolate"], flavorTags: ["chocolate"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Ultra-clean sweetener-free premium",
  },
  {
    brand: "Wellbeing Nutrition", productName: "Superfood Plant Protein",
    base: "Pea Isolate + Quinoa + Amaranth + Algae",
    proteinPerServing: "22g / 30g serving", proteinGrams: 22, servingGrams: 30,
    pricePerKg: 2699, priceNote: "Verify wellbeingnutrition.com",
    sugars: "No added sugar", sweetener: "Monk Fruit",
    gutFriendly: true, gutNote: "Superfood matrix + monk fruit only",
    flavors: ["Chocolate", "Vanilla"], flavorTags: ["chocolate", "vanilla"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Premium superfood matrix",
  },
  {
    brand: "Boldfit", productName: "Plant Protein",
    base: "Pea Isolate + Brown Rice",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 1814, priceNote: "SP ₹1,814 (45% off)",
    sugars: "Some pack photos show sucrose", sweetener: "Mixed (verify pack)",
    gutFriendly: false, gutNote: "Labeling inconsistencies reported",
    flavors: ["Chocolate", "Cafe Mocha"], flavorTags: ["chocolate", "coffee"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Value fitness brand",
  },
  {
    brand: "bGREEN by HealthKart", productName: "Plant Protein",
    base: "Pea Isolate + Pumpkin/Rice (varies)",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 2199, priceNote: "MRP ₹2,999 · SP ₹2,199 (1kg)",
    sugars: "Not fully disclosed", sweetener: "Not fully disclosed",
    gutFriendly: false, gutNote: "Disclosure gaps on pack",
    flavors: ["Chocolate", "Cafe Mocha", "Strawberry"],
    flavorTags: ["chocolate", "coffee", "strawberry"],
    thirdParty: "HK-referenced", allergens: [], vegan: true, containsDairy: false,
    positioning: "HealthKart house label",
  },
  {
    brand: "Origin Nutrition", productName: "100% Natural Plant Protein",
    base: "European Golden Pea Isolate + Organic Pumpkin Seed",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 2149, priceNote: "MRP ₹2,225 · SP ₹1,869 (~975g)",
    sugars: "No added sugar", sweetener: "Stevia",
    gutFriendly: true, gutNote: "Stevia-only, organic pumpkin seed matrix",
    flavors: ["Chocolate", "Vanilla", "Filter Coffee", "Strawberry", "Coffee Caramel", "Malai Kulfi", "Unflavoured"],
    flavorTags: ["chocolate", "vanilla", "coffee", "strawberry", "kulfi", "unflavoured"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Premium natural with widest flavor lineup",
  },
  {
    brand: "Naturaltein", productName: "Plant Protein",
    base: "Pea + Fine Rice",
    proteinPerServing: "21g / 30g serving", proteinGrams: 21, servingGrams: 30,
    pricePerKg: 1799, priceNote: "MRP ₹2,225 · SP ₹1,799 (1kg); 500g ₹1,099",
    sugars: "No added sugar", sweetener: "Stevia",
    gutFriendly: true, gutNote: "Stevia-only, gentle base",
    flavors: ["Mango", "Berry", "Coffee", "Pista", "Chocolate"],
    flavorTags: ["mango", "strawberry", "coffee", "chocolate"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Emerging clean-label variety",
  },
  {
    brand: "GNC", productName: "AMP Plant Isolate",
    base: "Pea Isolate + Brown Rice Isolate",
    proteinPerServing: "25g / 33g serving", proteinGrams: 25, servingGrams: 33,
    pricePerKg: 2299, priceNote: "₹1,499–₹2,699 across retailers (907g pack)",
    sugars: "No added sugar", sweetener: "Sucralose + Acesulfame K",
    gutFriendly: false, gutNote: "Dual artificial sweeteners",
    flavors: ["Chocolate Hazelnut", "Vanilla Cookie"],
    flavorTags: ["chocolate", "vanilla", "cookies"],
    thirdParty: "GNC global tested", allergens: ["nuts"], vegan: true, containsDairy: false,
    positioning: "Global brand premium",
  },
  {
    brand: "AS-IT-IS Nutrition", productName: "ONE Pea Protein Isolate",
    base: "Pea Isolate (single ingredient)",
    proteinPerServing: "29g / 33g serving", proteinGrams: 29, servingGrams: 33,
    pricePerKg: 1157, priceNote: "MRP ₹1,446 · SP ₹1,157",
    sugars: "No added sugar", sweetener: "None",
    gutFriendly: true, gutNote: "Single-ingredient raw isolate — highest macro density",
    flavors: ["Unflavoured"], flavorTags: ["unflavoured"],
    thirdParty: "Brand tested", allergens: [], vegan: true, containsDairy: false,
    positioning: "Cheapest raw high-protein isolate",
  },
];

/* -------------------------- Profile + calculations ------------------------ */

export type Profile = {
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  objective: "fat-loss" | "muscle-gain" | "longevity" | "maintenance";
  activity: "sedentary" | "light" | "moderate" | "high";
  diet: "vegan" | "vegetarian";
  health: string[];
  gut: "pristine" | "bloating" | "ibs";
  sweetener: "stevia" | "monk" | "raw" | "any";
  allergens: string[];
  budget: "value" | "mid" | "luxury" | "any";
  flavor: FlavorKey | "";
  habit: string;
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

/* --------------------------- Filtering + scoring -------------------------- */

// Hard filters — NEVER relaxed.
function passesDiet(pr: Product, p: Profile): boolean {
  // Diet is a hard filter. All current products are plant-based, but keep the
  // structure ready for future non-vegan additions.
  if (p.diet === "vegan" && !pr.vegan) return false;
  return true;
}
function passesAllergen(pr: Product, p: Profile): boolean {
  for (const a of p.allergens) {
    if (a && a !== "none" && pr.allergens.includes(a)) return false;
  }
  return true;
}

// Preferential filters — may be relaxed if the candidate pool is empty.
function passesGut(pr: Product, p: Profile): boolean {
  if (p.gut === "pristine") return true;
  return pr.gutFriendly; // bloating & IBS require a gentle base
}
function passesSweetener(pr: Product, p: Profile): boolean {
  if (p.sweetener === "any") return true;
  const s = pr.sweetener;
  if (p.sweetener === "raw")    return /None/i.test(s);
  if (p.sweetener === "monk")   return /Monk/i.test(s) || /None/i.test(s);
  if (p.sweetener === "stevia") return /Stevia/i.test(s) || /None/i.test(s);
  return true;
}

// Ranking score — used only AFTER hard + preferential filters pass.
// Primary goal alignment first, flavor + budget only for tie-breaking.
function rankScore(pr: Product, p: Profile): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let s = 0;

  // Primary — protein density vs daily target (max 30)
  const density = pr.proteinGrams / pr.servingGrams;
  s += Math.min(30, density * 38);
  if (density > 0.78) reasons.push("High protein density");

  // Primary — gut alignment strength (max 25)
  if (pr.gutFriendly) { s += 25; reasons.push("Gentle for your gut profile"); }
  else s += 10;

  // Primary — sweetener label cleanliness (max 20)
  const sw = pr.sweetener;
  if (/None/i.test(sw))                                    { s += 20; reasons.push("Fully unsweetened base"); }
  else if (/Monk/i.test(sw))                                { s += 18; reasons.push("Monk-fruit-sweetened"); }
  else if (/Stevia/i.test(sw))                              { s += 16; reasons.push("Stevia-sweetened"); }
  else if (/Sucralose|Acesulfame|Artificial|Mixed/i.test(sw)) s += 4;
  else s += 8;

  // Tie-breakers — flavor match (max 8)
  if (p.flavor && pr.flavorTags.includes(p.flavor)) { s += 8; reasons.push("Offers your chosen flavor"); }

  // Tie-breakers — budget tier fit (max 7)
  const budgetTier: Record<Profile["budget"], [number, number]> = {
    value: [0, 1500], mid: [1500, 2500], luxury: [2500, 99999], any: [0, 99999],
  };
  const [lo, hi] = budgetTier[p.budget];
  if (pr.pricePerKg >= lo && pr.pricePerKg <= hi) { s += 7; reasons.push("Inside your budget tier"); }
  else s += Math.max(0, 5 - Math.abs(pr.pricePerKg - (lo + hi) / 2) / 500);

  // Small correction for female users with sensitive digestion — Cosmix,
  // Origin, OZiva and Yogabar are documented as women-friendly clean-label,
  // so bump them slightly to avoid a Nakpro/MuscleBlaze default.
  if (p.sex === "female" && (p.gut === "bloating" || p.gut === "ibs")) {
    if (pr.brand === "Cosmix") s += 6;
    if (pr.brand === "Origin Nutrition") s += 4;
    if (pr.brand === "OZiva") s += 3;
    if (pr.brand === "Yogabar") s += 3;
  }

  return { score: Math.round(s), reasons };
}

export type Match = { product: Product; score: number; reasons: string[] };
export type MatchResult = {
  ideal: Match | null;
  close: Match | null;
  relaxed: string | null;   // plain-language note on any relaxed filter
  unsafe: boolean;          // true only when allergen filter alone empties the pool
};

export function findMatches(p: Profile): MatchResult {
  const hard = PRODUCTS.filter((pr) => passesDiet(pr, p) && passesAllergen(pr, p));
  if (hard.length === 0) {
    // Allergen (or diet) alone removed everything — never surface an unsafe pick.
    return { ideal: null, close: null, relaxed: null, unsafe: true };
  }

  let pool = hard.filter((pr) => passesGut(pr, p) && passesSweetener(pr, p));
  let relaxed: string | null = null;

  if (pool.length === 0) {
    pool = hard.filter((pr) => passesSweetener(pr, p));
    relaxed = "None of our products fully matched your gut sensitivity preference, so we've shown the closest option based on your other answers.";
  }
  if (pool.length === 0) {
    pool = hard;
    relaxed = "None of our products matched your exact sweetener preference, so we've shown the closest option based on your other answers.";
  }

  const scored: Match[] = pool
    .map((pr) => ({ product: pr, ...rankScore(pr, p) }))
    .sort((a, b) => b.score - a.score);

  const ideal = scored[0] ?? null;
  const close =
    scored.find((s) => s.product.brand !== ideal?.product.brand) ??
    scored[1] ?? null;

  if (typeof window !== "undefined" && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[Oryn] candidate scores:", scored.map((s) => ({
      brand: s.product.brand, product: s.product.productName, score: s.score, reasons: s.reasons,
    })));
  }

  return { ideal, close, relaxed, unsafe: false };
}

/** Short one-liner describing why the Close Match differs from the Ideal. */
export function describeDifference(ideal: Product, close: Product): string {
  const diffs: string[] = [];
  if (ideal.sweetener !== close.sweetener) diffs.push(`different sweetener (${close.sweetener.split(" ")[0]})`);
  if (Math.abs(ideal.pricePerKg - close.pricePerKg) >= 300) {
    diffs.push(close.pricePerKg < ideal.pricePerKg ? "cheaper price tier" : "higher price tier");
  }
  if (ideal.gutFriendly && !close.gutFriendly) diffs.push("less gut-optimized");
  return diffs.length ? diffs.slice(0, 2).join(", ") : "closest runner-up on macros and label";
}

// Brand list ordered for the calibration survey — Cosmix first.
export const CALIBRATION_BRANDS: string[] = (() => {
  const uniq: string[] = [];
  for (const p of PRODUCTS) if (!uniq.includes(p.brand)) uniq.push(p.brand);
  return [
    "Cosmix",
    ...uniq.filter((b) => b !== "Cosmix"),
    "None / on Whey",
  ];
})();
