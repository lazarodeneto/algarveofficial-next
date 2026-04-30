import { BadgeCheck, Compass, Layers3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const trustItems = [
  {
    titleKey: "sections.homepage.trustSection.items.curated.title",
    descriptionKey: "sections.homepage.trustSection.items.curated.description",
    icon: BadgeCheck,
  },
  {
    titleKey: "sections.homepage.trustSection.items.verified.title",
    descriptionKey: "sections.homepage.trustSection.items.verified.description",
    icon: Compass,
  },
  {
    titleKey: "sections.homepage.trustSection.items.comprehensive.title",
    descriptionKey: "sections.homepage.trustSection.items.comprehensive.description",
    icon: Layers3,
  },
];

export function HomeTrustSection() {
  const { t } = useTranslation();

  return (
    <section id="platform-trust" className="bg-muted/25 py-14 sm:py-16 lg:py-20">
      <div className="app-container content-max">
        <div className="mb-10 text-center lg:mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("sections.homepage.trustSection.label")}
          </span>
          <h2 className="mx-auto mt-3 max-w-xl font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl">
            {t("sections.homepage.trustSection.title")}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleKey}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft-surface transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-base font-semibold not-italic text-foreground">
                  {t(item.titleKey)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(item.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
