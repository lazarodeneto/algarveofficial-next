"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  Calendar,
  CalendarPlus,
  Filter,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventCategoryLabels, type CalendarEvent, type EventCategory } from "@/types/events";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useHydrated } from "@/hooks/useHydrated";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import {
  STANDARD_PUBLIC_HERO_WRAPPER_CLASS,
  STANDARD_PUBLIC_NO_HERO_SPACER_CLASS,
} from "@/components/sections/hero-layout";
import { hideServerShell } from "@/lib/dom/server-shell";
import { isPublicEventVisibleByDate } from "@/lib/events/publicVisibility";
import { getEventMonthHeading } from "@/lib/events/dateDisplay";
import { PIXABAY_EVENT_IMAGE_FALLBACK } from "@/lib/events/cardStyles";
import { EventTicketCard } from "@/components/events/EventTicketCard";
import type { PublicEventGlobalSetting } from "@/lib/public-data/events";
import { useTripPlanner } from "@/hooks/useTripPlanner";
import { useAuth } from "@/contexts/AuthContext";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";

const EventMapDirectory = dynamic(
  () => import("@/components/events/EventMapDirectory").then((module) => module.EventMapDirectory),
  { ssr: false },
);
const CreateTripDialog = dynamic(
  () => import("@/components/trip-planner/CreateTripDialog").then((module) => module.CreateTripDialog),
  { ssr: false },
);
const LoginModal = dynamic(
  () => import("@/components/ui/login-modal").then((module) => module.LoginModal),
  { ssr: false },
);

type EventGlobalSetting = PublicEventGlobalSetting;

export interface EventsClientProps {
  initialEvents: CalendarEvent[];
  initialGlobalSettings: EventGlobalSetting[];
}

