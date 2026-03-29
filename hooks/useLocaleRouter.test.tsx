import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocaleRouter } from "./useLocaleRouter";

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  usePathname: () => "/en/map",
  useSearchParams: () => new URLSearchParams("city=lagos&category=restaurants"),
}));

vi.mock("@/hooks/useCurrentLocale", () => ({
  useCurrentLocale: () => "en",
}));

function TestHarness() {
  const { switchLocale } = useLocaleRouter();

  return (
    <button type="button" onClick={() => switchLocale("pt-pt")}>
      Switch locale
    </button>
  );
}

describe("useLocaleRouter", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    document.cookie = "NEXT_LOCALE=; Max-Age=0; path=/";
  });

  it("preserves the current query string when switching locale", () => {
    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Switch locale" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/pt-pt/map?city=lagos&category=restaurants"
    );
  });

  it("persists the selected locale in the NEXT_LOCALE cookie", () => {
    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Switch locale" }));

    expect(document.cookie).toContain("NEXT_LOCALE=pt-pt");
  });
});
