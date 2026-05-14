import { useCallback, useState } from "react";

export type NewsletterSignupStatus =
  | "success"
  | "already_subscribed"
  | "rate_limited"
  | "empty_email"
  | "invalid_email"
  | "error";

interface NewsletterSignupPayload {
  email: string;
  fullName?: string | null;
  source?: string;
  honeypot?: string | null;
  submittedAt?: number | null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function useNewsletterSignup(defaultSource = "newsletter") {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscribe = useCallback(
    async (payload: NewsletterSignupPayload): Promise<NewsletterSignupStatus> => {
      const normalizedEmail = payload.email.toLowerCase().trim();

      if (!normalizedEmail) return "empty_email";
      if (!EMAIL_REGEX.test(normalizedEmail)) return "invalid_email";

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            fullName: payload.fullName ?? null,
            source: payload.source ?? defaultSource,
            source_url: typeof window !== "undefined" ? window.location.href : null,
            locale: typeof document !== "undefined" ? document.documentElement.lang : null,
            honeypot: payload.honeypot ?? "",
            submittedAt: payload.submittedAt ?? null,
          }),
        });

        if (response.status === 429) return "rate_limited";
        if (!response.ok) return "error";

        return "success";
      } catch (error) {
        console.error("Newsletter signup error:", error);
        return "error";
      } finally {
        setIsSubmitting(false);
      }
    },
    [defaultSource],
  );

  return {
    subscribe,
    isSubmitting,
  };
}
