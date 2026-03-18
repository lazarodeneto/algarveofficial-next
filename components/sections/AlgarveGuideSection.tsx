import { Link } from "next/link";
import { buildLangPath, useLangPrefix } from "@/hooks/useLangPrefix";
import { useTranslation } from "react-i18next";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { HeroTrustSignals } from "@/components/sections/HeroTrustSignals";

export function AlgarveGuideSection() {
  const langPrefix = useLangPrefix();
  const { t } = useTranslation();
  const { getText } = useCmsPageBuilder("home");

  const path = (route: string) => buildLangPath(langPrefix, route);
  const andWord = getText("sections.algarveGuide.and", t("sections.algarveGuide.and"));

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
              {getText("sections.algarveGuide.title", t("sections.algarveGuide.title"))}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {getText("sections.algarveGuide.intro1", t("sections.algarveGuide.intro1"))}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {getText("sections.algarveGuide.intro2", t("sections.algarveGuide.intro2"))}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {getText("sections.algarveGuide.intro3", t("sections.algarveGuide.intro3"))}
            </p>
          </header>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border/70 bg-card/40 p-6">
              <h3 className="text-2xl font-serif font-medium text-foreground">
                {getText("sections.algarveGuide.stayTitle", t("sections.algarveGuide.stayTitle"))}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {getText("sections.algarveGuide.stayBody", t("sections.algarveGuide.stayBody"))}{" "}
                {getText("sections.algarveGuide.stayLinksPrefix", t("sections.algarveGuide.stayLinksPrefix"))}{" "}
                <Link href={path("/directory?category=places-to-stay")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.algarveHotels", t("sections.algarveGuide.links.algarveHotels"))}
                </Link>{" "}
                {andWord}{" "}
                <Link href={path("/directory?category=places-to-stay")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.placesToStay", t("sections.algarveGuide.links.placesToStay"))}
                </Link>
                .
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-card/40 p-6">
              <h3 className="text-2xl font-serif font-medium text-foreground">
                {getText("sections.algarveGuide.destinationsTitle", t("sections.algarveGuide.destinationsTitle"))}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {getText("sections.algarveGuide.destinationsBody", t("sections.algarveGuide.destinationsBody"))}{" "}
                {getText("sections.algarveGuide.destinationsLinksPrefix", t("sections.algarveGuide.destinationsLinksPrefix"))}{" "}
                <Link href={path("/destinations")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.destinations", t("sections.algarveGuide.links.destinations"))}
                </Link>
                ,{" "}
                <Link href={path("/directory?category=beaches-clubs")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.beaches", t("sections.algarveGuide.links.beaches"))}
                </Link>
                , {andWord}{" "}
                <Link href={path("/map")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.interactiveMap", t("sections.algarveGuide.links.interactiveMap"))}
                </Link>
                .
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-card/40 p-6">
              <h3 className="text-2xl font-serif font-medium text-foreground">
                {getText("sections.algarveGuide.doTitle", t("sections.algarveGuide.doTitle"))}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {getText("sections.algarveGuide.doBody", t("sections.algarveGuide.doBody"))}{" "}
                {getText("sections.algarveGuide.doLinksPrefix", t("sections.algarveGuide.doLinksPrefix"))}{" "}
                <Link href={path("/directory?category=golf")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.golf", t("sections.algarveGuide.links.golf"))}
                </Link>
                ,{" "}
                <Link href={path("/directory?category=restaurants")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.restaurants", t("sections.algarveGuide.links.restaurants"))}
                </Link>
                ,{" "}
                <Link href={path("/directory?category=things-to-do")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.thingsToDo", t("sections.algarveGuide.links.thingsToDo"))}
                </Link>
                , {andWord}{" "}
                <Link href={path("/events")} className="text-primary underline-offset-4 hover:underline">
                  {getText("sections.algarveGuide.links.events", t("sections.algarveGuide.links.events"))}
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
