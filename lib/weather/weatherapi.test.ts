import { describe, expect, it } from "vitest";

import {
  buildWeatherApiForecastUrl,
  isValidCoordinate,
  normalizeWeatherApiForecast,
} from "./weatherapi";

const verifiedWeatherApiPayload = {
  location: {
    name: "Loule",
    region: "Faro",
    country: "Portugal",
  },
  current: {
    temp_c: 15.5,
    feelslike_c: 15.2,
    condition: {
      text: "Sunny",
      icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
    },
    wind_kph: 14.0,
    wind_dir: "SW",
    humidity: 74,
    uv: 1.5,
    last_updated: "2026-05-12 09:45",
  },
  forecast: {
    forecastday: [
      {
        day: {
          maxtemp_c: 18.6,
          mintemp_c: 12.5,
          daily_chance_of_rain: 89,
        },
        astro: {
          sunrise: "06:26 AM",
          sunset: "08:31 PM",
        },
      },
    ],
  },
};

const currentOnlyWeatherApiPayload = {
  location: {
    name: "Albufeira",
    region: "Faro",
    country: "Portugal",
  },
  current: {
    last_updated: "2026-05-12 14:30",
    temp_c: 20.4,
    condition: {
      text: "Sunny",
      icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
    },
    wind_kph: 16.9,
    wind_dir: "SW",
    humidity: 68,
    uv: 8,
    chance_of_rain: 0,
  },
};

describe("WeatherAPI helpers", () => {
  it("validates coordinates before provider requests", () => {
    expect(isValidCoordinate(37.09, -8.41)).toBe(true);
    expect(isValidCoordinate(120, -8.41)).toBe(false);
    expect(isValidCoordinate(37.09, Number.NaN)).toBe(false);
  });

  it("builds the forecast endpoint using server-only key input", () => {
    const url = buildWeatherApiForecastUrl({
      apiKey: "test-key",
      latitude: 37.0891,
      longitude: -8.4123,
    });

    expect(url).toContain("api.weatherapi.com/v1/forecast.json");
    expect(url).toContain("key=test-key");
    expect(url).toContain("q=37.0891%2C-8.4123");
    expect(url).toContain("days=1");
    expect(url).toContain("aqi=no");
    expect(url).toContain("alerts=no");
  });

  it("maps the verified WeatherAPI response into the public summary", () => {
    expect(normalizeWeatherApiForecast(verifiedWeatherApiPayload)).toEqual({
      ok: true,
      provider: "weatherapi",
      locationName: "Loule",
      region: "Faro",
      country: "Portugal",
      temperatureC: 15.5,
      feelsLikeC: 15.2,
      conditionLabel: "Sunny",
      conditionIconUrl: "https://cdn.weatherapi.com/weather/64x64/day/113.png",
      windKph: 14,
      windDir: "SW",
      humidity: 74,
      uvIndex: 1.5,
      chanceOfRain: 89,
      minTempC: 12.5,
      maxTempC: 18.6,
      sunrise: "06:26 AM",
      sunset: "08:31 PM",
      updatedAt: "2026-05-12 09:45",
    });
  });

  it("maps a current-only WeatherAPI response into the public summary", () => {
    expect(normalizeWeatherApiForecast(currentOnlyWeatherApiPayload)).toEqual({
      ok: true,
      provider: "weatherapi",
      locationName: "Albufeira",
      region: "Faro",
      country: "Portugal",
      temperatureC: 20.4,
      feelsLikeC: null,
      conditionLabel: "Sunny",
      conditionIconUrl: "https://cdn.weatherapi.com/weather/64x64/day/113.png",
      windKph: 16.9,
      windDir: "SW",
      humidity: 68,
      uvIndex: 8,
      chanceOfRain: 0,
      minTempC: null,
      maxTempC: null,
      sunrise: null,
      sunset: null,
      updatedAt: "2026-05-12 14:30",
    });
  });

  it("returns a safe unavailable object for malformed provider data", () => {
    expect(normalizeWeatherApiForecast({ current: { temp_c: "not-a-number" } })).toEqual({
      ok: false,
      error: "weather_unavailable",
    });
  });
});
