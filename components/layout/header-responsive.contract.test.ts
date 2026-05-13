import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const headerSource = readFileSync(
  join(process.cwd(), "components/layout/Header.tsx"),
  "utf8",
);
const megaMenuSource = readFileSync(
  join(process.cwd(), "components/layout/HeaderMegaMenu.tsx"),
  "utf8",
);
const navigationMenuSource = readFileSync(
  join(process.cwd(), "components/ui/navigation-menu.tsx"),
  "utf8",
);

describe("header responsive navigation contract", () => {
  it("switches full desktop mega menu only when there is enough width", () => {
    expect(headerSource).toContain('window.matchMedia("(min-width: 1280px)")');
    expect(headerSource).toContain("min-[1280px]:flex");
    expect(headerSource).toContain("min-[1280px]:hidden");
    expect(megaMenuSource).toContain("min-[1280px]:flex");
  });

  it("keeps tablet navigation compact before desktop mega menu", () => {
    expect(megaMenuSource).toContain("min-[960px]:flex min-[1280px]:hidden");
    expect(headerSource).toContain("min-[960px]:flex min-[1280px]:hidden");
  });

  it("keeps the Visit panel viewport-safe at desktop breakpoints", () => {
    expect(megaMenuSource).toContain("w-[min(760px,calc(100vw-9rem))]");
    expect(megaMenuSource).toContain("min-[1360px]:w-[min(820px,calc(100vw-10rem))]");
    expect(megaMenuSource).toContain("min-[1440px]:w-[min(900px,calc(100vw-12rem))]");
    expect(navigationMenuSource).toContain("min-[1280px]:max-w-[calc(100vw-9rem)]");
  });
});
