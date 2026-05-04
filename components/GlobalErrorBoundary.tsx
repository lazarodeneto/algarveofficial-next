import React, { Component, ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const CHUNK_RECOVERY_SESSION_KEY = "algarveofficial:chunk-error-recovered";
const SUPPORTED_LOCALE_PATTERN = /^(en|pt-pt|fr|de|es|it|nl|sv|no|da)$/;
const SENSITIVE_QUERY_PATTERN = /(token|code|session|secret|key|password|auth|email|phone)/i;

function redactSensitiveText(value: string | null | undefined) {
  if (!value) return undefined;

  return value
    .replace(/https?:\/\/[^\s)]+/gi, (match) => {
      try {
        const url = new URL(match);
        return `${url.origin}${url.pathname}`;
      } catch {
        return "[redacted-url]";
      }
    })
    .replace(/(access_token|refresh_token|id_token|token|code|secret|key|password|email|phone)=([^&\s]+)/gi, "$1=[redacted]")
    .slice(0, 4000);
}

function getSafeLocationDetails() {
  if (typeof window === "undefined") {
    return {
      href: "unavailable",
      pathname: "unavailable",
      queryKeys: [] as string[],
      locale: "unknown",
    };
  }

  const { origin, pathname, searchParams } = new URL(window.location.href);
  const queryKeys = Array.from(searchParams.keys())
    .filter((key) => !SENSITIVE_QUERY_PATTERN.test(key))
    .sort();
  const [, firstSegment] = pathname.split("/");

  return {
    href: `${origin}${pathname}`,
    pathname,
    queryKeys,
    locale: SUPPORTED_LOCALE_PATTERN.test(firstSegment) ? firstSegment : "unknown",
  };
}

function getDeploymentId() {
  if (typeof document === "undefined") return "unknown";
  return document.documentElement.getAttribute("data-dpl-id") ?? "unknown";
}

function isChunkLoadError(error: Error) {
  const haystack = `${error.name} ${error.message}`.toLowerCase();
  return (
    haystack.includes("chunkloaderror") ||
    haystack.includes("loading chunk") ||
    haystack.includes("failed to fetch dynamically imported module") ||
    haystack.includes("importing a module script failed") ||
    haystack.includes("error loading dynamically imported module")
  );
}

function buildErrorDiagnostics(error: Error, errorInfo: ErrorInfo) {
  const locationDetails = getSafeLocationDetails();

  return {
    timestamp: new Date().toISOString(),
    errorName: redactSensitiveText(error.name) ?? "Error",
    errorMessage: redactSensitiveText(error.message) ?? "No error message",
    isChunkLoadError: isChunkLoadError(error),
    location: locationDetails,
    deploymentId: getDeploymentId(),
    userAgent: typeof navigator === "undefined" ? "unavailable" : navigator.userAgent,
    componentStack: redactSensitiveText(errorInfo.componentStack) ?? "unavailable",
    stack:
      process.env.NODE_ENV === "production"
        ? redactSensitiveText(error.stack?.split("\n").slice(0, 4).join("\n"))
        : redactSensitiveText(error.stack),
  };
}

function recoverFromStaleChunkOnce(error: Error) {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return;

  try {
    const locationKey = `${CHUNK_RECOVERY_SESSION_KEY}:${window.location.pathname}`;
    if (window.sessionStorage.getItem(locationKey) === "1") return;

    window.sessionStorage.setItem(locationKey, "1");
    window.setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch {
    // If sessionStorage is unavailable, keep the existing manual refresh fallback.
  }
}

function GlobalErrorFallback({ error }: { error: Error | null }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="mb-4 text-4xl font-bold">{t("errorPage.title")}</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        {t("errorPage.description")}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>
          {t("errorPage.refreshPage")}
        </Button>
        <Button variant="outline" asChild>
          <LocaleLink href="/">{t("errorPage.goHome")}</LocaleLink>
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && error ? (
        <pre className="mt-8 max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs">
          {error.toString()}
        </pre>
      ) : null}
    </div>
  );
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const diagnostics = buildErrorDiagnostics(error, errorInfo);
    console.error("GlobalErrorBoundary caught an error:", diagnostics);
    recoverFromStaleChunkOnce(error);
  }

  public render() {
    if (this.state.hasError) {
      return <GlobalErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
