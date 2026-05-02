"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RequestTeeTimeLabels {
  title: string;
  intro: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  morning: string;
  midday: string;
  afternoon: string;
  flexible: string;
  players: string;
  handicap: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
}

interface RequestTeeTimeFormProps {
  listingId: string;
  courseId?: string | null;
  labels: RequestTeeTimeLabels;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function RequestTeeTimeForm({ listingId, courseId, labels }: RequestTeeTimeFormProps) {
  const [state, setState] = useState<SubmitState>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const formData = new FormData(event.currentTarget);
    const playersRaw = formValue(formData, "players");
    const players = playersRaw ? Number(playersRaw) : null;

    const response = await fetch("/api/golf/tee-time-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: courseId ?? null,
        listing_id: listingId,
        name: formValue(formData, "name"),
        email: formValue(formData, "email"),
        phone: formValue(formData, "phone"),
        preferred_date: formValue(formData, "preferred_date"),
        preferred_time: formValue(formData, "preferred_time"),
        players: Number.isFinite(players) ? players : null,
        handicap: formValue(formData, "handicap"),
        message: formValue(formData, "message"),
      }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    event.currentTarget.reset();
    setState("success");
  }

  return (
    <section className="mx-auto max-w-6xl py-12">
      <div className="rounded-2xl border border-border/70 p-5 shadow-sm md:p-6">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl font-medium text-foreground">{labels.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{labels.intro}</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tee-time-name">{labels.name}</Label>
            <Input id="tee-time-name" name="name" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tee-time-email">{labels.email}</Label>
            <Input id="tee-time-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tee-time-phone">{labels.phone}</Label>
            <Input id="tee-time-phone" name="phone" autoComplete="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tee-time-date">{labels.preferredDate}</Label>
            <Input id="tee-time-date" name="preferred_date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tee-time-period">{labels.preferredTime}</Label>
            <select
              id="tee-time-period"
              name="preferred_time"
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground ring-offset-background transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
              defaultValue="Flexible"
            >
              <option value="Morning">{labels.morning}</option>
              <option value="Midday">{labels.midday}</option>
              <option value="Afternoon">{labels.afternoon}</option>
              <option value="Flexible">{labels.flexible}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tee-time-players">{labels.players}</Label>
            <Input id="tee-time-players" name="players" type="number" min={1} max={8} inputMode="numeric" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tee-time-handicap">{labels.handicap}</Label>
            <Input id="tee-time-handicap" name="handicap" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tee-time-message">{labels.message}</Label>
            <Textarea id="tee-time-message" name="message" />
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button type="submit" disabled={state === "submitting"}>
              {state === "submitting" ? labels.submitting : labels.submit}
            </Button>
            {state === "success" ? <p className="text-sm font-medium text-emerald-700">{labels.success}</p> : null}
            {state === "error" ? <p className="text-sm font-medium text-destructive">{labels.error}</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
