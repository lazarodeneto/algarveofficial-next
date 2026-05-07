import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GolfCTA } from "./GolfCTA";

const labels = {
  readyToPlay: "Ready to Play?",
  bookTeeTimeSubtext: "Book your tee time today",
  bookTeeTime: "Book Tee Time",
  bookTeeTimeAria: "Book tee time with external partner",
  contactClub: "Contact Club",
  visitWebsite: "Visit Website",
};

describe("GolfCTA", () => {
  it("shows an external sponsored Book Tee Time link when a booking URL exists", () => {
    const bookingUrl = "https://partner.example/tee-times?course=els&partner_id=ao&utm_source=algarve";

    render(<GolfCTA bookingUrl={bookingUrl} labels={labels} />);

    const link = screen.getByRole("link", { name: labels.bookTeeTimeAria });
    expect(screen.getByText(labels.readyToPlay)).toBeInTheDocument();
    expect(screen.getByText(labels.bookTeeTimeSubtext)).toBeInTheDocument();
    expect(link).toHaveTextContent("BOOK TEE TIME");
    expect(link).toHaveAttribute("href", bookingUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "sponsored noopener noreferrer");
  });

  it("uses the tee-time label when falling back to a course website", () => {
    render(<GolfCTA bookingUrl={null} websiteUrl="https://course.example" labels={labels} />);

    const link = screen.getByRole("link", { name: labels.bookTeeTimeAria });
    expect(link).toHaveTextContent("BOOK TEE TIME");
    expect(link).toHaveAttribute("href", "https://course.example");
  });
});
