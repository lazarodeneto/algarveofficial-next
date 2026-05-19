"use client";

import { useEffect, useMemo, useState } from "react";
import { CloudSun } from "lucide-react";
import { useTranslation } from "react-i18next";

const FARO_WEATHER_URL = "/api/weather/faro";
const ALGARVE_WEATHER_URL = "/api/weather/faro?location=albufeira";
const FARO_CACHE_KEY = "algarveofficial:faro-weather:v2";
const ALGARVE_CACHE_KEY = "algarveofficial:algarve-weather:v1";
const CACHE_TTL_MS = 10 * 60 * 1000;
export type HeaderWeatherLocation = "faro" | "algarve";

const WEATHER_LOCATION_CONFIG: Record<
  HeaderWeatherLocation,
  {
    url: string;
    cacheKey: string;
    titleKey: string;
    titleDefault: string;
    shortKey: string;
    shortDefault: string;
  }
> = {
  faro: {
    url: FARO_WEATHER_URL,
    cacheKey: FARO_CACHE_KEY,
    titleKey: "weather.faroDistrict",
    titleDefault: "Faro",
    shortKey: "weather.faroShort",
    shortDefault: "Faro",
  },
  algarve: {
    url: ALGARVE_WEATHER_URL,
    cacheKey: ALGARVE_CACHE_KEY,
    titleKey: "weather.algarveRegion",
    titleDefault: "Algarve",
    shortKey: "weather.algarveShort",
    shortDefault: "Algarve",
  },
};

type WeatherReading = {
  celsius: number;
  fahrenheit: number;
  weatherCode?: number;
  isDay?: boolean;
  fetchedAt: number;
};

function readCachedWeather(cacheKey: string): WeatherReading | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as WeatherReading;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    if (!Number.isFinite(parsed.celsius) || !Number.isFinite(parsed.fahrenheit)) return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeCachedWeather(cacheKey: string, reading: WeatherReading) {
  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(reading));
  } catch {
    // Storage can be disabled in privacy modes; the live reading can still render.
  }
}

interface HeaderWeatherPillProps {
  compact?: boolean;
  embedded?: boolean;
  location?: HeaderWeatherLocation;
}

