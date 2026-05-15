import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TranslationListingGroup } from "./TranslationListingGroup";
import type { ListingJobGroup, TranslationJob } from "@/lib/admin/translations/types";

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

const group: ListingJobGroup = {
  listing: {
    id: "listing-1",
    name: "Praia Test Listing",
    city: "Lagos",
    category: "Beaches",
    tier: "verified",
    status: "published",
    content_updated_at: "2026-05-15T08:00:00.000Z",
  },
  jobs: [job],
  priorityScore: 10,
  seoCoverage: 0,
  seoCoverageLabel: "critical",
  doneCount: 0,
  problemCount: 1,
  pendingCount: 0,
  attentionCount: 1,
  slaBreachCount: 0,
  outdatedCount: 0,
};

describe("TranslationListingGroup manual action", () => {
  it("shows a manual translation button on locale rows and calls onEdit", () => {
    const onEdit = vi.fn();

    render(
      <TranslationListingGroup
        group={group}
        onTranslate={vi.fn()}
        onRetry={vi.fn()}
        onMarkReviewed={vi.fn()}
        onEdit={onEdit}
        onGroupAction={vi.fn()}
        onGroupRequeue={vi.fn()}
        loadingJobId={null}
        groupActionLoading={false}
        defaultExpanded
        selectedJobIds={[]}
        onSelectJob={vi.fn()}
      />,
    );

    const manualButton = screen.getByRole("button", { name: /manual/i });
    expect(manualButton).toBeInTheDocument();

    fireEvent.click(manualButton);

    expect(onEdit).toHaveBeenCalledWith(job);
  });
});
