/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { verifyServerSecret } from "@/lib/server/secret-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

function verifyCronSecret(request: NextRequest) {
  return verifyServerSecret(request, {
    envName: "CRON_SECRET",
    headerNames: ["x-cron-secret"],
  });
}

async function handleTranslateCron(request: NextRequest) {
  const auth = verifyCronSecret(request);
  if (auth === "missing-config") {
    console.error("[translate-cron] CRON_SECRET is not configured.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  if (auth !== "authorized") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client not initialized" },
      { status: 500 },
    );
  }

  const { data: jobs, error } = await supabase
    .from("translation_jobs")
    .select("*")
    .eq("status", "queued")
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ message: "No jobs" });
  }

  for (const job of jobs) {
    await supabase
      .from("translation_jobs")
      .update({ status: "auto" })
      .eq("id", job.id);
  }

  return NextResponse.json({
    processed: jobs.length,
  });
}

export async function GET(request: NextRequest) {
  return handleTranslateCron(request);
}

export async function POST(request: NextRequest) {
  return handleTranslateCron(request);
}
