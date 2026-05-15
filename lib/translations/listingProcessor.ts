import { createHash } from "node:crypto";

import type { Database } from "@/integrations/supabase/types";
import { sanitizeHtmlString } from "@/lib/sanitizeHtml";
import {
  getTranslationProcessorSelection,
  type TranslationProcessorProvider,
} from "@/lib/translations/processorConfig";

type TranslationStatus = Database["public"]["Enums"]["translation_status"];

type TranslationServiceClient = {
  from(table: string): {
    select(columns?: string): unknown;
    update(payload: Record<string, unknown>): unknown;
    upsert(payload: Record<string, unknown>, options?: Record<string, unknown>): unknown;
  };
};

interface ThenableQuery<T = unknown> extends PromiseLike<{ data: T | null; error: QueryError | null }> {
  eq(column: string, value: unknown): ThenableQuery<T>;
  maybeSingle(): Promise<{ data: T | null; error: QueryError | null }>;
}

interface QueryError {
  message: string;
}

interface TranslationJobInput {
  id: string;
  attempts?: number | null;
}

interface ListingSourceRow {
  id: string;
  name: string | null;
  short_description: string | null;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content_updated_at: string | null;
}

interface TranslationJobDetail {
  id: string;
  listing_id: string;
  target_lang: string;
  attempts: number | null;
  allow_manual_overwrite?: boolean | null;
  listing: ListingSourceRow | ListingSourceRow[] | null;
}

interface ExistingTranslationRow {
  translation_status: TranslationStatus | null;
  translation_source: "manual" | "automatic" | null;
}

interface ListingSourceText {
  title: string;
  short_description: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

type ListingTranslatedText = ListingSourceText;

export interface TranslationJobProcessResult {
  jobId: string;
  status: "completed" | "failed";
  provider: TranslationProcessorProvider;
  errorMessage?: string;
}

const TRANSLATABLE_FIELDS = [
  "title",
  "short_description",
  "description",
  "seo_title",
  "seo_description",
] as const;

const TARGET_LANGUAGE_LABELS: Record<string, string> = {
  "pt-pt": "European Portuguese",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian Bokmal",
  da: "Danish",
};

const DEEPL_TARGET_LANGS: Record<string, string> = {
  "pt-pt": "PT-PT",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  nl: "NL",
  sv: "SV",
  no: "NB",
  da: "DA",
};

const FIELD_LIMITS: Record<keyof ListingSourceText, number> = {
  title: 180,
  short_description: 500,
  description: 8000,
  seo_title: 180,
  seo_description: 320,
};

const MANUAL_TRANSLATION_CONFLICT_MESSAGE =
  "MANUAL_TRANSLATION_EXISTS: Manual translation preserved. Confirm overwrite before running automatic translation.";

function asQuery<T>(value: unknown): ThenableQuery<T> {
  return value as ThenableQuery<T>;
}

function normalizeOutput(value: unknown, field: keyof ListingSourceText): string | null {
  if (typeof value !== "string") return null;
  const trimmed = sanitizeHtmlString(value.trim().slice(0, FIELD_LIMITS[field])).trim();
  return trimmed || null;
}

function buildSourceText(listing: ListingSourceRow): ListingSourceText {
  const title = normalizeOutput(listing.name, "title") ?? "Untitled listing";
  return {
    title,
    short_description: normalizeOutput(listing.short_description, "short_description"),
    description: normalizeOutput(listing.description, "description"),
    seo_title: normalizeOutput(listing.meta_title, "seo_title") ?? title,
    seo_description:
      normalizeOutput(listing.meta_description, "seo_description") ??
      normalizeOutput(listing.short_description, "seo_description"),
  };
}

function sourceHash(source: ListingSourceText): string {
  return createHash("md5")
    .update(
      `${source.title ?? ""}${source.short_description ?? ""}${source.description ?? ""}${source.seo_title ?? ""}${source.seo_description ?? ""}`,
    )
    .digest("hex");
}

function isProtectedManualTranslation(row: ExistingTranslationRow | null | undefined): boolean {
  return row?.translation_source === "manual" || row?.translation_status === "edited";
}

async function fetchExistingTranslation(
  client: TranslationServiceClient,
  listingId: string,
  targetLang: string,
): Promise<ExistingTranslationRow | null> {
  const { data, error } =
    await asQuery<ExistingTranslationRow>(
      client
        .from("listing_translations")
        .select("translation_status, translation_source"),
    )
      .eq("listing_id", listingId)
      .eq("language_code", targetLang)
      .maybeSingle();

  if (error) throw error;
  return data;
}

function parseOpenAiJson(content: string): Partial<ListingTranslatedText> {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
    : trimmed;
  const parsed = JSON.parse(jsonText) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("OpenAI translation response was not a JSON object.");
  }
  return parsed as Partial<ListingTranslatedText>;
}

