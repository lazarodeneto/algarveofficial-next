import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Save, Trash2, ExternalLink, Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import {
  CMS_GLOBAL_SETTING_KEYS,
  CMS_PAGE_DEFINITIONS,
  type CmsBlockConfig,
  type CmsDesignTokenMap,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStringMap(input: unknown): Record<string, string> {
  if (!isRecord(input)) return {};
  const out: Record<string, string> = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      out[key] = value;
    }
  });
  return out;
}

function normalizePageConfigs(input: unknown): CmsPageConfigMap {
  if (!isRecord(input)) return {};

  const out: CmsPageConfigMap = {};

  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isRecord(rawPage)) return;

    const page: CmsPageConfigMap[string] = {};

    if (isRecord(rawPage.blocks)) {
      const blocks: Record<string, CmsBlockConfig> = {};
      Object.entries(rawPage.blocks).forEach(([blockId, rawBlock]) => {
        if (!isRecord(rawBlock)) return;
        const block: CmsBlockConfig = {};
        if (typeof rawBlock.enabled === "boolean") block.enabled = rawBlock.enabled;
        if (typeof rawBlock.order === "number" && Number.isFinite(rawBlock.order)) block.order = rawBlock.order;
        if (typeof rawBlock.className === "string") block.className = rawBlock.className;

        if (isRecord(rawBlock.style)) {
          const style: Record<string, string | number> = {};
          Object.entries(rawBlock.style).forEach(([styleKey, styleValue]) => {
            if (typeof styleValue === "string" || typeof styleValue === "number") {
              style[styleKey] = styleValue;
            }
          });
          block.style = style;
        }

        blocks[blockId] = block;
      });
      page.blocks = blocks;
    }

    if (isRecord(rawPage.text)) {
      const text: Record<string, string> = {};
      Object.entries(rawPage.text).forEach(([textKey, textValue]) => {
        if (typeof textValue === "string") {
          text[textKey] = textValue;
        }
      });
      page.text = text;
    }

    if (isRecord(rawPage.meta)) {
      page.meta = {
        title: typeof rawPage.meta.title === "string" ? rawPage.meta.title : undefined,
        description: typeof rawPage.meta.description === "string" ? rawPage.meta.description : undefined,
      };
    }

    out[pageId] = page;
  });

  return out;
}

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
}

function toRows(input: Record<string, string>): KeyValueRow[] {
  return Object.entries(input).map(([key, value], index) => ({
    id: `${key}-${index}`,
    key,
    value,
  }));
}

function fromRows(rows: KeyValueRow[]): Record<string, string> {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    if (!key) return acc;
    acc[key] = row.value;
    return acc;
  }, {});
}

