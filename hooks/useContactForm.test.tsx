import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useContactForm } from "./useContactForm";

const mocks = vi.hoisted(() => ({
  sendEnquiry: vi.fn(),
  toastError: vi.fn(),
  toastMessage: vi.fn(),
  toastSuccess: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/lib/enquiries/client", () => ({
  sendEnquiry: mocks.sendEnquiry,
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    message: mocks.toastMessage,
    success: mocks.toastSuccess,
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "contact.error": "Something went wrong. Please try again.",
        "contact.networkError": "Unable to reach our server right now. Please try again in a moment.",
        "contact.success": "Your message has been sent successfully. We'll get back to you within 24 hours.",
      };
      return translations[key] ?? key;
    },
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("useContactForm", () => {
  it("shows one localized success toast even when the API reports internal email warnings", async () => {
    mocks.useAuth.mockReturnValue({ user: null });
    mocks.sendEnquiry.mockResolvedValue({
      data: {
        threadId: "thread-1",
        messageId: "message-1",
      },
      warnings: ["email_delivery_failed"],
    });

    const { result } = renderHook(() => useContactForm(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        name: "Test Sender",
        email: "sender@example.com",
        subject: "Availability",
        message: "Hello",
      });
    });

    expect(mocks.sendEnquiry).toHaveBeenCalledWith({
      name: "Test Sender",
      email: "sender@example.com",
      phone: null,
      message: "Subject: Availability\n\nHello",
      listing_id: null,
      listing_title: "Website Contact Form",
      agent_name: null,
      agent_email: null,
      visit_type: null,
    });
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Your message has been sent successfully. We'll get back to you within 24 hours.",
    );
    expect(mocks.toastMessage).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("shows an error toast when the API request fails", async () => {
    mocks.useAuth.mockReturnValue({ user: null });
    mocks.sendEnquiry.mockRejectedValue(new Error("Message details are invalid."));

    const { result } = renderHook(() => useContactForm(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({
        name: "Test Sender",
        email: "sender@example.com",
        subject: "Question",
        message: "Hello",
      })).rejects.toThrow("Message details are invalid.");
    });

    expect(mocks.toastError).toHaveBeenCalledWith("Message details are invalid.");
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });
});
