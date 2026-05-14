"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpenText,
  Check,
  Clipboard,
  FileText,
  Globe2,
  Lightbulb,
  ListChecks,
  PenLine,
  Search,
  Settings2,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Tone = "editorial" | "insider" | "luxury" | "practical";
type Category = "travel-guides" | "food-wine" | "golf" | "real-estate" | "events" | "wellness";

const toneLabels: Record<Tone, string> = {
  editorial: "Editorial",
  insider: "Local insider",
  luxury: "Premium",
  practical: "Practical guide",
};

const categoryLabels: Record<Category, string> = {
  "travel-guides": "Travel guide",
  "food-wine": "Food & wine",
  golf: "Golf",
  "real-estate": "Real estate",
  events: "Events",
  wellness: "Wellness",
};

const keywordOptions = [
  "Algarve itinerary",
  "beaches",
  "restaurants",
  "golf courses",
  "family travel",
  "luxury villas",
  "local tips",
  "off season",
];

const outlineByCategory: Record<Category, string[]> = {
  "travel-guides": ["Opening angle", "Where to base yourself", "Day-by-day route", "Local logistics", "Final recommendation"],
  "food-wine": ["Opening taste", "Best areas", "Signature dishes", "Booking notes", "Pair with nearby stops"],
  golf: ["Opening hook", "Course profile", "Playing conditions", "Nearby stays", "Who it suits"],
  "real-estate": ["Market context", "Buyer profile", "Location tradeoffs", "Ownership notes", "Next steps"],
  events: ["Event promise", "Who should go", "Schedule flow", "Local transport", "What to book early"],
  wellness: ["Wellness angle", "Best settings", "Treatment style", "Slow-travel pairing", "Practical notes"],
};

const toneIntros: Record<Tone, string> = {
  editorial:
    "The best Algarve stories begin with a precise sense of place: the light, the rhythm of the day, and the detail that makes a recommendation feel earned.",
  insider:
    "Ask locals where to start and the answer is rarely a single address. It is a sequence of timings, viewpoints, and small decisions that make the day work.",
  luxury:
    "A polished Algarve escape depends on restraint: the right base, beautifully paced meals, and experiences that feel private without feeling distant.",
  practical:
    "A strong Algarve plan is simple to follow, easy to adapt, and clear about the tradeoffs between beaches, towns, drive times, and booking windows.",
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function estimateReadingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function buildStarterDraft({
  title,
  audience,
  category,
  tone,
  keywords,
  includeListings,
  includeLocalProof,
}: {
  title: string;
  audience: string;
  category: Category;
  tone: Tone;
  keywords: string[];
  includeListings: boolean;
  includeLocalProof: boolean;
}) {
  const resolvedTitle = title.trim() || `A sharper ${categoryLabels[category].toLowerCase()} for the Algarve`;
  const resolvedAudience = audience.trim() || "travellers planning a considered Algarve trip";
  const keywordLine = keywords.length > 0 ? `Focus keywords: ${keywords.join(", ")}.` : "Focus keywords: Algarve, local guide, Portugal.";
  const localProof = includeLocalProof
    ? "Anchor each recommendation with a neighbourhood cue, seasonal note, or timing detail so the article feels field-tested."
    : "Keep the guidance concise and avoid unsupported claims.";
  const listings = includeListings
    ? "Where a business, stay, course, or restaurant is mentioned, leave room for a curated AlgarveOfficial listing link."
    : "Keep partner mentions out of the first draft and preserve a neutral editorial voice.";

  return `${resolvedTitle}

${toneIntros[tone]}

Write for ${resolvedAudience}. The article should open with a useful point of view, then move quickly into specific decisions a reader can act on. ${keywordLine}

Suggested structure:
${outlineByCategory[category].map((item, index) => `${index + 1}. ${item}`).join("\n")}

Editorial notes:
- ${localProof}
- ${listings}
- Close with one confident recommendation rather than a generic summary.`;
}

function getHeadlineIdeas(title: string, category: Category, keywords: string[]) {
  const base = title.trim() || `Algarve ${categoryLabels[category]}`;
  const keyword = keywords[0] ?? "local guide";
  const keywordPhrase = keyword.toLowerCase().startsWith("algarve") ? keyword : `Algarve ${keyword}`;

  return [
    `${base}: what to know before you book`,
    `The ${keywordPhrase} plan worth saving`,
    `${base} with better timing, fewer detours, and local context`,
  ];
}

function scoreDraft({
  title,
  body,
  keywords,
  includeLocalProof,
}: {
  title: string;
  body: string;
  keywords: string[];
  includeLocalProof: boolean;
}) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const keywordHits = keywords.filter((keyword) => body.toLowerCase().includes(keyword.toLowerCase())).length;
  const hasTitle = title.trim().length >= 24;
  const hasSections = /\n\d\.|\n-/.test(body);
  const hasLocalCue = includeLocalProof || /local|neighbourhood|season|timing|booking|beach|town/i.test(body);

  return {
    editorial: clampScore((words / 8) + (hasSections ? 18 : 0) + (hasLocalCue ? 18 : 0)),
    seo: clampScore((keywordHits / Math.max(1, keywords.length)) * 54 + (hasTitle ? 24 : 0) + (words > 120 ? 18 : 0)),
    readiness: clampScore((words / 10) + (hasTitle ? 20 : 0) + (hasSections ? 20 : 0) + (hasLocalCue ? 14 : 0)),
  };
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof BarChart3;
  label: string;
  value: number;
  tone: "gold" | "teal" | "coral";
}) {
  const colorClass = {
    gold: "text-[#8A6408] dark:text-[#D4A62A]",
    teal: "text-cyan-600 dark:text-cyan-300",
    coral: "text-rose-600 dark:text-rose-300",
  }[tone];

  return (
    <div className="rounded-[8px] border border-border/70 bg-muted/35 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className={cn("h-4 w-4", colorClass)} />
          {label}
        </span>
        <span className="font-mono text-sm text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-2 bg-muted [&>div]:bg-[#D4A62A]" />
    </div>
  );
}

