import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const CMS_TAG_MAP: Record<string, string> = {
  "/golf": "cms:golf",
  "/blog": "cms:blog",
  "/destinations": "cms:destinations",
  "/experiences": "cms:experiences",
  "/live": "cms:live",
  "/real-estate": "cms:real-estate",
  "/directory": "cms:directory",
  "/events": "cms:events",
  "/stay": "cms:stay",
  "/map": "cms:map",
  "/invest": "cms:invest",
};

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const tag = CMS_TAG_MAP[path];
    if (!tag) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    revalidateTag(tag, "max");

    return NextResponse.json({ revalidated: true, path, tag });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}