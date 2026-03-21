/**
 * components/dev/I18nDebugPanel.tsx
 *
 * Development-only overlay that shows:
 *  • Current locale and language code
 *  • Missing translation keys detected at runtime
 *  • Keys falling back to English / default values
 *  • Total key count loaded
 *
 * Rendered only in NODE_ENV=development. Tree-shaken out of production builds.
 *
 * ─── Usage ────────────────────────────────────────────────────────────────────
 *
 *   // In your root layout (wrapped in a dev check):
 *   import dynamic from "next/dynamic";
 *   const I18nDebugPanel = dynamic(
 *     () => import("@/components/dev/I18nDebugPanel"),
 *     { ssr: false }
 *   );
 *
 *   {process.env.NODE_ENV === "development" && <I18nDebugPanel />}
 *
 * ─── Controls ─────────────────────────────────────────────────────────────────
 *   • Click the 🌐 badge to expand/collapse the panel
 *   • "Clear" button resets the runtime issue log
 *   • Keyboard shortcut: Alt+Shift+I to toggle
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MissingKeyEntry {
  key: string;
  locale: string;
  timestamp: number;
  component?: string;
}

// ─── Global issue bus (populated by tSafe) ────────────────────────────────────

declare global {
  interface Window {
    __i18nDebug?: {
      issues: MissingKeyEntry[];
      onIssue: ((entry: MissingKeyEntry) => void) | null;
      reportMissing: (key: string, locale: string) => void;
    };
  }
}

function getDebugBus() {
  if (typeof window === "undefined") return null;
  if (!window.__i18nDebug) {
    window.__i18nDebug = {
      issues: [],
      onIssue: null,
      reportMissing(key, locale) {
        const entry: MissingKeyEntry = { key, locale, timestamp: Date.now() };
        this.issues.push(entry);
        this.onIssue?.(entry);
      },
    };
  }
  return window.__i18nDebug;
}

/** Call from tSafe or any translation wrapper to report a missing key. */
export function reportMissingKey(key: string, locale: string): void {
  if (process.env.NODE_ENV !== "development") return;
  getDebugBus()?.reportMissing(key, locale);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function I18nDebugPanel() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState<MissingKeyEntry[]>([]);
  const [keyCount, setKeyCount] = useState(0);
  const busRef = useRef(getDebugBus());

  // Subscribe to missing-key events
  useEffect(() => {
    const bus = busRef.current;
    if (!bus) return;

    // Replay any issues already recorded before the panel mounted
    if (bus.issues.length > 0) {
      setIssues([...bus.issues]);
    }

    bus.onIssue = (entry) => {
      setIssues((prev) => {
        // Deduplicate by key+locale
        const exists = prev.some((e) => e.key === entry.key && e.locale === entry.locale);
        return exists ? prev : [...prev, entry];
      });
    };

    return () => {
      bus.onIssue = null;
    };
  }, []);

  // Count loaded keys
  useEffect(() => {
    const resources = i18n.getResourceBundle(i18n.language, "translation");
    if (resources && typeof resources === "object") {
      const count = Object.keys(resources).length;
      setKeyCount(count);
    }
  }, [i18n, i18n.language]);

  // Keyboard shortcut: Alt+Shift+I
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === "I") {
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const clearIssues = useCallback(() => {
    if (busRef.current) busRef.current.issues = [];
    setIssues([]);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  const locale = i18n.language ?? "unknown";
  const hasBadge = issues.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 99999,
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      {/* Toggle badge */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          background: hasBadge ? "#dc2626" : "#1d4ed8",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          userSelect: "none",
        }}
        title="Toggle i18n debug panel (Alt+Shift+I)"
        aria-label="Toggle i18n debug panel"
      >
        🌐 {locale.toUpperCase()}
        {hasBadge && (
          <span
            style={{
              background: "#fff",
              color: "#dc2626",
              borderRadius: "999px",
              padding: "0 5px",
              fontWeight: 700,
              fontSize: "11px",
            }}
          >
            {issues.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            width: "360px",
            maxHeight: "480px",
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px",
              background: "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #334155",
            }}
          >
            <span style={{ fontWeight: 700, color: "#38bdf8" }}>
              🌐 i18n Debug Panel
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "14px",
                padding: "2px 4px",
              }}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              padding: "10px 14px",
              borderBottom: "1px solid #1e293b",
              flexWrap: "wrap",
            }}
          >
            <Stat label="Locale" value={locale} />
            <Stat label="Issues" value={String(issues.length)} accent={hasBadge ? "#ef4444" : undefined} />
            <Stat label="Keys loaded" value={keyCount > 0 ? String(keyCount) : "—"} />
          </div>

          {/* Issues list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {issues.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#4ade80",
                }}
              >
                ✅ No missing keys detected
              </div>
            ) : (
              issues.map((issue, i) => (
                <div
                  key={`${issue.key}-${issue.locale}-${i}`}
                  style={{
                    padding: "8px 14px",
                    borderBottom: "1px solid #1e293b",
                  }}
                >
                  <div style={{ color: "#fbbf24", wordBreak: "break-all" }}>
                    ⚠️ <strong>{issue.key}</strong>
                  </div>
                  <div style={{ color: "#64748b", marginTop: "2px" }}>
                    locale: {issue.locale} ·{" "}
                    {new Date(issue.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {issues.length > 0 && (
            <div
              style={{
                padding: "8px 14px",
                borderTop: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#1e293b",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "11px" }}>
                Alt+Shift+I to toggle
              </span>
              <button
                onClick={clearIssues}
                style={{
                  background: "#334155",
                  border: "none",
                  color: "#cbd5e1",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <div style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color: accent ?? "#f8fafc", fontWeight: 700 }}>{value}</div>
    </div>
  );
}