async function translateWithOpenAi(
  source: ListingSourceText,
  targetLang: string,
): Promise<ListingTranslatedText> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const model = process.env.OPENAI_TRANSLATION_MODEL?.trim() || process.env.TRANSLATION_OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const languageName = TARGET_LANGUAGE_LABELS[targetLang] ?? targetLang;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Translate listing content from English. Return only valid JSON with keys title, short_description, description, seo_title, seo_description. Preserve facts, links, HTML-safe plain text, tone, and interpolation tokens. Use null for null inputs.",
        },
        {
          role: "user",
          content: JSON.stringify({
            target_language: languageName,
            source,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenAI translation failed with HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI translation response was empty.");

  const parsed = parseOpenAiJson(content);
  return normalizeTranslatedText(parsed, source);
}

async function translateWithDeepL(
  source: ListingSourceText,
  targetLang: string,
): Promise<ListingTranslatedText> {
  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey) throw new Error("DEEPL_API_KEY is not configured.");
  const targetLanguage = DEEPL_TARGET_LANGS[targetLang];
  if (!targetLanguage) throw new Error(`DeepL does not support target language ${targetLang}.`);

  const entries = TRANSLATABLE_FIELDS
    .map((field) => [field, source[field]] as const)
    .filter((entry): entry is readonly [keyof ListingSourceText, string] => Boolean(entry[1]));

  if (entries.length === 0) return source;

  const form = new URLSearchParams();
  form.set("source_lang", "EN");
  form.set("target_lang", targetLanguage);
  form.set("preserve_formatting", "1");
  for (const [, value] of entries) form.append("text", value);

  const apiBase = process.env.DEEPL_API_URL?.trim() || "https://api.deepl.com/v2/translate";
  const response = await fetch(apiBase, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`DeepL translation failed with HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`);
  }

  const json = (await response.json()) as { translations?: Array<{ text?: string }> };
  const translated: Partial<ListingTranslatedText> = {};
  entries.forEach(([field], index) => {
    translated[field] = json.translations?.[index]?.text;
  });

  return normalizeTranslatedText(translated, source);
}

function normalizeTranslatedText(
  translated: Partial<ListingTranslatedText>,
  source: ListingSourceText,
): ListingTranslatedText {
  const output: ListingTranslatedText = {
    title: normalizeOutput(translated.title, "title") ?? "",
    short_description: source.short_description
      ? normalizeOutput(translated.short_description, "short_description")
      : null,
    description: source.description ? normalizeOutput(translated.description, "description") : null,
    seo_title: source.seo_title ? normalizeOutput(translated.seo_title, "seo_title") : null,
    seo_description: source.seo_description
      ? normalizeOutput(translated.seo_description, "seo_description")
      : null,
  };

  if (!output.title) {
    throw new Error("Translation provider returned an empty title.");
  }

  return output;
}

async function translateListingText(
  provider: TranslationProcessorProvider,
  source: ListingSourceText,
  targetLang: string,
): Promise<ListingTranslatedText> {
  if (provider === "deepl") return translateWithDeepL(source, targetLang);
  return translateWithOpenAi(source, targetLang);
}

async function markJobFailed(
  client: TranslationServiceClient,
  job: TranslationJobInput,
  errorMessage: string,
  now: string,
) {
  await asQuery(
    client
      .from("translation_jobs")
      .update({
        status: "failed" satisfies TranslationStatus,
        attempts: (job.attempts ?? 0) + 1,
        last_error: errorMessage.slice(0, 2000),
        locked_at: null,
        allow_manual_overwrite: false,
        updated_at: now,
      }),
  ).eq("id", job.id);
}

