import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OrynHeader, OrynFooter, OrynBotanical, ScreenFrame } from "@/components/oryn/Shell";
import { getGeminiRecommendation, type GeminiRecommendation } from "@/lib/gemini.functions";
import {
  recordVisit, startSession, updateSessionResponses, finalizeSession, recordMatches, submitWaitlist as submitWaitlistFn,
} from "@/lib/oryn-backend.functions";
import {
  computeBMI, bmiClass, computeProteinNeed, findMatches, PRODUCTS, CALIBRATION_BRANDS,
  FLAVOR_LABELS, describeDifference, type FlavorKey, type Profile, type Product, type MatchResult,
} from "@/lib/oryn-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oryn — Find the plant protein that fits you. In 60 seconds." },
      { name: "description", content: "India's first AI protein-matching engine. Cross-referenced against the entire Indian market. 100% free analysis." },
      { property: "og:title", content: "Oryn — Find the plant protein that fits you. In 60 seconds." },
      { property: "og:description", content: "India's first AI protein-matching engine. Cross-referenced against the entire Indian market. 100% free analysis." },
    ],
  }),
  component: Home,
});

type Step =
  | "landing" | "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10" | "q11"
  | "processing" | "results" | "waitlist" | "thanks";

const QUIZ_STEPS: Step[] = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11"];

