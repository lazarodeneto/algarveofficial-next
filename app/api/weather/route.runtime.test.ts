import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "./route";

function weatherRequest(query: string) {
  return new NextRequest(`http://localhost/api/weather${query}`, {
    method: "GET",
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("weather API route", () => {
  it("rejects invalid coordinates without calling WeatherAPI", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await GET(weatherRequest("?lat=999&lng=-8.4"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, error: "invalid_coordinates" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns a clean unavailable response when WEATHERAPI_KEY is missing", async () => {
    vi.stubEnv("WEATHERAPI_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await GET(weatherRequest("?lat=37.09&lng=-8.41"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: false, error: "missing_api_key" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
