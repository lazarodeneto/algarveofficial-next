import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  CMS_BLOCK_ID_ALIASES_BY_PAGE,
  CMS_CONTRACT_ENFORCED_PAGE_IDS,
  CMS_CONTRACT_PLANNED_BLOCK_IDS,
  CMS_PAGE_DEFINITION_MAP,
  getCmsPageRegistryMeta,
  isCmsPageEditableInFullBuilder,
  isKnownCmsPageId,
  resolveCmsBlockId,
} from "@/lib/cms/pageBuilderRegistry";

interface RuntimeCmsUsage {
  pages: Set<string>;
  rawBlocksByPage: Map<string, Set<string>>;
  canonicalBlocksByPage: Map<string, Set<string>>;
}

const RUNTIME_SCAN_ROOTS = ["components", "legacy-pages/public"];

function listSourceFiles(rootDir: string): string[] {
  const out: string[] = [];

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      if (["node_modules", ".next", "assets", "dist", ".git"].includes(entry.name)) return;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        return;
      }
      if (/\.(ts|tsx)$/.test(entry.name)) {
        out.push(fullPath);
      }
    });
  };

  walk(rootDir);
  return out;
}

function readRuntimeUsage(): RuntimeCmsUsage {
  const pages = new Set<string>();
  const rawBlocksByPage = new Map<string, Set<string>>();
  const canonicalBlocksByPage = new Map<string, Set<string>>();

  const addPage = (pageId: string) => {
    pages.add(pageId);
    if (!rawBlocksByPage.has(pageId)) rawBlocksByPage.set(pageId, new Set());
    if (!canonicalBlocksByPage.has(pageId)) canonicalBlocksByPage.set(pageId, new Set());
  };

  const addBlock = (pageId: string, blockId: string) => {
    addPage(pageId);
    rawBlocksByPage.get(pageId)?.add(blockId);
    const resolved = resolveCmsBlockId(pageId, blockId);
    if (resolved) {
      canonicalBlocksByPage.get(pageId)?.add(resolved);
    }
  };

  const cwd = process.cwd();
  const files = RUNTIME_SCAN_ROOTS.flatMap((relativeRoot) =>
    listSourceFiles(path.join(cwd, relativeRoot)),
  );

  files.forEach((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    const pageCandidates = new Set<string>();

    const useCmsPageRe = /useCmsPageBuilder\(\s*"([a-z0-9-]+)"\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = useCmsPageRe.exec(source))) {
      pageCandidates.add(match[1]);
    }

    const pageConfigBracketRe = /pageConfigs\[\s*"([a-z0-9-]+)"\s*\]/g;
    while ((match = pageConfigBracketRe.exec(source))) {
      pageCandidates.add(match[1]);
    }

    const pageConfigDotRe = /pageConfigs\.([a-z0-9]+)/g;
    while ((match = pageConfigDotRe.exec(source))) {
      pageCandidates.add(match[1]);
    }

    const dataCmsPageRe = /data-cms-page="([a-z0-9-]+)"/g;
    while ((match = dataCmsPageRe.exec(source))) {
      pageCandidates.add(match[1]);
    }

    pageCandidates.forEach((pageId) => addPage(pageId));

    const cmsBlockDirectRe = /<CmsBlock[^>]*pageId="([a-z0-9-]+)"[^>]*blockId="([a-z0-9-]+)"/g;
    while ((match = cmsBlockDirectRe.exec(source))) {
      addBlock(match[1], match[2]);
    }

    const cmsBlockInverseRe = /<CmsBlock[^>]*blockId="([a-z0-9-]+)"[^>]*pageId="([a-z0-9-]+)"/g;
    while ((match = cmsBlockInverseRe.exec(source))) {
      addBlock(match[2], match[1]);
    }

    const hasDynamicCmsPageId = /pageConfigs\[\s*cmsPageId\s*\]/.test(source);
    const inferPageId = pageCandidates.size === 1 && !hasDynamicCmsPageId
      ? Array.from(pageCandidates)[0]
      : null;

    if (inferPageId) {
      const blockMethodRe =
        /(?:isBlockEnabled|getBlockClassName|getBlockStyle|getBlockData)\(\s*"([a-z0-9-]+)"/g;
      while ((match = blockMethodRe.exec(source))) {
        addBlock(inferPageId, match[1]);
      }
    }
  });

  return {
    pages,
    rawBlocksByPage,
    canonicalBlocksByPage,
  };
}

