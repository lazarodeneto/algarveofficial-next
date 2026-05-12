import { describe, expect, it } from "vitest";

import {
  LISTING_CHANGE_REQUESTS_SETUP_MESSAGE,
  isMissingListingChangeRequestsSchemaError,
} from "./queries";

describe("listing change request query guards", () => {
  it("recognizes Supabase schema-cache misses for the change request table", () => {
    expect(
      isMissingListingChangeRequestsSchemaError({
        code: "PGRST205",
        message: "Could not find the table 'public.listing_change_requests' in the schema cache",
      }),
    ).toBe(true);
    expect(
      isMissingListingChangeRequestsSchemaError({
        code: "42P01",
        message: 'relation "public.listing_change_requests" does not exist',
      }),
    ).toBe(true);
  });

  it("does not hide unrelated admin query errors as setup problems", () => {
    expect(
      isMissingListingChangeRequestsSchemaError({
        code: "42501",
        message: "permission denied for table listing_change_requests",
      }),
    ).toBe(false);
    expect(LISTING_CHANGE_REQUESTS_SETUP_MESSAGE).toContain(
      "20260511183000_add_listing_change_requests.sql",
    );
  });
});
