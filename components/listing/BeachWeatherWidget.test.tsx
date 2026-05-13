import type { ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BeachWeatherWidget } from "./BeachWeatherWidget";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? _key,
  }),
}));

function renderWidget(props: Partial<ComponentProps<typeof BeachWeatherWidget>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BeachWeatherWidget
        latitude={37.089824}
        longitude={-8.412287}
        locationLabel="Lagoa"
        {...props}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BeachWeatherWidget", () => {
  it("renders WeatherAPI values without broken placeholders", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
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
        }),
      }),
    );

    renderWidget();

    expect(await screen.findByText(/16°C/)).toBeInTheDocument();
    expect(screen.getByText(/Sunny/)).toBeInTheDocument();
    expect(screen.getByText(/SW 14 km\/h/)).toBeInTheDocument();
    expect(screen.getByText(/UV 1.5/)).toBeInTheDocument();
    expect(screen.getByText(/Rain 89%/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/--°C|undefined|NaN|null/);
  });

  it("shows a clean unavailable state when weather is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false, error: "missing_api_key" }),
      }),
    );

    renderWidget();

    expect(await screen.findByText("Weather unavailable")).toBeInTheDocument();
    expect(screen.getByText("Local forecast could not be loaded.")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/--°C|undefined|NaN|null/);
  });

  it("does not render when listing coordinates are missing", async () => {
    const { container } = renderWidget({ latitude: null, longitude: null });

    await waitFor(() => expect(container.querySelector("aside")).not.toBeInTheDocument());
  });
});
