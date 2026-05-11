"use client";

import { useEffect, useMemo, useState } from "react";
import { CloudSun } from "lucide-react";
import { useTranslation } from "react-i18next";

const FARO_WEATHER_URL = "/api/weather/faro";
const CACHE_KEY = "algarveofficial:faro-weather:v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

type WeatherReading = {
  celsius: number;
  fahrenheit: number;
  weatherCode?: number;
  isDay?: boolean;
  fetchedAt: number;
};

function readCachedWeather(): WeatherReading | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as WeatherReading;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    if (!Number.isFinite(parsed.celsius) || !Number.isFinite(parsed.fahrenheit)) return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeCachedWeather(reading: WeatherReading) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(reading));
  } catch {
    // Storage can be disabled in privacy modes; the live reading can still render.
  }
}

interface HeaderWeatherPillProps {
  compact?: boolean;
}

export function HeaderWeatherPill({ compact = false }: HeaderWeatherPillProps) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cached = readCachedWeather();
    if (cached) {
      setWeather(cached);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch(FARO_WEATHER_URL, {
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
        writeCachedWeather(nextReading);
      } catch {
        setWeather(readCachedWeather());
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadWeather();

    return () => controller.abort();
  }, []);

  const display = useMemo(() => {
    if (!weather) return { celsius: "--", fahrenheit: "--" };

    return {
      celsius: Math.round(weather.celsius).toString(),
      fahrenheit: Math.round(weather.fahrenheit).toString(),
    };
  }, [weather]);

  const locationLabel = t("weather.faroDistrict");
  const ariaLabel = weather
    ? t("weather.temperatureLabel", {
        celsius: display.celsius,
        fahrenheit: display.fahrenheit,
      })
    : isLoading
      ? t("weather.loading")
      : t("weather.unavailable");

  return (
    <div
      className={`group relative flex items-center overflow-hidden rounded-full border border-white/55 bg-white/62 text-foreground shadow-[0_18px_46px_-30px_rgba(15,23,42,0.55)] ring-1 ring-black/5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white/72 hover:shadow-[0_22px_52px_-30px_rgba(217,147,24,0.5)] dark:border-white/14 dark:bg-white/10 dark:ring-white/10 dark:hover:bg-white/14 ${
        compact ? "h-9 min-w-[7.6rem] gap-1.5 px-2.5" : "h-11 min-w-[8.75rem] gap-2 px-3.5"
      }`}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      title={`${locationLabel} · ${ariaLabel}`}
    >
      <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.24)_45%,rgba(217,147,24,0.16))] opacity-90 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_45%,rgba(217,147,24,0.16))]" />
      <span className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/18 blur-2xl transition-opacity group-hover:opacity-100" />
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white/72 text-primary shadow-inner dark:bg-white/10 ${
          compact ? "h-7 w-7" : "h-8 w-8"
        }`}
      >
        <CloudSun className={compact ? "h-3.5 w-3.5" : "h-4.5 w-4.5"} />
      </span>
      <span className="relative min-w-0 leading-none">
        <span className={`block font-bold uppercase tracking-[0.18em] text-muted-foreground ${compact ? "text-[8px]" : "text-[9px]"}`}>
          {t("weather.faroShort")}
        </span>
        <span className={`mt-1 flex items-baseline gap-1 font-semibold tabular-nums text-foreground ${compact ? "text-[11px]" : "text-[13px]"}`}>
          <span>{display.celsius}°C</span>
          <span className="text-muted-foreground/60">/</span>
          <span>{display.fahrenheit}°F</span>
        </span>
      </span>
    </div>
  );
}
