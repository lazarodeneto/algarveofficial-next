import { useState, useCallback, useMemo } from "react";
import { Upload, FileJson, AlertCircle, CheckCircle2, Loader2, Download, Eye, ClipboardPaste, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/useReferenceData";
import { useCities } from "@/hooks/useRegions";
import { fetchAdmin } from "@/lib/api/fetchAdmin";
import { parseListingImportInput } from "@/lib/admin/parse-listing-import-input";
import { toast } from "sonner";

interface ImportResult {
  total: number;
  valid: number;
  invalid: number;
  created?: number;
  inserted: number;
  updated: number;
  skipped: number;
  golf_created?: number;
  golf_updated?: number;
  property_created?: number;
  property_updated?: number;
  service_created?: number;
  service_updated?: number;
  scorecard_rows_processed?: number;
  golfRecords?: number;
  propertyRecords?: number;
  serviceRecords?: number;
  warnings?: { index: number; name: string; message?: string; warnings: string[] }[];
  errors: { index?: number; name: string; error: string }[];
  processed: { name: string; slug: string; action: string; vertical?: string }[];
  preview?: ImportPreviewRow[];
}

interface ImportPreviewRow {
  index: number;
  name: string;
  slug: string;
  city: string;
  normalizedCategory: string;
  vertical: "none" | "golf" | "property" | "service";
  estimatedAction: "create" | "update" | "invalid";
  holes?: number;
  par?: number;
  tier?: string;
  subcategory?: string;
  scorecardRows?: number;
  warnings: string[];
  errors: string[];
}

interface ParsedListing {
  Nome: string;
  City: string;
  Category?: string;
  [key: string]: unknown;
}

export default function AdminImport() {
  const { data: categories = [], isLoading: loadingRef } = useCategories();
  const { data: citiesData = [], isLoading: loadingCities, refetch: refetchCities } = useCities({ activeOnly: false });
  
  const [file, setFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedListing[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dryRun, setDryRun] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "paste">("paste");

  const parsedSummary = useMemo(() => {
    if (!parsedData) return null;

    const golf = parsedData.filter((listing) => Boolean(listing.golf)).length;
    const property = parsedData.filter((listing) => Boolean(listing.property)).length;
    const missingName = parsedData.filter((listing) => typeof listing.Nome !== "string" || listing.Nome.trim().length === 0).length;
    const missingCity = parsedData.filter((listing) => typeof listing.City !== "string" || listing.City.trim().length === 0).length;
    const normal = parsedData.length - golf - property;

    return {
      total: parsedData.length,
      normal,
      golf,
      property,
      missingName,
      missingCity,
    };
  }, [parsedData]);

  const parseJsonData = useCallback((jsonString: string) => {
    setParseError(null);
    setParsedData(null);
    setResult(null);
    
    if (!jsonString.trim()) {
      return;
    }

    const parsed = parseListingImportInput(jsonString);
    if (parsed.error) {
      setParseError(parsed.error);
      return;
    }

    if (parsed.listings) {
      setParsedData(parsed.listings as ParsedListing[]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setParsedData(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      parseJsonData(content);
    };
    reader.readAsText(selectedFile);
  }, [parseJsonData]);

  const handleJsonTextChange = useCallback((value: string) => {
    setJsonText(value);
    parseJsonData(value);
  }, [parseJsonData]);

  const handleImport = async () => {
    if (!parsedData) {
      toast.error("Please paste or upload listing JSON");
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const response = await fetchAdmin("/api/admin/listings/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listings: parsedData,
          category_slug: selectedCategory,
          dry_run: dryRun
        }),
      });

      const data = response.data as ImportResult;
      setResult(data);
      if (data.invalid === 0) {
        if (dryRun) {
          toast.success(`Dry run complete: ${data.valid} valid listings`);
        } else {
          toast.success(`Import complete: ${data.inserted} inserted, ${data.updated} updated`);
        }
      } else {
        toast.error(`${data.invalid} listing(s) need attention before import`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleJson = () => {
    const sample = [
      {
        "Nome": "Grand Premium Resort & Spa",
        "URL_slug": "grand-premium-resort-spa",
        "Short Description": "A stunning 5-star resort overlooking the Atlantic.",
        "Full Description": "Experience unparalleled premium service at our beachfront resort...",
        "City": "Vilamoura",
        "Premium Region": "Vilamoura Prestige",
        "Tags": ["5-star", "premium", "spa", "beachfront"],
        "Photos": [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.jpg"
        ],
        "Category": "Accommodation",
        "Phone": "+351 289 123 456",
        "Email": "info@grandpremium.com",
        "Website": "https://grandpremium.com",
        "Full Address": "Avenida da Marina 123, Vilamoura",
        "Latitude": "37.0774",
        "Longitude": "-8.1208",
        "Instagram URL": "https://instagram.com/grandpremium",
        "Facebook URL": "https://facebook.com/grandpremium"
      },
      {
        "Nome": "The Els Club Vilamoura",
        "URL_slug": "the-els-club-vilamoura",
        "City": "Vilamoura",
        "Region": "Vilamoura Prestige",
        "Country": "Portugal",
        "location": {
          "address": "Vilamoura, Loulé",
          "latitude": 37.095,
          "longitude": -8.118
        },
        "golf": {
          "course_type": "championship",
          "holes": 18,
          "par": 72,
          "slope": { "white": 138, "yellow": 134, "red": 130 },
          "course_rating": { "white": 74.5, "yellow": 72.8, "red": 70.2 },
          "length_meters": { "white": 6651, "yellow": 6200, "red": 5400 },
          "designer": "Ernie Els",
          "year_opened": 2004,
          "last_renovation": 2024,
          "layout_type": "parkland",
          "difficulty": "high",
          "is_tournament_course": true,
          "is_signature": true
        },
        "facilities": {
          "driving_range": true,
          "short_game_area": true,
          "putting_green": true,
          "academy": true,
          "clubhouse": true,
          "restaurant": true,
          "pro_shop": true,
          "buggy": true,
          "caddie": false,
          "locker_room": true
        },
        "access": {
          "type": "private",
          "allows_visitors": true,
          "membership_required": false
        },
        "positioning": {
          "tier": "signature",
          "target": "luxury",
          "price_range": "high"
        },
        "media": {
          "featured_image": "https://your-domain.com/images/els-vilamoura.webp",
          "gallery": []
        },
        "seo": {
          "meta_title": "The Els Club Vilamoura Golf Course",
          "meta_description": "Championship golf course in Vilamoura designed by Ernie Els."
        },
        "scorecard": [
          { "hole": 1, "par": 4, "hcp": 9, "white": 380, "yellow": 360, "red": 310 }
        ]
      },
      {
        "Nome": "Luxury Villa in Vale do Lobo",
        "URL_slug": "luxury-villa-vale-do-lobo",
        "City": "Vale do Lobo",
        "category": "properties",
        "Description": "Detached villa near the resort and beach.",
        "Featured_Image_URL": "https://example.com/villa.webp",
        "property": {
          "property_type": "villa",
          "transaction_type": "sale",
          "price": 2450000,
          "currency": "EUR",
          "bedrooms": 5,
          "bathrooms": 6,
          "built_area_m2": 420,
          "plot_area_m2": 1200,
          "pool": true,
          "garden": true,
          "garage": true,
          "agent_name": "Example Agency",
          "agent_email": "info@example.com",
          "property_url": "https://example.com/property"
        }
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-import.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCities = citiesData.map((c: { name: string }) => c.name).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-serif font-medium text-foreground">
          Import Listings
        </h1>
        <p className="text-muted-foreground mt-1">
          Bulk import listings from JSON files
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import JSON Data
            </CardTitle>
            <CardDescription>
              Paste JSON directly or upload a file from your scraping script
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "file" | "paste")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <ClipboardPaste className="h-4 w-4" />
                  Paste JSON
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste" className="mt-4">
                <div className="space-y-2">
                  <Label>Paste your JSON object or array here</Label>
                  <Textarea
                    placeholder={`{\n  "Nome": "Hotel Name",\n  "City": "Vilamoura"\n}\n\nor\n\n[\n  {\n    "Nome": "Hotel Name",\n    "City": "Vilamoura"\n  }\n]`}
                    value={jsonText}
                    onChange={(e) => handleJsonTextChange(e.target.value)}
                    className="min-h-[200px] font-mono text-xs"
                  />
                  {parsedData && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {parsedData.length} listings found
                      </Badge>
                      {parsedSummary && parsedSummary.golf > 0 && <Badge variant="outline">{parsedSummary.golf} golf</Badge>}
                      {parsedSummary && parsedSummary.property > 0 && <Badge variant="outline">{parsedSummary.property} property</Badge>}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="file" className="mt-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="json-upload"
                  />
                  <label htmlFor="json-upload" className="cursor-pointer">
                    <FileJson className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : "Click to select JSON file"}
                    </p>
                    {parsedData && (
                      <Badge variant="secondary" className="mt-2">
                        {parsedData.length} listings found
                      </Badge>
                    )}
                  </label>
                </div>
              </TabsContent>
            </Tabs>

            {parseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Parse Error</AlertTitle>
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            {parsedSummary && !parseError && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Local parse summary</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{parsedSummary.total} total</Badge>
                    <Badge variant="outline">{parsedSummary.normal} standard</Badge>
                    <Badge variant="outline">{parsedSummary.golf} golf</Badge>
                    <Badge variant="outline">{parsedSummary.property} property</Badge>
                    {parsedSummary.missingName > 0 && (
                      <Badge variant="destructive">{parsedSummary.missingName} missing Nome</Badge>
                    )}
                    {parsedSummary.missingCity > 0 && (
                      <Badge variant="destructive">{parsedSummary.missingCity} missing City</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Use dry run to get category normalization, create/update estimates, and row-level warnings before importing.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Target Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="dry-run"
                checked={dryRun}
                onCheckedChange={(checked) => setDryRun(checked as boolean)}
              />
              <Label htmlFor="dry-run" className="text-sm">
                Dry run (validate without inserting)
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={!parsedData || isImporting || loadingRef}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {dryRun ? "Validating..." : "Importing..."}
                  </>
                ) : (
                  <>
                    {dryRun ? <Eye className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {dryRun ? "Validate" : "Import"}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={downloadSampleJson}>
                <Download className="h-4 w-4 mr-2" />
                Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Valid Cities Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Valid Algarve Cities</span>
              <Button variant="ghost" size="sm" onClick={() => refetchCities()} disabled={loadingCities}>
                <RefreshCw className={`h-4 w-4 ${loadingCities ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Cities sourced from database — all are accepted by the importer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCities ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading cities…
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {validCities.map((city: string) => (
                  <Badge key={city} variant="outline" className="text-xs">
                    {city}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              {dryRun ? "Validation Results" : "Import Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{result.valid}</div>
                <div className="text-xs text-muted-foreground">Valid</div>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-500">{result.invalid}</div>
                <div className="text-xs text-muted-foreground">Invalid</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{result.inserted}</div>
                <div className="text-xs text-muted-foreground">Inserted</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">{result.updated}</div>
                <div className="text-xs text-muted-foreground">Updated</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold">{result.skipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold">{result.golfRecords ?? 0}</div>
                <div className="text-xs text-muted-foreground">Golf records</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold">{result.propertyRecords ?? 0}</div>
                <div className="text-xs text-muted-foreground">Property records</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold">{result.serviceRecords ?? 0}</div>
                <div className="text-xs text-muted-foreground">Service records</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold">{result.warnings?.length ?? 0}</div>
                <div className="text-xs text-muted-foreground">Rows with warnings</div>
              </div>
            </div>

            {result.preview && result.preview.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Category-aware preview ({result.preview.length})</h4>
                <ScrollArea className="h-64 rounded-md border p-3">
                  <div className="space-y-2">
                    {result.preview.map((item) => (
                      <div key={`${item.index}-${item.slug}`} className="rounded-md border border-border p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">#{item.index + 1}</Badge>
                          <span className="font-medium">{item.name || "Unnamed listing"}</span>
                          <span className="text-muted-foreground">({item.slug || "no slug"})</span>
                          <Badge variant={item.estimatedAction === "invalid" ? "destructive" : "secondary"}>
                            {item.estimatedAction}
                          </Badge>
                          <Badge variant={item.vertical === "none" ? "outline" : "default"}>
                            {item.vertical === "none" ? "no vertical data" : item.vertical}
                          </Badge>
                          {item.subcategory ? (
                            <Badge variant="outline">
                              {item.subcategory}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.city || "No city"} · {item.normalizedCategory || "No category"}
                          {item.vertical === "golf" ? ` · ${item.holes ?? "?"} holes · par ${item.par ?? "?"} · ${item.tier ?? "tier pending"} · ${item.scorecardRows ?? 0} scorecard rows` : ""}
                        </div>
                        {item.warnings.length > 0 && (
                          <div className="mt-2 text-xs text-amber-700">
                            {item.warnings.join(" ")}
                          </div>
                        )}
                        {item.errors.length > 0 && (
                          <div className="mt-2 text-xs text-destructive">
                            {item.errors.join(" ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-amber-700">Warnings ({result.warnings.length})</h4>
                <ScrollArea className="h-40 rounded-md border p-3">
                  {result.warnings.map((warning, i) => (
                    <div key={i} className="text-sm py-1 border-b border-border last:border-0">
                      <span className="font-medium">#{warning.index + 1} {warning.name}:</span>{" "}
                      <span className="text-muted-foreground">{warning.warnings.join(" ")}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-destructive">Errors ({result.errors.length})</h4>
                <ScrollArea className="h-40 rounded-md border p-3">
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-sm py-1 border-b border-border last:border-0">
                      <span className="font-medium">{err.name}:</span>{" "}
                      <span className="text-muted-foreground">{err.error}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {/* Processed */}
            {result.processed.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Processed ({result.processed.length})</h4>
                <ScrollArea className="h-40 rounded-md border p-3">
                  {result.processed.map((item, i) => (
                    <div key={i} className="text-sm py-1 border-b border-border last:border-0 flex items-center gap-2">
                      <Badge
                        variant={item.action === 'inserted' ? 'default' : item.action === 'updated' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {item.action}
                      </Badge>
                      <span>{item.name}</span>
                      <span className="text-muted-foreground text-xs">({item.slug})</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>JSON Format</CardTitle>
          <CardDescription>
            Expected format for imported listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "Nome": "Hotel Name",
  "URL_slug": "hotel-name",
  "Short Description": "Brief description (max 160 chars)",
  "Full Description": "Complete description...",
  "City": "Vilamoura",
  "Premium Region": "Vilamoura Prestige",
  "Tags": ["5-star", "premium"],
  "Photos": ["https://..."],
  "Phone": "+351...",
  "Email": "info@...",
  "Website": "https://...",
  "Full Address": "Street, City",
  "Latitude": "37.0774",
  "Longitude": "-8.1208"
}

or

[
  {
    "Nome": "Hotel Name",
    "URL_slug": "hotel-name",
    "Short Description": "Brief description (max 160 chars)",
    "Full Description": "Complete description...",
    "City": "Vilamoura",  // Must be from valid cities list
    "Premium Region": "Vilamoura Prestige",  // Optional
    "Tags": ["5-star", "premium"],
    "Photos": ["https://...", "https://..."],
    "Phone": "+351...",
    "Email": "info@...",
    "Website": "https://...",
    "Full Address": "Street, City",
    "Latitude": "37.0774",
    "Longitude": "-8.1208",
    "Instagram URL": "https://instagram.com/...",
    "Facebook URL": "https://facebook.com/..."
  },
  {
    "Nome": "The Els Club Vilamoura",
    "URL_slug": "the-els-club-vilamoura",
    "City": "Vilamoura",
    "Region": "Vilamoura Prestige",
    "Country": "Portugal",
    "location": {
      "address": "Vilamoura, Loulé",
      "latitude": 37.095,
      "longitude": -8.118
    },
    "golf": {
      "course_type": "championship",
      "holes": 18,
      "par": 72,
      "slope": { "white": 138, "yellow": 134, "red": 130 },
      "course_rating": { "white": 74.5, "yellow": 72.8, "red": 70.2 },
      "length_meters": { "white": 6651, "yellow": 6200, "red": 5400 },
      "designer": "Ernie Els",
      "year_opened": 2004,
      "last_renovation": 2024,
      "layout_type": "parkland",
      "difficulty": "high",
      "is_tournament_course": true,
      "is_signature": true
    },
    "facilities": {
      "driving_range": true,
      "short_game_area": true,
      "putting_green": true,
      "academy": true,
      "clubhouse": true,
      "restaurant": true,
      "pro_shop": true,
      "buggy": true,
      "caddie": false,
      "locker_room": true
    },
    "access": {
      "type": "private",
      "allows_visitors": true,
      "membership_required": false
    },
    "positioning": {
      "tier": "signature",
      "target": "luxury",
      "price_range": "high"
    },
    "media": {
      "featured_image": "https://your-domain.com/images/els-vilamoura.webp",
      "gallery": []
    },
    "seo": {
      "meta_title": "The Els Club Vilamoura Golf Course",
      "meta_description": "Championship golf course in Vilamoura designed by Ernie Els."
    },
    "scorecard": [
      { "hole": 1, "par": 4, "hcp": 9, "white": 380, "yellow": 360, "red": 310 }
    ]
  },
  {
    "Nome": "Luxury Villa in Vale do Lobo",
    "URL_slug": "luxury-villa-vale-do-lobo",
    "City": "Vale do Lobo",
    "category": "properties",
    "Description": "Detached villa near the beach.",
    "property": {
      "property_type": "villa",
      "transaction_type": "sale",
      "price": 2450000,
      "bedrooms": 5,
      "bathrooms": 6,
      "pool": true,
      "agent_email": "info@example.com"
    }
  }
]`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
