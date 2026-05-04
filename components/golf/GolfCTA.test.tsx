import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GolfCTA } from "./GolfCTA";

const labels = {
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
    expect(link).toHaveTextContent(labels.bookTeeTime);
    expect(link).toHaveAttribute("href", bookingUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "sponsored noopener noreferrer");
  });

  it("does not show the booking button when the booking URL is empty", () => {
    render(<GolfCTA bookingUrl={null} websiteUrl="https://course.example" labels={labels} />);

    expect(screen.queryByRole("link", { name: labels.bookTeeTimeAria })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: labels.visitWebsite })).toHaveAttribute("href", "https://course.example");
  });
});