function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionKey = useRef<string>("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Profile["sex"] | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [objective, setObjective] = useState<Profile["objective"] | "">("");
  const [activity, setActivity] = useState<Profile["activity"] | "">("");
  const [diet, setDiet] = useState<Profile["diet"] | "">("");
  const [health, setHealth] = useState<string[]>([]);
  const [gut, setGut] = useState<Profile["gut"] | "">("");
  const [sweetener, setSweetener] = useState<Profile["sweetener"] | "">("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [budget, setBudget] = useState<Profile["budget"] | "">("");
  const [flavor, setFlavor] = useState<FlavorKey | "">("");
  const [habit, setHabit] = useState("");

  const [surveyBrand, setSurveyBrand] = useState("");
  const [frustration, setFrustration] = useState("");
  const [sachet, setSachet] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [aiRec, setAiRec] = useState<GeminiRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const key = crypto.randomUUID();
    sessionKey.current = key;
    recordVisit({ data: { visitKey: key, path: "/" } }).catch(() => {});
  }, []);

  const profile: Profile | null = useMemo(() => {
    if (!name || !age || !sex || !heightCm || !weightKg || !objective || !activity || !diet || !gut || !sweetener || !budget) return null;
    return {
      name, age: +age, sex: sex as Profile["sex"], heightCm: +heightCm, weightKg: +weightKg,
      objective: objective as Profile["objective"], activity: activity as Profile["activity"],
      diet: diet as Profile["diet"], health, gut: gut as Profile["gut"],
      sweetener: sweetener as Profile["sweetener"], allergens, budget: budget as Profile["budget"],
      flavor, habit,
    };
  }, [name, age, sex, heightCm, weightKg, objective, activity, diet, health, gut, sweetener, allergens, budget, flavor, habit]);

  const bmi = useMemo(() => profile ? computeBMI(profile.heightCm, profile.weightKg) : 0, [profile]);
  const proteinNeed = useMemo(() => profile ? computeProteinNeed(profile) : 0, [profile]);
  const matches: MatchResult | null = useMemo(() => profile ? findMatches(profile) : null, [profile]);

  async function persistSession(patch: Record<string, unknown>) {
    if (!sessionId) {
      const res = await startSession({
        data: {
          sessionKey: sessionKey.current || crypto.randomUUID(),
          userName: name || null,
          responses: patch,
        },
      });
      if (res.id) setSessionId(res.id);
    } else {
      await updateSessionResponses({ data: { id: sessionId, responses: patch } });
    }
  }

  function next(from: Step) {
    const idx = QUIZ_STEPS.indexOf(from as any);
    if (idx >= 0 && idx < QUIZ_STEPS.length - 1) setStep(QUIZ_STEPS[idx + 1]);
    else if (from === "q11") setStep("processing");
  }

  function startQuiz() { setStep("q1"); }

  async function finishQuiz() {
    if (!profile) return;
    setStep("processing");
    const responses = { ...profile };
    const res = await finalizeSession({
      data: {
        sessionKey: sessionKey.current,
        userName: profile.name,
        bmi,
        proteinNeed,
        responses,
      },
    });
    if (res.id) setSessionId(res.id);
  }

  useEffect(() => {
    if (step !== "processing") return;
    let cancelled = false;

    if (profile && matches) {
      setAiLoading(true);
      setAiRec(null);
      const candidatePool = [matches.ideal, matches.close].filter(Boolean).map((m) => ({
        brand: m!.product.brand, productName: m!.product.productName, score: m!.score, reasons: m!.reasons,
      }));
      getGeminiRecommendation({
        data: {
          profile: {
            name: profile.name, age: profile.age, sex: profile.sex,
            heightCm: profile.heightCm, weightKg: profile.weightKg,
            objective: profile.objective, activity: profile.activity, diet: profile.diet,
            gut: profile.gut, sweetener: profile.sweetener, budget: profile.budget,
            allergens: profile.allergens, flavor: profile.flavor, habit: profile.habit,
          },
          bmi, proteinNeed, candidatePool, relaxed: matches.relaxed,
        },
      })
        .then((rec) => { if (!cancelled) setAiRec(rec); })
        .catch((err) => { console.error("[Oryn] Gemini call failed:", err); })
        .finally(() => { if (!cancelled) setAiLoading(false); });
    }

    const t = setTimeout(async () => {
      if (matches && sessionId) {
        await recordMatches({
          data: {
            id: sessionId,
            ideal: matches.ideal?.product.brand ?? null,
            budget: matches.close?.product.brand ?? null,
          },
        });
      }
      if (!cancelled) setStep("results");
    }, 5200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [step, matches, sessionId, profile, bmi, proteinNeed]);

  async function submitWaitlist() {
    if (!profile || !matches) return;
    await submitWaitlistFn({
      data: {
        sessionId,
        name: profile.name,
        email,
        phone,
        matchedIdeal: matches.ideal?.product.brand ?? null,
        matchedBudget: matches.close?.product.brand ?? null,
        bmi,
        proteinNeed,
        surveyBrand: surveyBrand || null,
        frustration: frustration || null,
        sachet: sachet || null,
        responses: profile,
      },
    });
    setStep("thanks");
  }


  const progress = (() => {
    const idx = QUIZ_STEPS.indexOf(step as any);
    if (idx >= 0) return { current: idx + 1, total: QUIZ_STEPS.length };
    return undefined;
  })();

  return (
    <ScreenFrame progress={progress}>
      {step === "landing" && <Landing onStart={startQuiz} />}
      <AnimatePresence mode="wait">
        {step === "q1" && <Q key="q1" title="Physical Architecture"
          why="We use your exact BMI and physical metrics to establish a true daily macro baseline, bypassing generic, one-size-fits-all scoop sizing."
          onNext={() => { persistSession({ q1: { name, age, sex, heightCm, weightKg } }); next("q1"); }}
          canNext={!!(name && age && sex && heightCm && weightKg)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name" value={name} onChange={setName} placeholder="Aarav Sharma" />
            <Field label="Age" value={age} onChange={setAge} type="number" placeholder="27" />
            <SelectCards label="Biological Sex" value={sex} onChange={(v) => setSex(v as any)} options={[
              { v: "male", l: "Male" }, { v: "female", l: "Female" }, { v: "other", l: "Other" },
            ]} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Height (cm)" value={heightCm} onChange={setHeightCm} type="number" placeholder="175" />
              <Field label="Weight (kg)" value={weightKg} onChange={setWeightKg} type="number" placeholder="72" />
            </div>
          </div>
          {name && age && heightCm && weightKg && (
            <div className="mt-6 rounded-md border border-line bg-cream-deep/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Live calculation</p>
              <p className="serif text-xl text-ink mt-1">
                BMI {computeBMI(+heightCm, +weightKg)} · {bmiClass(computeBMI(+heightCm, +weightKg))}
              </p>
              <p className="text-xs text-ink-muted mt-2">General wellness guidance, not medical advice.</p>
            </div>
          )}
        </Q>}

        {step === "q2" && <Q key="q2" title="Target Kinetic Objective" why="Your objective changes your daily target macros and how your amino acid breakdown must be structured."
          onNext={() => { persistSession({ q2: objective }); next("q2"); }} canNext={!!objective}>
          <Choice value={objective} onChange={(v) => setObjective(v as any)} options={[
            { v: "fat-loss", l: "Optimized Fat Loss" },
            { v: "muscle-gain", l: "Accelerated Lean Muscle Mass Gain" },
            { v: "longevity", l: "Metabolic Health & Longevity" },
            { v: "maintenance", l: "Daily Maintenance" },
          ]} />
        </Q>}

        {step === "q3" && <Q key="q3" title="Activity & Metabolic Load" why="This informs the daily dose your body needs — activity does not filter which brands you see."
          onNext={() => { persistSession({ q3: activity }); next("q3"); }} canNext={!!activity}>
          <Choice value={activity} onChange={(v) => setActivity(v as any)} options={[
            { v: "sedentary", l: "Sedentary", d: "Minimal training strain" },
            { v: "light", l: "Lightly Active", d: "1–2 structural workouts / week" },
            { v: "moderate", l: "Moderately Active", d: "3–4 intensive sessions / week" },
            { v: "high", l: "High Output Athlete", d: "5+ high-intensity sessions / week" },
          ]} />
        </Q>}

        {step === "q4" && <Q key="q4" title="Dietary Framework" why="A hard filter — non-compliant bases are excluded from the pool entirely."
          onNext={() => { persistSession({ q4: diet }); next("q4"); }} canNext={!!diet}>
          <Choice value={diet} onChange={(v) => setDiet(v as any)} options={[
            { v: "vegan", l: "🌱 Vegan" },
            { v: "vegetarian", l: "🥛 Vegetarian" },
          ]} />
        </Q>}

        {step === "q5" && <Q key="q5" title="Clinical Health & Lifestyle" why="Contextual signal for the AI — helps it flag ingredients that compound underlying stressors."
          onNext={() => { persistSession({ q5: health }); next("q5"); }} canNext={health.length > 0}>
          <Multi value={health} onChange={setHealth} options={[
            { v: "diabetes", l: "Diabetes / Insulin Resistance" },
            { v: "pcos", l: "PCOS Management" },
            { v: "acid", l: "Acid Reflux / High Acidity" },
            { v: "acne", l: "Acne-Prone Skin" },
            { v: "none", l: "None of these apply" },
          ]} />
        </Q>}

        {step === "q6" && <Q key="q6" title="Gut & Sensitivity Metrics" why="Plant bases ferment differently in the gut. This is a strong filter to prevent post-shake discomfort."
          onNext={() => { persistSession({ q6: gut }); next("q6"); }} canNext={!!gut}>
          <Choice value={gut} onChange={(v) => setGut(v as any)} options={[
            { v: "pristine", l: "No issues", d: "Digestion is clean" },
            { v: "bloating", l: "Occasional Bloating or Gas" },
            { v: "ibs", l: "Sensitive Stomach / IBS Archetype" },
          ]} />
        </Q>}

        {step === "q7" && <Q key="q7" title="Sweetener Matrix Preference" why="A strong filter — sweeteners drive both aftertaste and long-term compliance."
          onNext={() => { persistSession({ q7: sweetener }); next("q7"); }} canNext={!!sweetener}>
          <Choice value={sweetener} onChange={(v) => setSweetener(v as any)} options={[
            { v: "stevia", l: "Stevia Extract is fine" },
            { v: "monk", l: "Monk Fruit Extract only" },
            { v: "raw", l: "100% Unsweetened / Raw Base" },
            { v: "any", l: "Doesn't matter to me" },
          ]} />
        </Q>}

        {step === "q8" && <Q key="q8" title="Immuno-Allergen Filter" why="Absolute hard filter — allergen conflicts are always excluded, no exceptions."
          onNext={() => { persistSession({ q8: allergens }); next("q8"); }} canNext={allergens.length > 0}>
          <Multi value={allergens} onChange={setAllergens} options={[
            { v: "soy", l: "Soy Fractions" },
            { v: "nuts", l: "Tree Nuts" },
            { v: "gluten", l: "Gluten Traces" },
            { v: "none", l: "Zero Known Allergens" },
          ]} />
        </Q>}

        {step === "q9" && <Q key="q9" title="Economic Budget Allocation" why="Used only to break ties among candidates that already passed gut, sweetener and allergen checks."
          onNext={() => { persistSession({ q9: budget }); next("q9"); }} canNext={!!budget}>
          <Choice value={budget} onChange={(v) => setBudget(v as any)} options={[
            { v: "value", l: "Entry / Value Tier", d: "Under ₹1,500 per kg" },
            { v: "mid", l: "Mid-Premium Tier", d: "₹1,500 – ₹2,500 per kg" },
            { v: "luxury", l: "Luxury Performance", d: "₹2,500+ per kg" },
            { v: "any", l: "Budget is not a constraint" },
          ]} />
        </Q>}

        {step === "q10" && <Q key="q10" title="Flavor Preference" why="Pick one — a tie-breaker, never overrides gut, sweetener or allergen filters."
          onNext={() => { persistSession({ q10: flavor }); next("q10"); }} canNext={!!flavor}>
          <Choice value={flavor} onChange={(v) => setFlavor(v as FlavorKey)} options={
            (Object.entries(FLAVOR_LABELS) as [FlavorKey, string][]).map(([v, l]) => ({ v, l }))
          } />
        </Q>}

        {step === "q11" && <Q key="q11" title="Historical Supplement Habit" why="Benchmarks compliance to optimize onboarding — context only, not a filter."
          onNext={() => { persistSession({ q11: habit }); finishQuiz(); }} canNext={!!habit} nextLabel="Run Analysis">
          <Choice value={habit} onChange={setHabit} options={[
            { v: "plant", l: "Currently on a plant protein blend" },
            { v: "whey", l: "Currently on whey derivatives" },
            { v: "new", l: "Completely new to supplements" },
            { v: "lapsed", l: "Used to, but stopped from frustration" },
          ]} />
        </Q>}

        {step === "processing" && <Processing key="proc" />}
        {step === "results" && profile && matches && (
          <Results key="results" profile={profile} bmi={bmi} proteinNeed={proteinNeed} matches={matches}
            aiRec={aiRec} aiLoading={aiLoading}
            survey={{ surveyBrand, setSurveyBrand, frustration, setFrustration, sachet, setSachet }}
            onContinue={() => setStep("waitlist")} />
        )}
        {step === "waitlist" && profile && (
          <Waitlist key="wait" name={name} setName={setName} email={email} setEmail={setEmail}
            phone={phone} setPhone={setPhone} onSubmit={submitWaitlist} />
        )}
        {step === "thanks" && profile && <Thanks key="thanks" name={name} />}
      </AnimatePresence>

      {step === "landing" && <OrynFooter />}
    </ScreenFrame>
  );
}

/* -------------------------------- Landing -------------------------------- */

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <>
      <OrynHeader />
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-32 md:pb-32 grid md:grid-cols-[1.4fr_1fr] gap-16 items-center">
          <div>
            <p className="oryn-chip mb-8">India's First AI Protein-Matching Engine</p>
            <h1 className="serif text-5xl md:text-7xl leading-[1.02] text-ink">
              Find the plant protein<br />that fits you.<br />
              <span className="text-accent">In 60 seconds.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg text-ink-soft leading-relaxed">
              Oryn instantly analyzes your physical architecture against every prominent plant protein
              product in the Indian market — then recommends the closest fit for your body.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <button onClick={onStart} className="oryn-btn oryn-btn-accent text-base px-8 py-4">
                Start My 60-Second Match →
              </button>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-muted pt-4">
                AI-Engineered · Optimized for Indian Phenotypes · 100% Free Analysis
              </div>
            </div>
          </div>
          <div className="hidden md:block relative aspect-square text-ink">
            <OrynBotanical className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted">Metric</p>
                <p className="serif text-4xl text-ink mt-1">Top 20 Brands</p>
                <p className="text-xs text-ink-muted mt-1">cross-referenced</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-cream-deep/50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="serif text-2xl md:text-3xl text-ink max-w-3xl leading-snug">
            "Made in India. Made for India. Cross-referenced against the entire Indian market."
          </p>
        </div>
      </section>
    </>
  );
}

