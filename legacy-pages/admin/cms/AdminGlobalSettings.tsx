import { useEffect, useState } from "react";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Save,
  Palette,
  Globe,
  Type,
  Share2,
  Mail,
  Building2,
  RefreshCw,
  Image,
  Search,
  FileCode,
  Bot,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Construction,
  Shield,
  Plus,
  X,
  Cookie,
  ConciergeBell,
  Upload,
  FileEdit,
  BarChart3,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { ColorPicker } from "@/components/admin/ColorPicker";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCookieBannerSettings } from "@/hooks/useCookieBannerSettings";
import { useGlobalSettings, GlobalSetting } from "@/hooks/useGlobalSettings";
import { useContactSettings, ContactSettings } from "@/hooks/useContactSettings";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunctionWithAuthRetry } from "@/lib/supabaseFunctionInvoke";
import {
  getSupabaseFunctionErrorMessage,
  isSupabaseFunctionAuthError,
} from "@/lib/supabaseFunctionError";
import {
  LISTING_TRANSLATION_TARGET_LANGS,
  queueListingTranslationJobs,
} from "@/lib/listingTranslationQueue";
import {
  isMaintenanceIpWhitelisted,
  isValidMaintenanceWhitelistEntry,
  normalizeMaintenanceWhitelistEntry,
} from "@/lib/maintenance";
import { normalizePublicImageUrl, resolveSupabaseBucketImageUrl } from "@/lib/imageUrls";

