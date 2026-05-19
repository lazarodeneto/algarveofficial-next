"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Inbox,
  KanbanSquare,
  ListChecks,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOwnerChatThreads } from "@/hooks/useOwnerChatThreads";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type CrmStage = "new_lead" | "contacted" | "planning" | "booked" | "won" | "lost";

interface CrmContact {
  id: string;
  display_name: string | null;
  company_name?: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  updated_at: string;
}

interface CrmOpportunity {
  id: string;
  stage: CrmStage;
  title: string | null;
  estimated_value_cents: number | null;
  currency: string;
  updated_at: string;
  contact?: { display_name?: string | null; email?: string | null } | null;
  listing?: { name?: string | null } | null;
}

interface CrmTask {
  id: string;
  title: string;
  description: string | null;
  status: "open" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  due_at: string | null;
  contact?: { display_name?: string | null; email?: string | null } | null;
  listing?: { name?: string | null } | null;
}

interface CrmSummary {
  contacts: number;
  new_leads: number;
  open_opportunities: number;
  upcoming_tasks: number;
  overdue_tasks: number;
  unread_messages: number;
  listing_health_alerts: number;
  subscription: { tier: string; status: string; current_period_end: string | null } | null;
}

const stages: Array<{ id: CrmStage; label: string }> = [
  { id: "new_lead", label: "New Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "planning", label: "Planning" },
  { id: "booked", label: "Booked" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

const tabs = [
  { id: "overview", label: "Overview", icon: KanbanSquare },
  { id: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { id: "contacts", label: "Contacts", icon: UsersRound },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "tasks", label: "Tasks", icon: ListChecks },
] as const;

async function crmFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Request failed with status ${response.status}`);
  }
  return body as T;
}

function formatMoney(cents: number | null, currency = "EUR") {
  if (!cents) return "Value TBD";
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(cents / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function displayName(contact?: { display_name?: string | null; email?: string | null } | null) {
  return contact?.display_name || contact?.email || "Unknown contact";
}

export default function OwnerCRM() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [contactSearch, setContactSearch] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const { data: inboxThreads = [], isLoading: inboxLoading } = useOwnerChatThreads();

  const summaryQuery = useQuery({
    queryKey: ["owner-crm", "summary"],
    queryFn: () => crmFetch<{ summary: CrmSummary }>("/api/owner/crm/summary"),
  });

  const opportunitiesQuery = useQuery({
    queryKey: ["owner-crm", "opportunities"],
    queryFn: () => crmFetch<{ opportunities: CrmOpportunity[] }>("/api/owner/crm/opportunities?limit=100"),
  });

  const contactsQuery = useQuery({
    queryKey: ["owner-crm", "contacts", contactSearch],
    queryFn: () =>
      crmFetch<{ contacts: CrmContact[] }>(
        `/api/owner/crm/contacts?limit=80${contactSearch.trim() ? `&search=${encodeURIComponent(contactSearch.trim())}` : ""}`,
      ),
  });

  const tasksQuery = useQuery({
    queryKey: ["owner-crm", "tasks"],
    queryFn: () => crmFetch<{ tasks: CrmTask[] }>("/api/owner/crm/tasks?limit=80"),
  });

  const updateStage = useMutation({
    mutationFn: ({ opportunityId, stage }: { opportunityId: string; stage: CrmStage }) =>
      crmFetch<{ opportunity: CrmOpportunity }>(`/api/owner/crm/opportunities/${opportunityId}`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-crm", "opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["owner-crm", "summary"] });
    },
  });

  const createTask = useMutation({
    mutationFn: () =>
      crmFetch<{ task: CrmTask }>("/api/owner/crm/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || null,
          priority: "normal",
        }),
      }),
    onSuccess: () => {
      setTaskTitle("");
      setTaskDescription("");
      queryClient.invalidateQueries({ queryKey: ["owner-crm", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["owner-crm", "summary"] });
    },
  });

  const completeTask = useMutation({
    mutationFn: (taskId: string) =>
      crmFetch<{ task: CrmTask }>(`/api/owner/crm/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-crm", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["owner-crm", "summary"] });
    },
  });

  const opportunities = opportunitiesQuery.data?.opportunities ?? [];
  const contacts = contactsQuery.data?.contacts ?? [];
  const tasks = tasksQuery.data?.tasks ?? [];
  const summary = summaryQuery.data?.summary;
  const isLoading = summaryQuery.isLoading || opportunitiesQuery.isLoading || contactsQuery.isLoading || tasksQuery.isLoading;

  const opportunitiesByStage = useMemo(() => {
    return stages.reduce<Record<CrmStage, CrmOpportunity[]>>((acc, stage) => {
      acc[stage.id] = opportunities.filter((opportunity) => opportunity.stage === stage.id);
      return acc;
    }, {} as Record<CrmStage, CrmOpportunity[]>);
  }, [opportunities]);

  const openTasks = tasks.filter((task) => task.status === "open");
  const overdueTasks = openTasks.filter((task) => task.due_at && new Date(task.due_at).getTime() < Date.now());

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-sm border border-border/70 bg-card/70 p-5 shadow-card backdrop-blur-xl lg:flex-row lg:items-end">
        <div>
          <Badge variant="gold" className="mb-3">Owner CRM</Badge>
          <h1 className="font-serif text-3xl font-semibold text-foreground lg:text-4xl">Business command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Track leads, conversations, opportunities, and follow-up tasks from your existing AlgarveOfficial owner workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={activeTab === tab.id ? "primary" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {activeTab === "overview" && !isLoading ? (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "New leads", value: summary?.new_leads ?? 0, icon: UsersRound },
              { label: "Open opportunities", value: summary?.open_opportunities ?? 0, icon: KanbanSquare },
              { label: "Open tasks", value: summary?.upcoming_tasks ?? 0, icon: ListChecks },
              { label: "Unread messages", value: summary?.unread_messages ?? 0, icon: MessageSquare },
              { label: "Listing alerts", value: summary?.listing_health_alerts ?? 0, icon: AlertTriangle },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="bg-card/70 backdrop-blur-xl">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{item.value}</p>
                    </div>
                    <Icon className="h-5 w-5 text-primary" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl">Recent opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opportunities.slice(0, 5).map((opportunity) => (
                  <div key={opportunity.id} className="rounded-sm border border-border/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{opportunity.title || opportunity.listing?.name || "Untitled opportunity"}</p>
                        <p className="text-sm text-muted-foreground">{displayName(opportunity.contact)}</p>
                      </div>
                      <Badge variant="outline">{opportunity.stage.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{formatMoney(opportunity.estimated_value_cents, opportunity.currency)}</p>
                  </div>
                ))}
                {opportunities.length === 0 ? <p className="text-sm text-muted-foreground">No opportunities yet.</p> : null}
              </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl">Tasks needing attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueTasks.length > 0 ? (
                  <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {overdueTasks.length} overdue task{overdueTasks.length === 1 ? "" : "s"} need follow-up.
                  </div>
                ) : null}
                {openTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-3 rounded-sm border border-border/70 p-3">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(task.due_at)} · {task.priority}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => completeTask.mutate(task.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Done
                    </Button>
                  </div>
                ))}
                {openTasks.length === 0 ? <p className="text-sm text-muted-foreground">No open tasks.</p> : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === "pipeline" && !isLoading ? (
        <div className="grid gap-3 overflow-x-auto pb-2 lg:grid-cols-3 xl:grid-cols-6">
          {stages.map((stage) => (
            <Card key={stage.id} className="min-h-[360px] bg-card/70 backdrop-blur-xl">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{stage.label}</CardTitle>
                  <Badge variant="outline">{opportunitiesByStage[stage.id]?.length ?? 0}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {(opportunitiesByStage[stage.id] ?? []).map((opportunity) => (
                  <div key={opportunity.id} className="rounded-sm border border-border/70 bg-background/50 p-3">
                    <p className="font-semibold leading-5">{opportunity.title || opportunity.listing?.name || "Untitled opportunity"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{displayName(opportunity.contact)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{formatMoney(opportunity.estimated_value_cents, opportunity.currency)}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {stages.filter((nextStage) => nextStage.id !== stage.id).slice(0, 3).map((nextStage) => (
                        <button
                          key={nextStage.id}
                          type="button"
                          className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-foreground"
                          onClick={() => updateStage.mutate({ opportunityId: opportunity.id, stage: nextStage.id })}
                        >
                          {nextStage.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {activeTab === "contacts" && !isLoading ? (
        <Card className="bg-card/70 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Contacts</CardTitle>
            <div className="relative mt-3 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Search by name, email, phone..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-sm border border-border/70 p-4">
                <p className="font-semibold">{contact.display_name || contact.company_name || contact.email || "Unnamed contact"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{contact.email || contact.phone || "No direct channel yet"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline">{contact.source}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(contact.updated_at)}</span>
                </div>
              </div>
            ))}
            {contacts.length === 0 ? <p className="text-sm text-muted-foreground">No contacts found.</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "inbox" && !isLoading ? (
        <Card className="bg-card/70 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Inbox preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inboxLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : null}
            {inboxThreads.slice(0, 10).map((thread) => (
              <div key={thread.id} className={cn("rounded-sm border border-border/70 p-4", thread.unread_count > 0 && "border-primary/40 bg-primary/5")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{thread.viewer?.full_name || "Unknown visitor"}</p>
                    <p className="text-sm text-muted-foreground">{thread.listing?.name || "No listing linked"}</p>
                  </div>
                  <Badge variant={thread.unread_count > 0 ? "gold" : "outline"}>{thread.unread_count} unread</Badge>
                </div>
                <p className="mt-2 truncate text-sm text-muted-foreground">{thread.last_message?.body_text || "No messages yet"}</p>
              </div>
            ))}
            {!inboxLoading && inboxThreads.length === 0 ? <p className="text-sm text-muted-foreground">No inbox threads yet.</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "tasks" && !isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="bg-card/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3 rounded-sm border border-border/70 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{task.title}</p>
                      <Badge variant={task.status === "open" ? "outline" : "secondary"}>{task.status}</Badge>
                      <Badge variant="outline">{task.priority}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                      {formatDate(task.due_at)}
                    </p>
                    {task.description ? <p className="mt-2 text-sm text-muted-foreground">{task.description}</p> : null}
                  </div>
                  {task.status === "open" ? (
                    <Button variant="outline" size="sm" onClick={() => completeTask.mutate(task.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Done
                    </Button>
                  ) : null}
                </div>
              ))}
              {tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks yet.</p> : null}
            </CardContent>
          </Card>

          <Card className="h-fit bg-card/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">Create task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Follow up with lead" />
              <Textarea value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} placeholder="Notes for this follow-up" />
              <Button disabled={!taskTitle.trim() || createTask.isPending} onClick={() => createTask.mutate()} className="w-full">
                {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add task
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
