import { afterEach, describe, expect, it, vi } from "vitest";

import { sendEnquiry } from "./client";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Promise<Response>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("sendEnquiry", () => {
  it("posts contact enquiries to the local API and returns normalized warnings", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      jsonResponse({
        ok: true,
        data: {
          threadId: "thread-1",
          messageId: "message-1",
        },
        warnings: ["email_delivery_failed"],
      }, 201),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendEnquiry({
      name: "Test Sender",
      email: "sender@example.com",
      message: "Hello",
      listing_title: "Website Contact Form",
    });

    expect(result).toEqual({
      data: {
        threadId: "thread-1",
        messageId: "message-1",
      },
      warnings: ["email_delivery_failed"],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/enquiries",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("throws structured API errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() =>
      jsonResponse({
        ok: false,
        error: {
          code: "INVALID_ENQUIRY",
          message: "Message details are invalid.",
        },
      }, 400),
    ));

    await expect(sendEnquiry({
      name: "T",
      email: "bad",
      message: "",
    })).rejects.toThrow("Message details are invalid.");
  });

  it("throws when the success response is missing message identifiers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() =>
      jsonResponse({
        ok: true,
        data: {
          threadId: "thread-1",
        },
        warnings: [],
      }, 201),
    ));

    await expect(sendEnquiry({
      name: "Test Sender",
      email: "sender@example.com",
      message: "Hello",
    })).rejects.toThrow("Message delivery response was incomplete.");
  });
});
