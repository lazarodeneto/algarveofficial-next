import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

async function generateBrowserHash(): Promise<string> {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export function useNewsletterSignup(defaultSource = "newsletter") {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscribe = useCallback(
    async (payload: NewsletterSignupPayload): Promise<NewsletterSignupStatus> => {
      const normalizedEmail = payload.email.toLowerCase().trim();

      if (!normalizedEmail) return "empty_email";
      if (!EMAIL_REGEX.test(normalizedEmail)) return "invalid_email";

      setIsSubmitting(true);

      try {
        const ipHash = await generateBrowserHash();

        const { data, error } = await supabase.rpc("subscribe_newsletter", {
          _email: normalizedEmail,
          _full_name: payload.fullName ?? null,
          _source: payload.source ?? defaultSource,
          _ip_hash: ipHash,
        });

        if (error) throw error;

        const result = data as { success?: boolean; error?: string; message?: string } | null;
        const message = `${result?.error ?? ""} ${result?.message ?? ""}`.toLowerCase();

        if (result?.success) return "success";
        if (message.includes("too many requests")) return "rate_limited";
        return "already_subscribed";
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
