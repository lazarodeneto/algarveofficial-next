import { NextRequest, NextResponse } from "next/server";

import {
  buildWeatherApiForecastUrl,
  isValidCoordinate,
  normalizeWeatherApiForecast,
  type WeatherResponse,
} from "@/lib/weather/weatherapi";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawLatitude = searchParams.get("lat");
  const rawLongitude = searchParams.get("lng");
  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (!rawLatitude || !rawLongitude || !isValidCoordinate(latitude, longitude)) {
    return NextResponse.json(
      { ok: false, error: "invalid_coordinates" } satisfies WeatherResponse,
      { status: 400 },
    );
  }

  const apiKey = process.env.WEATHERAPI_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "missing_api_key" } satisfies WeatherResponse);
  }

  try {
    const response = await fetch(buildWeatherApiForecastUrl({ apiKey, latitude, longitude }), {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "weather_unavailable" } satisfies WeatherResponse,
        { status: 502 },
      );
    }

    const data = await response.json();
    const summary = normalizeWeatherApiForecast(data);

    if (!summary.ok) {
      return NextResponse.json(summary, { status: 502 });
    }

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "weather_unavailable" } satisfies WeatherResponse,
      { status: 502 },
    );
  }
}
