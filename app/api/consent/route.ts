/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ConsentRecord {
  id?: string;
  user_id?: string;
  consent_type: "cookies" | "marketing" | "analytics" | "functional" | "essential";
  consent_given: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

const CONSENT_TYPES = new Set([
  "cookies",
  "marketing",
  "analytics",
  "functional",
  "essential",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consent_type, consent_given } = body;

    if (
      typeof consent_type !== "string" ||
      !CONSENT_TYPES.has(consent_type) ||
      typeof consent_given !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid consent payload" },
        { status: 400 }
      );
    }

    const ipAddress =
      (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip")) ?? "unknown";

    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const supabase = await createClient();

    const consentRecord: ConsentRecord = {
      consent_type: consent_type as ConsentRecord["consent_type"],
      consent_given,
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    const { error } = await supabase
      .from("consent_records")
      .insert(consentRecord)
      .select("id")
      .single();

    if (error) {
      console.error("[Consent API] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to record consent" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Consent API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from("cookie_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error) {
      return NextResponse.json(
        { 
          consent_types: ["essential", "functional", "analytics", "marketing"],
          legal_basis: {
            essential: "Legitimate interests - security",
            functional: "Consent",
            analytics: "Consent",
            marketing: "Consent"
          },
          retention_periods: {
            essential: "Session",
            functional: "1 year",
            analytics: "90 days",
            marketing: "2 years"
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[Consent API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
