import type { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import {
  invalidateCmsPageMutationQueries,
  invalidateListingMutationQueries,
} from "@/lib/query-invalidation";

describe("query invalidation helpers", () => {
  it("invalidates all listing caches touched by admin listing updates", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);

    await invalidateListingMutationQueries(
      { invalidateQueries } as unknown as Pick<QueryClient, "invalidateQueries">,
      "listing-123",
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["admin-listings"],
      exact: false,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["admin-listing", "listing-123"],
      exact: true,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["public-listings"],
      exact: false,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["listing-by-slug"],
      exact: false,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["listing"],
      exact: false,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["golf-listings"],
      exact: false,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["golf-course"],
      exact: false,
    });
  });

  it("invalidates all CMS/page-builder caches after publish or update", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);

    await invalidateCmsPageMutationQueries(
      { invalidateQueries } as unknown as Pick<QueryClient, "invalidateQueries">,
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cms-page"],
      exact: false,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["homepage-config"],
      exact: false,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["public-page"],
      exact: false,
    });
  });
});
