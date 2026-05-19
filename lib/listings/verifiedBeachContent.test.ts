import { describe, expect, it } from "vitest";

import {
  hasVerifiedBeachBaseContent,
  isCurrentBeachLocalizedContent,
  resolveBeachDetails,
  shouldUseBeachBaseContent,
} from "./verifiedBeachContent";

describe("verified beach content helpers", () => {
  it("detects verified beach detail upgrades", () => {
    expect(hasVerifiedBeachBaseContent({ last_verified_at: "2026-05-18" })).toBe(true);
    expect(shouldUseBeachBaseContent({ parking_info: "Verified parking note." })).toBe(true);
    expect(hasVerifiedBeachBaseContent({ full_description: "Generic beach copy." })).toBe(false);
  });

  it("uses current localized beach content when verification dates match", () => {
    expect(
      isCurrentBeachLocalizedContent(
        { last_verified_at: "2026-05-18", parking_info: "Parking." },
        { last_verified_at: "2026-05-18", parking_info: "Estacionamento." },
      ),
    ).toBe(true);
  });

  it("ignores stale localized beach content when the verified base is newer", () => {
    const details = {
      last_verified_at: "2026-05-18",
      full_description: "New verified English beach description.",
      parking_info: "Verified parking detail.",
      localized_content: {
        "pt-pt": {
          full_description: "Old Portuguese beach description.",
        },
      },
    };

    expect(resolveBeachDetails(details, "pt-pt").full_description).toBe("New verified English beach description.");
  });

  it("preserves localized content for non-upgraded beach detail payloads", () => {
    const details = {
      full_description: "English beach description.",
      localized_content: {
        "pt-pt": {
          full_description: "Portuguese beach description.",
        },
      },
    };

    expect(resolveBeachDetails(details, "pt-pt").full_description).toBe("Portuguese beach description.");
  });
});
