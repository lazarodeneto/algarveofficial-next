import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button as CanonicalButton } from "./Button";
import { Button } from "./Button";

describe("Button variants", () => {
  it("applies the primary variant class", () => {
    render(<Button variant="primary">Primary action</Button>);
    expect(screen.getByRole("button", { name: "Primary action" })).toHaveClass("bg-gradient-gold");
  });

  it("applies the secondary variant class", () => {
    render(<Button variant="secondary">Secondary action</Button>);
    expect(screen.getByRole("button", { name: "Secondary action" })).toHaveClass("border-border/70");
  });

  it("exposes the canonical Button.tsx export", () => {
    render(<CanonicalButton variant="ghost">Ghost action</CanonicalButton>);
    expect(screen.getByRole("button", { name: "Ghost action" })).toHaveClass("bg-transparent");
  });
});