/* --------------------------------- Quiz UI --------------------------------- */

function Q({ title, why, children, onNext, canNext, nextLabel = "Continue", hint }: {
  title: string; why: string; children: React.ReactNode;
  onNext: () => void; canNext: boolean; nextLabel?: string; hint?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="mx-auto max-w-3xl px-6 pt-24 pb-16"
    >
      <p className="oryn-chip mb-6">Diagnostic</p>
      <h2 className="serif text-4xl md:text-5xl text-ink">{title}</h2>
      <p className="mt-3 text-sm text-ink-muted italic">Why this matters — {why}</p>
      {hint && <p className="mt-1 text-xs uppercase tracking-[0.2em] text-accent">{hint}</p>}
      <div className="mt-10">{children}</div>
      <div className="mt-10 flex justify-end">
        <button onClick={onNext} disabled={!canNext}
          className="oryn-btn oryn-btn-accent disabled:opacity-30 disabled:cursor-not-allowed">
          {nextLabel} →
        </button>
      </div>
    </motion.section>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-2 w-full border-0 border-b border-line bg-transparent py-3 text-lg text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-accent transition-colors" />
    </label>
  );
}

function Choice({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { v: string; l: string; d?: string }[];
}) {
  return (
    <div className="grid gap-3">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`text-left rounded-md border p-5 transition-all ${
            value === o.v ? "border-accent bg-accent/5 shadow-sm" : "border-line bg-card hover:border-ink-muted"
          }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="serif text-xl text-ink">{o.l}</p>
              {o.d && <p className="text-sm text-ink-muted mt-1">{o.d}</p>}
            </div>
            <span className={`mt-2 h-3 w-3 rounded-full border ${value === o.v ? "bg-accent border-accent" : "border-line"}`} />
          </div>
        </button>
      ))}
    </div>
  );
}

function SelectCards({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">{label}</span>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button key={o.v} onClick={() => onChange(o.v)}
            className={`rounded-md border py-3 text-sm transition-all ${
              value === o.v ? "border-accent bg-accent/5 text-ink" : "border-line bg-card text-ink-soft hover:border-ink-muted"
            }`}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Multi({ value, onChange, options }: {
  value: string[]; onChange: (v: string[]) => void; options: { v: string; l: string }[];
}) {
  const toggle = (v: string) => {
    if (v === "none") { onChange(["none"]); return; }
    const next = value.includes(v) ? value.filter((x) => x !== v) : [...value.filter((x) => x !== "none"), v];
    onChange(next);
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const on = value.includes(o.v);
        return (
          <button key={o.v} onClick={() => toggle(o.v)}
            className={`text-left rounded-md border p-4 transition-all ${
              on ? "border-accent bg-accent/5" : "border-line bg-card hover:border-ink-muted"
            }`}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-ink">{o.l}</p>
              <span className={`h-4 w-4 rounded-sm border ${on ? "bg-accent border-accent" : "border-line"}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Processing ------------------------------ */

const PROCESS_LINES = [
  "Parsing your physical architecture and calculating your daily protein target…",
  "Running allergen and dietary hard filters against the Indian catalogue…",
  "Cross-referencing gut sensitivity and sweetener preferences…",
  "Ranking candidates by macro density, label cleanliness and fit…",
  "Finalising your ideal match and closest alternative…",
];

function Processing() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, PROCESS_LINES.length - 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="mx-auto max-w-3xl px-6 pt-32 pb-24 min-h-[70vh]">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-40 w-40 text-ink">
          <OrynBotanical className="w-full h-full animate-spin" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
        <p className="oryn-chip mt-10">Analysis in progress</p>
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }} className="serif text-xl md:text-2xl text-ink mt-8 max-w-2xl leading-snug">
            {PROCESS_LINES[i]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-10 flex gap-1">
          {PROCESS_LINES.map((_, idx) => (
            <span key={idx} className={`h-[3px] w-8 ${idx <= i ? "bg-accent" : "bg-line"}`} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* -------------------------------- Results -------------------------------- */

function Results({ profile, bmi, proteinNeed, matches, aiRec, aiLoading, survey, onContinue }: {
  profile: Profile; bmi: number; proteinNeed: number; matches: MatchResult;
  aiRec: GeminiRecommendation | null; aiLoading: boolean;
  survey: {
    surveyBrand: string; setSurveyBrand: (v: string) => void;
    frustration: string; setFrustration: (v: string) => void;
    sachet: string; setSachet: (v: string) => void;
  };
  onContinue: () => void;
}) {
  // Resolve Gemini's picks against the live catalogue; fall back to the local scorer.
  const resolveByPick = (pick: { brand: string; productName?: string } | null | undefined): Product | null => {
    if (!pick) return null;
    const list = PRODUCTS.filter((p) => p.brand.toLowerCase() === pick.brand.toLowerCase());
    if (!list.length) return null;
    if (pick.productName) {
      const exact = list.find((p) => p.productName.toLowerCase() === pick.productName!.toLowerCase());
      if (exact) return exact;
    }
    return list[0];
  };
  const idealProduct = resolveByPick(aiRec?.idealMatch) ?? matches.ideal?.product ?? null;
  const closeProduct = resolveByPick(aiRec?.closeMatch) ?? matches.close?.product ?? null;
  const idealWhy = aiRec?.idealMatch?.why ?? matches.ideal?.reasons.slice(0, 2).join(". ") ?? "";
  const closeWhy = aiRec?.closeMatch?.why ?? matches.close?.reasons.slice(0, 2).join(". ") ?? "";

  // Flavor availability check
  const flavorMissingNote = (() => {
    if (!profile.flavor || !idealProduct) return null;
    if (!idealProduct.flavorTags.includes(profile.flavor)) {
      const flavorLabel = FLAVOR_LABELS[profile.flavor];
      return `${idealProduct.brand} does not currently offer ${flavorLabel}. You'll need to pick a different flavor from their range — we haven't silently swapped you to Chocolate.`;
    }
    return null;
  })();

  if (matches.unsafe || (!idealProduct && !closeProduct)) {
    return (
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl px-6 pt-24 pb-24">
        <p className="oryn-chip mb-6">Analysis complete</p>
        <h2 className="serif text-4xl md:text-5xl text-ink leading-tight">
          {profile.name.split(" ")[0]}, we can't recommend a product for you right now.
        </h2>
        <p className="mt-6 text-ink-soft leading-relaxed">
          Your allergen profile removes every product currently on Indian shelves in our catalogue. Rather
          than surface something unsafe, we'd rather be honest — please talk to a registered dietitian for
          a bespoke plan.
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-6 pt-24 pb-16">
      <p className="oryn-chip mb-6">Analysis complete</p>
      <h2 className="serif text-4xl md:text-6xl text-ink leading-[1.05]">
        Hey {profile.name.split(" ")[0]}, your physical architecture analysis is complete.
      </h2>
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Metric label="BMI" value={String(bmi)} sub={bmiClass(bmi)} />
        <Metric label="Daily Protein Target" value={`${proteinNeed}g`} sub="calibrated to your activity + objective" />
      </div>
      <p className="mt-8 text-sm text-ink-soft max-w-3xl">
        Based on your weight of {profile.weightKg}kg, your {profile.activity} activity load and a {profile.objective.replace("-", " ")} objective,
        your metabolism needs roughly {proteinNeed}g of protein daily — distributed across 2–3 doses for optimal amino acid saturation.
      </p>

      {matches.relaxed && (
        <div className="mt-6 rounded-md border border-accent/40 bg-accent/5 p-4 text-sm text-ink">
          <strong>Heads up:</strong> {matches.relaxed}
        </div>
      )}
      {flavorMissingNote && (
        <div className="mt-4 rounded-md border border-accent/40 bg-accent/5 p-4 text-sm text-ink">
          <strong>Flavor note:</strong> {flavorMissingNote}
        </div>
      )}

      {/* Gemini live recommendation */}
      <div className="mt-12 rounded-md border border-line bg-cream-deep/40 p-8 md:p-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="oryn-chip">Live Recommendation · Indian Market · July 2026</p>
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            {aiLoading ? "Composing…" : aiRec?.source === "gemini" ? "Generated for your profile" : "Prepared for your profile"}
          </span>
        </div>
        {aiLoading && !aiRec ? (
          <div className="mt-6 space-y-3">
            <div className="h-4 w-3/4 bg-line/70 animate-pulse rounded" />
            <div className="h-3 w-full bg-line/60 animate-pulse rounded" />
            <div className="h-3 w-5/6 bg-line/60 animate-pulse rounded" />
          </div>
        ) : aiRec ? (
          <div className="mt-6 space-y-6">
            <h3 className="serif text-2xl md:text-3xl text-ink leading-snug">{aiRec.headline}</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm leading-relaxed text-ink-soft">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Daily Protocol</p>
                <p className="mt-2">{aiRec.dailyProtocol}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Market Verdict</p>
                <p className="mt-2">{aiRec.marketVerdict}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Ideal + Close match */}
      <div className="mt-14 grid md:grid-cols-2 gap-6">
        {idealProduct && (
          <MatchCard badge="Ideal Match" ideal
            title="Ideal Match"
            brand={idealProduct.brand} productName={idealProduct.productName}
            reason={idealWhy}
            detail={["Base", "Protein / serving", "Cost / kg", "Sweetener"]}
            detailVal={[idealProduct.base, idealProduct.proteinPerServing, `₹${idealProduct.pricePerKg.toLocaleString("en-IN")}`, idealProduct.sweetener]}
          />
        )}
        {closeProduct && (
          <MatchCard badge="Close Match"
            title="Close Match"
            brand={closeProduct.brand} productName={closeProduct.productName}
            reason={`${closeWhy}${idealProduct ? ` What's different: ${describeDifference(idealProduct, closeProduct)}.` : ""}`}
            detail={["Base", "Protein / serving", "Cost / kg", "Sweetener"]}
            detailVal={[closeProduct.base, closeProduct.proteinPerServing, `₹${closeProduct.pricePerKg.toLocaleString("en-IN")}`, closeProduct.sweetener]}
          />
        )}
      </div>

      {/* Market Reality — Oryn Method hook */}
      <div className="mt-16">

        <div className="mt-10 rounded-md border border-ink bg-ink text-cream p-8 md:p-12">
          <p className="text-[10px] uppercase tracking-[0.24em] text-accent">Market Reality · The Oryn Method</p>
          <h3 className="serif text-3xl md:text-4xl mt-4 leading-tight">
            You've been sold a 1&nbsp;kg tub of one flavour. That's the problem.
          </h3>
          <div className="mt-6 space-y-5 text-cream/85 leading-relaxed max-w-3xl">
            <p>
              Every plant protein sold in India today ships as a locked-in 1&nbsp;kg tub of a single flavour and a
              single generic formula. By week two, most people quietly stop drinking it — flavour fatigue, bloating,
              a base that was never built for their gut, their diet or their allergens in the first place.
            </p>
            <p>
              Oryn flips that. Your base is engineered around <em>you</em> — your diet (vegan or vegetarian), your gut
              (sensitive, dairy-free, low-FODMAP), your allergen profile, your activity load and your daily protein
              need. No fillers you didn't ask for. No sweetener your system rejects. No stabilisers hiding in the
              fine print.
            </p>
            <p>
              On top of that clean, customised base, you pick from <strong className="text-cream">8 flavours</strong> —
              Chocolate, Vanilla, Coffee, Matcha, Mango, Cookies&nbsp;&amp;&nbsp;Cream, Strawberry and Kulfi. Lock in
              your favourite, or rotate a new one every day like a booster sachet. The base underneath stays built
              around you, either way.
            </p>
            <p className="text-cream">
              One clean base. Eight flavours. Zero flavour fatigue. That's the shift.
            </p>
          </div>
        </div>

      </div>

      {/* Calibration survey */}
      <div className="mt-20">
        <p className="oryn-chip mb-4">Cohort Signal</p>
        <h3 className="serif text-3xl text-ink">Help calibrate our first batch.</h3>
        <div className="mt-8 space-y-8">
          <SurveyBlock label="F1 — Which protein are you currently on?">
            <SurveyPills value={survey.surveyBrand} onChange={survey.setSurveyBrand} options={CALIBRATION_BRANDS} />
          </SurveyBlock>
          <SurveyBlock label="F2 — What's your primary frustration today?">
            <SurveyPills value={survey.frustration} onChange={survey.setFrustration} options={[
              "Flavor fatigue", "Bloating / digestion stress", "Excessive monthly cost",
              "Gritty / chalky mouthfeel", "Synthetic stabilisers & fillers",
            ]} />
          </SurveyBlock>
          <SurveyBlock label="F3 — Would a rotating flavour sachet system beat a single locked-in tub?">
            <SurveyPills value={survey.sachet} onChange={survey.setSachet} options={[
              "Yes — completely aligns", "Maybe — depends on pricing", "No — I prefer flavour consistency",
            ]} />
          </SurveyBlock>
        </div>
      </div>

      <div className="mt-14 flex justify-end">
        <button onClick={onContinue} className="oryn-btn oryn-btn-accent text-base px-8 py-4">
          Secure Priority Cohort →
        </button>
      </div>
    </motion.section>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="oryn-card">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">{label}</p>
      <p className="serif text-4xl text-ink mt-3">{value}</p>
      <p className="text-xs text-ink-muted mt-2">{sub}</p>
    </div>
  );
}

function MatchCard({ badge, ideal, title, brand, productName, reason, detail, detailVal }: {
  badge: string; ideal?: boolean; title: string; brand: string; productName?: string; reason: string;
  detail: string[]; detailVal: string[];
}) {
  return (
    <div className={`rounded-md border p-6 flex flex-col ${ideal ? "border-accent bg-accent/5" : "border-line bg-card"}`}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">{title}</p>
        <span className="serif text-sm text-accent">{badge}</span>
      </div>
      <h4 className="serif text-2xl text-ink mt-4 leading-tight">{brand}</h4>
      {productName && <p className="text-xs text-ink-muted mt-1">{productName}</p>}
      <p className="text-sm text-ink-soft mt-3 leading-relaxed">{reason}</p>
      <dl className="mt-5 pt-5 border-t border-line/70 grid grid-cols-2 gap-3 text-xs">
        {detail.map((d, i) => (
          <div key={d}>
            <dt className="uppercase tracking-[0.16em] text-ink-muted text-[10px]">{d}</dt>
            <dd className="text-ink mt-1">{detailVal[i]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SurveyBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="serif text-lg text-ink mb-3">{label}</p>
      {children}
    </div>
  );
}

function SurveyPills({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`rounded-full border px-4 py-2 text-sm transition-all ${
            value === o ? "border-accent bg-accent text-cream" : "border-line bg-card text-ink-soft hover:border-ink-muted"
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- Waitlist ------------------------------- */

function Waitlist({ name, setName, email, setEmail, phone, setPhone, onSubmit }: {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  onSubmit: () => void;
}) {
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email) && phone.replace(/\D/g, "").length >= 7;
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mx-auto max-w-2xl px-6 pt-24 pb-24">
      <p className="oryn-chip mb-6">Priority Cohort</p>
      <h2 className="serif text-4xl md:text-5xl text-ink leading-tight">Secure Priority Cohort Placement for Oryn.</h2>
      <p className="mt-4 text-ink-soft">
        Join our priority access group to secure allocation in the first customised batch.
      </p>
      <div className="mt-10 space-y-6">
        <Field label="Full Name" value={name} onChange={setName} />
        <Field label="Primary Email" value={email} onChange={setEmail} type="email" placeholder="you@domain.com" />
        <Field label="Mobile" value={phone} onChange={setPhone} placeholder="+91 …" />
      </div>
      <button onClick={onSubmit} disabled={!valid}
        className="oryn-btn oryn-btn-accent mt-10 w-full sm:w-auto text-base px-8 py-4 disabled:opacity-30 disabled:cursor-not-allowed">
        Request Priority Access →
      </button>
    </motion.section>
  );
}

function Thanks({ name }: { name: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-6 pt-24 pb-24">
      <p className="oryn-chip mb-6">You're in the cohort</p>
      <h2 className="serif text-4xl md:text-5xl text-ink leading-tight">
        You're in, {name.split(" ")[0]}.
      </h2>
      <p className="mt-6 text-ink-soft leading-relaxed">
        Your profile is locked into the priority cohort. We're calibrating the first batch around bodies like
        yours — you'll hear from us the moment allocation opens. Something considered is coming.
      </p>
    </motion.section>
  );
}
