/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { verifyServerSecret } from "@/lib/server/secret-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const TRANSLATION_PROCESSOR_UNAVAILABLE =
  "Translation processor is not configured. Job was not marked complete and no translated content was written.";

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
    .select("id, attempts")
    .eq("status", "queued")
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ message: "No jobs" });
  }

  let failedUpdates = 0;
  const now = new Date().toISOString();

  for (const job of jobs) {
    const attempts = typeof job.attempts === "number" ? job.attempts : 0;
    const { error: updateError } = await supabase
      .from("translation_jobs")
      .update({
        status: "failed",
        attempts: attempts + 1,
        last_error: TRANSLATION_PROCESSOR_UNAVAILABLE,
        locked_at: null,
        updated_at: now,
      })
      .eq("id", job.id);

    if (updateError) {
      failedUpdates += 1;
      console.error("[translate-cron] Failed to mark translation job as failed.", {
        jobId: job.id,
        error: updateError.message,
      });
    }
  }

  if (failedUpdates > 0) {
    return NextResponse.json(
      {
        error: "Failed to update one or more queued translation jobs.",
        failedUpdates,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    processed: 0,
    failed: jobs.length,
    message: TRANSLATION_PROCESSOR_UNAVAILABLE,
  });
}

export async function GET(request: NextRequest) {
  return handleTranslateCron(request);
}

export async function POST(request: NextRequest) {
  return handleTranslateCron(request);
}
