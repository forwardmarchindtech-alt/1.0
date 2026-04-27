import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const exportFormat = url.searchParams.get("export");

    // Fetch all data
    const [usageResult, visitsResult, loginsResult, profilesResult] = await Promise.all([
      supabase.from("usage_logs").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("page_visits").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("login_events").select("*").order("logged_in_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("id, email, full_name, avatar_url, created_at"),
    ]);

    const usageLogs = usageResult.data || [];
    const pageVisits = visitsResult.data || [];
    const loginEvents = loginsResult.data || [];
    const profiles = profilesResult.data || [];

    // Aggregate counts
    const { count: totalVisits } = await supabase.from("page_visits").select("*", { count: "exact", head: true });
    const { count: totalGenerations } = await supabase.from("usage_logs").select("*", { count: "exact", head: true });
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: totalLogins } = await supabase.from("login_events").select("*", { count: "exact", head: true });

    // Type breakdown
    const typeBreakdown: Record<string, number> = {};
    usageLogs.forEach((log: any) => {
      typeBreakdown[log.design_type] = (typeBreakdown[log.design_type] || 0) + 1;
    });

    // Daily visits (last 30 days)
    const dailyVisits: Record<string, number> = {};
    pageVisits.forEach((v: any) => {
      const day = new Date(v.created_at).toISOString().split("T")[0];
      dailyVisits[day] = (dailyVisits[day] || 0) + 1;
    });

    // Daily signups
    const dailySignups: Record<string, number> = {};
    profiles.forEach((p: any) => {
      const day = new Date(p.created_at).toISOString().split("T")[0];
      dailySignups[day] = (dailySignups[day] || 0) + 1;
    });

    // Daily active users (unique user_ids per day from login_events)
    const dailyActiveUsers: Record<string, Set<string>> = {};
    loginEvents.forEach((e: any) => {
      const day = new Date(e.logged_in_at).toISOString().split("T")[0];
      if (!dailyActiveUsers[day]) dailyActiveUsers[day] = new Set();
      if (e.user_id) dailyActiveUsers[day].add(e.user_id);
    });
    const dailyDAU: Record<string, number> = {};
    Object.entries(dailyActiveUsers).forEach(([day, set]) => {
      dailyDAU[day] = set.size;
    });

    // Average session duration (minutes)
    let totalDuration = 0;
    let sessionCount = 0;
    loginEvents.forEach((e: any) => {
      if (e.session_end_at && e.logged_in_at) {
        const dur = (new Date(e.session_end_at).getTime() - new Date(e.logged_in_at).getTime()) / 60000;
        if (dur > 0 && dur < 1440) { // cap at 24h
          totalDuration += dur;
          sessionCount++;
        }
      }
    });
    const avgSessionMinutes = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;

    // Provider breakdown
    const providerBreakdown: Record<string, number> = {};
    loginEvents.forEach((e: any) => {
      const p = e.provider || "email";
      providerBreakdown[p] = (providerBreakdown[p] || 0) + 1;
    });

    const payload = {
      totalVisits: totalVisits || 0,
      totalGenerations: totalGenerations || 0,
      totalUsers: totalUsers || 0,
      totalLogins: totalLogins || 0,
      avgSessionMinutes,
      typeBreakdown,
      dailyVisits,
      dailySignups,
      dailyDAU,
      providerBreakdown,
      recentUsage: usageLogs.slice(0, 50),
      recentVisits: pageVisits.slice(0, 50),
      recentLogins: loginEvents.slice(0, 50),
      profiles: profiles.slice(0, 100),
    };

    // CSV export
    if (exportFormat === "csv") {
      const rows = ["date,visits,signups,dau,generations"];
      const allDays = new Set([
        ...Object.keys(dailyVisits),
        ...Object.keys(dailySignups),
        ...Object.keys(dailyDAU),
      ]);
      const sortedDays = [...allDays].sort();
      
      // Count daily generations
      const dailyGens: Record<string, number> = {};
      usageLogs.forEach((l: any) => {
        const day = new Date(l.created_at).toISOString().split("T")[0];
        dailyGens[day] = (dailyGens[day] || 0) + 1;
      });

      sortedDays.forEach((day) => {
        rows.push(`${day},${dailyVisits[day] || 0},${dailySignups[day] || 0},${dailyDAU[day] || 0},${dailyGens[day] || 0}`);
      });

      return new Response(rows.join("\n"), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=analytics.csv",
        },
      });
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-analytics error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
