import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TranslationEditorDrawer } from "./TranslationEditorDrawer";
import {
  getTranslationEditorData,
  saveManualTranslation,
} from "@/lib/admin/translations/queries";
import type { ListingRow, TranslationJob } from "@/lib/admin/translations/types";

vi.mock("@/lib/admin/translations/queries", () => ({
  getTranslationEditorData: vi.fn(),
  saveManualTranslation: vi.fn(),
  TranslationAdminApiError: class TranslationAdminApiError extends Error {
    code = "TEST";
    status = 400;
  },
}));

const mockedGetTranslationEditorData = vi.mocked(getTranslationEditorData);
const mockedSaveManualTranslation = vi.mocked(saveManualTranslation);

const job: TranslationJob = {
  id: "job-1",
  listing_id: "listing-1",
  source_lang: "en",
  target_lang: "fr",
  status: "missing",
  attempts: 0,
  last_error: null,
  created_at: "2026-05-15T09:00:00.000Z",
  updated_at: "2026-05-15T09:00:00.000Z",
  sla_deadline: null,
  sla_priority: 0,
  source_updated_at: null,
};

const listing: ListingRow = {
  id: "listing-1",
  name: "Praia Test Listing",
  city: "Lagos",
  category: "Beaches",
  tier: "verified",
  status: "published",
  content_updated_at: "2026-05-15T08:00:00.000Z",
};

function editorData(overrides = {}) {
  return {
    job,
    listing: {
      id: "listing-1",
      name: "Praia Test Listing",
      slug: "praia-test-listing",
      short_description: "Source short description",
      description: "Source full description",
      meta_title: null,
      meta_description: null,
      tier: "verified",
      status: "published",
      content_updated_at: "2026-05-15T08:00:00.000Z",
    },
    translation: {
      id: "translation-1",
      listing_id: "listing-1",
      language_code: "fr",
      title: "Titre traduit",
      short_description: null,
      description: "Description traduite",
      seo_title: null,
      seo_description: null,
      translation_status: "edited" as const,
      updated_at: "2026-05-15T10:00:00.000Z",
    },
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("TranslationEditorDrawer", () => {
  it("loads current manual content and shows missing required fields", async () => {
    mockedGetTranslationEditorData.mockResolvedValueOnce(editorData() as never);

    render(
      <TranslationEditorDrawer
        job={job}
        listing={listing}
        open
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(await screen.findByDisplayValue("Titre traduit")).toBeInTheDocument();
    expect(screen.getByText("Missing required fields:")).toBeInTheDocument();
    expect(screen.getAllByText("Short description").length).toBeGreaterThan(0);
    expect(screen.getByText(/Last saved:/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save reviewed/i })).toBeDisabled();
  });

  it("saves manual drafts through the admin route helper", async () => {
    mockedGetTranslationEditorData.mockResolvedValueOnce(editorData() as never);
    mockedSaveManualTranslation.mockResolvedValueOnce(undefined);
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(
      <TranslationEditorDrawer
        job={job}
        listing={listing}
        open
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    const shortDescription = await screen.findByLabelText("Short description");
    fireEvent.change(shortDescription, { target: { value: "Description courte traduite" } });
    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    await waitFor(() => {
      expect(mockedSaveManualTranslation).toHaveBeenCalledWith({
        listingId: "listing-1",
        targetLang: "fr",
        saveStatus: "edited",
        translation: expect.objectContaining({
          title: "Titre traduit",
          short_description: "Description courte traduite",
        }),
      });
    });
    expect(onSaved).toHaveBeenCalledWith("job-1");
    expect(onClose).toHaveBeenCalled();
  });
});
