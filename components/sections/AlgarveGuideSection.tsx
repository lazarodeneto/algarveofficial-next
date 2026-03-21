import Link from "next/link";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useTranslation } from "react-i18next";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { HeroTrustSignals } from "@/components/sections/HeroTrustSignals";

export function AlgarveGuideSection() {
  const l = useLocalizedHref();
  const { t } = useTranslation();
  const { getText } = useCmsPageBuilder("home");

  const path = l;
  const text = (key: string, fallback: string) => getText(key, t(key, fallback));
  const andWord = text("sections.algarveGuide.and", "and");

  return (
    <section
      id="algarve-travel-guide"
      aria-labelledby="algarve-travel-guide-title"
      className="bg-background py-20 lg:py-24"
    >
      <div className="app-container content-max">
        <div className="mx-auto max-w-[1040px]">
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <header className="mx-auto max-w-4xl text-center">
            <h2
              id="algarve-travel-guide-title"
              className="text-title font-serif font-medium text-foreground"
            >
              {text("sections.algarveGuide.title", "Your essential Algarve guide")}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {text(
                "sections.algarveGuide.intro1",
                "A premium Algarve trip works best when your stay, dining, and day plans are shortlisted before you land.",
              )}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {text(
                "sections.algarveGuide.intro2",
                "This guide connects the core decisions visitors usually make first: where to stay, which destinations to prioritize, and what experiences are worth time on the ground.",
              )}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {text(
                "sections.algarveGuide.intro3",
                "Use it as a fast starting point, then jump into the directory, destination pages, or map to build a sharper shortlist.",
              )}
            </p>
          </header>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border/70 bg-card/40 p-6">
              <h3 className="text-2xl font-serif font-medium text-foreground">
                {text("sections.algarveGuide.stayTitle", "Where to stay")}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {text(
                  "sections.algarveGuide.stayBody",
                  "Start with the right base for your trip.",
                )}{" "}
                {text(
                  "sections.algarveGuide.stayLinksPrefix",
                  "Browse premium",
                )}{" "}
                <Link href={path("/directory?category=places-to-stay")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.algarveHotels", "Algarve hotels")}
                </Link>{" "}
                {andWord}{" "}
                <Link href={path("/directory?category=places-to-stay")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.placesToStay", "places to stay")}
                </Link>
                .
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-card/40 p-6">
              <h3 className="text-2xl font-serif font-medium text-foreground">
                {text("sections.algarveGuide.destinationsTitle", "Where to go")}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {text(
                  "sections.algarveGuide.destinationsBody",
                  "Compare the Algarve by region before locking your plan.",
                )}{" "}
                {text(
                  "sections.algarveGuide.destinationsLinksPrefix",
                  "Explore",
                )}{" "}
                <Link href={path("/destinations")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.destinations", "destinations")}
                </Link>
                ,{" "}
                <Link href={path("/directory?category=beaches-clubs")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.beaches", "beaches")}
                </Link>
                , {andWord}{" "}
                <Link href={path("/map")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.interactiveMap", "the interactive map")}
                </Link>
                .
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-card/40 p-6">
              <h3 className="text-2xl font-serif font-medium text-foreground">
                {text("sections.algarveGuide.doTitle", "What to do")}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {text(
                  "sections.algarveGuide.doBody",
                  "Balance the shortlist with experiences that fit your pace.",
                )}{" "}
                {text(
                  "sections.algarveGuide.doLinksPrefix",
                  "Jump into",
                )}{" "}
                <Link href={path("/directory?category=golf")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.golf", "golf")}
                </Link>
                ,{" "}
                <Link href={path("/directory?category=restaurants")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.restaurants", "restaurants")}
                </Link>
                ,{" "}
                <Link href={path("/directory?category=things-to-do")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.thingsToDo", "things to do")}
                </Link>
                , {andWord}{" "}
                <Link href={path("/events")} className="text-primary underline-offset-4 hover:underline">
                  {text("sections.algarveGuide.links.events", "events")}
                </Link>
                .
              </p>
            </article>
          </div>

          <HeroTrustSignals variant="surface" className="mt-8 lg:mt-10" />
        </div>
      </div>
    </section>
  );
}

export default AlgarveGuideSection;
