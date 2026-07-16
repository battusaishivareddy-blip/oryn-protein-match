import { createServerFn } from "@tanstack/react-start";

// All Oryn table access runs through supabaseAdmin on the server.
// RLS denies anon access; only these server functions can read/write.

export const recordVisit = createServerFn({ method: "POST" })
  .inputValidator((d: { visitKey: string; path: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("oryn_visits").insert({ visit_key: data.visitKey, path: data.path });
    return { ok: true };
  });

export const startSession = createServerFn({ method: "POST" })
  .inputValidator((d: { sessionKey: string; userName?: string | null; responses: unknown }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("oryn_sessions")
      .insert({
        session_key: data.sessionKey,
        last_completed_step: 1,
        user_name: data.userName ?? null,
        responses: (data.responses ?? {}) as any,
      })
      .select("id")
      .maybeSingle();
    return { id: row?.id ?? null };
  });

export const updateSessionResponses = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; responses: unknown }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("oryn_sessions").update({ responses: data.responses as any }).eq("id", data.id);
    return { ok: true };
  });

export const finalizeSession = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      sessionKey: string;
      userName: string;
      bmi: number;
      proteinNeed: number;
      responses: unknown;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("oryn_sessions")
      .upsert(
        {
          session_key: data.sessionKey,
          completed: false,
          last_completed_step: 11,
          user_name: data.userName,
          bmi: data.bmi,
          protein_need: data.proteinNeed,
          responses: data.responses as any,
        },
        { onConflict: "session_key" },
      )
      .select("id")
      .maybeSingle();
    return { id: row?.id ?? null };
  });

export const recordMatches = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; ideal: string | null; budget: string | null }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("oryn_sessions")
      .update({ matched_ideal_brand: data.ideal, matched_budget_brand: data.budget })
      .eq("id", data.id);
    return { ok: true };
  });

export const submitWaitlist = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      sessionId: string | null;
      name: string;
      email: string;
      phone: string;
      matchedIdeal: string | null;
      matchedBudget: string | null;
      bmi: number;
      proteinNeed: number;
      surveyBrand: string | null;
      frustration: string | null;
      sachet: string | null;
      responses: unknown;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("oryn_waitlist").insert({
      session_id: data.sessionId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      matched_ideal_brand: data.matchedIdeal,
      matched_budget_brand: data.matchedBudget,
      bmi: data.bmi,
      protein_need: data.proteinNeed,
      survey_current_brand: data.surveyBrand,
      survey_frustration: data.frustration,
      survey_sachet_interest: data.sachet,
      responses: data.responses as any,
    });
    if (data.sessionId) {
      await supabaseAdmin
        .from("oryn_sessions")
        .update({
          completed: true,
          survey_current_brand: data.surveyBrand,
          survey_frustration: data.frustration,
          survey_sachet_interest: data.sachet,
        })
        .eq("id", data.sessionId);
    }
    return { ok: true };
  });

const ADMIN_PASSWORD = "oryn2026";

export const getAdminData = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    const expected = process.env.ORYN_ADMIN_PASSWORD || ADMIN_PASSWORD;
    if (data.password !== expected) {
      throw new Error("Unauthorized");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [visitsRes, sessionsRes, waitlistRes] = await Promise.all([
      supabaseAdmin.from("oryn_visits").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("oryn_sessions").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("oryn_waitlist").select("*").order("created_at", { ascending: false }),
    ]);
    return {
      visits: visitsRes.count ?? 0,
      sessions: sessionsRes.data ?? [],
      waitlist: waitlistRes.data ?? [],
    };
  });
