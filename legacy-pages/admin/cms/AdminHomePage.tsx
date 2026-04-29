import { useState, useEffect, useRef, forwardRef } from "react";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  Upload,
  Video,
  Image,
  Eye,
  GripVertical,
  Settings2,
  LayoutGrid,
  Type,
  Link as LinkIcon,
  Youtube,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHomepageSettings, HomepageSettings } from "@/hooks/useHomepageSettings";
import { GlobalSetting, useGlobalSettings } from "@/hooks/useGlobalSettings";
import { supabase } from "@/integrations/supabase/client";
import { convertToWebP } from "@/lib/imageUtils";
import { normalizePublicImageUrl, resolveSupabaseBucketImageUrl } from "@/lib/imageUrls";
import {
  HOME_QUICK_LINK_CARDS,
  HOME_QUICK_LINK_SETTING_KEYS,
  HOME_QUICK_LINKS_CATEGORY,
} from "@/lib/homeQuickLinks";

interface HeroContent {
  videoUrl: string;
  posterUrl: string;
  youtubeUrl: string;
  mediaType: 'video' | 'poster' | 'youtube';
  headline: string;
  subtitle: string;
  primaryCta: { label: string; link: string };
  secondaryCta: { label: string; link: string };
  overlayIntensity: number | null;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_OVERLAY_INTENSITY = 50;

const DEFAULT_HERO_CONTENT: HeroContent = {
  videoUrl: '',
  posterUrl: '',
  youtubeUrl: '',
  mediaType: 'video',
  headline: '',
  subtitle: '',
  primaryCta: { label: 'AI PLANNER', link: '#regions' },
  secondaryCta: { label: 'Signature Selection', link: '#curated-excellence' },
  overlayIntensity: DEFAULT_OVERLAY_INTENSITY,
  autoplay: true,
  loop: true,
  muted: true,
};

const defaultSections: HomeSection[] = [
  { id: 'hero', title: 'Hero Section', type: 'hero', enabled: true, order: 1 },
  { id: 'regions', title: 'Premium Regions', type: 'regions', enabled: true, order: 2 },
  { id: 'categories', title: 'Categories', type: 'categories', enabled: true, order: 3 },
  { id: 'curated', title: 'Signature Selection', type: 'curated', enabled: true, order: 4 },
  { id: 'cities', title: 'Cities', type: 'cities', enabled: true, order: 5 },
  { id: 'vip', title: 'VIP Section', type: 'vip', enabled: true, order: 6 },
  { id: 'all-listings', title: 'All Listings', type: 'listings', enabled: true, order: 7 },
  { id: 'cta', title: 'Call to Action', type: 'cta', enabled: true, order: 8 },
];

const areStringRecordValuesEqual = (
  a: Record<string, string>,
  b: Record<string, string>,
): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => a[key] === b[key]);
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getUploadErrorMessage = (
  uploadErrorMessage: string,
  file: File,
  assetType: "image" | "video",
) => {
  if (/maximum allowed size/i.test(uploadErrorMessage)) {
    return `This ${assetType} is too large for the current media storage limit (${formatFileSize(file.size)}). Please upload a smaller/compressed ${assetType} file.`;
  }

  return uploadErrorMessage;
};