describe("CMS page/block runtime contract", () => {
  it("only uses known page ids and block ids at runtime", () => {
    const usage = readRuntimeUsage();
    const unknownPages: string[] = [];
    const unknownBlocks: string[] = [];

    Array.from(usage.pages)
      .sort()
      .forEach((pageId) => {
        if (!isKnownCmsPageId(pageId)) {
          unknownPages.push(pageId);
        }
      });

    Array.from(usage.rawBlocksByPage.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([pageId, blockIds]) => {
        Array.from(blockIds)
          .sort()
          .forEach((blockId) => {
            if (!resolveCmsBlockId(pageId, blockId)) {
              unknownBlocks.push(`${pageId}.${blockId}`);
            }
          });
      });

    expect(unknownPages).toEqual([]);
    expect(unknownBlocks).toEqual([]);
  });

  it("keeps all enforced registry pages and blocks referenced by runtime", () => {
    const usage = readRuntimeUsage();
    const missingPages: string[] = [];
    const missingBlocks: string[] = [];

    CMS_CONTRACT_ENFORCED_PAGE_IDS.forEach((pageId) => {
      if (!usage.pages.has(pageId)) {
        missingPages.push(pageId);
      }
    });

    CMS_CONTRACT_ENFORCED_PAGE_IDS.forEach((pageId) => {
      const pageDefinition = CMS_PAGE_DEFINITION_MAP[pageId];
      const plannedBlockIds = new Set(CMS_CONTRACT_PLANNED_BLOCK_IDS[pageId] ?? []);
      const usedBlocks = usage.canonicalBlocksByPage.get(pageId) ?? new Set<string>();

      pageDefinition.blocks.forEach((block) => {
        if (plannedBlockIds.has(block.id)) return;
        if (!usedBlocks.has(block.id)) {
          missingBlocks.push(`${pageId}.${block.id}`);
        }
      });
    });

    expect(missingPages).toEqual([]);
    expect(missingBlocks).toEqual([]);
  });

  it("keeps block alias mappings pointed at valid targets", () => {
    const invalidAliases: string[] = [];

    Object.entries(CMS_BLOCK_ID_ALIASES_BY_PAGE).forEach(([pageId, aliases]) => {
      if (!isKnownCmsPageId(pageId)) {
        invalidAliases.push(`${pageId} (unknown page)`);
        return;
      }

      Object.entries(aliases).forEach(([fromBlockId, toBlockId]) => {
        if (!resolveCmsBlockId(pageId, toBlockId)) {
          invalidAliases.push(`${pageId}.${fromBlockId}->${toBlockId}`);
        }
      });
    });

    expect(invalidAliases).toEqual([]);
  });

  it("only marks pages editable after public renderer parity is intentionally wired", () => {
    expect(getCmsPageRegistryMeta("home").status).toBe("enabled");
    expect(getCmsPageRegistryMeta("real-estate").status).toBe("enabled");
    expect(getCmsPageRegistryMeta("invest").status).toBe("enabled");
    expect(getCmsPageRegistryMeta("golf").status).toBe("enabled");

    expect(getCmsPageRegistryMeta("partner").status).toBe("partial");
    expect(getCmsPageRegistryMeta("properties").status).toBe("partial");
    expect(getCmsPageRegistryMeta("visit").status).toBe("planned");
    expect(getCmsPageRegistryMeta("auth-login").status).toBe("disabled");

    expect(isCmsPageEditableInFullBuilder("home")).toBe(true);
    expect(isCmsPageEditableInFullBuilder("real-estate")).toBe(true);
    expect(isCmsPageEditableInFullBuilder("invest")).toBe(true);
    expect(isCmsPageEditableInFullBuilder("partner")).toBe(true);
    expect(isCmsPageEditableInFullBuilder("properties")).toBe(true);
    expect(isCmsPageEditableInFullBuilder("visit")).toBe(false);
    expect(isCmsPageEditableInFullBuilder("auth-login")).toBe(false);
  });
});
