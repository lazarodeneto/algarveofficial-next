import { useState, useCallback } from "react";
import { Upload, FileJson, AlertCircle, CheckCircle2, Loader2, Download, Eye, ClipboardPaste, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useReferenceData";
import { useCities } from "@/hooks/useRegions";
import { toast } from "sonner";

interface ImportResult {
  total: number;
  valid: number;
  invalid: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: { name: string; error: string }[];
  processed: { name: string; slug: string; action: string }[];
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

  const parseJsonData = useCallback((jsonString: string) => {
    setParseError(null);
    setParsedData(null);
    setResult(null);
    
    if (!jsonString.trim()) {
      return;
    }

    try {
      const json = JSON.parse(jsonString);
      if (!Array.isArray(json)) {
        setParseError("JSON must be an array of listings");
        return;
      }
      setParsedData(json);
    } catch {
      setParseError("Invalid JSON format");
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
    if (!parsedData || !selectedCategory) {
      toast.error("Please select a file and category");
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const response = await supabase.functions.invoke('import-listings', {
        body: {
          listings: parsedData,
          category_slug: selectedCategory,
          dry_run: dryRun
        }
      });

      if (response.error) {
        toast.error(response.error.message);
        return;
      }

      const data = response.data;
      if (data.success) {
        setResult(data.results);
        if (dryRun) {
          toast.success(`Dry run complete: ${data.results.valid} valid listings`);
        } else {
          toast.success(`Import complete: ${data.results.inserted} inserted, ${data.results.updated} updated`);
        }
      } else {
        toast.error(data.error || "Import failed");
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
                  <Label>Paste your JSON array here</Label>
                  <Textarea
                    placeholder={`[\n  {\n    "Nome": "Hotel Name",\n    "City": "Vilamoura",\n    ...\n  }\n]`}
                    value={jsonText}
                    onChange={(e) => handleJsonTextChange(e.target.value)}
                    className="min-h-[200px] font-mono text-xs"
                  />
                  {parsedData && (
                    <Badge variant="secondary">
                      {parsedData.length} listings found
                    </Badge>
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
                disabled={!parsedData || !selectedCategory || isImporting || loadingRef}
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
{`[
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
  }
]`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
