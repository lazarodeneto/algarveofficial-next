import { BadgeCheck, Compass, Layers3 } from "lucide-react";

const trustItems = [
  {
    title: "Premium curated selection",
    description: "A focused platform for quality places, property and experiences across the Algarve.",
    icon: BadgeCheck,
  },
  {
    title: "Local insights and verified listings",
    description: "Discovery is guided by place, category and editorial context, not endless directory noise.",
    icon: Compass,
  },
  {
    title: "Stay, dine, explore and invest",
    description: "One multi-category platform for visitors, residents, owners and investors.",
    icon: Layers3,
  },
];

export function HomeTrustSection() {
  return (
    <section id="platform-trust" className="bg-muted/25 py-14 sm:py-20">
      <div className="app-container content-max">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Why AlgarveOfficial
            </span>
            <h2 className="mt-4 font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl">
              Curated for confident discovery
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
