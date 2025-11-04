import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const recipients = (Deno.env.get("REPORT_EMAILS") || "eric@worldcup26fanzone.com")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[daily-report] Missing Supabase service credentials");
    return new Response("Missing Supabase service credentials", { status: 500 });
  }

  if (!resendKey) {
    console.error("[daily-report] RESEND_API_KEY not configured");
    return new Response("RESEND_API_KEY not configured", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: stats, error } = await supabase
    .from("analytics_overview")
    .select("*")
    .maybeSingle();

  if (error || !stats) {
    console.error("[daily-report] Analytics query failed", error);
    return new Response("Error fetching analytics", { status: 500 });
  }

  const body = [
    "📊 Fan Zone Daily Report",
    "-------------------------",
    `Date: ${stats.report_date}`,
    `New Users (24h): ${stats.new_users_24h}`,
    `Total Users: ${stats.total_users}`,
    `Trip Plans (24h): ${stats.trip_plans_24h}`,
    `Total Trip Plans: ${stats.total_trip_plans}`,
    `Flights Generated (24h): ${stats.flight_plans_24h}`,
    `Total Flights Generated: ${stats.flight_plans_total}`,
    `Lodging Plans (24h): ${stats.lodging_plans_24h}`,
    `Total Lodging Plans: ${stats.lodging_plans_total}`,
  ].join("\n");

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fan Zone Reports <reports@worldcup26fanzone.com>",
        to: recipients,
        subject: `Fan Zone Daily Report – ${stats.report_date}`,
        text: body,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text().catch(() => "");
      console.error("[daily-report] Resend API error", emailRes.status, errText);
      return new Response("Failed to send report", { status: 502 });
    }
  } catch (sendError) {
    console.error("[daily-report] Failed to send report", sendError);
    return new Response("Failed to send report", { status: 500 });
  }

  return new Response("OK");
});
