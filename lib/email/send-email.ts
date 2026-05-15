import {
  getDefaultFrom,
  getDefaultReplyTo,
  getEmailConfig,
  isAllowedSenderAddress,
  normalizeEmailAddress,
} from "@/lib/email/email-config";
import {
  recordEmailAttempt,
  recordEmailFailure,
  recordEmailSkipped,
  recordEmailSuccess,
} from "@/lib/email/email-events";
import { getResendClient } from "@/lib/email/resend-client";
import type { EmailAttachment, EmailTag, SendEmailInput, SendEmailResult } from "@/lib/email/email-types";

const TAG_PATTERN = /^[A-Za-z0-9_-]{1,256}$/;

function result(overrides: Partial<SendEmailResult>): SendEmailResult {
  return {
    success: false,
    provider: "resend",
    providerEmailId: null,
    error: null,
    skipped: false,
    reason: null,
    ...overrides,
  };
}

function normalizeEmailList(value: string | string[] | null | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(
    new Set(
      values
        .flatMap((item) => item.split(","))
        .map((item) => normalizeEmailAddress(item))
        .filter((item): item is string => Boolean(item)),
    ),
  );
}

function hasInvalidEmail(value: string | string[] | null | undefined) {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const flattened = rawValues.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean);
  return flattened.some((item) => !normalizeEmailAddress(item));
}

function sanitizeTags(tags: EmailTag[] | null | undefined) {
  if (!tags) return undefined;
  const sanitized = tags
    .map((tag) => ({
      name: tag.name.trim(),
      value: tag.value.trim(),
    }))
    .filter((tag) => TAG_PATTERN.test(tag.name) && TAG_PATTERN.test(tag.value))
    .slice(0, 75);

  return sanitized.length > 0 ? sanitized : undefined;
}

function sanitizeAttachments(attachments: EmailAttachment[] | null | undefined) {
  if (!attachments) return undefined;

  const sanitized = attachments
    .filter((attachment) => attachment.content || attachment.path)
    .map((attachment) => ({
      content: attachment.content,
      filename: attachment.filename,
      path: attachment.path,
      contentType: attachment.contentType,
      contentId: attachment.contentId,
    }))
    .slice(0, 3);

  return sanitized.length > 0 ? sanitized : undefined;
}

function buildEventInput(input: SendEmailInput, to: string[], providerEmailId?: string | null, errorMessage?: string | null) {
  return {
    providerEmailId: providerEmailId ?? null,
    templateKey: input.templateKey,
    recipient: to,
    subject: input.subject,
    relatedEntityType: input.relatedEntityType ?? null,
    relatedEntityId: input.relatedEntityId ?? null,
    errorMessage: errorMessage ?? null,
    metadata: input.metadata ?? null,
  };
}

function safeErrorMessage(error: unknown) {
  if (!error) return "Email send failed.";
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Email send failed.";
}

function validateInput(input: SendEmailInput) {
  const to = normalizeEmailList(input.to);
  const cc = normalizeEmailList(input.cc);
  const bcc = normalizeEmailList(input.bcc);
  const replyTo = normalizeEmailList(input.replyTo);

  if (to.length === 0 || hasInvalidEmail(input.to)) {
    return { error: "Email recipient is invalid.", to, cc, bcc, replyTo };
  }

  if (hasInvalidEmail(input.cc) || hasInvalidEmail(input.bcc) || hasInvalidEmail(input.replyTo)) {
    return { error: "Email copy or reply-to recipient is invalid.", to, cc, bcc, replyTo };
  }

  if (!input.subject.trim()) {
    return { error: "Email subject is required.", to, cc, bcc, replyTo };
  }

  if (!input.html.trim() || !input.text.trim()) {
    return { error: "Email html and text content are required.", to, cc, bcc, replyTo };
  }

  return { error: null, to, cc, bcc, replyTo };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const validation = validateInput(input);
  const eventBase = buildEventInput(input, validation.to);

  if (validation.error) {
    await recordEmailFailure({ ...eventBase, errorMessage: validation.error });
    return result({ error: validation.error });
  }

  const config = getEmailConfig();
  const defaultFrom = getDefaultFrom();
  const defaultReplyTo = getDefaultReplyTo();
  if (!config.resendApiKey || !defaultFrom || !defaultReplyTo) {
    const reason = "email_not_configured";
    if (config.isProduction && input.allowSkip !== true) {
      const message = "Resend email configuration is incomplete.";
      await recordEmailFailure({ ...eventBase, errorMessage: message });
      return result({ error: message, reason });
    }

    await recordEmailSkipped({ ...eventBase, errorMessage: reason });
    return result({ skipped: true, reason });
  }

  const from = input.from?.trim() ? input.from.trim() : defaultFrom;
  if (!isAllowedSenderAddress(from)) {
    const message = "Email sender must use the configured Resend sender domain.";
    await recordEmailFailure({ ...eventBase, errorMessage: message });
    return result({ error: message });
  }

  const replyTo = validation.replyTo.length > 0 ? validation.replyTo : [defaultReplyTo as string];

  await recordEmailAttempt(eventBase);

  try {
    const response = await getResendClient().emails.send(
      {
        from,
        to: validation.to,
        cc: validation.cc.length > 0 ? validation.cc : undefined,
        bcc: validation.bcc.length > 0 ? validation.bcc : undefined,
        replyTo,
        subject: input.subject.trim(),
        html: input.html,
        text: input.text,
        tags: sanitizeTags(input.tags),
        attachments: sanitizeAttachments(input.attachments),
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );

    if (response.error) {
      const message = safeErrorMessage(response.error);
      await recordEmailFailure({ ...eventBase, errorMessage: message });
      console.warn("[email] resend send failed", {
        templateKey: input.templateKey,
        relatedEntityType: input.relatedEntityType ?? null,
        reason: message,
      });
      return result({ error: message });
    }

    const providerEmailId = response.data?.id ?? null;
    await recordEmailSuccess(buildEventInput(input, validation.to, providerEmailId));
    return result({
      success: true,
      providerEmailId,
    });
  } catch (error) {
    const message = safeErrorMessage(error);
    await recordEmailFailure({ ...eventBase, errorMessage: message });
    console.warn("[email] send failed", {
      templateKey: input.templateKey,
      relatedEntityType: input.relatedEntityType ?? null,
      reason: message,
    });
    return result({ error: message });
  }
}
