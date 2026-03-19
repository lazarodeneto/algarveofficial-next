import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, Handshake, Newspaper, Sparkles, Users, LineChart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/seo/SeoHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const teamCards = [
  {
    icon: Users,
    roleKey: "about.team.roles.curation.title",
    bioKey: "about.team.roles.curation.bio",
  },
  {
    icon: Sparkles,
    roleKey: "about.team.roles.concierge.title",
    bioKey: "about.team.roles.concierge.bio",
  },
  {
    icon: Handshake,
    roleKey: "about.team.roles.partnerships.title",
    bioKey: "about.team.roles.partnerships.bio",
  },
  {
    icon: LineChart,
    roleKey: "about.team.roles.performance.title",
    bioKey: "about.team.roles.performance.bio",
  },
];

const valueCards = [
  {
    icon: Compass,
    titleKey: "about.value.curation.title",
    descriptionKey: "about.value.curation.description",
  },
  {
    icon: Handshake,
    titleKey: "about.value.partnerships.title",
    descriptionKey: "about.value.partnerships.description",
  },
  {
    icon: LineChart,
    titleKey: "about.value.growth.title",
    descriptionKey: "about.value.growth.description",
  },
];

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={t("about.metaTitle")}
        description={t("about.metaDescription")}
        canonicalUrl="/about-us"
        openGraphTitle={t("about.metaTitle")}
        openGraphDescription={t("about.metaDescription")}
        openGraphUrl="/about-us"
      />
      <Header />

      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary"
          >
            {t("about.badge")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-tight"
          >
            {t("about.heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            {t("about.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      <section className="pb-8 lg:pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="glass-box">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">{t("about.story.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("about.story.paragraph1")}</p>
              <p>{t("about.story.paragraph2")}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-3xl lg:text-4xl font-serif font-medium">{t("about.value.title")}</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("about.value.subtitle")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {valueCards.map((item, index) => (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Card className="h-full glass-box">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-serif text-2xl">{t(item.titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {t(item.descriptionKey)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-3xl lg:text-4xl font-serif font-medium">{t("about.team.title")}</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("about.team.subtitle")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {teamCards.map((card, index) => (
              <motion.div
                key={card.roleKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-serif text-2xl">{t(card.roleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{t(card.bioKey)}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-2">
          <Card className="h-full glass-box">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">{t("about.partnerships.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>{t("about.partnerships.intro")}</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>{t("about.partnerships.point1")}</li>
                <li>{t("about.partnerships.point2")}</li>
                <li>{t("about.partnerships.point3")}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Newspaper className="h-5 w-5" />
              </div>
              <CardTitle className="font-serif text-3xl">{t("about.press.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>{t("about.press.intro")}</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>{t("about.press.point1")}</li>
                <li>{t("about.press.point2")}</li>
                <li>{t("about.press.point3")}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pt-4 pb-16 lg:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Card className="glass-box">
            <CardContent className="py-10">
              <h2 className="text-3xl lg:text-4xl font-serif font-medium">{t("about.cta.title")}</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("about.cta.subtitle")}</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/partner">{t("about.cta.primary")}</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">{t("about.cta.secondary")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
