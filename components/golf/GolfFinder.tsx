"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { buildLocalizedPath } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/Button";

interface GolfFinderLabels {
  title: string;
  skillQuestion: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  mattersQuestion: string;
  scenery: string;
  challenge: string;
  ease: string;
  viewMatches: string;
}

interface GolfFinderProps {
  locale: string;
  labels: GolfFinderLabels;
}

export function GolfFinder({ locale, labels }: GolfFinderProps) {
  const router = useRouter();
  const [skill, setSkill] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [priority, setPriority] = useState<"scenery" | "challenge" | "ease">("scenery");

  const computedTag = useMemo(() => {
    if (skill === "beginner" || priority === "ease") return "beginner";
    if (skill === "advanced" || priority === "challenge") return "championship";
    return "coastal";
  }, [priority, skill]);

  return (
    <section className="mx-auto max-w-6xl py-12">
      <div className="rounded-2xl border border-border/70 p-5 shadow-sm">
        <h2 className="font-serif text-2xl font-medium text-foreground">{labels.title}</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{labels.skillQuestion}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                ["beginner", labels.beginner],
                ["intermediate", labels.intermediate],
                ["advanced", labels.advanced],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={skill === value ? "default" : "outline"}
                  onClick={() => setSkill(value as typeof skill)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{labels.mattersQuestion}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                ["scenery", labels.scenery],
                ["challenge", labels.challenge],
                ["ease", labels.ease],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={priority === value ? "default" : "outline"}
                  onClick={() => setPriority(value as typeof priority)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => router.push(buildLocalizedPath(locale, `/golf/discover/${computedTag}`))}
          >
            {labels.viewMatches}
          </Button>
        </div>
      </div>
    </section>
  );
}

