"use client";

import { CloudSun, Wind } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import type { WeatherResponse, WeatherSummary } from "@/lib/weather/weatherapi";
import { cn } from "@/lib/utils";

type BeachWeatherWidgetProps = {
  latitude: number | null;
  longitude: number | null;
  locationLabel?: string | null;
  className?: string;
};

function hasCoordinates(latitude: number | null, longitude: number | null) {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  );
}

async function fetchBeachWeather(latitude: number, longitude: number) {
  const response = await fetch(`/api/weather?lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  return (await response.json()) as WeatherResponse;
}

function formatNumber(value: number | null | undefined, maximumFractionDigits = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);
}

function WeatherIcon({ weather }: { weather: WeatherSummary | null }) {
  if (weather?.conditionIconUrl) {
    return <img src={weather.conditionIconUrl} alt="" className="h-7 w-7" loading="lazy" />;
  }

  return <CloudSun className="h-5 w-5" aria-hidden="true" />;
}

export function BeachWeatherWidget({
  latitude,
  longitude,
  locationLabel,
  className,
}: BeachWeatherWidgetProps) {
  const { t } = useTranslation();
  const canLoadWeather = hasCoordinates(latitude, longitude);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["beach-weather", latitude?.toFixed(4), longitude?.toFixed(4)],
    queryFn: () => fetchBeachWeather(latitude as number, longitude as number),
    enabled: canLoadWeather,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (!canLoadWeather) return null;

  const weather = data?.ok ? data : null;
  const unavailable = !isLoading && (isError || data?.ok === false);
  const temperature = formatNumber(weather?.temperatureC);
  const wind = formatNumber(weather?.windKph);
  const uv = formatNumber(weather?.uvIndex, 1);
  const minTemp = formatNumber(weather?.minTempC);
  const maxTemp = formatNumber(weather?.maxTempC);
  const chanceOfRain = formatNumber(weather?.chanceOfRain);
  const condition = weather?.conditionLabel ?? null;

  const title = t("weather.label", { defaultValue: "Weather" });
  const ariaLabel = weather && temperature
    ? t("weather.beachTemperatureLabel", {
        place: locationLabel ?? title,
        celsius: temperature,
        condition: condition ?? "",
        wind: wind ?? "",
        defaultValue: `${locationLabel ?? title} weather: ${temperature}°C${condition ? `, ${condition}` : ""}`,
      })
    : unavailable
      ? t("weather.unavailable", { defaultValue: "Weather unavailable" })
      : t("weather.loading", { defaultValue: "Loading weather" });

  return (
    <aside
      className={cn(
        "relative isolate w-full overflow-hidden rounded-2xl border border-border/70 bg-card/82 p-3 text-foreground shadow-sm backdrop-blur-xl sm:w-auto sm:min-w-[14rem]",
        "dark:border-white/12 dark:bg-white/[0.08]",
        className,
      )}
      aria-label={ariaLabel}
      aria-busy={isLoading}
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(217,147,24,0.10))] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(217,147,24,0.10))]" />
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
          <WeatherIcon weather={weather} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.64rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {title}
          </p>
          {weather && temperature ? (
            <>
              <p className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
                {temperature}°C{condition ? <span className="text-muted-foreground"> · {condition}</span> : null}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {wind ? (
                  <span className="inline-flex items-center gap-1">
                    <Wind className="h-3.5 w-3.5" aria-hidden="true" />
                    {weather.windDir ? `${weather.windDir} ` : ""}
                    {wind} {t("weather.windSpeedUnit", { defaultValue: "km/h" })}
                  </span>
                ) : null}
                {uv ? <span>UV {uv}</span> : null}
              </p>
              {(minTemp && maxTemp) || chanceOfRain ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {minTemp && maxTemp ? (
                    <span>
                      {t("weather.today", { defaultValue: "Today" })} {minTemp}° / {maxTemp}°
                    </span>
                  ) : null}
                  {minTemp && maxTemp && chanceOfRain ? <span> · </span> : null}
                  {chanceOfRain ? (
                    <span>
                      {t("weather.rain", { defaultValue: "Rain" })} {chanceOfRain}%
                    </span>
                  ) : null}
                </p>
              ) : null}
              {weather.humidity !== null ? (
                <span className="sr-only">
                  {t("weather.humidity", {
                    humidity: formatNumber(weather.humidity) ?? "",
                    defaultValue: `Humidity ${formatNumber(weather.humidity) ?? ""}%`,
                  })}
                </span>
              ) : null}
            </>
          ) : unavailable ? (
            <div className="mt-1">
              <p className="text-sm font-semibold text-foreground">
                {t("weather.unavailable", { defaultValue: "Weather unavailable" })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("weather.beachUnavailableDescription", {
                  defaultValue: "Local forecast could not be loaded.",
                })}
              </p>
            </div>
          ) : (
            <div className="mt-2 space-y-1.5">
              <span className="block h-3 w-24 animate-pulse rounded-full bg-muted-foreground/20" />
              <span className="block h-2.5 w-32 animate-pulse rounded-full bg-muted-foreground/15" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
