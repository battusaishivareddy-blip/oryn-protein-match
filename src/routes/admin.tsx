import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { OrynHeader } from "@/components/oryn/Shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Oryn Admin — Analytics Console" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const ADMIN_PASSWORD = "oryn2026";

type Session = {
  id: string; session_key: string; completed: boolean; last_completed_step: number;
  user_name: string | null; bmi: number | null; protein_need: number | null;
  responses: any; matched_ideal_brand: string | null; matched_budget_brand: string | null;
  survey_current_brand: string | null; survey_frustration: string | null; survey_sachet_interest: string | null;
  created_at: string;
};
type Waitlist = {
  id: string; name: string; email: string; phone: string;
  matched_ideal_brand: string | null; matched_budget_brand: string | null;
  bmi: number | null; protein_need: number | null;
  survey_current_brand: string | null; survey_frustration: string | null; survey_sachet_interest: string | null;
  created_at: string;
};

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("oryn_admin") === "1") setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream">
        <OrynHeader />
        <div className="mx-auto max-w-md px-6 pt-24">
          <p className="oryn-chip mb-6">Restricted</p>
          <h1 className="serif text-4xl text-ink">Analytics Console</h1>
          <p className="text-ink-muted mt-3 text-sm">Enter your access phrase to view the vault.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (pw === ADMIN_PASSWORD) { sessionStorage.setItem("oryn_admin", "1"); setAuthed(true); }
            else setErr(true);
          }} className="mt-8 space-y-4">
            <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }}
              placeholder="Access phrase"
              className="w-full border-0 border-b border-line bg-transparent py-3 text-lg text-ink focus:outline-none focus:border-accent" />
            {err && <p className="text-sm text-destructive">Incorrect access phrase.</p>}
            <button type="submit" className="oryn-btn oryn-btn-accent">Unlock →</button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [visits, setVisits] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [waitlist, setWaitlist] = useState<Waitlist[]>([]);
  const [q, setQ] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
    (async () => {
      const [{ count }, s, w] = await Promise.all([
        supabase.from("oryn_visits").select("id", { count: "exact", head: true }),
        supabase.from("oryn_sessions").select("*").order("created_at", { ascending: false }),
        supabase.from("oryn_waitlist").select("*").order("created_at", { ascending: false }),
      ]);
      setVisits(count ?? 0);
      setSessions((s.data ?? []) as Session[]);
      setWaitlist((w.data ?? []) as Waitlist[]);
    })();
  }, []);

  const started = sessions.length;
  const completedQuiz = sessions.filter((s) => s.last_completed_step >= 11).length;
  const converted = waitlist.length;

  const funnel = [
    { stage: "Visits", value: Math.max(visits, started) },
    { stage: "Quiz Starts", value: started },
    { stage: "Quiz Completed", value: completedQuiz },
    { stage: "Waitlist", value: converted },
  ];

  const dropOff = useMemo(() => {
    const steps = Array.from({ length: 11 }, (_, i) => i + 1);
    return steps.map((step) => ({
      step: `Q${step}`,
      users: sessions.filter((s) => s.last_completed_step >= step).length,
    }));
  }, [sessions]);

  const distributions = useMemo(() => {
    const buckets = (key: string, labelMap?: Record<string, string>) => {
      const counts: Record<string, number> = {};
      sessions.forEach((s) => {
        const v = s.responses?.[key];
        if (!v) return;
        const arr = Array.isArray(v) ? v : [v];
        arr.forEach((x: string) => {
          const label = labelMap?.[x] ?? x;
          counts[label] = (counts[label] ?? 0) + 1;
        });
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };
    return {
      objective: buckets("objective"),
      diet: buckets("diet"),
      allergens: buckets("allergens"),
      sweetener: buckets("sweetener"),
      budget: buckets("budget"),
      currentBrand: (() => {
        const c: Record<string, number> = {};
        waitlist.forEach((w) => {
          if (!w.survey_current_brand) return;
          c[w.survey_current_brand] = (c[w.survey_current_brand] ?? 0) + 1;
        });
        return Object.entries(c).map(([name, value]) => ({ name, value }));
      })(),
      frustration: (() => {
        const c: Record<string, number> = {};
        waitlist.forEach((w) => {
          if (!w.survey_frustration) return;
          c[w.survey_frustration] = (c[w.survey_frustration] ?? 0) + 1;
        });
        return Object.entries(c).map(([name, value]) => ({ name, value }));
      })(),
    };
  }, [sessions, waitlist]);

  const filtered = waitlist.filter((w) =>
    !q || [w.name, w.email, w.phone, w.matched_ideal_brand].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  function exportCSV() {
    const headers = ["Name", "Email", "Phone", "BMI", "Protein Need", "Ideal Match", "Budget Match", "Current Brand", "Frustration", "Sachet Interest", "Created"];
    const rows = filtered.map((w) => [
      w.name, w.email, w.phone, w.bmi ?? "", w.protein_need ?? "",
      w.matched_ideal_brand ?? "", w.matched_budget_brand ?? "",
      w.survey_current_brand ?? "", w.survey_frustration ?? "", w.survey_sachet_interest ?? "",
      new Date(w.created_at).toISOString(),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `oryn-waitlist-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrynHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="oryn-chip mb-3">Analytics Console</p>
            <h1 className="serif text-4xl text-ink">Oryn Data Vault</h1>
          </div>
          <button onClick={() => { sessionStorage.removeItem("oryn_admin"); location.reload(); }}
            className="text-xs uppercase tracking-[0.2em] text-ink-muted hover:text-ink">Sign out</button>
        </div>

        {/* Funnel */}
        <section className="mt-10 grid md:grid-cols-4 gap-4">
          {funnel.map((f, i) => {
            const prev = i === 0 ? f.value : funnel[i - 1].value;
            const pct = prev ? Math.round((f.value / prev) * 100) : 0;
            return (
              <div key={f.stage} className="oryn-card">
                <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">{f.stage}</p>
                <p className="serif text-4xl text-ink mt-3">{f.value}</p>
                <p className="text-xs text-ink-muted mt-1">{i === 0 ? "entry" : `${pct}% of prev`}</p>
              </div>
            );
          })}
        </section>

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <ChartCard title="Diagnostic Question Drop-Off">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dropOff}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd0" />
                <XAxis dataKey="step" stroke="#6b7867" fontSize={11} />
                <YAxis stroke="#6b7867" fontSize={11} />
                <Tooltip contentStyle={{ background: "#fcf8ef", border: "1px solid #d9cfb8", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="users" fill="#c97c4b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Kinetic Objectives">
            <DistPie data={distributions.objective} />
          </ChartCard>

          <ChartCard title="Dietary Frameworks">
            <DistPie data={distributions.diet} />
          </ChartCard>

          <ChartCard title="Budget Tiers">
            <DistBar data={distributions.budget} />
          </ChartCard>

          <ChartCard title="Allergen Filters">
            <DistBar data={distributions.allergens} />
          </ChartCard>

          <ChartCard title="Sweetener Preferences">
            <DistBar data={distributions.sweetener} />
          </ChartCard>

          <ChartCard title="Current Brand (Waitlist)">
            <DistBar data={distributions.currentBrand} />
          </ChartCard>

          <ChartCard title="Primary Frustration (Waitlist)">
            <DistBar data={distributions.frustration} />
          </ChartCard>
        </div>

        {/* Waitlist table */}
        <section className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="serif text-2xl text-ink">Waitlist Roster ({waitlist.length})</h2>
            <div className="flex gap-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
                className="border border-line rounded-md px-3 py-2 text-sm bg-card focus:outline-none focus:border-accent" />
              <button onClick={exportCSV} className="oryn-btn oryn-btn-accent">Export CSV</button>
            </div>
          </div>
          <div className="border border-line rounded-md overflow-x-auto bg-card">
            <table className="w-full text-sm">
              <thead className="bg-cream-deep/60 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                <tr>
                  {["Name", "Email", "Phone", "BMI", "g/day", "Ideal Match", "Budget Match", "Frustration", "Sachet", "Created"].map((h) => (
                    <th key={h} className="text-left px-3 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-t border-line">
                    <td className="px-3 py-2">{w.name}</td>
                    <td className="px-3 py-2">{w.email}</td>
                    <td className="px-3 py-2">{w.phone}</td>
                    <td className="px-3 py-2">{w.bmi ?? "—"}</td>
                    <td className="px-3 py-2">{w.protein_need ?? "—"}</td>
                    <td className="px-3 py-2">{w.matched_ideal_brand ?? "—"}</td>
                    <td className="px-3 py-2">{w.matched_budget_brand ?? "—"}</td>
                    <td className="px-3 py-2">{w.survey_frustration ?? "—"}</td>
                    <td className="px-3 py-2">{w.survey_sachet_interest ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(w.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="px-3 py-10 text-center text-ink-muted text-sm">No waitlist entries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* QR code */}
        <section className="mt-14 grid md:grid-cols-[auto_1fr] gap-8 items-center border border-ink rounded-md p-8 bg-ink text-cream">
          <div className="bg-cream p-4 rounded-md">
            {origin && <QRCodeSVG value={origin} size={168} fgColor="#1f2e1e" bgColor="#fcf8ef" />}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-accent-soft">Deployment Share</p>
            <h3 className="serif text-3xl mt-2">Scan to open Oryn on your device.</h3>
            <p className="text-sm text-cream/75 mt-3">{origin}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="oryn-card">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted mb-4">{title}</p>
      {children}
    </div>
  );
}

const PALETTE = ["#1f2e1e", "#c97c4b", "#8a9b7e", "#d9a066", "#4c5a4a", "#b46d3f", "#a8b39e", "#7a5533"];

function DistPie({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "#fcf8ef", border: "1px solid #d9cfb8", borderRadius: 6, fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function DistBar({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd0" />
        <XAxis type="number" stroke="#6b7867" fontSize={11} />
        <YAxis dataKey="name" type="category" stroke="#6b7867" fontSize={11} width={120} />
        <Tooltip contentStyle={{ background: "#fcf8ef", border: "1px solid #d9cfb8", borderRadius: 6, fontSize: 12 }} />
        <Bar dataKey="value" fill="#c97c4b" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return <div className="h-[240px] grid place-items-center text-xs uppercase tracking-[0.2em] text-ink-muted">No data yet</div>;
}
