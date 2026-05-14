import { describe, expect, it } from "vitest";

import {
  decodeSideTableArchiveRow,
  encodeLegacySideTableReason,
  getLegacySideTableSource,
  inboxSideTableLookupKeys,
} from "./side-table-compat";

describe("admin inbox side-table compatibility", () => {
  it("does not alias sources supported by the original side-table constraint", () => {
    expect(getLegacySideTableSource("listing_moderation")).toBeNull();
    expect(getLegacySideTableSource("review_moderation")).toBeNull();
    expect(getLegacySideTableSource("event_moderation")).toBeNull();
  });

  it("aliases newer derived sources to an original source for stale deployments", () => {
    expect(getLegacySideTableSource("translation_job")).toBe("listing_moderation");
    expect(getLegacySideTableSource("billing_subscription")).toBe("listing_moderation");
    expect(getLegacySideTableSource("external_outbox_alert")).toBe("listing_moderation");
    expect(getLegacySideTableSource("listing_claim")).toBe("listing_moderation");
    expect(getLegacySideTableSource("chat_message")).toBe("listing_moderation");
  });

  it("round-trips archived/read reasons with their original source", () => {
    const reason = encodeLegacySideTableReason("read_from_list", "translation_job");

    expect(reason).toBe("read_from_list:translation_job");
    expect(decodeSideTableArchiveRow("listing_moderation", reason)).toEqual({
      source: "translation_job",
      reason: "read_from_list",
    });
  });

  it("returns canonical and legacy lookup keys for newer sources", () => {
    expect(inboxSideTableLookupKeys("translation_job", "job-id")).toEqual([
      "translation_job:job-id",
      "listing_moderation:job-id",
    ]);
  });
});
