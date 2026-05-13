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
  it("switches full mega menu on for tablet and desktop widths", () => {
    expect(headerSource).toContain('window.matchMedia("(min-width: 1280px)")');
    expect(headerSource).toContain("min-[960px]:flex");
    expect(headerSource).toContain("min-[1280px]:hidden");
    expect(megaMenuSource).toContain("min-[960px]:flex");
  });

  it("keeps tablet header controls available before wide desktop actions", () => {
    expect(megaMenuSource).toContain("min-[960px]:flex min-[1280px]:hidden");
    expect(headerSource).toContain("min-[960px]:flex min-[1280px]:hidden");
  });

  it("keeps the Visit panel viewport-safe at tablet and desktop breakpoints", () => {
    expect(megaMenuSource).toContain("min-[960px]:w-[min(720px,calc(100vw-7rem))]");
    expect(megaMenuSource).toContain("w-[min(760px,calc(100vw-9rem))]");
    expect(megaMenuSource).toContain("min-[1360px]:w-[min(820px,calc(100vw-10rem))]");
    expect(megaMenuSource).toContain("min-[1440px]:w-[min(900px,calc(100vw-12rem))]");
    expect(navigationMenuSource).toContain("min-[960px]:max-w-[calc(100vw-7rem)]");
    expect(navigationMenuSource).toContain("min-[1280px]:max-w-[calc(100vw-9rem)]");
  });

  it("uses a bounded tablet dropdown instead of a scrolling full-page menu", () => {
    expect(headerSource).toContain("min-[768px]:inset-auto");
    expect(headerSource).toContain("min-[768px]:top-[5.5rem]");
    expect(headerSource).toContain("min-[768px]:w-[min(30rem,calc(100vw-2rem))]");
    expect(headerSource).toContain("min-[768px]:max-h-[calc(100svh-6rem)]");
  });

  it("does not make top-header mega-menu panels internally scrollable", () => {
    expect(megaMenuSource).not.toContain("overflow-y-auto");
    expect(megaMenuSource).not.toContain("max-h-[min(74vh,calc(100vh-6.5rem))]");
  });
});
