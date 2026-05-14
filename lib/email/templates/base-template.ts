import { getSiteUrl } from "@/lib/email/email-config";

export interface EmailRow {
  label: string;
  value: string | null | undefined;
}

export interface EmailAction {
  label: string;
  url: string;
}

export interface BaseTemplateInput {
  preview: string;
  title: string;
  intro: string;
  rows?: EmailRow[];
  body?: string | null;
  action?: EmailAction | null;
  footerReason?: string;
}

const DEFAULT_FOOTER_REASON =
  "You are receiving this email because you contacted AlgarveOfficial or used an AlgarveOfficial service.";

export function escapeHtml(value: string | null | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

function multilineHtml(value: string | null | undefined) {
  return escapeHtml(displayValue(value)).replace(/\n/g, "<br />");
}

function renderRows(rows: EmailRow[]) {
  if (rows.length === 0) return "";
  const rendered = rows
    .map((row) => (
      `<tr><td style="padding:7px 0;color:#64748b;width:160px;vertical-align:top">${escapeHtml(row.label)}</td><td style="padding:7px 0;color:#111827;vertical-align:top">${multilineHtml(row.value)}</td></tr>`
    ))
    .join("");
  return `<table role="presentation" style="border-collapse:collapse;width:100%;margin:18px 0">${rendered}</table>`;
}

function renderTextRows(rows: EmailRow[]) {
  return rows.map((row) => `${row.label}: ${displayValue(row.value)}`).join("\n");
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function renderBaseEmail(input: BaseTemplateInput) {
  const rows = input.rows ?? [];
  const siteUrl = getSiteUrl();
  const footerReason = input.footerReason ?? DEFAULT_FOOTER_REASON;
  const actionHtml = input.action
    ? `<p style="margin:24px 0"><a href="${escapeHtml(input.action.url)}" style="display:inline-block;background:#0f9f6e;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700">${escapeHtml(input.action.label)}</a></p>`
    : "";
  const bodyHtml = input.body
    ? `<div style="margin:18px 0;padding:16px 18px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;color:#334155;line-height:1.7">${multilineHtml(input.body)}</div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;background:#f5f2ec;padding:0;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${escapeHtml(input.preview)}</div>
    <table role="presentation" style="width:100%;border-collapse:collapse;background:#f5f2ec">
      <tr>
        <td align="center" style="padding:28px 14px">
          <table role="presentation" style="width:100%;max-width:640px;border-collapse:collapse;background:#ffffff;border:1px solid #e6dfd3;border-radius:16px;overflow:hidden">
            <tr>
              <td style="padding:28px 30px 10px">
                <p style="margin:0 0 10px;color:#c9952c;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">AlgarveOfficial</p>
                <h1 style="margin:0;color:#171923;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.16;font-weight:600">${escapeHtml(input.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 30px">
                <p style="margin:16px 0 0;color:#475569;font-size:16px;line-height:1.65">${escapeHtml(input.intro)}</p>
                ${renderRows(rows)}
                ${bodyHtml}
                ${actionHtml}
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">${escapeHtml(footerReason)}</p>
                <p style="margin:10px 0 0;color:#64748b;font-size:13px"><a href="${escapeHtml(siteUrl)}" style="color:#0f766e;text-decoration:none">${escapeHtml(siteUrl)}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  const text = [
    "AlgarveOfficial",
    "",
    input.title,
    "",
    input.intro,
    rows.length > 0 ? `\n${renderTextRows(rows)}` : "",
    input.body ? `\n${displayValue(input.body)}` : "",
    input.action ? `\n${input.action.label}: ${input.action.url}` : "",
    "",
    footerReason,
    siteUrl,
  ].filter(Boolean).join("\n");

  return { html, text };
}
