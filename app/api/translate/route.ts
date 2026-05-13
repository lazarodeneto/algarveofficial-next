/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { verifyServerSecret } from "@/lib/server/secret-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { processListingTranslationJob } from "@/lib/translations/listingProcessor";
import {
  TRANSLATION_PROCESSOR_UNAVAILABLE,
  getTranslationProcessorCapabilities,
} from "@/lib/translations/processorConfig";

export const runtime = "nodejs";

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

  const capabilities = getTranslationProcessorCapabilities();
  if (!capabilities.configured) {
    return NextResponse.json({
      processed: 0,
      skipped: jobs.length,
      failed: 0,
      message: TRANSLATION_PROCESSOR_UNAVAILABLE,
    });
  }

  let processed = 0;
  let failed = 0;
  const errors: Array<{ jobId: string; message: string }> = [];

  for (const job of jobs) {
    const result = await processListingTranslationJob(supabase, {
      id: job.id,
      attempts: typeof job.attempts === "number" ? job.attempts : 0,
    });

    if (result.status === "completed") {
      processed += 1;
    } else {
      failed += 1;
      errors.push({
        jobId: result.jobId,
        message: result.errorMessage ?? "Translation failed.",
      });
      console.error("[translate-cron] Translation job failed.", {
        jobId: result.jobId,
        error: result.errorMessage,
      });
    }
  }

  return NextResponse.json({
    processed,
    failed,
    provider: capabilities.provider,
    errors: errors.slice(0, 10),
    message:
      failed > 0
        ? `Processed ${processed} translation job(s); ${failed} failed.`
        : `Processed ${processed} translation job(s).`,
  });
}

export async function GET(request: NextRequest) {
  return handleTranslateCron(request);
}

export async function POST(request: NextRequest) {
  return handleTranslateCron(request);
}