export default function AdminGlobalSettings() {
  const { settings: siteSettings, isLoading: siteLoading, updateSettingsAsync, isUpdating } = useSiteSettings();
  const {
    settings: cookieBannerSettings,
    isLoading: isCookieLoading,
    updateSettings: updateCookieBanner,
    isUpdating: isCookieUpdating,
  } = useCookieBannerSettings();
  const {
    settings: globalSettings,
    isLoading: globalLoading,
    saveSettingsAsync,
    isSaving: isGlobalSaving,
  } = useGlobalSettings();
  const {
    settings: contactFormSettings,
    isLoading: isContactFormLoading,
    updateSettings: updateContactForm,
  } = useContactSettings();

  const isLoading = siteLoading || isCookieLoading || globalLoading || isContactFormLoading;
  const isSaving = isUpdating || isCookieUpdating || isGlobalSaving;

  // ─────────────────────────────────────────────────────────────────────────────
  // LOCAL STATE - Site Settings (Branding + Status)
  // ─────────────────────────────────────────────────────────────────────────────
  const [primaryColor, setPrimaryColor] = useState("rgba(196, 155, 55, 1)");
  const [secondaryColor, setSecondaryColor] = useState("rgba(196, 155, 55, 0.3)");
  const [accentColor, setAccentColor] = useState("rgba(255, 215, 102, 1)");
  const [siteName, setSiteName] = useState("AlgarveOfficial");
  const [tagline, setTagline] = useState("Premium Experiences in Portugal");
  const [contactEmail, setContactEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingLogoDark, setIsUploadingLogoDark] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const resolvedLogoUrl =
    resolveSupabaseBucketImageUrl(logoUrl, "branding") ?? normalizePublicImageUrl(logoUrl);
  const resolvedLogoDarkUrl =
    resolveSupabaseBucketImageUrl(logoDarkUrl, "branding") ?? normalizePublicImageUrl(logoDarkUrl);
  const resolvedFaviconUrl =
    resolveSupabaseBucketImageUrl(faviconUrl, "branding") ?? normalizePublicImageUrl(faviconUrl);

  // Google Analytics
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [gaDashboardUrl, setGaDashboardUrl] = useState("");

  // Maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We are currently performing scheduled maintenance. Please check back soon.",
  );
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [newIpAddress, setNewIpAddress] = useState("");
  const [adminRestrictPortugal, setAdminRestrictPortugal] = useState(false);
  const [currentPublicIp, setCurrentPublicIp] = useState<string | null>(null);
  const [currentPublicIpLoading, setCurrentPublicIpLoading] = useState(true);
  const [currentPublicIpError, setCurrentPublicIpError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOCAL STATE - Cookie Banner Settings
  // ─────────────────────────────────────────────────────────────────────────────
  const [cookieTitle, setCookieTitle] = useState("Your Privacy Matters");
  const [cookieDescription, setCookieDescription] = useState("");
  const [cookieLearnMoreText, setCookieLearnMoreText] = useState("Learn more");
  const [cookieLearnMoreLink, setCookieLearnMoreLink] = useState("/privacy-policy");
  const [cookieDeclineText, setCookieDeclineText] = useState("Decline");
  const [cookieAcceptText, setCookieAcceptText] = useState("Accept Analytics");
  const [cookieGdprBadge, setCookieGdprBadge] = useState("GDPR Compliant");
  const [cookieDataRetention, setCookieDataRetention] = useState("Data retained for 90 days");
  const [showGdprBadge, setShowGdprBadge] = useState(true);
  const [showDataRetention, setShowDataRetention] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOCAL STATE - Global Settings (SEO, Labels, Social, Contact extra fields)
  // ─────────────────────────────────────────────────────────────────────────────
  const [localGlobalSettings, setLocalGlobalSettings] = useState<Record<string, string>>({});

  // ─────────────────────────────────────────────────────────────────────────────
  // Local state - Translation Runner (manual batches)
  // ─────────────────────────────────────────────────────────────────────────────
  const [translateBatch, setTranslateBatch] = useState(10);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateResult, setTranslateResult] = useState<any>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const TARGET_LANGS = [...LISTING_TRANSLATION_TARGET_LANGS];

  // Missing translations list
  const [missingTranslations, setMissingTranslations] = useState<{ id: string; name: string; slug: string; city: string; status: string; missingLangs: string[] }[]>([]);
  const [missingLoading, setMissingLoading] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  async function fetchMissingTranslations() {
    setMissingLoading(true);
    try {
      // Step 1: fetch all existing translations (listing_id + language_code)
      const { data: translated, error: tErr } = await supabase
        .from("listing_translations")
        .select("listing_id, language_code");
      if (tErr) throw tErr;

      // Build map: listing_id -> Set of translated language codes
      const translatedMap = new Map<string, Set<string>>();
      for (const t of (translated || []) as any[]) {
        if (!translatedMap.has(t.listing_id)) {
          translatedMap.set(t.listing_id, new Set());
        }
        const set = translatedMap.get(t.listing_id);
        if (set) set.add(t.language_code);
      }

      // IDs that already have ALL target languages
      const fullyTranslatedIds = [...translatedMap.entries()]
        .filter(([, langs]) => TARGET_LANGS.every((l) => langs.has(l)))
        .map(([id]) => id);

      // Step 2: fetch published listings, exclude fully-translated ones
      let query = supabase
        .from("listings")
        .select("id, name, slug, status, cities(name)")
        .eq("status", "published")
        .order("name", { ascending: true })
        .limit(200);

      if (fullyTranslatedIds.length > 0) {
        query = query.not("id", "in", `(${fullyTranslatedIds.map((id) => `"${id}"`).join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Annotate each listing with which languages are missing
      setMissingTranslations(
        (data || []).map((l: any) => {
          const existing = translatedMap.get(l.id) || new Set<string>();
          const missingLangs = TARGET_LANGS.filter((lang) => !existing.has(lang));
          return {
            id: l.id,
            name: l.name,
            slug: l.slug,
            city: l.cities?.name || "—",
            status: l.status,
            missingLangs,
          };
        })
      );
    } catch (e: any) {
      toast.error("Failed to load missing translations: " + e.message);
    } finally {
      setMissingLoading(false);
    }
  }

  async function translateSingle(listingId: string) {
    setTranslatingId(listingId);
    try {
      const { data, error } = await invokeFunctionWithAuthRetry<{ ok?: boolean; error?: string }>("translate-listing", {
        body: { listing_id: listingId },
      });
      if (error) {
        if (await isSupabaseFunctionAuthError(error)) {
          const queueResult = await queueListingTranslationJobs(listingId, TARGET_LANGS);
          if (queueResult.queued > 0) {
            toast.warning(
              `Direct translation endpoint is unavailable. Queued ${queueResult.queued} language job${queueResult.queued !== 1 ? "s" : ""} for background processing.`,
            );
          } else {
            toast.info("No new translation jobs were queued. Languages are already translated or queued.");
          }
          await fetchMissingTranslations();
          return;
        }

        throw new Error(await getSupabaseFunctionErrorMessage(error, "Translation request failed"));
      }
      if (data?.ok === false) throw new Error(data?.error || "Translation request failed");
      toast.success("Translation queued successfully.");
      await fetchMissingTranslations();
    } catch (e: any) {
      toast.error("Translation failed: " + e.message);
    } finally {
      setTranslatingId(null);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOCAL STATE - Contact Form Settings (from contact_settings table)
  // ─────────────────────────────────────────────────────────────────────────────
  const [cfHeroTitle, setCfHeroTitle] = useState("Get in Touch");
  const [cfHeroSubtitle, setCfHeroSubtitle] = useState("");
  const [cfGetInTouchTitle, setCfGetInTouchTitle] = useState("Connect with Us");
  const [cfGetInTouchDescription, setCfGetInTouchDescription] = useState("");
  const [cfDisplayEmail, setCfDisplayEmail] = useState("hello@algarveofficial.com");
  const [cfWhatsappNumber, setCfWhatsappNumber] = useState("+351 912 345 678");
  const [cfOfficeLocation, setCfOfficeLocation] = useState("Vilamoura, Algarve, Portugal");
  const [cfFormTitle, setCfFormTitle] = useState("Send us a Message");
  const [cfFormDescription, setCfFormDescription] = useState("");
  const [cfSuccessMessage, setCfSuccessMessage] = useState("");
  const [cfForwardingEmail, setCfForwardingEmail] = useState("admin@algarveofficial.com");
  const [activeTab, setActiveTab] = useState("status");

  async function runTranslationsNow() {
    setTranslateLoading(true);
    setTranslateError(null);
    setTranslateResult(null);

    try {
      // Step 1: fetch all existing translations to find fully-translated listings
      const { data: translated, error: tErr } = await supabase
        .from("listing_translations")
        .select("listing_id, language_code");
      if (tErr) throw new Error(`Failed to fetch translations: ${tErr.message}`);

      const translatedMap = new Map<string, Set<string>>();
      for (const t of (translated || []) as any[]) {
        if (!translatedMap.has(t.listing_id)) {
          translatedMap.set(t.listing_id, new Set());
        }
        const set = translatedMap.get(t.listing_id);
        if (set) set.add(t.language_code);
      }
      const fullyTranslatedIds = [...translatedMap.entries()]
        .filter(([, langs]) => TARGET_LANGS.every((l) => langs.has(l)))
        .map(([id]) => id);

      // Step 2: fetch published listings not yet fully translated
      let batchQuery = supabase
        .from("listings")
        .select("id, name")
        .eq("status", "published")
        .limit(translateBatch);
      if (fullyTranslatedIds.length > 0) {
        batchQuery = batchQuery.not("id", "in", `(${fullyTranslatedIds.map((id: string) => `"${id}"`).join(",")})`);
      }
      const { data: listings, error: fetchError } = await batchQuery;

      if (fetchError) {
        throw new Error(`Failed to fetch listings: ${fetchError.message}`);
      }

      if (!listings || listings.length === 0) {
        setTranslateResult({ message: "No listings require translation", processed: 0 });
        toast.success("All listings are already translated.");
        await fetchMissingTranslations();
        return;
      }

      const results: { id: string; name: string; status: string; error?: string }[] = [];

      for (const listing of listings) {
        try {
          const { data, error } = await invokeFunctionWithAuthRetry<{ ok?: boolean; error?: string }>("translate-listing", {
            body: { listing_id: listing.id },
          });
          if (error) {
            if (await isSupabaseFunctionAuthError(error)) {
              const queueResult = await queueListingTranslationJobs(listing.id, TARGET_LANGS);
              if (queueResult.queued > 0) {
                results.push({
                  id: listing.id,
                  name: listing.name,
                  status: "queued",
                  error: `Queued ${queueResult.queued} language jobs for background processing.`,
                });
              } else {
                results.push({
                  id: listing.id,
                  name: listing.name,
                  status: "ok",
                  error: "No new jobs queued (already translated or queued).",
                });
              }
              continue;
            }

            const functionErrorMessage = await getSupabaseFunctionErrorMessage(error, "Translation request failed");
            if (/session expired/i.test(functionErrorMessage)) {
              throw new Error(functionErrorMessage);
            }
            results.push({
              id: listing.id,
              name: listing.name,
              status: "failed",
              error: functionErrorMessage,
            });
          } else if (data?.ok === false) {
            const functionErrorMessage = data?.error || "Translation request failed";
            results.push({
              id: listing.id,
              name: listing.name,
              status: "failed",
              error: functionErrorMessage,
            });
          } else {
            results.push({ id: listing.id, name: listing.name, status: "ok" });
          }
        } catch (err: any) {
          results.push({ id: listing.id, name: listing.name, status: "failed", error: err?.message });
        }
      }

      const succeeded = results.filter((r) => r.status === "ok").length;
      const queued = results.filter((r) => r.status === "queued").length;
      const failed = results.filter((r) => r.status === "failed").length;
      setTranslateResult({ processed: results.length, succeeded, queued, failed, results });
      if (failed === 0 && queued === 0) {
        toast.success(`Translation batch complete: ${succeeded} listing(s) translated.`);
      } else if (failed === 0) {
        toast.warning(
          `Batch done: ${succeeded} translated, ${queued} queued for background processing.`,
        );
      } else {
        toast.warning(
          `Batch done: ${succeeded} translated, ${queued} queued, ${failed} failed. Check results below.`,
        );
      }
      await fetchMissingTranslations();
    } catch (e: any) {
      const msg = e?.message || String(e);
      setTranslateError(msg);
      toast.error(`Translation failed: ${msg}`);
    } finally {
      setTranslateLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SYNC DATABASE → LOCAL STATE
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (siteSettings) {
      setPrimaryColor(siteSettings.primary_color);
      setSecondaryColor(siteSettings.secondary_color);
      setAccentColor(siteSettings.accent_color);
      setSiteName(siteSettings.site_name);
      setTagline(siteSettings.tagline);
      setContactEmail(siteSettings.contact_email ?? "");
      setMaintenanceMode(siteSettings.maintenance_mode ?? false);
      setMaintenanceMessage(
        siteSettings.maintenance_message ??
        "We are currently performing scheduled maintenance. Please check back soon.",
      );
      setIpWhitelist(siteSettings.maintenance_ip_whitelist ?? []);
      setLogoUrl(siteSettings.logo_url ?? null);
      setFaviconUrl(siteSettings.favicon_url ?? null);
      setGaMeasurementId(siteSettings.ga_measurement_id ?? "");
      setGaDashboardUrl(siteSettings.ga_dashboard_url ?? "");
    }
  }, [siteSettings]);

  useEffect(() => {
    if (cookieBannerSettings) {
      setCookieTitle(cookieBannerSettings.title);
      setCookieDescription(cookieBannerSettings.description);
      setCookieLearnMoreText(cookieBannerSettings.learn_more_text);
      setCookieLearnMoreLink(cookieBannerSettings.learn_more_link);
      setCookieDeclineText(cookieBannerSettings.decline_button_text);
      setCookieAcceptText(cookieBannerSettings.accept_button_text);
      setCookieGdprBadge(cookieBannerSettings.gdpr_badge_text);
      setCookieDataRetention(cookieBannerSettings.data_retention_text);
      setShowGdprBadge(cookieBannerSettings.show_gdpr_badge);
      setShowDataRetention(cookieBannerSettings.show_data_retention);
    }
  }, [cookieBannerSettings]);

  useEffect(() => {
    if (globalSettings.length > 0) {
      const mapped: Record<string, string> = {};
      globalSettings.forEach((s) => {
        mapped[s.key] = s.value;
      });
      setLocalGlobalSettings(mapped);
      // Sync geo-restriction toggle from global_settings
      setAdminRestrictPortugal(mapped["admin_restrict_portugal"] === "true");
      // Sync dark logo
      setLogoDarkUrl(mapped["logo_dark_url"] ?? null);
    }
  }, [globalSettings]);

  useEffect(() => {
    let cancelled = false;

    const fetchCurrentPublicIp = async () => {
      setCurrentPublicIpLoading(true);
      setCurrentPublicIpError(null);

      try {
        const { data, error } = await supabase.functions.invoke("get-client-ip");
        if (cancelled) {
          return;
        }

        if (error) {
          throw error;
        }

        setCurrentPublicIp(typeof data?.ip === "string" ? data.ip : null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCurrentPublicIp(null);
        setCurrentPublicIpError("Could not detect your current public IP.");
      } finally {
        if (!cancelled) {
          setCurrentPublicIpLoading(false);
        }
      }
    };

    void fetchCurrentPublicIp();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (contactFormSettings) {
      setCfHeroTitle(contactFormSettings.hero_title ?? "Get in Touch");
      setCfHeroSubtitle(contactFormSettings.hero_subtitle ?? "");
      setCfGetInTouchTitle(contactFormSettings.get_in_touch_title ?? "Connect with Us");
      setCfGetInTouchDescription(contactFormSettings.get_in_touch_description ?? "");
      setCfDisplayEmail(contactFormSettings.display_email ?? "hello@algarveofficial.com");
      setCfWhatsappNumber(contactFormSettings.whatsapp_number ?? "+351 912 345 678");
      setCfOfficeLocation(contactFormSettings.office_location ?? "Vilamoura, Algarve, Portugal");
      setCfFormTitle(contactFormSettings.form_title ?? "Send us a Message");
      setCfFormDescription(contactFormSettings.form_description ?? "");
      setCfSuccessMessage(contactFormSettings.success_message ?? "");
      setCfForwardingEmail(contactFormSettings.forwarding_email ?? "admin@algarveofficial.com");
    }
  }, [contactFormSettings]);

  useEffect(() => {
    if (activeTab !== "translations") return;
    void fetchMissingTranslations();
  }, [activeTab]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS for Global Settings key-value
  // ─────────────────────────────────────────────────────────────────────────────
  const getSettingValue = (key: string): string => {
    return localGlobalSettings[key] ?? "";
  };

  const updateSetting = (key: string, value: string, category?: string) => {
    setLocalGlobalSettings((prev) => ({
      ...prev,
      [key]: value,
      [`__cat__${key}`]: category ?? "",
    }));
  };
  const resolvedOgImageUrl = normalizePublicImageUrl(getSettingValue("og_image"));

  // Apply colors in real-time as user changes them
  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    const root = document.documentElement;
    const hsl = rgbaToHsl(color);
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--primary-rgba", color);
  };

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    const root = document.documentElement;
    const hsl = rgbaToHsl(color);
    root.style.setProperty("--secondary", hsl);
    root.style.setProperty("--secondary-rgba", color);
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    const root = document.documentElement;
    const hsl = rgbaToHsl(color);
    root.style.setProperty("--accent", hsl);
    root.style.setProperty("--accent-rgba", color);
  };

  const addIpToWhitelist = () => {
    const enteredValue = newIpAddress.trim();
    if (!enteredValue) return;

    const normalizedValue = normalizeMaintenanceWhitelistEntry(enteredValue);
    if (!isValidMaintenanceWhitelistEntry(normalizedValue)) {
      toast.error("Please enter a valid IP, IPv4 prefix, or CIDR range");
      return;
    }

    const alreadyExists = ipWhitelist.some(
      (ip) => normalizeMaintenanceWhitelistEntry(ip) === normalizedValue,
    );
    if (alreadyExists) {
      toast.error("This IP is already in the whitelist");
      return;
    }

    setIpWhitelist([...ipWhitelist, normalizedValue]);
    setNewIpAddress("");
    toast.success("IP added to whitelist (click Save All to persist)");
  };

  const removeIpFromWhitelist = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter((i) => i !== ip));
    toast.info("IP removed from whitelist (click Save All to persist)");
  };

  const handleFileUpload = async (file: File, type: "logo" | "logo_dark" | "favicon") => {
    const isLogo = type.startsWith("logo");
    let setUploading: (v: boolean) => void;
    let setUrl: (v: string | null) => void;

    if (type === "logo") {
      setUploading = setIsUploadingLogo;
      setUrl = setLogoUrl;
    } else if (type === "logo_dark") {
      setUploading = setIsUploadingLogoDark;
      setUrl = setLogoDarkUrl;
    } else {
      setUploading = setIsUploadingFavicon;
      setUrl = setFaviconUrl;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage.from("branding").upload(filePath, file, {
        cacheControl: "31536000",
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("branding").getPublicUrl(filePath);

      setUrl(publicUrl);
      toast.success(`${type === "favicon" ? "Favicon" : "Logo"} uploaded successfully (click Save All to persist)`);
    } catch (error: any) {
      toast.error(`Error uploading ${type}: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SAVE ALL - persist all three sources
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      // 1. Save site_settings
      await updateSettingsAsync({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        site_name: siteName,
        tagline: tagline,
        contact_email: contactEmail || null,
        maintenance_mode: maintenanceMode,
        maintenance_message: maintenanceMessage,
        maintenance_ip_whitelist: ipWhitelist,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        ga_measurement_id: gaMeasurementId,
        ga_dashboard_url: gaDashboardUrl,
      });

      // 2. Save cookie_banner_settings
      await updateCookieBanner.mutateAsync({
        title: cookieTitle,
        description: cookieDescription,
        learn_more_text: cookieLearnMoreText,
        learn_more_link: cookieLearnMoreLink,
        decline_button_text: cookieDeclineText,
        accept_button_text: cookieAcceptText,
        gdpr_badge_text: cookieGdprBadge,
        data_retention_text: cookieDataRetention,
        show_gdpr_badge: showGdprBadge,
        show_data_retention: showDataRetention,
      });

      // 3. Save global_settings (SEO, Labels, Social, Contact extras)
      // IMPORTANT: We persist *all* known keys (even if empty) so “Reset → Save All”
      // actually clears the database.

      // Define category mappings for all settings keys
      const categoryMap: Record<string, string> = {
        // SEO
        seo_title: "seo",
        seo_description: "seo",
        seo_keywords: "seo",
        canonical_url: "seo",
        og_title: "seo",
        og_type: "seo",
        og_description: "seo",
        og_image: "seo",
        og_locale: "seo",
        og_site_name: "seo",
        twitter_card: "seo",
        twitter_site: "seo",
        twitter_title: "seo",
        twitter_description: "seo",
        schema_organization_enabled: "seo",
        schema_name: "seo",
        schema_legal_name: "seo",
        schema_logo: "seo",
        schema_local_business: "seo",
        schema_breadcrumbs: "seo",
        robots_index: "seo",
        robots_follow: "seo",
        sitemap_url: "seo",
        robots_custom: "seo",
        // Labels
        cta_explore: "labels",
        cta_vip: "labels",
        // Social
        instagram: "social",
        facebook: "social",
        linkedin: "social",
        twitter: "social",
        youtube: "social",
        tiktok: "social",
        // Contact (extras beyond site_settings)
        contact_phone: "contact",
        contact_address: "contact",
        // WhatsApp Chat
        whatsapp_number: "contact",
        whatsapp_default_message: "contact",
        // Security
        admin_restrict_portugal: "security",
        // Branding (Dark Logo)
        logo_dark_url: "branding",
      };

      const existingCategoryByKey = new Map(globalSettings.map((s) => [s.key, s.category ?? null] as const));

      const keysToSave = Array.from(new Set([...Object.keys(categoryMap), ...globalSettings.map((s) => s.key)]));

      // Merge the geo-restriction toggle into localGlobalSettings before saving
      const settingsSnapshot: Record<string, string> = {
        ...localGlobalSettings,
        admin_restrict_portugal: adminRestrictPortugal ? "true" : "false",
        logo_dark_url: logoDarkUrl ?? "",
      };

      const globalSettingsToSave: GlobalSetting[] = keysToSave.map((key) => ({
        key,
        value: settingsSnapshot[key] ?? "",
        category: categoryMap[key] ?? existingCategoryByKey.get(key) ?? null,
      }));

      await saveSettingsAsync(globalSettingsToSave);

      // 4. Save contact_settings (Contact Form page fields)
      await updateContactForm.mutateAsync({
        hero_title: cfHeroTitle,
        hero_subtitle: cfHeroSubtitle,
        get_in_touch_title: cfGetInTouchTitle,
        get_in_touch_description: cfGetInTouchDescription,
        display_email: cfDisplayEmail,
        whatsapp_number: cfWhatsappNumber,
        office_location: cfOfficeLocation,
        form_title: cfFormTitle,
        form_description: cfFormDescription,
        success_message: cfSuccessMessage,
        forwarding_email: cfForwardingEmail,
      });

      toast.success("All settings saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RESET - clear all fields to empty/default values
  // ─────────────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    // Default colors (Algarve gold theme)
    const defaultPrimary = "rgba(196, 155, 55, 1)";
    const defaultSecondary = "rgba(196, 155, 55, 0.3)";
    const defaultAccent = "rgba(255, 215, 102, 1)";

    // Clear site settings (branding + status)
    setPrimaryColor(defaultPrimary);
    setSecondaryColor(defaultSecondary);
    setAccentColor(defaultAccent);
    setSiteName("");
    setTagline("");
    setContactEmail("");
    setMaintenanceMode(false);
    setMaintenanceMessage("");
    setIpWhitelist([]);
    setNewIpAddress("");
    setNewIpAddress("");
    setAdminRestrictPortugal(false);
    setGaMeasurementId("");
    setGaDashboardUrl("");
    setLogoDarkUrl(null);

    // Re-apply default colors to CSS
    const root = document.documentElement;
    root.style.setProperty("--primary", rgbaToHsl(defaultPrimary));
    root.style.setProperty("--primary-rgba", defaultPrimary);
    root.style.setProperty("--secondary", rgbaToHsl(defaultSecondary));
    root.style.setProperty("--secondary-rgba", defaultSecondary);
    root.style.setProperty("--accent", rgbaToHsl(defaultAccent));
    root.style.setProperty("--accent-rgba", defaultAccent);

    // Clear cookie banner settings
    setCookieTitle("");
    setCookieDescription("");
    setCookieLearnMoreText("");
    setCookieLearnMoreLink("");
    setCookieDeclineText("");
    setCookieAcceptText("");
    setCookieGdprBadge("");
    setCookieDataRetention("");
    setShowGdprBadge(false);
    setShowDataRetention(false);

    // Clear all global settings (SEO, Labels, Social, Contact extras)
    setLocalGlobalSettings({});

    // Clear translation runner UI
    setTranslateBatch(10);
    setTranslateResult(null);
    setTranslateError(null);

    toast.info("All fields cleared. Click 'Save All' to persist changes.");
  };

  // Helper function to convert RGBA to HSL
  const rgbaToHsl = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return "43 74% 49%";

    const r = parseInt(match[1], 10) / 255;
    const g = parseInt(match[2], 10) / 255;
    const b = parseInt(match[3], 10) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const currentIpIsWhitelisted = isMaintenanceIpWhitelisted(currentPublicIp, ipWhitelist);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Global Settings</h1>
          <p className="text-muted-foreground">Configure site-wide content and branding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border flex-wrap">
          <TabsTrigger
            value="status"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Construction className="h-4 w-4 mr-2" />
            Site Status
          </TabsTrigger>

          <TabsTrigger
            value="branding"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>

          <TabsTrigger
            value="seo"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Globe className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>

          <TabsTrigger
            value="labels"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Type className="h-4 w-4 mr-2" />
            Labels
          </TabsTrigger>

          <TabsTrigger
            value="social"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>

          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>

          <TabsTrigger
            value="cookie"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Cookie className="h-4 w-4 mr-2" />
            Cookie Banner
          </TabsTrigger>

          <TabsTrigger
            value="contact-form"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileEdit className="h-4 w-4 mr-2" />
            Contact Form
          </TabsTrigger>

          {/* New tab: Translations */}
          <TabsTrigger
            value="translations"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Content Translations
          </TabsTrigger>
        </TabsList>

        {/* Site Status - Maintenance Mode */}
        <TabsContent value="status">
          <Card
            className={`border-border ${maintenanceMode ? "bg-destructive/10 border-destructive/50" : "bg-card/50"}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Construction className={`h-5 w-5 ${maintenanceMode ? "text-destructive" : "text-primary"}`} />
                Site Status & Maintenance
              </CardTitle>
              <CardDescription>Control site availability for visitors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Maintenance Mode Toggle */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg border ${maintenanceMode ? "bg-destructive/20 border-destructive/30" : "bg-muted/30 border-border"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                      <div>
                        <p className="font-medium text-foreground">Maintenance Mode</p>
                        <p className="text-xs text-muted-foreground">
                          {maintenanceMode
                            ? "Site is currently offline for visitors"
                            : "Site is live and accessible to everyone"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={maintenanceMode ? "destructive" : "outline"}
                      className={`text-xs ${!maintenanceMode
                        ? "border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3),0_0_4px_rgba(16,185,129,0.2)]"
                        : ""
                        }`}
                    >
                      {maintenanceMode ? "OFFLINE" : "LIVE"}
                    </Badge>
                  </div>

                  {/* Warning when maintenance is enabled */}
                  {maintenanceMode && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-sm text-destructive font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Warning: Maintenance mode is enabled
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All visitors will see a maintenance page. Admins, editors, and whitelisted IPs can still access
                        the site. Don't forget to click "Save All" to apply changes.
                      </p>
                    </div>
                  )}

                  {/* Maintenance Message */}
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance_message"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="bg-background"
                      rows={3}
                      placeholder="We are currently performing scheduled maintenance. Please check back soon."
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be displayed to visitors when maintenance mode is enabled.
                    </p>
                  </div>

                  {/* IP Whitelist Section */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">IP Whitelist</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Allow specific IP addresses to bypass maintenance mode. Useful for testing or allowing specific
                      clients access.
                    </p>

                    <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                      {currentPublicIpLoading ? (
                        <p>Detecting your current public IP...</p>
                      ) : currentPublicIp ? (
                        <p>
                          Current public IP: <code className="font-mono text-foreground">{currentPublicIp}</code>{" "}
                          {currentIpIsWhitelisted ? (
                            <span className="text-destructive font-medium">(whitelisted: this browser bypasses maintenance)</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">(not whitelisted)</span>
                          )}
                        </p>
                      ) : (
                        <p>{currentPublicIpError ?? "Current public IP could not be detected."}</p>
                      )}
                    </div>

                    {/* Add new IP */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter IP (e.g., 192.168.1.10, 192.168.1, or 203.0.113.0/24)"
                        value={newIpAddress}
                        onChange={(e) => setNewIpAddress(e.target.value)}
                        className="bg-background flex-1"
                        onKeyDown={(e) => e.key === "Enter" && addIpToWhitelist()}
                      />
                      <Button type="button" variant="outline" onClick={addIpToWhitelist} className="shrink-0">
                        <Plus className="h-4 w-4 mr-1" />
                        Add IP
                      </Button>
                    </div>

                    {/* IP List */}
                    {ipWhitelist.length > 0 ? (
                      <div className="space-y-2">
                        {ipWhitelist.map((ip) => (
                          <div
                            key={ip}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border"
                          >
                            <code className="text-sm font-mono text-foreground">{ip}</code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIpFromWhitelist(ip)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No IP addresses whitelisted. Only admins/editors can access the site during maintenance.
                      </p>
                    )}
                  </div>

                  {/* Geo-Restriction Toggle */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">Admin Access Restriction</Label>
                    </div>
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border ${adminRestrictPortugal ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Switch checked={adminRestrictPortugal} onCheckedChange={setAdminRestrictPortugal} />
                        <div>
                          <p className="font-medium text-foreground">Restrict Admin to Portugal</p>
                          <p className="text-xs text-muted-foreground">
                            {adminRestrictPortugal
                              ? "Admin panel is only accessible from Portugal"
                              : "Admin panel is accessible from anywhere"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={adminRestrictPortugal ? "default" : "outline"} className="text-xs">
                        {adminRestrictPortugal ? "RESTRICTED" : "OPEN"}
                      </Badge>
                    </div>
                    {adminRestrictPortugal && (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          <Info className="h-4 w-4 inline-block mr-2 text-primary" />
                          When enabled, visitors outside Portugal will see an access denied page when trying to access
                          /admin. If geolocation fails, access is allowed (fail-open) to prevent admin lockout.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info note */}
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <Info className="h-4 w-4 inline-block mr-2 text-primary" />
                      Admins, editors, and whitelisted IPs can always access the site during maintenance. Login and
                      authentication pages remain accessible.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Branding Settings
              </CardTitle>
              <CardDescription>Configure your site identity and visual branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="site_name">Site Name</Label>
                      <Input
                        id="site_name"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="bg-background"
                        placeholder="Your site name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="bg-background"
                        placeholder="Short tagline"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ColorPicker label="Primary Color" value={primaryColor} onChange={handlePrimaryColorChange} />
                    <ColorPicker label="Secondary Color" value={secondaryColor} onChange={handleSecondaryColorChange} />
                    <ColorPicker label="Accent Color" value={accentColor} onChange={handleAccentColorChange} />
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      Logo & Favicon
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Logo Upload (Light Mode) */}
                      <div className="space-y-4">
                        <Label>Site Logo (Light Mode)</Label>
                        <div className="flex flex-col gap-4">
                          <div className="h-32 w-full rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                            {resolvedLogoUrl ? (
                              <img src={resolvedLogoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain p-4" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Image className="h-8 w-8 opacity-20" />
                                <span className="text-xs">No logo uploaded</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="logo-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "logo");
                              }}
                              disabled={isUploadingLogo}
                            />
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => document.getElementById("logo-upload")?.click()}
                              disabled={isUploadingLogo}
                            >
                              {isUploadingLogo ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              {logoUrl ? "Change Logo" : "Upload Logo"}
                            </Button>
                            {logoUrl && (
                              <Button variant="ghost" size="icon" onClick={() => setLogoUrl(null)} className="text-destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Recommended: Highly optimized SVG or transparent PNG. Max 2MB.
                          </p>
                        </div>
                      </div>

                      {/* Logo Upload (Dark Mode) */}
                      <div className="space-y-4">
                        <Label>Site Logo (Dark Mode)</Label>
                        <div className="flex flex-col gap-4">
                          <div className="h-32 w-full rounded-lg border-2 border-dashed border-border bg-slate-900 flex items-center justify-center overflow-hidden">
                            {resolvedLogoDarkUrl ? (
                              <img src={resolvedLogoDarkUrl} alt="Dark Logic Preview" className="max-h-full max-w-full object-contain p-4" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Image className="h-8 w-8 opacity-20" />
                                <span className="text-xs">No dark logo uploaded</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="logo-dark-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "logo_dark");
                              }}
                              disabled={isUploadingLogoDark}
                            />
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => document.getElementById("logo-dark-upload")?.click()}
                              disabled={isUploadingLogoDark}
                            >
                              {isUploadingLogoDark ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              {logoDarkUrl ? "Change Dark Logo" : "Upload Dark Logo"}
                            </Button>
                            {logoDarkUrl && (
                              <Button variant="ghost" size="icon" onClick={() => setLogoDarkUrl(null)} className="text-destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Displayed on dark backgrounds. Transparent PNG/SVG recommended.
                          </p>
                        </div>
                      </div>

                      {/* Favicon Upload */}
                      <div className="space-y-4">
                        <Label>Browser Favicon</Label>
                        <div className="flex flex-col gap-4">
                          <div className="h-32 w-full rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                            {resolvedFaviconUrl ? (
                              <div className="bg-white p-2 rounded shadow-sm">
                                <img src={resolvedFaviconUrl} alt="Favicon Preview" className="h-12 w-12 object-contain" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Globe className="h-8 w-8 opacity-20" />
                                <span className="text-xs">No favicon uploaded</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*,.ico"
                              className="hidden"
                              id="favicon-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "favicon");
                              }}
                              disabled={isUploadingFavicon}
                            />
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => document.getElementById("favicon-upload")?.click()}
                              disabled={isUploadingFavicon}
                            >
                              {isUploadingFavicon ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              {faviconUrl ? "Change Favicon" : "Upload Favicon"}
                            </Button>
                            {faviconUrl && (
                              <Button variant="ghost" size="icon" onClick={() => setFaviconUrl(null)} className="text-destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Recommended: 32x32px .ico or .png. Max 512KB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-6">
          {/* Basic SEO */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="mr-2">Analytics</span>
                <span className="text-muted-foreground">|</span>
                <Search className="h-5 w-5 text-primary ml-2" />
                Basic SEO
              </CardTitle>
              <CardDescription>Configure Google Analytics and default metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Analytics Section */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <Label className="text-base font-medium">Google Analytics 4</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Connect your Google Analytics 4 property to track visitor behavior.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ga_measurement_id">Measurement ID</Label>
                    <Input
                      id="ga_measurement_id"
                      placeholder="G-XXXXXXXXXX"
                      value={gaMeasurementId}
                      onChange={(e) => setGaMeasurementId(e.target.value)}
                      className="bg-background"
                    />
                    <p className="text-[10px] text-muted-foreground">Found in GA4 Admin {'>'} Data Streams</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ga_dashboard_url">Dashboard URL (Optional)</Label>
                    <Input
                      id="ga_dashboard_url"
                      placeholder="https://analytics.google.com/..."
                      value={gaDashboardUrl}
                      onChange={(e) => setGaDashboardUrl(e.target.value)}
                      className="bg-background"
                    />
                    <p className="text-[10px] text-muted-foreground">Enables "Open Live Analytics" button in dashboard</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_title">Default Page Title</Label>
                <Input
                  id="seo_title"
                  value={getSettingValue("seo_title")}
                  onChange={(e) => updateSetting("seo_title", e.target.value, "seo")}
                  className="bg-background"
                  placeholder="AlgarveOfficial | Premium Experiences in Portugal"
                />
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${getSettingValue("seo_title").length > 60 ? "text-destructive" : "text-muted-foreground"
                      }`}
                  >
                    {getSettingValue("seo_title").length}/60 characters
                  </span>
                  {getSettingValue("seo_title").length <= 60 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">Default Meta Description</Label>
                <Textarea
                  id="seo_description"
                  value={getSettingValue("seo_description")}
                  onChange={(e) => updateSetting("seo_description", e.target.value, "seo")}
                  className="bg-background"
                  rows={3}
                  placeholder="Discover premium accommodations, fine dining, golf, wellness, and exclusive experiences across the Algarve, Portugal."
                />
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${getSettingValue("seo_description").length > 160 ? "text-destructive" : "text-muted-foreground"
                      }`}
                  >
                    {getSettingValue("seo_description").length}/160 characters
                  </span>
                  {getSettingValue("seo_description").length <= 160 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={getSettingValue("canonical_url")}
                    onChange={(e) => updateSetting("canonical_url", e.target.value, "seo")}
                    className="bg-background"
                    placeholder="https://algarveofficial.com"
                  />
                  <p className="text-xs text-muted-foreground">Primary domain for canonical tags</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">Focus Keywords</Label>
                  <Input
                    id="seo_keywords"
                    value={getSettingValue("seo_keywords")}
                    onChange={(e) => updateSetting("seo_keywords", e.target.value, "seo")}
                    className="bg-background"
                    placeholder="algarve, premium, portugal, golf, villas"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Graph */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Share2 className="h-5 w-5 text-primary" />
                Open Graph (Facebook/LinkedIn)
              </CardTitle>
              <CardDescription>How your site appears when shared on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="og_title">OG Title</Label>
                  <Input
                    id="og_title"
                    value={getSettingValue("og_title")}
                    onChange={(e) => updateSetting("og_title", e.target.value, "seo")}
                    className="bg-background"
                    placeholder="AlgarveOfficial — Premium Portal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_type">OG Type</Label>
                  <Select
                    value={getSettingValue("og_type") || "website"}
                    onValueChange={(value) => updateSetting("og_type", value, "seo")}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="business.business">Business</SelectItem>
                      <SelectItem value="place">Place</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og_description">OG Description</Label>
                <Textarea
                  id="og_description"
                  value={getSettingValue("og_description")}
                  onChange={(e) => updateSetting("og_description", e.target.value, "seo")}
                  className="bg-background"
                  rows={2}
                  placeholder="Your premier gateway to premium experiences in the Algarve..."
                />
              </div>

              <div className="space-y-2">
                <Label>OG Image</Label>
                <div className="flex gap-4 items-start">
                  <div className="w-48 h-[100px] bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                    {resolvedOgImageUrl ? (
                      <img src={resolvedOgImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <Image className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">1200 × 630px</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={getSettingValue("og_image")}
                      onChange={(e) => updateSetting("og_image", e.target.value, "seo")}
                      className="bg-background"
                      placeholder="https://algarveofficial.com/og-image.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1200×630px for optimal display on social platforms
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="og_locale">Locale</Label>
                  <Select
                    value={getSettingValue("og_locale") || "en_GB"}
                    onValueChange={(value) => updateSetting("og_locale", value, "seo")}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en_GB">English (UK)</SelectItem>
                      <SelectItem value="en_US">English (US)</SelectItem>
                      <SelectItem value="pt_PT">Portuguese (PT)</SelectItem>
                      <SelectItem value="es_ES">Spanish</SelectItem>
                      <SelectItem value="fr_FR">French</SelectItem>
                      <SelectItem value="de_DE">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_site_name">OG Site Name</Label>
                  <Input
                    id="og_site_name"
                    value={getSettingValue("og_site_name")}
                    onChange={(e) => updateSetting("og_site_name", e.target.value, "seo")}
                    className="bg-background"
                    placeholder="AlgarveOfficial"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Twitter Cards */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Twitter className="h-5 w-5 text-primary" />
                Twitter Cards
              </CardTitle>
              <CardDescription>How your site appears when shared on X (Twitter)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="twitter_card">Card Type</Label>
                  <Select
                    value={getSettingValue("twitter_card") || "summary_large_image"}
                    onValueChange={(value) => updateSetting("twitter_card", value, "seo")}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="player">Player</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter_site">Twitter @username</Label>
                  <Input
                    id="twitter_site"
                    value={getSettingValue("twitter_site")}
                    onChange={(e) => updateSetting("twitter_site", e.target.value, "seo")}
                    className="bg-background"
                    placeholder="@algarveofficial"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_title">Twitter Title</Label>
                <Input
                  id="twitter_title"
                  value={getSettingValue("twitter_title")}
                  onChange={(e) => updateSetting("twitter_title", e.target.value, "seo")}
                  className="bg-background"
                  placeholder="Override for Twitter (leave blank to use OG title)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_description">Twitter Description</Label>
                <Textarea
                  id="twitter_description"
                  value={getSettingValue("twitter_description")}
                  onChange={(e) => updateSetting("twitter_description", e.target.value, "seo")}
                  className="bg-background"
                  rows={2}
                  placeholder="Override for Twitter (leave blank to use OG description)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Structured Data (JSON-LD) */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCode className="h-5 w-5 text-primary" />
                Structured Data (Schema.org)
              </CardTitle>
              <CardDescription>JSON-LD schema for rich search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={getSettingValue("schema_organization_enabled") === "true"}
                    onCheckedChange={(checked) => updateSetting("schema_organization_enabled", String(checked), "seo")}
                  />
                  <div>
                    <p className="font-medium text-foreground">Organization Schema</p>
                    <p className="text-xs text-muted-foreground">Include business information in search results</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Recommended
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schema_name">Business Name</Label>
                  <Input
                    id="schema_name"
                    value={getSettingValue("schema_name")}
                    onChange={(e) => updateSetting("schema_name", e.target.value, "seo")}
                    className="bg-background"
                    placeholder="AlgarveOfficial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schema_legal_name">Legal Name</Label>
                  <Input
                    id="schema_legal_name"
                    value={getSettingValue("schema_legal_name")}
                    onChange={(e) => updateSetting("schema_legal_name", e.target.value, "seo")}
                    className="bg-background"
                    placeholder="AlgarveOfficial Lda."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schema_logo">Logo URL</Label>
                <Input
                  id="schema_logo"
                  value={getSettingValue("schema_logo")}
                  onChange={(e) => updateSetting("schema_logo", e.target.value, "seo")}
                  className="bg-background"
                  placeholder="https://algarveofficial.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">Minimum 112×112px, square or 16:9</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={getSettingValue("schema_local_business") === "true"}
                    onCheckedChange={(checked) => updateSetting("schema_local_business", String(checked), "seo")}
                  />
                  <div>
                    <p className="font-medium text-foreground">LocalBusiness Schema</p>
                    <p className="text-xs text-muted-foreground">Enable for local search visibility</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={getSettingValue("schema_breadcrumbs") === "true"}
                    onCheckedChange={(checked) => updateSetting("schema_breadcrumbs", String(checked), "seo")}
                  />
                  <div>
                    <p className="font-medium text-foreground">Breadcrumb Schema</p>
                    <p className="text-xs text-muted-foreground">Show navigation path in search results</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Recommended
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Crawling & Indexing */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-primary" />
                Crawling & Indexing
              </CardTitle>
              <CardDescription>Control how search engines access your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={getSettingValue("robots_index") !== "false"}
                      onCheckedChange={(checked) => updateSetting("robots_index", String(checked), "seo")}
                    />
                    <div>
                      <p className="font-medium text-foreground">Allow Indexing</p>
                      <p className="text-xs text-muted-foreground">Let search engines index pages</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={getSettingValue("robots_follow") !== "false"}
                      onCheckedChange={(checked) => updateSetting("robots_follow", String(checked), "seo")}
                    />
                    <div>
                      <p className="font-medium text-foreground">Allow Following Links</p>
                      <p className="text-xs text-muted-foreground">Let crawlers follow links</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitemap_url">Sitemap URL</Label>
                <Input
                  id="sitemap_url"
                  value={getSettingValue("sitemap_url")}
                  onChange={(e) => updateSetting("sitemap_url", e.target.value, "seo")}
                  className="bg-background"
                  placeholder="https://algarveofficial.com/sitemap.xml"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots_custom">Custom robots.txt Rules</Label>
                <Textarea
                  id="robots_custom"
                  value={getSettingValue("robots_custom")}
                  onChange={(e) => updateSetting("robots_custom", e.target.value, "seo")}
                  className="bg-background font-mono text-sm"
                  rows={4}
                  placeholder={"User-agent: *\nDisallow: /admin/\nDisallow: /api/"}
                />
                <p className="text-xs text-muted-foreground">Additional rules appended to robots.txt</p>
              </div>

              {/* SEO Preview */}
              <div className="border-t border-border pt-6">
                <Label className="mb-3 block">Google Search Preview</Label>
                <div className="p-4 bg-white rounded-lg border border-border">
                  <p className="text-sm text-[#1a0dab] hover:underline cursor-pointer truncate">
                    {getSettingValue("seo_title") || "AlgarveOfficial | Premium Experiences in Portugal"}
                  </p>
                  <p className="text-xs text-[#006621] mt-1">
                    {getSettingValue("canonical_url") || "https://algarveofficial.com"}
                  </p>
                  <p className="text-xs text-[#545454] mt-1 line-clamp-2">
                    {getSettingValue("seo_description") ||
                      "Discover premium accommodations, fine dining, golf, wellness, and exclusive experiences across the Algarve, Portugal."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Labels */}
        <TabsContent value="labels">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="h-5 w-5 text-primary" />
                UI Labels
              </CardTitle>
              <CardDescription>Customize button labels and copy across the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cta_explore">Explore Button Label</Label>
                  <Input
                    id="cta_explore"
                    value={getSettingValue("cta_explore")}
                    onChange={(e) => updateSetting("cta_explore", e.target.value, "labels")}
                    className="bg-background"
                    placeholder="Explore Regions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_vip">VIP Button Label</Label>
                  <Input
                    id="cta_vip"
                    value={getSettingValue("cta_vip")}
                    onChange={(e) => updateSetting("cta_vip", e.target.value, "labels")}
                    className="bg-background"
                    placeholder="Signature Selection"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Section Titles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Regions Section</p>
                    <p className="font-medium text-foreground">Selected Destinations</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Categories Section</p>
                    <p className="font-medium text-foreground">Premium Categories</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">VIP Section</p>
                    <p className="font-medium text-foreground">Signature Selection</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Real Estate Category</p>
                    <p className="font-medium text-foreground">Algarve Services</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Share2 className="h-5 w-5 text-primary" />
                Social Links
              </CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={getSettingValue("instagram")}
                  onChange={(e) => updateSetting("instagram", e.target.value, "social")}
                  className="bg-background"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={getSettingValue("facebook")}
                  onChange={(e) => updateSetting("facebook", e.target.value, "social")}
                  className="bg-background"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={getSettingValue("linkedin")}
                  onChange={(e) => updateSetting("linkedin", e.target.value, "social")}
                  className="bg-background"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">X (Twitter)</Label>
                <Input
                  id="twitter"
                  value={getSettingValue("twitter")}
                  onChange={(e) => updateSetting("twitter", e.target.value, "social")}
                  className="bg-background"
                  placeholder="https://x.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={getSettingValue("youtube")}
                  onChange={(e) => updateSetting("youtube", e.target.value, "social")}
                  className="bg-background"
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={getSettingValue("tiktok")}
                  onChange={(e) => updateSetting("tiktok", e.target.value, "social")}
                  className="bg-background"
                  placeholder="https://tiktok.com/@yourhandle"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>Public contact details displayed on the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="bg-background"
                  placeholder="info@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={getSettingValue("contact_phone")}
                  onChange={(e) => updateSetting("contact_phone", e.target.value, "contact")}
                  className="bg-background"
                  placeholder="+351 000 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_address">Address</Label>
                <Textarea
                  id="contact_address"
                  value={getSettingValue("contact_address")}
                  onChange={(e) => updateSetting("contact_address", e.target.value, "contact")}
                  className="bg-background"
                  rows={2}
                  placeholder="Your business address"
                />
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Chat */}
          <Card className="border-border bg-card/50 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ConciergeBell className="h-5 w-5 text-primary" />
                WhatsApp Chat
              </CardTitle>
              <CardDescription>
                Configure the concierge chat bell — messages are sent via WhatsApp (no API required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                <Input
                  id="whatsapp_number"
                  type="tel"
                  value={getSettingValue("whatsapp_number")}
                  onChange={(e) => updateSetting("whatsapp_number", e.target.value, "contact")}
                  className="bg-background"
                  placeholder="351910000000"
                />
                <p className="text-xs text-muted-foreground">
                  International format without + or spaces (e.g. 351910000000)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_default_message">Default Welcome Message</Label>
                <Textarea
                  id="whatsapp_default_message"
                  value={getSettingValue("whatsapp_default_message")}
                  onChange={(e) => updateSetting("whatsapp_default_message", e.target.value, "contact")}
                  className="bg-background"
                  rows={2}
                  placeholder="Hello! I'm interested in learning more about your premium services in Algarve."
                />
                <p className="text-xs text-muted-foreground">
                  Pre-filled message when visitors open WhatsApp from the concierge bell
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Form (contact_settings table) */}
        <TabsContent value="contact-form" className="space-y-6">
          {/* Hero Section */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileEdit className="h-5 w-5 text-primary" />
                Contact Page — Hero
              </CardTitle>
              <CardDescription>Heading and subtitle shown at the top of the public /contact page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isContactFormLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cf_hero_title">Hero Title</Label>
                    <Input
                      id="cf_hero_title"
                      value={cfHeroTitle}
                      onChange={(e) => setCfHeroTitle(e.target.value)}
                      className="bg-background"
                      placeholder="Get in Touch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cf_hero_subtitle">Hero Subtitle</Label>
                    <Textarea
                      id="cf_hero_subtitle"
                      value={cfHeroSubtitle}
                      onChange={(e) => setCfHeroSubtitle(e.target.value)}
                      className="bg-background"
                      rows={2}
                      placeholder="Have a question? We'd love to hear from you…"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sidebar — Get in Touch */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-primary" />
                Contact Page — Sidebar Info
              </CardTitle>
              <CardDescription>Details shown in the left-hand "Connect with Us" card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isContactFormLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cf_touch_title">Section Title</Label>
                      <Input
                        id="cf_touch_title"
                        value={cfGetInTouchTitle}
                        onChange={(e) => setCfGetInTouchTitle(e.target.value)}
                        className="bg-background"
                        placeholder="Connect with Us"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cf_display_email">Display Email</Label>
                      <Input
                        id="cf_display_email"
                        type="email"
                        value={cfDisplayEmail}
                        onChange={(e) => setCfDisplayEmail(e.target.value)}
                        className="bg-background"
                        placeholder="hello@algarveofficial.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cf_touch_desc">Section Description</Label>
                    <Textarea
                      id="cf_touch_desc"
                      value={cfGetInTouchDescription}
                      onChange={(e) => setCfGetInTouchDescription(e.target.value)}
                      className="bg-background"
                      rows={2}
                      placeholder="Whether you have a question about our services…"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cf_whatsapp">WhatsApp Number</Label>
                      <Input
                        id="cf_whatsapp"
                        value={cfWhatsappNumber}
                        onChange={(e) => setCfWhatsappNumber(e.target.value)}
                        className="bg-background"
                        placeholder="+351 912 345 678"
                      />
                      <p className="text-xs text-muted-foreground">Shown in sidebar + used for WhatsApp link</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cf_location">Office Location</Label>
                      <Input
                        id="cf_location"
                        value={cfOfficeLocation}
                        onChange={(e) => setCfOfficeLocation(e.target.value)}
                        className="bg-background"
                        placeholder="Vilamoura, Algarve, Portugal"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileEdit className="h-5 w-5 text-primary" />
                Contact Page — Form
              </CardTitle>
              <CardDescription>Title, description, success message, and forwarding email for the contact form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isContactFormLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cf_form_title">Form Title</Label>
                      <Input
                        id="cf_form_title"
                        value={cfFormTitle}
                        onChange={(e) => setCfFormTitle(e.target.value)}
                        className="bg-background"
                        placeholder="Send us a Message"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cf_forwarding_email">Forwarding Email</Label>
                      <Input
                        id="cf_forwarding_email"
                        type="email"
                        value={cfForwardingEmail}
                        onChange={(e) => setCfForwardingEmail(e.target.value)}
                        className="bg-background"
                        placeholder="admin@algarveofficial.com"
                      />
                      <p className="text-xs text-muted-foreground">Submissions are forwarded here</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cf_form_desc">Form Description</Label>
                    <Textarea
                      id="cf_form_desc"
                      value={cfFormDescription}
                      onChange={(e) => setCfFormDescription(e.target.value)}
                      className="bg-background"
                      rows={2}
                      placeholder="Fill out the form below and our team will get back to you shortly."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cf_success_msg">Success Message</Label>
                    <Textarea
                      id="cf_success_msg"
                      value={cfSuccessMessage}
                      onChange={(e) => setCfSuccessMessage(e.target.value)}
                      className="bg-background"
                      rows={2}
                      placeholder="Your message has been sent successfully! We'll get back to you soon."
                    />
                    <p className="text-xs text-muted-foreground">Displayed after a visitor submits the contact form</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cookie Banner */}
        <TabsContent value="cookie">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Cookie className="h-5 w-5 text-primary" />
                    Cookie Consent Banner
                  </CardTitle>
                  <CardDescription>Customize the GDPR cookie consent banner</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isCookieLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Content Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Content</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cookie_title">Title</Label>
                        <Input
                          id="cookie_title"
                          value={cookieTitle}
                          onChange={(e) => setCookieTitle(e.target.value)}
                          className="bg-background"
                          placeholder="Your Privacy Matters"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cookie_learn_more_text">Learn More Text</Label>
                        <Input
                          id="cookie_learn_more_text"
                          value={cookieLearnMoreText}
                          onChange={(e) => setCookieLearnMoreText(e.target.value)}
                          className="bg-background"
                          placeholder="Learn more"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cookie_description">Description</Label>
                      <Textarea
                        id="cookie_description"
                        value={cookieDescription}
                        onChange={(e) => setCookieDescription(e.target.value)}
                        className="bg-background"
                        rows={3}
                        placeholder="We use cookies and similar technologies..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cookie_learn_more_link">Learn More Link</Label>
                      <Input
                        id="cookie_learn_more_link"
                        value={cookieLearnMoreLink}
                        onChange={(e) => setCookieLearnMoreLink(e.target.value)}
                        className="bg-background"
                        placeholder="/privacy-policy"
                      />
                    </div>
                  </div>

                  {/* Button Settings */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground">Buttons</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cookie_decline_text">Decline Button Text</Label>
                        <Input
                          id="cookie_decline_text"
                          value={cookieDeclineText}
                          onChange={(e) => setCookieDeclineText(e.target.value)}
                          className="bg-background"
                          placeholder="Decline"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cookie_accept_text">Accept Button Text</Label>
                        <Input
                          id="cookie_accept_text"
                          value={cookieAcceptText}
                          onChange={(e) => setCookieAcceptText(e.target.value)}
                          className="bg-background"
                          placeholder="Accept Analytics"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge Settings */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground">Footer Badges</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show_gdpr_badge">Show GDPR Badge</Label>
                          <Switch id="show_gdpr_badge" checked={showGdprBadge} onCheckedChange={setShowGdprBadge} />
                        </div>
                        <Input
                          value={cookieGdprBadge}
                          onChange={(e) => setCookieGdprBadge(e.target.value)}
                          className="bg-background"
                          placeholder="GDPR Compliant"
                          disabled={!showGdprBadge}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show_data_retention">Show Data Retention</Label>
                          <Switch
                            id="show_data_retention"
                            checked={showDataRetention}
                            onCheckedChange={setShowDataRetention}
                          />
                        </div>
                        <Input
                          value={cookieDataRetention}
                          onChange={(e) => setCookieDataRetention(e.target.value)}
                          className="bg-background"
                          placeholder="Data retained for 90 days"
                          disabled={!showDataRetention}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground">Preview</h4>
                    <div className="rounded-xl border border-border bg-card/95 p-4 md:p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                        <div className="hidden md:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-serif text-lg font-medium text-foreground">{cookieTitle}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {cookieDescription}{" "}
                            <span className="text-primary hover:underline font-medium">{cookieLearnMoreText}</span>
                          </p>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 md:flex-shrink-0">
                          <Button variant="outline" size="sm" className="text-muted-foreground">
                            <X className="h-4 w-4 mr-2" />
                            {cookieDeclineText}
                          </Button>
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            <Shield className="h-4 w-4 mr-2" />
                            {cookieAcceptText}
                          </Button>
                        </div>
                      </div>
                      {(showGdprBadge || showDataRetention) && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                          {showGdprBadge && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 border border-border">
                              <span className="text-primary">🇪🇺</span>
                              {cookieGdprBadge}
                            </span>
                          )}
                          {showGdprBadge && showDataRetention && <span className="text-muted-foreground/60">•</span>}
                          {showDataRetention && <span>{cookieDataRetention}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New: Translations */}
        <TabsContent value="translations">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCw className="h-5 w-5 text-primary" />
                Content Translation Jobs
              </CardTitle>
              <CardDescription>
                Process listing content translations stored in Supabase. This area does not manage bundled UI locale keys.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
                <Info className="mr-2 inline-block h-4 w-4 text-primary" />
                Use <strong className="text-foreground">Content &rarr; Translations</strong> for interface/UI locale key sync.
                This tab only works with <code>listing_translations</code> and <code>translation_jobs</code>.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="translate_batch">Batch size (n)</Label>
                  <Input
                    id="translate_batch"
                    type="number"
                    min={1}
                    max={200}
                    value={translateBatch}
                    onChange={(e) => setTranslateBatch(Number(e.target.value))}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 10–50 per run (cost-controlled).</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={runTranslationsNow} disabled={translateLoading}>
                    {translateLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {translateLoading ? "Translating..." : "Translate now"}
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setTranslateResult(null);
                      setTranslateError(null);
                    }}
                    disabled={translateLoading}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {translateError && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-sm text-destructive font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {translateError}
                  </p>
                </div>
              )}

              {translateResult && (
                <div className="space-y-2">
                  <Label>Last run result</Label>
                  <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto border border-border">
                    {JSON.stringify(translateResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline-block mr-2 text-primary" />
                  After running, validate results in <code>listing_translations</code> and check remaining jobs in{" "}
                  <code>translation_jobs</code> where status = <code>queued</code>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Missing Translations ── */}
          <Card className="border-border bg-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Listings Missing Content Translations
                  </CardTitle>
                  <CardDescription>Published listings missing one or more of: pt-pt · fr · de · es · it · nl · sv · no · da</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMissingTranslations} disabled={missingLoading}>
                  {missingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-2">{missingLoading ? "Loading..." : "Refresh"}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {missingTranslations.length === 0 && !missingLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  All published listings are currently translated for the supported content locales.
                </div>
              ) : missingLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="destructive">{missingTranslations.length} listing{missingTranslations.length !== 1 ? "s" : ""} incomplete</Badge>
                  </div>
                  <div className="rounded-md border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">City</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">Missing</th>
                          <th className="text-right px-4 py-2 font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missingTranslations.map((listing, i) => (
                          <tr key={listing.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                            <td className="px-4 py-2 font-medium truncate max-w-[200px]">{listing.name}</td>
                            <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">{listing.city}</td>
                            <td className="px-4 py-2 hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {listing.missingLangs.map((lang) => (
                                  <Badge key={lang} variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={translatingId === listing.id}
                                onClick={() => translateSingle(listing.id)}
                              >
                                {translatingId === listing.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                )}
                                Translate
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
