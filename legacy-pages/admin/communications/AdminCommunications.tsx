"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, MailCheck, RefreshCw, Send, Webhook } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CommunicationEmailEvent {
  id: string;
  templateKey: string;
  recipient: string | null;
  subject: string | null;
  relatedEntityType: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string | null;
}

interface WebhookReceipt {
  id: string;
  eventType: string | null;
  eventId: string | null;
  receivedAt: string | null;
}

interface RecentSubscriber {
  id: string;
  email: string | null;
  status: string;
  resendSyncStatus: string | null;
  createdAt: string | null;
}

interface CommunicationsResponse {
  ok: boolean;
  emailEvents: CommunicationEmailEvent[];
  failedEmailEvents: CommunicationEmailEvent[];
  webhookReceipts: WebhookReceipt[];
  newsletter: {
    counts: Record<string, number>;
    recentSubscribers: RecentSubscriber[];
  };
  externalOutbox: {
    counts: Record<string, number>;
    openAlertCount: number;
  };
  errors: Array<{ source: string; message: string }>;
}

const STATUS_OPTIONS = [
  "all",
  "sent",
  "delivered",
  "failed",
  "skipped",
  "bounced",
  "complained",
  "suppressed",
];

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function statusBadgeClass(status: string) {
  if (["sent", "delivered", "subscribed", "synced"].includes(status)) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }
  if (["failed", "bounced", "complained", "suppressed", "dead"].includes(status)) {
    return "border-red-500/20 bg-red-500/10 text-red-700";
  }
  if (["skipped", "unsubscribed", "pending", "queued", "retry"].includes(status)) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700";
  }
  return "border-slate-500/20 bg-slate-500/10 text-slate-700";
}

async function fetchCommunications(status: string): Promise<CommunicationsResponse> {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  const response = await fetch(`/api/admin/communications?${params.toString()}`, {
    cache: "no-store",
  });
  const body = await response.json().catch(() => null) as CommunicationsResponse | null;
  if (!response.ok || !body?.ok) throw new Error("Failed to load communication diagnostics.");
  return body;
}

function EventTable({
  title,
  events,
}: {
  title: string;
  events: CommunicationEmailEvent[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No events found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(event.status)}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{event.templateKey}</TableCell>
                  <TableCell>{event.recipient ?? "—"}</TableCell>
                  <TableCell>
                    <div className="max-w-[340px] truncate">
                      {event.subject ?? event.errorMessage ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(event.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminCommunications() {
  const [status, setStatus] = useState("all");
  const { data, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ["admin", "communications", status],
    queryFn: () => fetchCommunications(status),
    staleTime: 30_000,
  });

  const newsletterTotal = useMemo(
    () => Object.values(data?.newsletter.counts ?? {}).reduce((sum, count) => sum + count, 0),
    [data?.newsletter.counts],
  );
  const failedCount = data?.failedEmailEvents.length ?? 0;
  const webhookCount = data?.webhookReceipts.length ?? 0;
  const outboxAttention = (data?.externalOutbox.counts.queued ?? 0)
    + (data?.externalOutbox.counts.retry ?? 0)
    + (data?.externalOutbox.counts.dead ?? 0)
    + (data?.externalOutbox.openAlertCount ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-sm text-muted-foreground">
            Operational email, webhook, newsletter, and outbox diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "all" ? "All statuses" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-500/30">
          <CardContent className="flex items-center gap-3 pt-6 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Communication diagnostics could not be loaded.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent email events</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : data?.emailEvents.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : failedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter contacts</CardTitle>
            <MailCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : newsletterTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook receipts</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : webhookCount}</div>
            {outboxAttention > 0 ? (
              <p className="mt-1 text-xs text-amber-700">{outboxAttention} outbox item(s) need review</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {data?.errors?.length ? (
        <Card className="border-amber-500/30">
          <CardContent className="space-y-2 pt-6 text-sm">
            {data.errors.map((item) => (
              <p key={item.source} className="text-amber-800">
                {item.source}: {item.message}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <EventTable title="Recent transactional events" events={data?.emailEvents ?? []} />
      <EventTable title="Failed, skipped, bounced, or suppressed" events={data?.failedEmailEvents ?? []} />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Resend webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.webhookReceipts ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No webhook receipts found.</p>
            ) : (
              <div className="space-y-3">
                {data?.webhookReceipts.slice(0, 12).map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between rounded-sm border p-3 text-sm">
                    <div>
                      <p className="font-medium">{receipt.eventType ?? "Unknown event"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{receipt.eventId ?? "—"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(receipt.receivedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Newsletter status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(data?.newsletter.counts ?? {}).map(([key, count]) => (
                <Badge key={key} variant="outline" className={statusBadgeClass(key)}>
                  {key}: {count}
                </Badge>
              ))}
            </div>
            <div className="space-y-3">
              {(data?.newsletter.recentSubscribers ?? []).slice(0, 10).map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between rounded-sm border p-3 text-sm">
                  <div>
                    <p className="font-medium">{subscriber.email ?? "masked"}</p>
                    <p className="text-xs text-muted-foreground">
                      Resend sync: {subscriber.resendSyncStatus ?? "not synced"}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusBadgeClass(subscriber.status)}>
                    {subscriber.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
