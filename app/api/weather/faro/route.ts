import { NextRequest, NextResponse } from "next/server";

import {
  buildWeatherApiForecastUrl,
  normalizeWeatherApiForecast,
  toFahrenheit,
} from "@/lib/weather/weatherapi";

const FARO_COORDINATES = {
  latitude: 37.0194,
  longitude: -7.9304,
};

const ALBUFEIRA_COORDINATES = {
  latitude: 37.0891,
  longitude: -8.2479,
};

function resolveHeaderWeatherCoordinates(request: NextRequest) {
  const location = request.nextUrl.searchParams.get("location")?.trim().toLowerCase();

  if (location === "albufeira") {
    return ALBUFEIRA_COORDINATES;
  }

  return FARO_COORDINATES;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.WEATHERAPI_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "missing_api_key" });
  }

  const coordinates = resolveHeaderWeatherCoordinates(request);

  try {
    const response = await fetch(buildWeatherApiForecastUrl({ apiKey, ...coordinates }), {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "weather_unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const summary = normalizeWeatherApiForecast(data);

    if (!summary.ok || summary.temperatureC === null) {
      return NextResponse.json({ ok: false, error: "weather_unavailable" }, { status: 502 });
    }

    return NextResponse.json(
      {
        celsius: summary.temperatureC,
        fahrenheit: toFahrenheit(summary.temperatureC),
        condition: summary.conditionLabel,
        fetchedAt: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "weather_unavailable" }, { status: 502 });
  }
}
