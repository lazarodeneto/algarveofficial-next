import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GolfStep } from "./GolfStep";
import type { ListingGolfFormData } from "@/types/listing";

function golfData(overrides: Partial<ListingGolfFormData["details"]> = {}): ListingGolfFormData {
  return {
    structure: "single",
    status: "configured",
    details: {
      holes_count: 18,
      architect: "",
      course_rating: null,
      slope_rating: null,
      booking_url: "https://partner.example/book?course=els&aff=ao",
      scorecard_image_url: "",
      scorecard_pdf_url: "",
      map_image_url: "",
      ...overrides,
    },
    courses: [
      {
        id: "course-1",
        name: "Main Course",
        holes_count: 18,
        is_default: true,
        holes: [],
      },
    ],
  };
}

describe("GolfStep tee time booking URL", () => {
  it("prefills and saves the affiliate URL without stripping query parameters", () => {
    const onGolfChange = vi.fn();

    render(
      <GolfStep
        golf={golfData()}
        validationErrors={{}}
        canSave
        onGolfChange={onGolfChange}
        onSaveChanges={vi.fn()}
        onClearHoles={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Tee time booking URL");
    expect(input).toHaveAttribute("placeholder", "https://...");
    expect(input).toHaveValue("https://partner.example/book?course=els&aff=ao");
    expect(
      screen.getByText("External affiliate or partner link used for the public Book Tee Time button."),
    ).toBeInTheDocument();

    const nextUrl = "https://affiliate.example/tee?course=els&partner_id=123&utm_campaign=summer";
    fireEvent.change(input, { target: { value: nextUrl } });

    expect(onGolfChange).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          booking_url: nextUrl,
        }),
      }),
    );
  });
});
