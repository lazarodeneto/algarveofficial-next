import { afterEach, describe, expect, it, vi } from "vitest";

import { processListingTranslationJob } from "./listingProcessor";
import { getTranslationProcessorSelection } from "@/lib/translations/processorConfig";

vi.mock("@/lib/translations/processorConfig", () => ({
  getTranslationProcessorSelection: vi.fn(() => ({
    provider: "openai",
    missing: [],
    disabled: false,
  })),
}));

type QueryResult = { data: unknown; error: { message: string } | null };

function sourceListing() {
  return {
    id: "listing-1",
    name: "Source title",
    short_description: "Source short",
    description: "Source description",
    meta_title: "Source SEO",
    meta_description: "Source meta",
    content_updated_at: "2026-05-15T12:00:00.000Z",
  };
}

function jobDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "job-1",
    listing_id: "listing-1",
    target_lang: "fr",
    attempts: 0,
    allow_manual_overwrite: false,
    listing: sourceListing(),
    ...overrides,
  };
}

function createProcessorClient(results: QueryResult[]) {
  const calls: Array<{ table: string; method: string; args: unknown[] }> = [];

  const createBuilder = (table: string, result: QueryResult) => {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "select", args });
        return builder;
      }),
      update: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "update", args });
        return builder;
      }),
      upsert: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "upsert", args });
        return builder;
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "eq", args });
        return builder;
      }),
      maybeSingle: vi.fn(async () => result),
      then: (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject),
    };
    return builder;
  };

  const client = {
    from: vi.fn((table: string) => {
      calls.push({ table, method: "from", args: [] });
      return createBuilder(table, results.shift() ?? { data: null, error: null });
    }),
  };

  return { client, calls };
}

function mockOpenAiTranslation() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: "Titre traduit",
                  short_description: "Court traduit",
                  description: "Description traduite",
                  seo_title: "SEO traduit",
                  seo_description: "Meta traduite",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ),
  );
}

function expectManualConflict(result: Awaited<ReturnType<typeof processListingTranslationJob>>) {
  expect(result).toMatchObject({
    jobId: "job-1",
    status: "failed",
    provider: "openai",
  });
  expect(result.errorMessage).toContain("MANUAL_TRANSLATION_EXISTS");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  delete process.env.OPENAI_API_KEY;
});

describe("processListingTranslationJob manual overwrite protection", () => {
  it("does not overwrite an edited manual row without explicit overwrite", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { client, calls } = createProcessorClient([
      { data: null, error: null },
      { data: jobDetail(), error: null },
      { data: { translation_status: "edited", translation_source: "manual" }, error: null },
      { data: null, error: null },
    ]);

    const result = await processListingTranslationJob(client, { id: "job-1", attempts: 0 });

    expectManualConflict(result);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(calls.some((call) => call.table === "listing_translations" && call.method === "upsert")).toBe(false);
  });

  it("does not overwrite a reviewed manual row without explicit overwrite", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { client, calls } = createProcessorClient([
      { data: null, error: null },
      { data: jobDetail(), error: null },
      { data: { translation_status: "reviewed", translation_source: "manual" }, error: null },
      { data: null, error: null },
    ]);

    const result = await processListingTranslationJob(client, { id: "job-1", attempts: 0 });

    expectManualConflict(result);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(calls.some((call) => call.table === "listing_translations" && call.method === "upsert")).toBe(false);
  });

  it("re-checks immediately before upsert so an in-flight job cannot overwrite a new manual row", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockOpenAiTranslation();
    const { client, calls } = createProcessorClient([
      { data: null, error: null },
      { data: jobDetail(), error: null },
      { data: null, error: null },
      { data: { translation_status: "reviewed", translation_source: "manual" }, error: null },
      { data: null, error: null },
    ]);

    const result = await processListingTranslationJob(client, { id: "job-1", attempts: 0 });

    expectManualConflict(result);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(calls.some((call) => call.table === "listing_translations" && call.method === "upsert")).toBe(false);
  });

  it("overwrites a manual row only when allow_manual_overwrite is true", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockOpenAiTranslation();
    const { client, calls } = createProcessorClient([
      { data: null, error: null },
      { data: jobDetail({ allow_manual_overwrite: true }), error: null },
      { data: { translation_status: "reviewed", translation_source: "manual" }, error: null },
      { data: { translation_status: "reviewed", translation_source: "manual" }, error: null },
      { data: null, error: null },
      { data: null, error: null },
    ]);

    const result = await processListingTranslationJob(client, { id: "job-1", attempts: 0 });

    expect(result).toMatchObject({ jobId: "job-1", status: "completed", provider: "openai" });
    const translationUpsert = calls.find((call) => call.table === "listing_translations" && call.method === "upsert");
    expect(translationUpsert?.args[0]).toMatchObject({
      listing_id: "listing-1",
      language_code: "fr",
      title: "Titre traduit",
      translation_status: "auto",
      translation_source: "automatic",
    });
    const jobUpdate = calls.filter((call) => call.table === "translation_jobs" && call.method === "update").at(-1);
    expect(jobUpdate?.args[0]).toMatchObject({ status: "auto", allow_manual_overwrite: false });
  });

  it("marks successful automatic translations as automatic", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockOpenAiTranslation();
    vi.mocked(getTranslationProcessorSelection).mockReturnValueOnce({
      provider: "openai",
      missing: [],
      disabled: false,
    });
    const { client, calls } = createProcessorClient([
      { data: null, error: null },
      { data: jobDetail(), error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
    ]);

    const result = await processListingTranslationJob(client, { id: "job-1", attempts: 0 });

    expect(result).toMatchObject({ jobId: "job-1", status: "completed", provider: "openai" });
    const translationUpsert = calls.find((call) => call.table === "listing_translations" && call.method === "upsert");
    expect(translationUpsert?.args[0]).toMatchObject({
      translation_status: "auto",
      translation_source: "automatic",
    });
  });
});
