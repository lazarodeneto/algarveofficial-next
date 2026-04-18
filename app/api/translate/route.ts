import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function GET() {
const supabase = createServiceRoleClient();

if (!supabase) {
  return NextResponse.json(
    { error: "Supabase client not initialized" },
    { status: 500 }
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