export function BlogWriterClient() {
  const [title, setTitle] = useState("Where to stay in the Algarve for a first summer trip");
  const [audience, setAudience] = useState("couples and families comparing beach towns");
  const [category, setCategory] = useState<Category>("travel-guides");
  const [tone, setTone] = useState<Tone>("editorial");
  const [targetWords, setTargetWords] = useState(900);
  const [keywords, setKeywords] = useState<string[]>(["Algarve itinerary", "beaches", "local tips"]);
  const [includeListings, setIncludeListings] = useState(true);
  const [includeLocalProof, setIncludeLocalProof] = useState(true);
  const [draft, setDraft] = useState(() =>
    buildStarterDraft({
      title: "Where to stay in the Algarve for a first summer trip",
      audience: "couples and families comparing beach towns",
      category: "travel-guides",
      tone: "editorial",
      keywords: ["Algarve itinerary", "beaches", "local tips"],
      includeListings: true,
      includeLocalProof: true,
    }),
  );

  const scores = useMemo(
    () => scoreDraft({ title, body: draft, keywords, includeLocalProof }),
    [draft, includeLocalProof, keywords, title],
  );
  const readingMinutes = useMemo(() => estimateReadingMinutes(draft), [draft]);
  const wordCount = useMemo(() => draft.trim().split(/\s+/).filter(Boolean).length, [draft]);
  const progressToTarget = clampScore((wordCount / targetWords) * 100);
  const headlineIdeas = useMemo(() => getHeadlineIdeas(title, category, keywords), [category, keywords, title]);
  const seoDescription = useMemo(() => {
    const plain = draft.replace(/\s+/g, " ").trim();
    return plain.length > 152 ? `${plain.slice(0, 149)}...` : plain;
  }, [draft]);

  const toggleKeyword = (keyword: string) => {
    setKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : [...current, keyword],
    );
  };

  const generateDraft = () => {
    setDraft(
      buildStarterDraft({
        title,
        audience,
        category,
        tone,
        keywords,
        includeListings,
        includeLocalProof,
      }),
    );
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success("Draft copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_8%,rgba(212,166,42,0.16),transparent_30%),radial-gradient(circle_at_88%_16%,rgba(34,211,238,0.12),transparent_26%),hsl(var(--background))] text-foreground">
      <div className="app-container pt-24 pb-10 lg:pt-28">
        <div className="mb-6 flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#D4A62A]/35 bg-[#D4A62A]/15 text-[#8A6408] dark:text-[#D4A62A]">
                <PenLine className="h-4 w-4" />
              </span>
              <Badge variant="outline" className="border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-100">
                Editorial workspace
              </Badge>
            </div>
            <h1 className="max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
              Blog Writer
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Shape Algarve articles with a focused draft canvas, search intent controls, and publish-readiness signals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={copyDraft}>
              <Clipboard className="h-4 w-4" />
              Copy
            </Button>
            <Button type="button" onClick={generateDraft}>
              <Sparkles className="h-4 w-4" />
              Draft
            </Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)_360px]">
          <aside className="space-y-5">
            <section className="rounded-[8px] border border-border/70 bg-card p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                  <Settings2 className="h-4 w-4 text-[#D4A62A]" />
                  Brief
                </h2>
                <span className="font-mono text-xs text-muted-foreground">{targetWords}w</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="writer-title">Working title</Label>
                  <Input
                    id="writer-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-11 rounded-[8px] bg-background/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="writer-audience">Audience</Label>
                  <Input
                    id="writer-audience"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    className="h-11 rounded-[8px] bg-background/80"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                      <SelectTrigger className="h-11 rounded-[8px] bg-background/80 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
                      <SelectTrigger className="h-11 rounded-[8px] bg-background/80 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(toneLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="target-words">Target length</Label>
                    <span className="font-mono text-xs text-muted-foreground">{progressToTarget}%</span>
                  </div>
                  <Slider
                    id="target-words"
                    min={450}
                    max={1800}
                    step={50}
                    value={[targetWords]}
                    onValueChange={([value]) => setTargetWords(value ?? 900)}
                    className="[&_[role=slider]]:border-[#D4A62A] [&_[role=slider]]:bg-background"
                  />
                </div>
                <div className="space-y-3 rounded-[8px] border border-border/70 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="local-proof">Local proof</Label>
                    <Switch id="local-proof" checked={includeLocalProof} onCheckedChange={setIncludeLocalProof} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="listing-links">Listing links</Label>
                    <Switch id="listing-links" checked={includeListings} onCheckedChange={setIncludeListings} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[8px] border border-border/70 bg-card p-4 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                <Search className="h-4 w-4 text-cyan-300" />
                Search Intent
              </h2>
              <div className="flex flex-wrap gap-2">
                {keywordOptions.map((keyword) => {
                  const active = keywords.includes(keyword);
                  return (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => toggleKeyword(keyword)}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
                        active
                          ? "border-[#D4A62A]/45 bg-[#D4A62A]/15 text-[#7A5704] dark:text-[#F6D979]"
                          : "border-border/70 bg-muted/30 text-muted-foreground hover:border-cyan-500/35 hover:text-foreground",
                      )}
                    >
                      {active ? <Check className="h-3.5 w-3.5" /> : null}
                      {keyword}
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          <section className="min-w-0 rounded-[8px] border border-border/70 bg-card shadow-elevated">
            <Tabs defaultValue="draft" className="flex min-h-[720px] flex-col">
              <div className="flex flex-col gap-3 border-b border-border/70 p-4 md:flex-row md:items-center md:justify-between">
                <TabsList className="h-auto w-full justify-start rounded-[8px] bg-muted/50 p-1 md:w-auto">
                  <TabsTrigger value="draft" className="gap-2 rounded-[6px] px-3 py-2 text-xs">
                    <FileText className="h-4 w-4" />
                    Draft
                  </TabsTrigger>
                  <TabsTrigger value="outline" className="gap-2 rounded-[6px] px-3 py-2 text-xs">
                    <ListChecks className="h-4 w-4" />
                    Outline
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="gap-2 rounded-[6px] px-3 py-2 text-xs">
                    <Globe2 className="h-4 w-4" />
                    SEO
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{wordCount} words</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span className="font-mono">{readingMinutes} min read</span>
                </div>
              </div>

              <TabsContent value="draft" className="m-0 flex-1 p-4">
                <Textarea
                  aria-label="Blog draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="min-h-[610px] resize-none rounded-[8px] border-border/70 bg-background/80 p-5 font-sans text-base leading-8 text-foreground shadow-inner placeholder:text-muted-foreground"
                />
              </TabsContent>

              <TabsContent value="outline" className="m-0 flex-1 p-4">
                <div className="grid gap-3">
                  {outlineByCategory[category].map((item, index) => (
                    <article key={item} className="rounded-[8px] border border-border/70 bg-background/80 p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#D4A62A]/15 font-mono text-xs text-[#7A5704] dark:text-[#F6D979]">
                          {index + 1}
                        </span>
                        <h3 className="font-sans text-sm font-semibold text-foreground">{item}</h3>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Use this section to add one concrete Algarve detail, one reader decision, and one clean transition.
                      </p>
                    </article>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="seo" className="m-0 flex-1 p-4">
                <div className="grid gap-4">
                  <div className="rounded-[8px] border border-border/70 bg-background/80 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
                      <Target className="h-4 w-4 text-[#D4A62A]" />
                      Headline Options
                    </h3>
                    <div className="space-y-2">
                      {headlineIdeas.map((headline) => (
                        <button
                          key={headline}
                          type="button"
                          onClick={() => setTitle(headline)}
                          className="block w-full rounded-[8px] border border-border/70 bg-muted/30 px-3 py-2 text-left text-sm transition hover:border-[#D4A62A]/40 hover:text-[#7A5704] dark:hover:text-[#F6D979]"
                        >
                          {headline}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[8px] border border-border/70 bg-background/80 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
                      <BookOpenText className="h-4 w-4 text-cyan-300" />
                      Search Preview
                    </h3>
                    <div className="rounded-[8px] bg-muted/35 p-4">
                      <p className="text-base font-semibold leading-6 text-cyan-700 dark:text-cyan-200">{title || "Untitled Algarve guide"}</p>
                      <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">algarveofficial.com/blog/{title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "draft"}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{seoDescription}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[8px] border border-border/70 bg-card p-4 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                <BarChart3 className="h-4 w-4 text-[#D4A62A]" />
                Readiness
              </h2>
              <div className="space-y-3">
                <Metric icon={PenLine} label="Editorial" value={scores.editorial} tone="gold" />
                <Metric icon={Search} label="Search" value={scores.seo} tone="teal" />
                <Metric icon={Target} label="Publish" value={scores.readiness} tone="coral" />
              </div>
            </section>

            <section className="rounded-[8px] border border-border/70 bg-card p-4 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                <Lightbulb className="h-4 w-4 text-rose-300" />
                Notes
              </h2>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p className="rounded-[8px] border border-border/70 bg-muted/30 p-3">
                  Lead with one useful Algarve decision before adding atmosphere.
                </p>
                <p className="rounded-[8px] border border-border/70 bg-muted/30 p-3">
                  Add transport timing, booking windows, or seasonal context before publishing.
                </p>
                <p className="rounded-[8px] border border-border/70 bg-muted/30 p-3">
                  Keep listing mentions contextual and tied to the article promise.
                </p>
              </div>
            </section>

            <section className="rounded-[8px] border border-border/70 bg-card p-4 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                <BookOpenText className="h-4 w-4 text-cyan-300" />
                Article Preview
              </h2>
              <article className="rounded-[8px] border border-border/70 bg-background/80 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6408] dark:text-[#D4A62A]">
                  {categoryLabels[category]}
                </p>
                <h3 className="font-serif text-2xl leading-tight text-foreground">{title || "Untitled Algarve guide"}</h3>
                <p className="mt-3 line-clamp-6 text-sm leading-7 text-muted-foreground">
                  {draft.replace(title, "").trim() || "Start writing to preview the article introduction."}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 px-2.5 py-1">{readingMinutes} min read</span>
                  <span className="rounded-full border border-border/70 px-2.5 py-1">{toneLabels[tone]}</span>
                </div>
              </article>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
