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
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <GlobalErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
