import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function makeRequest(pathname: string, localeCookie?: string, authCookie = false) {
  const request = new NextRequest(`http://localhost${pathname}`);
  if (localeCookie) {
    request.cookies.set("NEXT_LOCALE", localeCookie);
  }
  if (authCookie) {
    request.cookies.set("sb-localhost-auth-token", "test-token");
  }
  return request;
}

describe("proxy relocation aliases", () => {
  it("redirects localized residence URLs to relocation", async () => {
    const response = await proxy(makeRequest("/pt-pt/residence"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/pt-pt/relocation");
  });

  it("redirects unlocalized residence URLs to the canonical English relocation URL", async () => {
    const response = await proxy(makeRequest("/residence", "de"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/relocation");
  });
});

describe("proxy default locale prefix policy", () => {
  it.each([
    "/",
    "/properties",
    "/golf",
    "/golf/courses",
    "/relocation",
    "/listing/example",
    "/visit/lagos/restaurants",
    "/category/beaches",
    "/category/restaurants",
  ])("serves canonical unprefixed English URL %s via the internal locale route", async (source) => {
    const response = await proxy(makeRequest(source, "de"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toContain("/en");
  });

  it("serves localized routes without redirecting them to English", async () => {
    const response = await proxy(makeRequest("/pt-pt/golf"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["/en", "/en/properties", "/en/golf"])(
    "serves legacy English URL %s to avoid cached redirect loops",
    async (source) => {
      const response = await proxy(makeRequest(source));

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    },
  );

  it.each([
    "/api/health",
    "/_next/image",
    "/robots.txt",
    "/sitemap.xml",
    "/images/example.webp",
    "/owner",
  ])("does not redirect system path %s", async (source) => {
    const response = await proxy(makeRequest(source));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects anonymous unprefixed admin URLs to the canonical login route", async () => {
    const response = await proxy(makeRequest("/admin/listings"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login?next=%2Fadmin%2Flistings");
  });

  it("serves authenticated unprefixed admin URLs via the internal locale route", async () => {
    const response = await proxy(makeRequest("/admin/listings", undefined, true));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("redirects the restaurants alias to the canonical category URL", async () => {
    const response = await proxy(makeRequest("/restaurants"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/category/restaurants");
  });

  it("redirects known category aliases to the canonical category URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ slug: "restaurants" }, { slug: "fine-dining" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/category/fine-dining"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/category/restaurants");
  });

  it("redirects wrong-locale category slugs to localized canonical category URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ slug: "restaurants" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/pt-pt/category/restaurants"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/pt-pt/category/restaurantes");
  });

  it("returns a true 404 for unknown category hub slugs when categories can be checked", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ slug: "restaurants" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/category/not-a-real-category"));

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  it("redirects visit city/category aliases to the canonical category URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ slug: "restaurants" }, { slug: "private-chefs" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/visit/lagos/private-chefs"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/visit/lagos/restaurants");
  });

  it("redirects wrong-locale visit city/category slugs to localized canonical URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ slug: "restaurants" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/pt-pt/visit/lagos/restaurants"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/pt-pt/visit/lagos/restaurantes");
  });

  it("returns a true 404 for unknown visit city/category slugs when categories can be checked", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ slug: "restaurants" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/visit/lagos/not-a-real-category"));

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  it("redirects the plural partners alias to the canonical partner page", async () => {
    const response = await proxy(makeRequest("/partners"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/partner");
  });

  it("keeps locale prefixes when redirecting plural partners aliases", async () => {
    const response = await proxy(makeRequest("/pt-pt/partners"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/pt-pt/partner");
  });

  it("redirects property detail aliases to the canonical listing URL", async () => {
    const response = await proxy(makeRequest("/properties/sample-property"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/listing/sample-property");
  });

  it("serves valid golf course detail slugs through the internal locale route", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ slug: "the-els-club-vilamoura", category: { slug: "golf" } }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/golf/courses/the-els-club-vilamoura"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toContain("/en/golf/courses/the-els-club-vilamoura");
  });

  it("returns a true 404 for missing golf course detail slugs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const response = await proxy(makeRequest("/golf/courses/not-a-real-course"));

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  it("redirects old golf course slug aliases to the canonical golf course URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([{ listing: { slug: "current-course", status: "published", category: { slug: "golf" } } }]),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    const response = await proxy(makeRequest("/golf/courses/old-course"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/golf/courses/current-course");
  });

  it("keeps locale prefixes when redirecting old golf course slug aliases", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              listing: {
                slug: "boavista-golf-spa-resort-lagos",
                status: "published",
                category: { slug: "golf" },
              },
            },
          ]),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    const response = await proxy(makeRequest("/pt-pt/golf/courses/boavista-golf-spa-resort-quinta-do-lago"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/pt-pt/golf/courses/boavista-golf-spa-resort-lagos");
  });

  it("returns 404 for unknown legacy category/city slug pairs", async () => {
    const response = await proxy(makeRequest("/not-a-category/lagos"));

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  it("redirects old listing slug aliases to the current canonical slug", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ listing: { slug: "current-listing", status: "published" } }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxy(makeRequest("/listing/old-listing"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/listing/current-listing");
  });
});
