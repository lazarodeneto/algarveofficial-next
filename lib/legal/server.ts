import { createPublicServerClient } from "@/lib/supabase/public-server";
import {
  buildLegalSettingsCandidateIds,
  pickLegalSettingsRowByLocale,
} from "@/lib/legal/settings";

type LegalSettingsTable = "privacy_settings" | "terms_settings";

export interface LegalSettingsMetadataRecord {
  id: string;
  page_title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  introduction: string | null;
  last_updated_date: string | null;
  sections: unknown;
  updated_at: string | null;
}

export async function fetchLegalSettings(
  table: LegalSettingsTable,
  locale?: string | null,
): Promise<LegalSettingsMetadataRecord | null> {
  const supabase = createPublicServerClient();
  const candidateIds = buildLegalSettingsCandidateIds(locale);

  const { data, error } = await supabase
    .from(table)
    .select(
      "id,page_title,meta_title,meta_description,introduction,last_updated_date,sections,updated_at",
    )
    .in("id", candidateIds);

  if (error || !data || data.length === 0) {
    return null;
  }

  return pickLegalSettingsRowByLocale(
    data as LegalSettingsMetadataRecord[],
    locale,
  );
}
