"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export function useContactForm() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (payload: ContactFormData) => {
            const { data, error } = await supabase.functions.invoke("send-enquiry", {
                body: {
                    name: payload.name,
                    email: payload.email,
                    message: `Subject: ${payload.subject}\n\n${payload.message}`,
                    listing_title: "Website Contact Form",
                },
            });

            if (error) {
                let detailedMessage = "";
                const errorContext = (error as { context?: unknown }).context;
                if (errorContext instanceof Response) {
                    const errorPayload = await errorContext.json().catch(() => null) as { error?: string } | null;
                    if (errorPayload?.error) detailedMessage = errorPayload.error;
                }
                throw new Error(detailedMessage || error.message || "Failed to send message");
            }

            return data as { warnings?: string[] } | null;
        },
        onSuccess: (responseData) => {
            queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
            // If the user is logged in, they might want to see their own threads updated
            if (user) {
                queryClient.invalidateQueries({ queryKey: ["chat-threads", user.id] });
            }
            toast.success(t("contact.success", "Your message has been sent successfully!"));
            if (responseData?.warnings?.includes("email_delivery_failed") || responseData?.warnings?.includes("email_delivery_primary_sender_failed")) {
                toast.message("Your message was saved, but email notification failed. The admin can still view it in the inbox.");
            }
            if (responseData?.warnings?.includes("admin_user_not_configured") || responseData?.warnings?.includes("enquiry_saved_but_admin_inbox_insert_failed") || responseData?.warnings?.includes("enquiry_saved_but_admin_message_insert_failed")) {
                toast.message("Your message was received, but admin inbox delivery needs configuration.");
            }
        },
        onError: (error: unknown) => {
            console.error("Contact form error:", error);
            const message = error instanceof Error ? error.message : "";
            const isNetworkError = /failed to fetch|failed to send a request/i.test(message);
            toast.error(
                isNetworkError
                    ? "Unable to reach our server right now. Please try again in a moment."
                    : (message || t("contact.error", "Failed to send message. Please try again later."))
            );
        }
    });
}