export default function AdminPageBuilder() {
  const router = useRouter();
  const pathname = usePathname() || "/admin/cms/page-builder";
  const searchParams = useSearchParams();
  const requestedPageId = searchParams.get("page")?.trim() ?? "";
  const fallbackPageId = CMS_PAGE_DEFINITIONS[0]?.id ?? "home";
  const initialPageId = CMS_PAGE_DEFINITIONS.some((page) => page.id === requestedPageId)
    ? requestedPageId
    : fallbackPageId;

  const { settings, isLoading, saveSettingsAsync, isSaving } = useGlobalSettings({
    keys: [
      CMS_GLOBAL_SETTING_KEYS.pageConfigs,
      CMS_GLOBAL_SETTING_KEYS.textOverrides,
      CMS_GLOBAL_SETTING_KEYS.designTokens,
      CMS_GLOBAL_SETTING_KEYS.customCss,
    ],
  });

  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId);

  const [pageConfigs, setPageConfigs] = useState<CmsPageConfigMap>({});
  const [globalTextRows, setGlobalTextRows] = useState<KeyValueRow[]>([]);
  const [designTokenRows, setDesignTokenRows] = useState<KeyValueRow[]>([]);
  const [customCss, setCustomCss] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  const setSearchParams = (nextParams: URLSearchParams, options?: { replace?: boolean }) => {
    const query = nextParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    if (options?.replace) {
      router.replace(href);
      return;
    }
    router.push(href);
  };

  const settingMap = useMemo(() => {
    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});
  }, [settings]);

  useEffect(() => {
    if (!requestedPageId) return;
    const isValidRequested = CMS_PAGE_DEFINITIONS.some((page) => page.id === requestedPageId);
    if (isValidRequested && requestedPageId !== selectedPageId) {
      setSelectedPageId(requestedPageId);
    }
  }, [requestedPageId, selectedPageId]);

  useEffect(() => {
    if (!selectedPageId) return;
    if (requestedPageId === selectedPageId) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", selectedPageId);
    setSearchParams(next, { replace: true });
  }, [requestedPageId, searchParams, selectedPageId, setSearchParams]);

  useEffect(() => {
    if (isLoading || initialized) return;

    const parsedPageConfigs = normalizePageConfigs(
      parseJson(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
    );
    const parsedGlobalText = normalizeStringMap(
      parseJson(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
    ) as CmsTextOverrideMap;
    const parsedTokens = normalizeStringMap(
      parseJson(settingMap[CMS_GLOBAL_SETTING_KEYS.designTokens], {}),
    ) as CmsDesignTokenMap;

    setPageConfigs(parsedPageConfigs);
    setGlobalTextRows(toRows(parsedGlobalText));
    setDesignTokenRows(toRows(parsedTokens));
    setCustomCss(settingMap[CMS_GLOBAL_SETTING_KEYS.customCss] ?? "");
    setInitialized(true);
  }, [initialized, isLoading, settingMap]);

  const selectedPageDefinition = useMemo(
    () => CMS_PAGE_DEFINITIONS.find((page) => page.id === selectedPageId) ?? CMS_PAGE_DEFINITIONS[0],
    [selectedPageId],
  );

  const selectedPageConfig = pageConfigs[selectedPageId] ?? {};

  const selectedPageTextRows = useMemo(
    () => toRows(selectedPageConfig.text ?? {}),
    [selectedPageConfig.text],
  );

  const updateBlockConfig = (blockId: string, updater: (current: CmsBlockConfig) => CmsBlockConfig) => {
    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      const currentBlocks = currentPage.blocks ?? {};
      const currentBlock = currentBlocks[blockId] ?? {};
      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          blocks: {
            ...currentBlocks,
            [blockId]: updater(currentBlock),
          },
        },
      };
    });
  };

  const setPageMeta = (field: "title" | "description", value: string) => {
    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          meta: {
            ...(currentPage.meta ?? {}),
            [field]: value,
          },
        },
      };
    });
  };

  const setPageTextRows = (rows: KeyValueRow[]) => {
    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          text: fromRows(rows),
        },
      };
    });
  };

  const addPageTextRow = () => {
    setPageTextRows([
      ...selectedPageTextRows,
      {
        id: `new-${Date.now()}`,
        key: "",
        value: "",
      },
    ]);
  };

  const updatePageTextRow = (id: string, field: "key" | "value", value: string) => {
    setPageTextRows(
      selectedPageTextRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removePageTextRow = (id: string) => {
    setPageTextRows(selectedPageTextRows.filter((row) => row.id !== id));
  };

  const addGlobalTextRow = () => {
    setGlobalTextRows((prev) => [...prev, { id: `new-${Date.now()}`, key: "", value: "" }]);
  };

  const updateGlobalTextRow = (id: string, field: "key" | "value", value: string) => {
    setGlobalTextRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeGlobalTextRow = (id: string) => {
    setGlobalTextRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addDesignTokenRow = () => {
    setDesignTokenRows((prev) => [...prev, { id: `new-${Date.now()}`, key: "", value: "" }]);
  };

  const updateDesignTokenRow = (id: string, field: "key" | "value", value: string) => {
    setDesignTokenRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeDesignTokenRow = (id: string) => {
    setDesignTokenRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSaveAll = async () => {
    try {
      const payload = [
        {
          key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
          value: JSON.stringify(pageConfigs, null, 2),
          category: "cms",
        },
        {
          key: CMS_GLOBAL_SETTING_KEYS.textOverrides,
          value: JSON.stringify(fromRows(globalTextRows), null, 2),
          category: "cms",
        },
        {
          key: CMS_GLOBAL_SETTING_KEYS.designTokens,
          value: JSON.stringify(fromRows(designTokenRows), null, 2),
          category: "cms",
        },
        {
          key: CMS_GLOBAL_SETTING_KEYS.customCss,
          value: customCss,
          category: "cms",
        },
      ];

      await saveSettingsAsync(payload);
      toast.success("Page builder settings saved");
    } catch (error) {
      toast.error(`Failed to save page builder settings: ${(error as Error).message}`);
    }
  };

  if (isLoading && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Full Page Builder</h1>
          <p className="text-muted-foreground">
            Control every page section, copy block, and design token from one CMS workspace.
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All
        </Button>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle>Select Page</CardTitle>
          <CardDescription>Choose which page schema to edit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Select value={selectedPageId} onValueChange={setSelectedPageId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {CMS_PAGE_DEFINITIONS.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.label} ({page.path})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPageDefinition?.path && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedPageDefinition.path, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Page
              </Button>
            )}
          </div>
          {selectedPageDefinition?.description && (
            <p className="text-sm text-muted-foreground">{selectedPageDefinition.description}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Block Controls</CardTitle>
            <CardDescription>Enable/disable blocks and control basic block-level classes/order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPageDefinition?.blocks.map((block) => {
              const config = selectedPageConfig.blocks?.[block.id] ?? {};

              return (
                <div key={block.id} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{block.label}</p>
                      <p className="text-xs text-muted-foreground">ID: {block.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{block.id}</Badge>
                      <Switch
                        checked={typeof config.enabled === "boolean" ? config.enabled : true}
                        onCheckedChange={(checked) =>
                          updateBlockConfig(block.id, (current) => ({ ...current, enabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={typeof config.order === "number" ? String(config.order) : ""}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          const parsed = Number.parseInt(nextValue, 10);
                          updateBlockConfig(block.id, (current) => ({
                            ...current,
                            order: Number.isFinite(parsed) ? parsed : undefined,
                          }));
                        }}
                        className="bg-background"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Extra Class Names</Label>
                      <Input
                        value={config.className ?? ""}
                        onChange={(e) =>
                          updateBlockConfig(block.id, (current) => ({ ...current, className: e.target.value }))
                        }
                        className="bg-background"
                        placeholder="e.g. py-24 bg-card"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Page Meta + Local Text Overrides</CardTitle>
            <CardDescription>
              Optional per-page overrides for hardcoded copy and SEO metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Meta Title Override</Label>
                <Input
                  value={selectedPageConfig.meta?.title ?? ""}
                  onChange={(e) => setPageMeta("title", e.target.value)}
                  className="bg-background"
                  placeholder="Optional page meta title"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description Override</Label>
                <Textarea
                  value={selectedPageConfig.meta?.description ?? ""}
                  onChange={(e) => setPageMeta("description", e.target.value)}
                  className="bg-background"
                  rows={3}
                  placeholder="Optional page meta description"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Page Local Text Map</Label>
                <Button variant="outline" size="sm" onClick={addPageTextRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use logical keys like <code>hero.badge</code>, <code>hero.title</code>, <code>cta.subtitle</code>.
              </p>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {selectedPageTextRows.length === 0 && (
                  <p className="text-sm text-muted-foreground">No page-local text overrides yet.</p>
                )}
                {selectedPageTextRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      value={row.key}
                      onChange={(e) => updatePageTextRow(row.id, "key", e.target.value)}
                      className="bg-background"
                      placeholder="key"
                    />
                    <Input
                      value={row.value}
                      onChange={(e) => updatePageTextRow(row.id, "value", e.target.value)}
                      className="bg-background"
                      placeholder="value"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removePageTextRow(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Global Translation Overrides</CardTitle>
            <CardDescription>
              Override any <code>t("...")</code> key globally (all pages/languages).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={addGlobalTextRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Key
              </Button>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {globalTextRows.length === 0 && (
                <p className="text-sm text-muted-foreground">No global text overrides yet.</p>
              )}
              {globalTextRows.map((row) => (
                <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    value={row.key}
                    onChange={(e) => updateGlobalTextRow(row.id, "key", e.target.value)}
                    className="bg-background"
                    placeholder="e.g. sections.regions.title"
                  />
                  <Input
                    value={row.value}
                    onChange={(e) => updateGlobalTextRow(row.id, "value", e.target.value)}
                    className="bg-background"
                    placeholder="Override text"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeGlobalTextRow(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              Design Tokens + Custom CSS
            </CardTitle>
            <CardDescription>
              Control global styles and inject advanced CSS safely from admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addDesignTokenRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Token
                </Button>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {designTokenRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      value={row.key}
                      onChange={(e) => updateDesignTokenRow(row.id, "key", e.target.value)}
                      className="bg-background"
                      placeholder="--cms-card-radius"
                    />
                    <Input
                      value={row.value}
                      onChange={(e) => updateDesignTokenRow(row.id, "value", e.target.value)}
                      className="bg-background"
                      placeholder="0.75rem"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeDesignTokenRow(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {designTokenRows.length === 0 && (
                  <p className="text-sm text-muted-foreground">No custom design tokens yet.</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Custom CSS</Label>
              <Textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="bg-background font-mono text-xs"
                rows={10}
                placeholder={`/* Example */\n[data-cms-page="home"] [data-cms-block="hero"] {\n  border-radius: 24px;\n}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