export function HeaderWeatherPill({ compact = false, embedded = false, location = "faro" }: HeaderWeatherPillProps) {
  const { t } = useTranslation();
  const locationConfig = WEATHER_LOCATION_CONFIG[location] ?? WEATHER_LOCATION_CONFIG.faro;
  const [weather, setWeather] = useState<WeatherReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cached = readCachedWeather(locationConfig.cacheKey);
    if (cached) {
      setWeather(cached);
      setIsLoading(false);
      return;
    }

    setWeather(null);
    setIsLoading(false);

    const controller = new AbortController();
    let hasStarted = false;

    async function loadWeather() {
      setIsLoading(true);

      try {
        const response = await fetch(locationConfig.url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Weather request failed: ${response.status}`);
        }

        const data = (await response.json()) as WeatherReading;
        const celsius = data.celsius;
        const fahrenheit = data.fahrenheit;

        if (
          typeof celsius !== "number" ||
          !Number.isFinite(celsius) ||
          typeof fahrenheit !== "number" ||
          !Number.isFinite(fahrenheit)
        ) {
          throw new Error("Weather temperature missing");
        }

        const nextReading: WeatherReading = {
          celsius,
          fahrenheit,
          weatherCode: data.weatherCode,
          isDay: data.isDay,
          fetchedAt: data.fetchedAt || Date.now(),
        };

        setWeather(nextReading);
        writeCachedWeather(locationConfig.cacheKey, nextReading);
      } catch {
        setWeather(readCachedWeather(locationConfig.cacheKey));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    const startLoad = () => {
      if (hasStarted) return;
      hasStarted = true;
      void loadWeather();
    };

    const passiveOnce: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("pointerdown", startLoad, passiveOnce);
    window.addEventListener("scroll", startLoad, passiveOnce);
    window.addEventListener("keydown", startLoad, { once: true });

    return () => {
      controller.abort();
      window.removeEventListener("pointerdown", startLoad);
      window.removeEventListener("scroll", startLoad);
      window.removeEventListener("keydown", startLoad);
    };
  }, [locationConfig.cacheKey, locationConfig.url]);

  const display = useMemo(() => {
    if (!weather) return null;

    return {
      celsius: Math.round(weather.celsius).toString(),
      fahrenheit: Math.round(weather.fahrenheit).toString(),
    };
  }, [weather]);

  const locationLabel = t(locationConfig.titleKey, { defaultValue: locationConfig.titleDefault });
  const shortLabel = t(locationConfig.shortKey, { defaultValue: locationConfig.shortDefault });
  const ariaLabel = weather
    ? t("weather.temperatureLabel", {
        place: locationLabel,
        celsius: display?.celsius ?? "",
        fahrenheit: display?.fahrenheit ?? "",
        defaultValue: `${locationLabel} weather: ${display?.celsius ?? ""}°C / ${display?.fahrenheit ?? ""}°F`,
      })
    : isLoading
      ? t("weather.loading", { defaultValue: "Loading weather" })
      : t("weather.unavailable", { defaultValue: "Weather unavailable" });
  const statusText = isLoading
    ? t("weather.loading", { defaultValue: "Loading weather" })
    : t("weather.unavailable", { defaultValue: "Weather unavailable" });

  return (
    <div
      className={`group relative isolate flex items-center overflow-hidden rounded-full text-foreground backdrop-blur-2xl transition-all duration-300 hover:border-primary/35 hover:bg-white/72 dark:hover:bg-white/14 ${
        embedded
          ? "border border-white/70 bg-white/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_28px_-22px_rgba(15,23,42,0.52)] ring-1 ring-primary/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_16px_34px_-22px_rgba(217,147,24,0.42)] dark:border-white/16 dark:bg-white/10 dark:ring-white/10"
          : "border border-white/55 bg-white/62 shadow-[0_18px_46px_-30px_rgba(15,23,42,0.55)] ring-1 ring-black/5 hover:shadow-[0_22px_52px_-30px_rgba(217,147,24,0.5)] dark:border-white/14 dark:bg-white/10 dark:ring-white/10"
      } ${
        compact ? "h-9 min-w-[8.15rem] gap-2 px-2.5" : "h-10 min-w-[8.8rem] gap-2.5 px-3"
      }`}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      title={`${locationLabel} · ${ariaLabel}`}
    >
      <span className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.28)_45%,rgba(217,147,24,0.18))] opacity-95 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_45%,rgba(217,147,24,0.16))]" />
      <span className="absolute inset-x-2 top-0 -z-10 h-px bg-white/90 dark:bg-white/20" />
      <span className="absolute -right-8 -top-8 -z-10 h-16 w-16 rounded-full bg-primary/20 blur-2xl transition-opacity group-hover:opacity-100" />
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white/72 text-primary shadow-inner dark:bg-white/10 dark:text-white ${
          compact ? "h-7 w-7" : "h-8 w-8"
        }`}
      >
        <CloudSun className={compact ? "h-3.5 w-3.5" : "h-4.5 w-4.5"} />
      </span>
      <span className="relative flex min-w-0 flex-col justify-center leading-none">
        <span className={`block font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground ${compact ? "text-[8px]" : "text-[9px]"}`}>
          {shortLabel}
        </span>
        {display ? (
          <span className={`mt-1 flex items-center gap-1 whitespace-nowrap font-semibold leading-none tabular-nums text-foreground ${compact ? "text-[11.5px]" : "text-[13px]"}`}>
            <span>{display.celsius}°C</span>
            <span className="text-muted-foreground/60">/</span>
            <span>{display.fahrenheit}°F</span>
          </span>
        ) : (
          <span className={`mt-1 block max-w-[6.5rem] truncate font-semibold text-muted-foreground ${compact ? "text-[10px]" : "text-[12px]"}`}>
            {statusText}
          </span>
        )}
      </span>
    </div>
  );
}
