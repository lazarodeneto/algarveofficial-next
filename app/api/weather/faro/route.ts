import { NextResponse } from "next/server";

const FARO_WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=37.0194&longitude=-7.9304&current=temperature_2m,weather_code,is_day&timezone=Europe%2FLisbon";

function toFahrenheit(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

export async function GET() {
  try {
    const response = await fetch(FARO_WEATHER_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Weather provider unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const celsius = data?.current?.temperature_2m;

    if (typeof celsius !== "number" || !Number.isFinite(celsius)) {
      return NextResponse.json({ error: "Weather temperature unavailable" }, { status: 502 });
    }

    return NextResponse.json(
      {
        celsius,
        fahrenheit: toFahrenheit(celsius),
        weatherCode: data.current?.weather_code,
        isDay: data.current?.is_day === 1,
        fetchedAt: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Weather request failed" }, { status: 502 });
  }
}
