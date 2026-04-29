import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const chunkDir = join(process.cwd(), ".next", "static", "chunks");
const maxGzipKb = Number(process.env.CLIENT_CHUNK_GZIP_BUDGET_KB ?? 350);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

let files;
try {
  files = readdirSync(chunkDir).filter((file) => file.endsWith(".js"));
} catch {
  fail("Missing .next/static/chunks. Run a production build before checking the bundle budget.");
  process.exit();
}

const oversized = [];

for (const file of files) {
  const fullPath = join(chunkDir, file);
  if (!statSync(fullPath).isFile()) continue;

  const gzipKb = gzipSync(readFileSync(fullPath)).length / 1024;
  if (gzipKb > maxGzipKb) {
    oversized.push({ file, gzipKb });
  }
}

if (oversized.length > 0) {
  fail(
    [
      `Client chunk gzip budget exceeded (${maxGzipKb} KB).`,
      ...oversized.map(({ file, gzipKb }) => `- ${file}: ${gzipKb.toFixed(1)} KB gzip`),
    ].join("\n"),
  );
} else {
  console.log(`Client chunk gzip budget OK: all chunks <= ${maxGzipKb} KB gzip.`);
}
