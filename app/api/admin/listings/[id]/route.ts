import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not initialized" },
      { status: 500 }
    );
  }

  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 🔥 CHECK ADMIN ROLE (FIX)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Access denied: admin role required" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const { error } = await supabase
    .from("listings")
    .update(body)
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// 👉 DELETE (O QUE PRECISAS)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not initialized" },
      { status: 500 }
    );
  }

  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 🔥 ADMIN CHECK
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Access denied: admin role required" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
