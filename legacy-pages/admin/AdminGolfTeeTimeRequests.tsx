import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarClock, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdmin } from "@/lib/api/fetchAdmin";
import { TEE_TIME_STATUSES, type TeeTimeStatusInput } from "@/lib/golf/tee-time-request";

interface TeeTimeRequestRow {
  id: string;
  course_id: string | null;
  listing_id: string | null;
  course_name: string | null;
  name: string;
  email: string;
  phone: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  players: number | null;
  status: TeeTimeStatusInput["status"];
  created_at: string;
}

const STATUS_BADGE_CLASSES: Record<TeeTimeStatusInput["status"], string> = {
  new: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  contacted: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  sent_to_course: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  closed: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "dd MMM yyyy, HH:mm");
}

function formatPreferredDateTime(row: TeeTimeRequestRow) {
  const parts = [row.preferred_date, row.preferred_time].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "-";
}

export default function AdminGolfTeeTimeRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<TeeTimeRequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const labels = useMemo(
    () => ({
      title: t("admin.golfTeeTimeRequests.title", "Golf tee time requests"),
      subtitle: t(
        "admin.golfTeeTimeRequests.subtitle",
        "Review lightweight tee-time leads submitted from golf course pages.",
      ),
      refresh: t("admin.golfTeeTimeRequests.refresh", "Refresh"),
      dateReceived: t("admin.golfTeeTimeRequests.dateReceived", "Date received"),
      course: t("admin.golfTeeTimeRequests.course", "Course"),
      name: t("admin.golfTeeTimeRequests.name", "Name"),
      email: t("admin.golfTeeTimeRequests.email", "Email"),
      phone: t("admin.golfTeeTimeRequests.phone", "Phone"),
      preferredDateTime: t("admin.golfTeeTimeRequests.preferredDateTime", "Preferred date/time"),
      players: t("admin.golfTeeTimeRequests.players", "Players"),
      status: t("admin.golfTeeTimeRequests.status", "Status"),
      empty: t("admin.golfTeeTimeRequests.empty", "No tee-time requests yet."),
      loading: t("admin.golfTeeTimeRequests.loading", "Loading tee-time requests..."),
      updateSuccess: t("admin.golfTeeTimeRequests.updateSuccess", "Request status updated."),
      updateError: t("admin.golfTeeTimeRequests.updateError", "Could not update request status."),
      unknownCourse: t("admin.golfTeeTimeRequests.unknownCourse", "Unknown course"),
      statuses: {
        new: t("admin.golfTeeTimeRequests.statuses.new", "New"),
        contacted: t("admin.golfTeeTimeRequests.statuses.contacted", "Contacted"),
        sent_to_course: t("admin.golfTeeTimeRequests.statuses.sent_to_course", "Sent to course"),
        closed: t("admin.golfTeeTimeRequests.statuses.closed", "Closed"),
      },
    }),
    [t],
  );

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdmin("/api/admin/golf/tee-time-requests");
      setRequests((response.data ?? []) as TeeTimeRequestRow[]);
    } catch (error) {
      toast.error(labels.updateError);
    } finally {
      setIsLoading(false);
    }
  }, [labels.updateError]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function updateStatus(id: string, status: TeeTimeStatusInput["status"]) {
    setUpdatingId(id);
    try {
      const response = await fetchAdmin("/api/admin/golf/tee-time-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const updated = response.data as TeeTimeRequestRow;
      setRequests((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      toast.success(labels.updateSuccess);
    } catch (error) {
      toast.error(labels.updateError);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-3xl font-semibold text-foreground lg:text-4xl">
            <CalendarClock className="h-8 w-8 text-primary" />
            {labels.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{labels.subtitle}</p>
        </div>
        <Button type="button" variant="outline" onClick={loadRequests} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {labels.refresh}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {labels.loading}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              {labels.empty}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.dateReceived}</TableHead>
                  <TableHead>{labels.course}</TableHead>
                  <TableHead>{labels.name}</TableHead>
                  <TableHead>{labels.email}</TableHead>
                  <TableHead>{labels.phone}</TableHead>
                  <TableHead>{labels.preferredDateTime}</TableHead>
                  <TableHead>{labels.players}</TableHead>
                  <TableHead>{labels.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(request.created_at)}
                    </TableCell>
                    <TableCell className="min-w-[180px] font-medium">
                      {request.course_name ?? labels.unknownCourse}
                    </TableCell>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>
                      <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${request.email}`}>
                        {request.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      {request.phone ? (
                        <a className="text-primary underline-offset-4 hover:underline" href={`tel:${request.phone}`}>
                          {request.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatPreferredDateTime(request)}</TableCell>
                    <TableCell>{request.players ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={STATUS_BADGE_CLASSES[request.status]}>
                          {labels.statuses[request.status]}
                        </Badge>
                        <select
                          value={request.status}
                          disabled={updatingId === request.id}
                          onChange={(event) =>
                            updateStatus(request.id, event.target.value as TeeTimeStatusInput["status"])
                          }
                          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                          aria-label={labels.status}
                        >
                          {TEE_TIME_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {labels.statuses[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
