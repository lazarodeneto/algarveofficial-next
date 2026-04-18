import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceRoleClient();

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
