"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { sendEnquiry } from "@/lib/enquiries/client";
import { toContactEnquiryPayload, type ContactFormData } from "@/lib/enquiries/contact-form";

export function useContactForm() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (payload: ContactFormData) => {
            return sendEnquiry(toContactEnquiryPayload(payload));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
            // If the user is logged in, they might want to see their own threads updated
            if (user) {
                queryClient.invalidateQueries({ queryKey: ["chat-threads", user.id] });
            }
            toast.success(t("contact.success"));
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "";
            const isNetworkError = /failed to fetch|failed to send a request/i.test(message);
            toast.error(
                isNetworkError
                    ? t("contact.networkError")
                    : (message || t("contact.error"))
            );
        }
    });
}
