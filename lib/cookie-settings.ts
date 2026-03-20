import { createClient } from "./supabase/server";

export interface CookieSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export interface CookieSettings {
  id: string;
  page_title: string | null;
  last_updated_date: string | null;
  introduction: string | null;
  sections: CookieSection[] | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}

export async function getCookieSettings(): Promise<CookieSettings | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("cookie_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) {
      return null;
    }

    let parsedSections: CookieSection[] = [];
    if (Array.isArray(data.sections)) {
      parsedSections = (data.sections as unknown[]).map((item) => {
        const obj = item as Record<string, unknown>;
        return {
          id: String(obj.id || ""),
          title: String(obj.title || ""),
          icon: String(obj.icon || "Cookie"),
          content: String(obj.content || ""),
        };
      });
    }

    return {
      ...data,
      sections: parsedSections,
    };
  } catch {
    return null;
  }
}
