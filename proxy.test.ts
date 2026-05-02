import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

function makeRequest(pathname: string, localeCookie?: string) {
  const request = new NextRequest(`http://localhost${pathname}`);
  if (localeCookie) {
    request.cookies.set("NEXT_LOCALE", localeCookie);
  }
  return request;
}

describe("proxy relocation aliases", () => {
  it("redirects localized residence URLs to relocation", () => {
    const response = proxy(makeRequest("/pt-pt/residence"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/pt-pt/relocation");
  });

  it("redirects unlocalized residence URLs to the canonical English relocation URL", () => {
    const response = proxy(makeRequest("/residence", "de"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/en/relocation");
  });
});

describe("proxy default locale prefix policy", () => {
  it.each([
    ["/", "http://localhost/en"],
    ["/properties", "http://localhost/en/properties"],
    ["/golf", "http://localhost/en/golf"],
    ["/relocation", "http://localhost/en/relocation"],
    ["/listing/example", "http://localhost/en/listing/example"],
    ["/visit/lagos/restaurants", "http://localhost/en/visit/lagos/restaurants"],
    ["/category/restaurants", "http://localhost/en/category/restaurants"],
  ])("redirects legacy public English URL %s to %s", (source, destination) => {
    const response = proxy(makeRequest(source, "de"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(destination);
  });

  it("preserves /en routes without redirecting them away", () => {
    const response = proxy(makeRequest("/en/properties"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([
    "/api/health",
    "/_next/image",
    "/robots.txt",
    "/sitemap.xml",
    "/images/example.webp",
    "/admin/listings",
    "/owner",
  ])("does not redirect system path %s", (source) => {
    const response = proxy(makeRequest(source));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
