import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const emailConfig = {
    resendNewsletterSegmentId: "segment-1",
    resendNewsletterTopicId: "topic-1",
    resendAudienceId: null as string | null,
  };
  const contacts = {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    segments: {
      add: vi.fn(),
    },
    topics: {
      update: vi.fn(),
    },
  };

  return {
    emailConfig,
    contacts,
    getResendClient: vi.fn(() => ({ contacts })),
    isEmailConfigured: vi.fn(() => true),
  };
});

vi.mock("@/lib/email/email-config", () => ({
  getEmailConfig: () => mocks.emailConfig,
}));

vi.mock("@/lib/email/resend-client", () => ({
  getResendClient: mocks.getResendClient,
  isEmailConfigured: mocks.isEmailConfigured,
}));

import { syncNewsletterSubscriberToResend } from "@/lib/email/resend-contacts";

const VALID_AUDIENCE_ID = "0f4e10db-4042-4e40-8da2-d5e329a8066f";

function makeSubscriber() {
  return {
    id: "subscriber-1",
    email: "reader@example.com",
    fullName: "Reader Example",
    locale: "en",
    source: "newsletter",
    confirmedAt: "2026-05-14T12:00:00.000Z",
  };
}

function makeDiagnosticClient() {
  const eq = vi.fn().mockResolvedValue({ data: null, error: null });
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));

  return {
    client: { from } as never,
    update,
  };
}

function setTargets(targets: {
  segmentId?: string | null;
  topicId?: string | null;
  audienceId?: string | null;
}) {
  mocks.emailConfig.resendNewsletterSegmentId = targets.segmentId ?? null;
  mocks.emailConfig.resendNewsletterTopicId = targets.topicId ?? null;
  mocks.emailConfig.resendAudienceId = targets.audienceId ?? null;
}

beforeEach(() => {
  setTargets({
    segmentId: "segment-1",
    topicId: "topic-1",
    audienceId: null,
  });
  mocks.isEmailConfigured.mockReturnValue(true);
  mocks.contacts.get.mockResolvedValue({ data: null, error: null });
  mocks.contacts.create.mockResolvedValue({ data: { id: "contact-1" }, error: null });
  mocks.contacts.update.mockResolvedValue({ data: { id: "contact-1" }, error: null });
  mocks.contacts.segments.add.mockResolvedValue({ data: { id: "contact-1" }, error: null });
  mocks.contacts.topics.update.mockResolvedValue({ data: { id: "contact-1" }, error: null });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Resend newsletter contact sync", () => {
  it("ignores invalid legacy Audience IDs when Segment or Topic targets are configured", async () => {
    setTargets({
      segmentId: "segment-1",
      topicId: "topic-1",
      audienceId: "not-a-valid-audience-id",
    });
    const diagnostics = makeDiagnosticClient();

    const result = await syncNewsletterSubscriberToResend({
      client: diagnostics.client,
      subscriber: makeSubscriber(),
    });

    expect(result.status).toBe("synced");
    expect(mocks.contacts.get).toHaveBeenCalledWith({ email: "reader@example.com" });
    expect(mocks.contacts.create).toHaveBeenCalledWith(expect.not.objectContaining({
      audienceId: expect.any(String),
    }));
    expect(mocks.contacts.segments.add).toHaveBeenCalledWith({
      email: "reader@example.com",
      segmentId: "segment-1",
    });
    expect(mocks.contacts.topics.update).toHaveBeenCalledWith({
      email: "reader@example.com",
      topics: [{ id: "topic-1", subscription: "opt_in" }],
    });
    expect(diagnostics.update).toHaveBeenCalledWith(expect.objectContaining({
      resend_sync_status: "synced",
      metadata: expect.objectContaining({
        resend_sync_warnings: ["legacy_audience_ignored_for_segment_topic_sync"],
      }),
    }));
  });

  it("uses legacy Audience fallback only when modern Segment and Topic targets are absent", async () => {
    setTargets({
      segmentId: null,
      topicId: null,
      audienceId: VALID_AUDIENCE_ID,
    });

    const result = await syncNewsletterSubscriberToResend({
      subscriber: makeSubscriber(),
    });

    expect(result.status).toBe("synced");
    expect(mocks.contacts.get).toHaveBeenCalledWith({
      audienceId: VALID_AUDIENCE_ID,
      email: "reader@example.com",
    });
    expect(mocks.contacts.create).toHaveBeenCalledWith(expect.objectContaining({
      audienceId: VALID_AUDIENCE_ID,
      email: "reader@example.com",
    }));
    expect(mocks.contacts.segments.add).not.toHaveBeenCalled();
    expect(mocks.contacts.topics.update).not.toHaveBeenCalled();
  });

  it("skips sync safely when only an invalid legacy Audience ID is configured", async () => {
    setTargets({
      segmentId: null,
      topicId: null,
      audienceId: "invalid-audience",
    });
    const diagnostics = makeDiagnosticClient();

    const result = await syncNewsletterSubscriberToResend({
      client: diagnostics.client,
      subscriber: makeSubscriber(),
    });

    expect(result.status).toBe("skipped");
    expect(result.reason).toBe("legacy_audience_id_invalid");
    expect(mocks.getResendClient).not.toHaveBeenCalled();
    expect(diagnostics.update).toHaveBeenCalledWith(expect.objectContaining({
      resend_sync_status: "skipped",
      metadata: expect.objectContaining({
        resend_sync_reason: "legacy_audience_id_invalid",
      }),
    }));
  });

  it("records a failed sync when Segment or Topic updates fail", async () => {
    mocks.contacts.segments.add.mockResolvedValueOnce({
      data: null,
      error: { message: "segment sync failed" },
    });
    const diagnostics = makeDiagnosticClient();

    const result = await syncNewsletterSubscriberToResend({
      client: diagnostics.client,
      subscriber: makeSubscriber(),
    });

    expect(result.status).toBe("failed");
    expect(result.reason).toBe("segment sync failed");
    expect(diagnostics.update).toHaveBeenCalledWith(expect.objectContaining({
      resend_contact_id: "contact-1",
      resend_sync_status: "failed",
      resend_synced_at: null,
      metadata: expect.objectContaining({
        resend_sync_reason: "segment sync failed",
      }),
    }));
  });
});
