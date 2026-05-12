export type WeatherSummary = {
  ok: true;
  provider: "weatherapi";
  locationName: string | null;
  region: string | null;
  country: string | null;
  temperatureC: number | null;
  feelsLikeC: number | null;
  conditionLabel: string | null;
  conditionIconUrl: string | null;
  windKph: number | null;
  windDir: string | null;
  humidity: number | null;
  uvIndex: number | null;
  chanceOfRain: number | null;
  minTempC: number | null;
  maxTempC: number | null;
  sunrise: string | null;
  sunset: string | null;
  updatedAt: string | null;
};

export type WeatherUnavailable = {
  ok: false;
  error: "weather_unavailable" | "missing_api_key" | "invalid_coordinates";
};

export type WeatherResponse = WeatherSummary | WeatherUnavailable;

type WeatherApiForecastResponse = {
  location?: {
    name?: unknown;
    region?: unknown;
    country?: unknown;
  };
  current?: {
    temp_c?: unknown;
    feelslike_c?: unknown;
    condition?: {
      text?: unknown;
      icon?: unknown;
    };
    wind_kph?: unknown;
    wind_dir?: unknown;
    humidity?: unknown;
    uv?: unknown;
    chance_of_rain?: unknown;
    last_updated?: unknown;
  };
  forecast?: {
    forecastday?: Array<{
      day?: {
        maxtemp_c?: unknown;
        mintemp_c?: unknown;
        daily_chance_of_rain?: unknown;
      };
      astro?: {
        sunrise?: unknown;
        sunset?: unknown;
      };
    }>;
  };
};

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function nullableNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toFahrenheit(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

export function isValidCoordinate(latitude: unknown, longitude: unknown) {
  const lat = nullableNumber(latitude);
  const lng = nullableNumber(longitude);

  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function buildWeatherApiForecastUrl({
  apiKey,
  latitude,
  longitude,
}: {
  apiKey: string;
  latitude: number;
  longitude: number;
}) {
  const params = new URLSearchParams({
    key: apiKey,
    q: `${latitude},${longitude}`,
    days: "1",
    aqi: "no",
    alerts: "no",
  });

  return `https://api.weatherapi.com/v1/forecast.json?${params.toString()}`;
}

export function normalizeWeatherApiIconUrl(value: unknown) {
  const icon = nullableString(value);
  if (!icon) return null;
  if (icon.startsWith("//")) return `https:${icon}`;
  if (/^https?:\/\//i.test(icon)) return icon;
  return null;
}

export function normalizeWeatherApiForecast(data: WeatherApiForecastResponse | null | undefined): WeatherResponse {
  const current = data?.current;
  const firstForecast = data?.forecast?.forecastday?.[0];
  const temperatureC = nullableNumber(current?.temp_c);
  const forecastChanceOfRain = nullableNumber(firstForecast?.day?.daily_chance_of_rain);
  const currentChanceOfRain = nullableNumber(current?.chance_of_rain);

  if (temperatureC === null) {
    return { ok: false, error: "weather_unavailable" };
  }

  return {
    ok: true,
    provider: "weatherapi",
    locationName: nullableString(data?.location?.name),
    region: nullableString(data?.location?.region),
    country: nullableString(data?.location?.country),
    temperatureC,
    feelsLikeC: nullableNumber(current?.feelslike_c),
    conditionLabel: nullableString(current?.condition?.text),
    conditionIconUrl: normalizeWeatherApiIconUrl(current?.condition?.icon),
    windKph: nullableNumber(current?.wind_kph),
    windDir: nullableString(current?.wind_dir),
    humidity: nullableNumber(current?.humidity),
    uvIndex: nullableNumber(current?.uv),
    chanceOfRain: forecastChanceOfRain ?? currentChanceOfRain,
    minTempC: nullableNumber(firstForecast?.day?.mintemp_c),
    maxTempC: nullableNumber(firstForecast?.day?.maxtemp_c),
    sunrise: nullableString(firstForecast?.astro?.sunrise),
    sunset: nullableString(firstForecast?.astro?.sunset),
    updatedAt: nullableString(current?.last_updated),
  };
}
