import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    if (report && report["csp-report"]) {
      const cspReport = report["csp-report"];
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        violated_directive: cspReport["violated-directive"],
        blocked_uri: cspReport["blocked-uri"],
        document_uri: cspReport["document-uri"],
        referrer: cspReport["referrer"],
        original_policy: cspReport["original-policy"],
      };

      if (process.env.NODE_ENV === "development") {
        console.log("[CSP Report]", JSON.stringify(logEntry, null, 2));
      } else {
        console.log("[CSP Report]", JSON.stringify(logEntry));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CSP Report Error]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "CSP Report endpoint ready",
    info: "POST violations to this endpoint"
  });
}
