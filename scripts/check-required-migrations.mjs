#!/usr/bin/env node

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    if (process.env[key]) continue;
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env.production.local");
loadEnv(".vercel/.env.production.local");
loadEnv(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const checks = [
  {
    label: "UI key status metadata table",
    migration: "20260513120000_add_i18n_locale_key_status.sql",
    query: () =>
      supabase
        .from("i18n_locale_key_status")
        .select("locale,key_path,source_hash,status,reviewed_at,updated_at")
        .limit(1),
  },
  {
    label: "Admin Inbox status history columns",
    migration: "20260513133000_add_admin_inbox_status_history.sql",
    query: () =>
      supabase
        .from("admin_inbox_archives")
        .select("source,source_row_id,status,item_snapshot,updated_at,resolved_at,dismissed_at")
        .limit(1),
  },
];

let failed = 0;
for (const check of checks) {
  const { error } = await check.query();
  if (error) {
    failed += 1;
    console.error(`FAIL ${check.label}: apply ${check.migration}`);
    console.error(`     ${error.code ?? "unknown"} ${error.message}`);
  } else {
    console.log(`OK   ${check.label}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