async function preserveManualTranslation(
  client: TranslationServiceClient,
  jobId: string,
  now: string,
) {
  await asQuery(
    client
      .from("translation_jobs")
      .update({
        status: "failed" satisfies TranslationStatus,
        last_error: MANUAL_TRANSLATION_CONFLICT_MESSAGE,
        locked_at: null,
        allow_manual_overwrite: false,
        updated_at: now,
      }),
  ).eq("id", jobId);
}

export async function processListingTranslationJob(
  client: TranslationServiceClient,
  job: TranslationJobInput,
): Promise<TranslationJobProcessResult> {
  const now = new Date().toISOString();
  const selection = getTranslationProcessorSelection();
  if (!selection.provider) {
    throw new Error("Translation processor is not configured.");
  }

  try {
    await asQuery(
      client
        .from("translation_jobs")
        .update({
          locked_at: now,
          updated_at: now,
        }),
    ).eq("id", job.id);

    const { data: detail, error: detailError } = await asQuery<TranslationJobDetail>(
      client
        .from("translation_jobs")
        .select(
          "id, listing_id, target_lang, attempts, allow_manual_overwrite, listing:listings!inner(id, name, short_description, description, meta_title, meta_description, content_updated_at)",
        ),
    )
      .eq("id", job.id)
      .maybeSingle();

    if (detailError) throw detailError;
    if (!detail?.listing_id || !detail.target_lang) throw new Error("Translation job is missing listing or target language.");

    const listing = Array.isArray(detail.listing) ? detail.listing[0] : detail.listing;
    if (!listing?.id) throw new Error("Translation job listing was not found.");

    const source = buildSourceText(listing);
    const allowManualOverwrite = detail.allow_manual_overwrite === true;
    const existingTranslation = await fetchExistingTranslation(client, detail.listing_id, detail.target_lang);
    if (isProtectedManualTranslation(existingTranslation) && !allowManualOverwrite) {
      await preserveManualTranslation(client, job.id, now);
      return {
        jobId: job.id,
        status: "failed",
        provider: selection.provider,
        errorMessage: MANUAL_TRANSLATION_CONFLICT_MESSAGE,
      };
    }

    const translated = await translateListingText(selection.provider, source, detail.target_lang);
    const hash = sourceHash(source);

    const latestTranslation = await fetchExistingTranslation(client, detail.listing_id, detail.target_lang);
    if (isProtectedManualTranslation(latestTranslation) && !allowManualOverwrite) {
      await preserveManualTranslation(client, job.id, now);
      return {
        jobId: job.id,
        status: "failed",
        provider: selection.provider,
        errorMessage: MANUAL_TRANSLATION_CONFLICT_MESSAGE,
      };
    }

    const { error: translationError } = await (client
      .from("listing_translations")
      .upsert(
        {
          listing_id: detail.listing_id,
          language_code: detail.target_lang,
          ...translated,
          source_hash: hash,
          translation_status: "auto" satisfies TranslationStatus,
          translation_source: "automatic",
          translated_at: now,
          updated_at: now,
        },
        { onConflict: "listing_id,language_code" },
      ) as PromiseLike<{ data: unknown; error: QueryError | null }>);

    if (translationError) throw translationError;

    const { error: jobError } = await asQuery(
      client
        .from("translation_jobs")
        .update({
          status: "auto" satisfies TranslationStatus,
          attempts: (detail.attempts ?? job.attempts ?? 0) + 1,
          last_error: null,
          locked_at: null,
          allow_manual_overwrite: false,
          source_updated_at: listing.content_updated_at ?? now,
          updated_at: now,
        }),
    ).eq("id", job.id);

    if (jobError) throw jobError;

    return {
      jobId: job.id,
      status: "completed",
      provider: selection.provider,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await markJobFailed(client, job, errorMessage, now);
    return {
      jobId: job.id,
      status: "failed",
      provider: selection.provider,
      errorMessage,
    };
  }
}