// Helper to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';

  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1`;
  }
  return url;
};

const resolveMediaAssetUrl = (value?: string | null) =>
  resolveSupabaseBucketImageUrl(value, "media") ?? normalizePublicImageUrl(value);

interface SortableSectionItemProps {
  section: HomeSection;
  onToggle: (id: string) => void;
}

const SortableSectionItem = forwardRef<HTMLDivElement, SortableSectionItemProps>(
  function SortableSectionItem({ section, onToggle }, _ref) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: section.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
          section.enabled
            ? "bg-background border-border"
            : "bg-muted/30 border-border/50 opacity-60",
          isDragging && "z-50 shadow-lg shadow-primary/20 opacity-90"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{section.title}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {section.type}
            </Badge>
          </div>
          {section.subtitle && (
            <p className="text-sm text-muted-foreground">{section.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={section.enabled}
            onCheckedChange={() => onToggle(section.id)}
          />
        </div>
      </div>
    );
  }
);

export default function AdminHomePage() {
  const { settings, isLoading, updateSettingsAsync } = useHomepageSettings();
  const {
    settings: quickLinkSettings,
    isLoading: isQuickLinksLoading,
    saveSettingsAsync: saveQuickLinkSettingsAsync,
    isSaving: isSavingQuickLinks,
  } = useGlobalSettings({ keys: HOME_QUICK_LINK_SETTING_KEYS });
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [sections, setSections] = useState<HomeSection[]>(defaultSections);
  const [quickLinkImages, setQuickLinkImages] = useState<Record<string, string>>({});
  const [quickLinkVideos, setQuickLinkVideos] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const quickLinkImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const quickLinkVideoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const overlayIntensity = heroContent.overlayIntensity ?? DEFAULT_OVERLAY_INTENSITY;
  const heroVideoPreviewUrl = resolveMediaAssetUrl(heroContent.videoUrl);
  const heroPosterPreviewUrl = resolveMediaAssetUrl(heroContent.posterUrl);
  const heroYoutubePreviewUrl = heroContent.youtubeUrl.trim();
  const hasHeroPreviewMedia =
    (heroContent.mediaType === "youtube" && Boolean(heroYoutubePreviewUrl)) ||
    (heroContent.mediaType === "poster" && Boolean(heroPosterPreviewUrl)) ||
    (heroContent.mediaType === "video" && Boolean(heroVideoPreviewUrl || heroPosterPreviewUrl));

  // Sync with database settings
  useEffect(() => {
    if (settings) {
      setHeroContent(prev => ({
        ...prev,
        ...DEFAULT_HERO_CONTENT,
        videoUrl: settings.hero_video_url || '',
        posterUrl: settings.hero_poster_url || '',
        youtubeUrl: settings.hero_youtube_url || '',
        mediaType: (settings as any).hero_media_type || 'video',
        overlayIntensity:
          (settings as any).hero_overlay_intensity ??
          prev.overlayIntensity ??
          DEFAULT_OVERLAY_INTENSITY,
        autoplay: (settings as any).hero_autoplay ?? DEFAULT_HERO_CONTENT.autoplay,
        loop: (settings as any).hero_loop ?? DEFAULT_HERO_CONTENT.loop,
        muted: (settings as any).hero_muted ?? DEFAULT_HERO_CONTENT.muted,
        headline: settings.hero_title || '',
        subtitle: settings.hero_subtitle || '',
        primaryCta: {
          label: settings.hero_cta_primary_text || DEFAULT_HERO_CONTENT.primaryCta.label,
          link: settings.hero_cta_primary_link || DEFAULT_HERO_CONTENT.primaryCta.link,
        },
        secondaryCta: {
          label: settings.hero_cta_secondary_text || DEFAULT_HERO_CONTENT.secondaryCta.label,
          link: settings.hero_cta_secondary_link || DEFAULT_HERO_CONTENT.secondaryCta.link,
        },
      }));

      // Sync sections order and visibility from database
      const dbSectionOrder = settings.section_order as string[] | null;

      setSections(prev => {
        const updatedSections = prev.map(section => {
          // Hero is always visible - skip visibility lookup
          if (section.id === 'hero') {
            return { ...section, enabled: true };
          }

          // Map section ID to database visibility column
          const visibilityKey = `show_${section.id.replace('-', '_')}_section` as keyof typeof settings;
          const isEnabled = settings[visibilityKey] !== undefined
            ? Boolean(settings[visibilityKey])
            : section.enabled;

          return { ...section, enabled: isEnabled };
        });

        // Apply order from database if available (filter out hero as it's always first)
        if (dbSectionOrder && dbSectionOrder.length > 0) {
          const filteredOrder = dbSectionOrder.filter(id => id !== 'hero');
          return updatedSections.sort((a, b) => {
            // Hero always comes first
            if (a.id === 'hero') return -1;
            if (b.id === 'hero') return 1;

            const aIndex = filteredOrder.indexOf(a.id);
            const bIndex = filteredOrder.indexOf(b.id);
            // Items not in order array go to the end
            const aOrder = aIndex === -1 ? 999 : aIndex;
            const bOrder = bIndex === -1 ? 999 : bIndex;
            return aOrder - bOrder;
          }).map((item, index) => ({ ...item, order: index + 1 }));
        }

        return updatedSections;
      });
    }
  }, [settings]);

  useEffect(() => {
    const mappedImages = HOME_QUICK_LINK_CARDS.reduce<Record<string, string>>((acc, card) => {
      const match = quickLinkSettings.find((setting) => setting.key === card.imageSettingKey);
      acc[card.imageSettingKey] = match?.value ?? "";
      return acc;
    }, {});
    const mappedVideos = HOME_QUICK_LINK_CARDS.reduce<Record<string, string>>((acc, card) => {
      const match = quickLinkSettings.find((setting) => setting.key === card.videoSettingKey);
      acc[card.videoSettingKey] = match?.value ?? "";
      return acc;
    }, {});
    setQuickLinkImages((prev) => (
      areStringRecordValuesEqual(prev, mappedImages) ? prev : mappedImages
    ));
    setQuickLinkVideos((prev) => (
      areStringRecordValuesEqual(prev, mappedVideos) ? prev : mappedVideos
    ));
  }, [quickLinkSettings]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileUpload = async (
    file: File,
    type: 'video' | 'poster' | 'quick-link',
    scopeId?: string,
    assetType?: "image" | "video",
  ) => {
    let processedFile = file;
    const resolvedAssetType =
      assetType ?? (file.type.startsWith("video/") ? "video" : "image");

    // Convert images to WebP for better performance
    if (type !== 'video' && file.type.startsWith('image/') && file.type !== 'image/webp') {
      try {
        processedFile = await convertToWebP(file, 0.85);
        toast.info("Image converted to WebP for better performance");
      } catch (error) {
        console.warn("WebP conversion failed, using original:", error);
      }
    }

    const fileExt = processedFile.name.split('.').pop() || (type === "video" ? "mp4" : "webp");
    const fileName =
      type === "quick-link"
        ? `quick-link-${scopeId || "card"}-${Date.now()}.${fileExt}`
        : `hero-${type}-${Date.now()}.${fileExt}`;
    const filePath = type === "quick-link" ? `homepage/quick-links/${fileName}` : `homepage/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, processedFile, {
        upsert: true,
        cacheControl: '31536000'
      });

    if (uploadError) {
      toast.error(
        getUploadErrorMessage(uploadError.message, file, resolvedAssetType),
      );
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const url = await handleFileUpload(file, 'video', undefined, "video");
    if (url) {
      setHeroContent(prev => ({ ...prev, videoUrl: url }));
      await updateSettingsAsync({ hero_video_url: url });
      toast.success("Video uploaded successfully");
    }
    setIsSaving(false);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const url = await handleFileUpload(file, 'poster', undefined, "image");
    if (url) {
      setHeroContent(prev => ({ ...prev, posterUrl: url }));
      await updateSettingsAsync({ hero_poster_url: url });
      toast.success("Poster uploaded successfully");
    }
    setIsSaving(false);
  };

  const handleQuickLinkUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    settingKey: string,
    videoSettingKey: string,
    cardId: string,
    cardTitle: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const url = await handleFileUpload(file, "quick-link", cardId, "image");
      if (!url) return;

      const payload: GlobalSetting[] = [
        {
          key: settingKey,
          value: url,
          category: HOME_QUICK_LINKS_CATEGORY,
        },
        {
          key: videoSettingKey,
          value: "",
          category: HOME_QUICK_LINKS_CATEGORY,
        },
      ];

      await saveQuickLinkSettingsAsync(payload);
      setQuickLinkImages((prev) => ({ ...prev, [settingKey]: url }));
      setQuickLinkVideos((prev) => ({ ...prev, [videoSettingKey]: "" }));
      toast.success(`${cardTitle} image updated`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to upload ${cardTitle} image:`, error);
      toast.error(`Failed to upload ${cardTitle} image: ${message}`);
    } finally {
      e.target.value = "";
      setIsSaving(false);
    }
  };

  const handleQuickLinkVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageSettingKey: string,
    videoSettingKey: string,
    cardId: string,
    cardTitle: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const url = await handleFileUpload(file, "quick-link", `${cardId}-video`, "video");
      if (!url) return;

      const payload: GlobalSetting[] = [
        {
          key: imageSettingKey,
          value: quickLinkImages[imageSettingKey] ?? "",
          category: HOME_QUICK_LINKS_CATEGORY,
        },
        {
          key: videoSettingKey,
          value: url,
          category: HOME_QUICK_LINKS_CATEGORY,
        },
      ];

      await saveQuickLinkSettingsAsync(payload);
      setQuickLinkVideos((prev) => ({ ...prev, [videoSettingKey]: url }));
      toast.success(`${cardTitle} video updated`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to upload ${cardTitle} video:`, error);
      toast.error(`Failed to upload ${cardTitle} video: ${message}`);
    } finally {
      e.target.value = "";
      setIsSaving(false);
    }
  };

  const handleRemoveQuickLinkImage = async (settingKey: string, cardTitle: string) => {
    const previous = quickLinkImages[settingKey] ?? "";
    setIsSaving(true);
    setQuickLinkImages((prev) => ({ ...prev, [settingKey]: "" }));

    try {
      const payload: GlobalSetting[] = [
        {
          key: settingKey,
          value: "",
          category: HOME_QUICK_LINKS_CATEGORY,
        },
      ];

      await saveQuickLinkSettingsAsync(payload);
      toast.success(`${cardTitle} image removed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setQuickLinkImages((prev) => ({ ...prev, [settingKey]: previous }));
      console.error(`Failed to remove ${cardTitle} image:`, error);
      toast.error(`Failed to remove ${cardTitle} image: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveQuickLinkVideo = async (settingKey: string, cardTitle: string) => {
    const previous = quickLinkVideos[settingKey] ?? "";
    setIsSaving(true);
    setQuickLinkVideos((prev) => ({ ...prev, [settingKey]: "" }));

    try {
      const payload: GlobalSetting[] = [
        {
          key: settingKey,
          value: "",
          category: HOME_QUICK_LINKS_CATEGORY,
        },
      ];

      await saveQuickLinkSettingsAsync(payload);
      toast.success(`${cardTitle} video removed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setQuickLinkVideos((prev) => ({ ...prev, [settingKey]: previous }));
      console.error(`Failed to remove ${cardTitle} video:`, error);
      toast.error(`Failed to remove ${cardTitle} video: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHero = async () => {
    setIsSaving(true);
    try {
      await updateSettingsAsync({
        hero_video_url: heroContent.mediaType === 'video' ? heroContent.videoUrl : (heroContent.videoUrl || null),
        hero_youtube_url: heroContent.mediaType === 'youtube' ? heroContent.youtubeUrl : null,
        hero_poster_url: heroContent.posterUrl,
        hero_media_type: heroContent.mediaType,
        hero_overlay_intensity: overlayIntensity,
        hero_autoplay: heroContent.autoplay,
        hero_loop: heroContent.loop,
        hero_muted: heroContent.muted,
        hero_title: heroContent.headline || null,
        hero_subtitle: heroContent.subtitle || null,
        hero_cta_primary_text: heroContent.primaryCta.label,
        hero_cta_primary_link: heroContent.primaryCta.link,
        hero_cta_secondary_text: heroContent.secondaryCta.label,
        hero_cta_secondary_link: heroContent.secondaryCta.link,
      } as any);
      toast.success("Hero content saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to save hero content:", error);
      toast.error(`Failed to save hero content: ${message}`);
    }
    setIsSaving(false);
  };

  const handleResetHeroMedia = async () => {
    const confirmed = window.confirm(
      "Clear all hero media and reset the hero media settings to defaults?",
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await updateSettingsAsync({
        hero_video_url: null,
        hero_poster_url: null,
        hero_youtube_url: null,
        hero_media_type: DEFAULT_HERO_CONTENT.mediaType,
        hero_overlay_intensity: DEFAULT_OVERLAY_INTENSITY,
        hero_autoplay: DEFAULT_HERO_CONTENT.autoplay,
        hero_loop: DEFAULT_HERO_CONTENT.loop,
        hero_muted: DEFAULT_HERO_CONTENT.muted,
      } as any);

      setHeroContent((prev) => ({
        ...prev,
        videoUrl: DEFAULT_HERO_CONTENT.videoUrl,
        posterUrl: DEFAULT_HERO_CONTENT.posterUrl,
        youtubeUrl: DEFAULT_HERO_CONTENT.youtubeUrl,
        mediaType: DEFAULT_HERO_CONTENT.mediaType,
        overlayIntensity: DEFAULT_OVERLAY_INTENSITY,
        autoplay: DEFAULT_HERO_CONTENT.autoplay,
        loop: DEFAULT_HERO_CONTENT.loop,
        muted: DEFAULT_HERO_CONTENT.muted,
      }));

      if (fileInputRef.current) fileInputRef.current.value = "";
      if (posterInputRef.current) posterInputRef.current.value = "";

      toast.success("Hero media cleared and reset");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to reset hero media:", error);
      toast.error(`Failed to reset hero media: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSections = async () => {
    setIsSaving(true);
    try {
      // Build section order array from current sorted order (exclude hero - it's always first)
      const sectionOrder = sortedSections
        .filter(s => s.id !== 'hero')
        .map(s => s.id);

      // Build visibility flags (exclude 'hero' as it's always visible and not a DB column)
      const visibilitySettings: Record<string, boolean> = {};
      sections.forEach(section => {
        if (section.id === 'hero') return; // Hero is always visible, no DB column for it
        // Convert section id to database column name (e.g., "all-listings" -> "show_all_listings_section")
        const columnName = `show_${section.id.replace('-', '_')}_section`;
        visibilitySettings[columnName] = section.enabled;
      });

      await updateSettingsAsync({
        section_order: sectionOrder,
        ...visibilitySettings,
      } as Partial<HomepageSettings>);

      toast.success("Section order saved successfully");
    } catch (error) {
      console.error("Failed to save sections:", error);
      toast.error("Failed to save section settings");
    }
    setIsSaving(false);
  };

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order values
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });
    }
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  if (isLoading || isQuickLinksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Home Page Editor</h1>
          <p className="text-muted-foreground">Manage hero content, sections, and page structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="hero" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Video className="h-4 w-4 mr-2" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="sections" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Page Sections
          </TabsTrigger>
        </TabsList>

        {/* Hero Section Editor */}
        <TabsContent value="hero" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video & Media */}
            <Card className="border-border bg-card/50">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Video className="h-5 w-5 text-primary" />
                      Hero Video
                    </CardTitle>
                    <CardDescription>Background video for the hero section</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetHeroMedia}
                    disabled={isSaving}
                    className="sm:self-start"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Reset Media
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Media Type Selector */}
                <div className="space-y-3">
                  <Label>Hero Media Type</Label>
                  <RadioGroup
                    value={heroContent.mediaType}
                    onValueChange={(v: 'video' | 'poster' | 'youtube') => setHeroContent(prev => ({ ...prev, mediaType: v }))}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="media-video" />
                      <Label htmlFor="media-video" className="cursor-pointer flex items-center gap-1.5">
                        <Video className="h-4 w-4" />
                        Video
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="poster" id="media-poster" />
                      <Label htmlFor="media-poster" className="cursor-pointer flex items-center gap-1.5">
                        <Image className="h-4 w-4" />
                        Poster Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="youtube" id="media-youtube" />
                      <Label htmlFor="media-youtube" className="cursor-pointer flex items-center gap-1.5">
                        <Youtube className="h-4 w-4 text-red-500" />
                        YouTube
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Media Preview */}
                <div className="aspect-video bg-muted rounded-lg border border-border overflow-hidden relative">
                  {heroContent.mediaType === "youtube" && heroYoutubePreviewUrl ? (
                    <iframe
                      src={getYouTubeEmbedUrl(heroYoutubePreviewUrl)}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : heroContent.mediaType === "poster" && heroPosterPreviewUrl ? (
                    <img
                      src={heroPosterPreviewUrl}
                      className="w-full h-full object-cover"
                      alt="Hero poster"
                    />
                  ) : heroContent.mediaType === "video" &&
                    (heroVideoPreviewUrl || heroPosterPreviewUrl) ? (
                    <video
                      key={`${heroVideoPreviewUrl ?? "no-video"}-${heroPosterPreviewUrl ?? "no-poster"}`}
                      src={heroVideoPreviewUrl ?? undefined}
                      poster={heroPosterPreviewUrl ?? undefined}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <div className="h-full w-full bg-black" aria-label="Empty hero media preview" />
                  )}
                  {hasHeroPreviewMedia ? (
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-background/60 to-background pointer-events-none"
                      style={{ opacity: overlayIntensity / 100 }}
                    />
                  ) : null}
                </div>

                {/* Upload controls based on media type */}
                {heroContent.mediaType === 'video' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                      <input
                        ref={posterInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePosterUpload}
                      />
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload Video
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => posterInputRef.current?.click()}
                        disabled={isSaving}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Upload Poster
                      </Button>
                    </div>
                    {heroContent.videoUrl && (
                      <p className="text-xs text-muted-foreground truncate">
                        Video: {heroContent.videoUrl.split('/').pop()}
                      </p>
                    )}
                    {heroContent.posterUrl && (
                      <p className="text-xs text-muted-foreground truncate">
                        Poster: {heroContent.posterUrl.split('/').pop()}
                      </p>
                    )}
                  </div>
                )}

                {heroContent.mediaType === 'poster' && (
                  <div className="space-y-3">
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => posterInputRef.current?.click()}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Image className="h-4 w-4 mr-2" />}
                      Upload Poster Image
                    </Button>
                    {heroContent.posterUrl && (
                      <p className="text-xs text-muted-foreground truncate">
                        Current: {heroContent.posterUrl.split('/').pop()}
                      </p>
                    )}
                  </div>
                )}

                {heroContent.mediaType === 'youtube' && (
                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      YouTube URL
                    </Label>
                    <Input
                      id="youtubeUrl"
                      value={heroContent.youtubeUrl}
                      onChange={(e) => setHeroContent(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                      className="bg-background"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a YouTube video URL (e.g., https://www.youtube.com/watch?v=xxxxx)
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Overlay Intensity: {overlayIntensity}%</Label>
                  <Slider
                    value={[overlayIntensity]}
                    onValueChange={([v]) =>
                      setHeroContent((prev) => ({
                        ...prev,
                        overlayIntensity: v ?? prev.overlayIntensity ?? DEFAULT_OVERLAY_INTENSITY,
                      }))
                    }
                    max={100}
                    step={5}
                    className="py-2"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="autoplay" className="text-sm">Autoplay</Label>
                    <Switch
                      id="autoplay"
                      checked={heroContent.autoplay}
                      onCheckedChange={(v) => setHeroContent(prev => ({ ...prev, autoplay: v }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="loop" className="text-sm">Loop</Label>
                    <Switch
                      id="loop"
                      checked={heroContent.loop}
                      onCheckedChange={(v) => setHeroContent(prev => ({ ...prev, loop: v }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="muted" className="text-sm">Muted</Label>
                    <Switch
                      id="muted"
                      checked={heroContent.muted}
                      onCheckedChange={(v) => setHeroContent(prev => ({ ...prev, muted: v }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Content */}
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Type className="h-5 w-5 text-primary" />
                  Hero Content
                </CardTitle>
                <CardDescription>Headline, subtitle, and call-to-action buttons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={heroContent.headline}
                    onChange={(e) => setHeroContent(prev => ({ ...prev, headline: e.target.value }))}
                    className="bg-background"
                    placeholder="Enter headline..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={heroContent.subtitle}
                    onChange={(e) => setHeroContent(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="bg-background min-h-[80px]"
                    placeholder="Enter subtitle..."
                  />
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Primary CTA
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="primaryLabel">Label</Label>
                      <Input
                        id="primaryLabel"
                        value={heroContent.primaryCta.label}
                        onChange={(e) => setHeroContent(prev => ({
                          ...prev,
                          primaryCta: { ...prev.primaryCta, label: e.target.value }
                        }))}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryLink">Link</Label>
                      <Input
                        id="primaryLink"
                        value={heroContent.primaryCta.link}
                        onChange={(e) => setHeroContent(prev => ({
                          ...prev,
                          primaryCta: { ...prev.primaryCta, link: e.target.value }
                        }))}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Secondary CTA
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryLabel">Label</Label>
                      <Input
                        id="secondaryLabel"
                        value={heroContent.secondaryCta.label}
                        onChange={(e) => setHeroContent(prev => ({
                          ...prev,
                          secondaryCta: { ...prev.secondaryCta, label: e.target.value }
                        }))}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryLink">Link</Label>
                      <Input
                        id="secondaryLink"
                        value={heroContent.secondaryCta.link}
                        onChange={(e) => setHeroContent(prev => ({
                          ...prev,
                          secondaryCta: { ...prev.secondaryCta, link: e.target.value }
                        }))}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveHero} disabled={isSaving} className="w-full mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Hero Content"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-5 w-5 text-primary" />
                Home Quick Link Cards
              </CardTitle>
              <CardDescription>
                Upload the images shown below the AI Planner and above Premium Regions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {HOME_QUICK_LINK_CARDS.map((card) => {
                  const customImageUrl = quickLinkImages[card.imageSettingKey]?.trim() ?? "";
                  const imageUrl = resolveMediaAssetUrl(customImageUrl);
                  const videoUrl = resolveMediaAssetUrl(quickLinkVideos[card.videoSettingKey]?.trim());
                  const hasCustomImage = Boolean(customImageUrl);
                  const hasCustomVideo = Boolean(videoUrl);
                  const isCardBusy = isSaving || isSavingQuickLinks;
                  return (
                    <div key={card.id} className="rounded-lg border border-border bg-background/40 p-3">
                      <p className="text-sm font-medium text-foreground">{card.title}</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        /stay?category={card.categorySlug}
                      </p>

                      <div className="relative aspect-[4/3] rounded-md border border-border bg-muted/40 overflow-hidden mb-3">
                        {hasCustomVideo ? (
                          <video
                            src={videoUrl ?? undefined}
                            poster={imageUrl ?? undefined}
                            className="w-full h-full object-cover"
                            controls
                            muted
                            playsInline
                          />
                        ) : hasCustomImage && imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`${card.title} card preview`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-black" aria-label={`${card.title} empty preview`} />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3">
                        {hasCustomVideo
                          ? "Custom video uploaded"
                          : hasCustomImage
                            ? "Custom image uploaded"
                            : "No custom media (black fallback)"}
                      </p>

                      <input
                        ref={(element) => {
                          quickLinkImageInputRefs.current[card.id] = element;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          handleQuickLinkUpload(
                            event,
                            card.imageSettingKey,
                            card.videoSettingKey,
                            card.id,
                            card.title,
                          );
                        }}
                      />

                      <input
                        ref={(element) => {
                          quickLinkVideoInputRefs.current[card.id] = element;
                        }}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        className="hidden"
                        onChange={(event) => {
                          handleQuickLinkVideoUpload(
                            event,
                            card.imageSettingKey,
                            card.videoSettingKey,
                            card.id,
                            card.title,
                          );
                        }}
                      />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => quickLinkImageInputRefs.current[card.id]?.click()}
                          disabled={isCardBusy}
                        >
                          {isCardBusy ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {hasCustomImage ? "Change Image" : "Upload Image"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => quickLinkVideoInputRefs.current[card.id]?.click()}
                          disabled={isCardBusy}
                        >
                          {isCardBusy ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Video className="h-4 w-4 mr-2" />
                          )}
                          {hasCustomVideo ? "Change Video" : "Upload Video"}
                        </Button>
                      </div>

                      <div className="mt-2 flex gap-2">
                        {hasCustomImage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuickLinkImage(card.imageSettingKey, card.title)}
                            disabled={isCardBusy}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove Image
                          </Button>
                        )}
                        {hasCustomVideo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuickLinkVideo(card.videoSettingKey, card.title)}
                            disabled={isCardBusy}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove Video
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Manager */}
        <TabsContent value="sections" className="space-y-6">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="h-5 w-5 text-primary" />
                Page Sections
              </CardTitle>
              <CardDescription>Drag to reorder, toggle to enable/disable sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedSections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedSections.map((section) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      onToggle={toggleSection}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <Button onClick={handleSaveSections} disabled={isSaving} className="w-full mt-4">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Section Order"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
