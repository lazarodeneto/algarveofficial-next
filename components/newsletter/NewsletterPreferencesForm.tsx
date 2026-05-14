"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PreferenceStatus = "loading" | "subscribed" | "unsubscribed" | "invalid" | "blocked";

interface PreferenceResponse {
  ok?: boolean;
  status?: Exclude<PreferenceStatus, "loading">;
  message?: string;
}

interface NewsletterPreferencesFormProps {
  token: string;
}

const STATUS_COPY: Record<Exclude<PreferenceStatus, "loading">, { title: string; description: string }> = {
  subscribed: {
    title: "Newsletter preference active",
    description: "You are subscribed to AlgarveOfficial updates.",
  },
  unsubscribed: {
    title: "Newsletter preference paused",
    description: "You are unsubscribed from AlgarveOfficial newsletter updates.",
  },
  invalid: {
    title: "Preference link unavailable",
    description: "This preferences link is invalid or has expired.",
  },
  blocked: {
    title: "Preference change unavailable",
    description: "This newsletter preference cannot be changed from this link.",
  },
};

function normalizeStatus(value: unknown): Exclude<PreferenceStatus, "loading"> {
  if (value === "subscribed" || value === "unsubscribed" || value === "blocked") return value;
  return "invalid";
}

export function NewsletterPreferencesForm({ token }: NewsletterPreferencesFormProps) {
  const [status, setStatus] = useState<PreferenceStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        const response = await fetch(`/api/newsletter/preferences?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as PreferenceResponse | null;
        if (cancelled) return;
        setStatus(normalizeStatus(payload?.status));
        setMessage(typeof payload?.message === "string" ? payload.message : null);
      } catch {
        if (!cancelled) {
          setStatus("invalid");
          setMessage("Newsletter preferences are temporarily unavailable.");
        }
      }
    }

    loadPreferences();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const content = useMemo(() => {
    if (status === "loading") {
      return {
        title: "Loading newsletter preferences",
        description: "Checking this secure preference link.",
      };
    }
    return STATUS_COPY[status];
  }, [status]);

  async function submitPreference(action: "stay_subscribed" | "subscribe" | "unsubscribe") {
    if (!token || isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter/preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, action }),
      });
      const payload = (await response.json().catch(() => null)) as PreferenceResponse | null;
      setStatus(normalizeStatus(payload?.status));
      setMessage(typeof payload?.message === "string" ? payload.message : null);
    } catch {
      setMessage("Newsletter preferences could not be updated. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canAct = status === "subscribed" || status === "unsubscribed";

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-16 text-foreground sm:px-6">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
        <Card className="w-full overflow-hidden rounded-lg border-[#e6ddcf] bg-white shadow-[0_24px_80px_rgba(17,24,39,0.08)]">
          <CardHeader className="border-b border-[#eadfce] bg-[#fbf8f1] p-6 sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#d8b45d]/45 bg-white text-[#0f8f64]">
              {status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : status === "subscribed" ? (
                <MailCheck className="h-5 w-5" aria-hidden="true" />
              ) : status === "unsubscribed" ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <CardTitle className="font-serif text-3xl leading-tight sm:text-4xl">
              {content.title}
            </CardTitle>
            <CardDescription className="mt-3 text-base leading-7 text-slate-600">
              {content.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-5">
              <p className="text-sm leading-6 text-slate-600">
                {message ?? "Use this page to manage AlgarveOfficial newsletter updates. Your email address is not displayed here."}
              </p>

              {canAct ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {status === "subscribed" ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => submitPreference("stay_subscribed")}
                        disabled={isSubmitting}
                        className="bg-[#0f8f64] text-white hover:bg-[#0b7753]"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                        Stay subscribed
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => submitPreference("unsubscribe")}
                        disabled={isSubmitting}
                      >
                        Unsubscribe
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => submitPreference("subscribe")}
                      disabled={isSubmitting}
                      className="bg-[#0f8f64] text-white hover:bg-[#0b7753]"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                      Re-subscribe
                    </Button>
                  )}
                </div>
              ) : null}

              <Button asChild variant="link" className="text-[#0f8f64]">
                <Link href="/">Return to AlgarveOfficial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