function EventsClientInner({ initialEvents }: EventsClientProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const locale = useCurrentLocale();
  const { isFavorite, toggleFavorite } = useFavoriteEvents();
  const { createTrip } = useTripPlanner();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const cms = useCmsPageBuilder("events");

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [activeMapEventId, setActiveMapEventId] = useState<string | null>(null);
  const [tripPlannerOpen, setTripPlannerOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTripPlannerOpen, setPendingTripPlannerOpen] = useState(false);

  const categories = Object.entries(eventCategoryLabels) as [EventCategory, string][];

  const getEventCategoryLabel = (category: EventCategory) => {
    const translationKeyMap: Record<string, string> = {
      festival: "events.categories.festival",
      market: "events.categories.market",
      "golf-tournament": "events.categories.golfTournament",
      gastronomy: "events.categories.gastronomy",
      music: "events.categories.music",
      cultural: "events.categories.cultural",
      sporting: "events.categories.sporting",
      seasonal: "events.categories.seasonal",
    };
    return t(translationKeyMap[category] || category, eventCategoryLabels[category]);
  };
  const getEventHref = (event: Pick<CalendarEvent, "slug">) => l(event.slug ? `/events/${event.slug}` : "/events");

  const events = initialEvents.filter((event) => selectedCategory === "all" || event.category === selectedCategory);

  const visibleEvents = events.filter((event) => isPublicEventVisibleByDate(event));
  const featuredEvents = visibleEvents.filter((event) => event.is_featured).slice(0, 3);
  const upcomingEvents = visibleEvents.filter((event) => !featuredEvents.some((featured) => featured.id === event.id));
  const heroEnabled = cms.isBlockEnabled("hero", true);
  const filtersEnabled = cms.isBlockEnabled("filters", true);
  const featuredEnabled = cms.isBlockEnabled("featured", true);
  const timelineEnabled = cms.isBlockEnabled("timeline", true);

  const scrollToEventsListings = () => {
    document.getElementById("events-listings")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const openTripPlanner = () => {
    if (!isAuthenticated) {
      setPendingTripPlannerOpen(true);
      toast.info(t("hero.loginRequired"));
      setShowLoginModal(true);
      return;
    }

    setTripPlannerOpen(true);
  };

  useEffect(() => {
    if (!pendingTripPlannerOpen || !isAuthenticated) return;

    setShowLoginModal(false);
    setTripPlannerOpen(true);
    setPendingTripPlannerOpen(false);
  }, [isAuthenticated, pendingTripPlannerOpen]);

  const handleCreateTrip = (data: { title: string; description?: string; start_date: string; end_date: string }) => {
    if (!isAuthenticated) {
      toast.info(t("hero.loginRequired"));
      setShowLoginModal(true);
      return;
    }

    const newTrip = createTrip(data);
    toast.success(t("hero.tripCreated"));
    router.push(`${l("/dashboard/trips")}?trip=${encodeURIComponent(newTrip.id)}`);
  };

  const eventsByMonth: Record<string, CalendarEvent[]> = {};
  upcomingEvents.forEach((event) => {
    const monthKey = event.start_date.slice(0, 7);
    if (!eventsByMonth[monthKey]) eventsByMonth[monthKey] = [];
    eventsByMonth[monthKey].push(event);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!heroEnabled && <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />}

      <main>
        {heroEnabled ? (
        <CmsBlock pageId="events" blockId="hero" as="section" className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
          <LiveStyleHero
            badge={cms.getText("hero.badge", t("sections.events.label"))}
            title={cms.getText("hero.title", t("sections.events.title"))}
            subtitle={cms.getText(
              "hero.subtitle",
              t("sections.events.subtitle"),
            )}
            media={
              <HeroBackgroundMedia
                mediaType={cms.getText("hero.mediaType", "image")}
                imageUrl={cms.getText("hero.imageUrl", "")}
                videoUrl={cms.getText("hero.videoUrl", "")}
                youtubeUrl={cms.getText("hero.youtubeUrl", "")}
                posterUrl={cms.getText("hero.posterUrl", "")}
                alt={cms.getText("hero.alt", t("events.hero.alt"))}
                fallback={<PageHeroImage page="events" alt={cms.getText("hero.alt", t("events.hero.alt"))} />}
              />
            }
            ctas={
              <>
                <Button type="button" variant="gold" size="lg" onClick={scrollToEventsListings}>
                  <ArrowDown className="h-4 w-4" />
                  {cms.getText("hero.cta.primary", t("events.hero.ctaPrimary"))}
                </Button>
                <Button
                  type="button"
                  variant="heroOutline"
                  size="lg"
                  onClick={openTripPlanner}
                  disabled={isAuthLoading}
                >
                  <CalendarPlus className="h-4 w-4" />
                  {cms.getText("hero.cta.secondary", t("events.hero.ctaSecondary"))}
                </Button>
              </>
            }
          />
        </CmsBlock>
        ) : null}

        {filtersEnabled ? (
          <CmsBlock
            pageId="events"
            blockId="filters"
            as="section"
            className={`${heroEnabled ? "-mt-12" : "pt-8"} relative z-10 app-container content-max pb-6`}
          >
            <div className="flex w-full flex-wrap items-center justify-center gap-4 rounded-md border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as EventCategory | "all")}
              >
                <SelectTrigger className="w-full max-w-[260px] bg-card/90 border-border text-foreground sm:w-[220px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("sections.events.allCategories")} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">{t("sections.events.allCategories")}</SelectItem>
                  {[...categories]
                    .map(([key]) => ({ key, label: getEventCategoryLabel(key) }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map(({ key, label }) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CmsBlock>
        ) : null}

        {featuredEnabled && featuredEvents.length > 0 ? (
          <CmsBlock pageId="events" blockId="featured" as="section" className="py-12 app-container content-max">
            <h2 className="mb-8 flex items-center gap-2 text-title font-serif font-semibold">
              <Star className="h-6 w-6 text-primary" />
              {cms.getText("featured.title", t("sections.events.featured"))}
            </h2>
            <div className="grid-adaptive">
              {featuredEvents.map((event, index) => (
                <m.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onMouseEnter={() => setActiveMapEventId(event.id)}
                  onFocus={() => setActiveMapEventId(event.id)}
                >
                  <EventTicketCard
                    event={event}
                    locale={locale}
                    href={getEventHref(event)}
                    categoryLabel={getEventCategoryLabel(event.category as EventCategory)}
                    featuredLabel={cms.getText("featured.badge", t("sections.events.featuredBadge"))}
                    showFeaturedBadge
                    imageFallback={PIXABAY_EVENT_IMAGE_FALLBACK}
                    isFavorite={isFavorite(event)}
                    onToggleFavorite={() => void toggleFavorite(event)}
                    t={t}
                  />
                </m.div>
              ))}
            </div>
          </CmsBlock>
        ) : null}

        {timelineEnabled ? (
        <CmsBlock pageId="events" blockId="timeline" as="section" className="scroll-mt-28 py-12 app-container content-max">
          <div id="events-listings" className="scroll-mt-28">
          <h2 className="mb-8 text-title font-serif font-semibold">
            {cms.getText("timeline.title", t("common.upcomingEvents"))}
          </h2>

          {Object.entries(eventsByMonth).length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-16 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-serif font-semibold">
                  {cms.getText("timeline.emptyTitle", t("sections.events.noUpcoming"))}
                </h3>
                <p className="text-muted-foreground">
                  {cms.getText("timeline.emptyDescription", t("sections.events.noUpcomingHint"))}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,38%)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,40%)] xl:grid-cols-[minmax(0,1fr)_minmax(380px,42%)] 3xl:grid-cols-[minmax(0,1.18fr)_minmax(420px,36%)]">
              <div className="space-y-12">
                {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => (
                  <div key={monthKey}>
                    <h3 className="mb-4 border-b border-border pb-2 text-lg font-medium text-muted-foreground">
                      {getEventMonthHeading(monthKey, locale)}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                      {monthEvents.map((event, index) => (
                        <m.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          onMouseEnter={() => setActiveMapEventId(event.id)}
                          onFocus={() => setActiveMapEventId(event.id)}
                        >
                          <EventTicketCard
                            event={event}
                            locale={locale}
                            href={getEventHref(event)}
                            categoryLabel={getEventCategoryLabel(event.category as EventCategory)}
                            imageFallback={PIXABAY_EVENT_IMAGE_FALLBACK}
                            isFavorite={isFavorite(event)}
                            onToggleFavorite={() => void toggleFavorite(event)}
                            t={t}
                          />
                        </m.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <aside className="hidden md:block">
                <div className="sticky top-28">
                  <EventMapDirectory
                    events={visibleEvents}
                    locale={locale}
                    activeEventId={activeMapEventId}
                    onEventSelect={setActiveMapEventId}
                    getEventHref={getEventHref}
                    eventImageFallback={PIXABAY_EVENT_IMAGE_FALLBACK}
                  />
                </div>
              </aside>
            </div>
          )}
          </div>
        </CmsBlock>
        ) : null}
      </main>

      {tripPlannerOpen ? (
        <CreateTripDialog
          open={tripPlannerOpen}
          onClose={() => setTripPlannerOpen(false)}
          onSave={handleCreateTrip}
        />
      ) : null}
      {showLoginModal ? (
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          title={t("hero.tripLoginTitle")}
          description={t("hero.tripLoginDescription")}
        />
      ) : null}

      <Footer />
    </div>
  );
}

export function EventsClient(props: EventsClientProps) {
  const mounted = useHydrated();

  useEffect(() => {
    return hideServerShell("events-server-shell");
  }, []);

  if (!mounted) {
    return null;
  }

  return <EventsClientInner {...props} />;
}

export default EventsClient;
