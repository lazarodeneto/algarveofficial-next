"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { callAdminEmailApi } from "@/lib/admin/email-client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface SegmentRule {
  field: string;
  operator: string;
  value: unknown;
}

export interface EmailSegment {
  id: string;
  name: string;
  description: string | null;
  rules: SegmentRule[];
  contact_count: number;
  is_dynamic: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailSegmentInsert {
  name: string;
  description?: string;
  rules: SegmentRule[];
  is_dynamic?: boolean;
}

function parseRules(jsonRules: Json): SegmentRule[] {
  if (Array.isArray(jsonRules)) {
    return jsonRules.map(rule => {
      const r = rule as Record<string, unknown>;
      return {
        field: String(r.field || ""),
        operator: String(r.operator || ""),
        value: r.value,
      };
    });
  }
  return [];
}

export function useEmailSegments() {
  return useQuery({
    queryKey: ["email-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_segments")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      
      return data.map(segment => ({
        ...segment,
        rules: parseRules(segment.rules),
      })) as EmailSegment[];
    },
  });
}

export function useEmailSegment(id: string | undefined) {
  return useQuery({
    queryKey: ["email-segment", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("email_segments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        rules: parseRules(data.rules),
      } as EmailSegment;
    },
    enabled: !!id,
  });
}

export function useCreateEmailSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (segment: EmailSegmentInsert) => {
      const data = await callAdminEmailApi("segments", "POST", {
        name: segment.name,
        description: segment.description ?? null,
        rules: segment.rules as unknown as Json,
        is_dynamic: segment.is_dynamic ?? true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-segments"] });
      toast({ title: "Segment created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create segment", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateEmailSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rules, ...updates }: { id: string; name?: string; description?: string; rules?: SegmentRule[]; is_dynamic?: boolean }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (rules !== undefined) {
        updateData.rules = rules as unknown as Json;
      }
      const data = await callAdminEmailApi("segments", "PATCH", { id, ...updateData });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-segments"] });
      toast({ title: "Segment updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update segment", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteEmailSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await callAdminEmailApi("segments", "DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-segments"] });
      toast({ title: "Segment deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete segment", description: error.message, variant: "destructive" });
    },
  });
}

// Helper to evaluate segment rules against contacts
function buildContactQuery(rules: SegmentRule[]) {
  let query = supabase
    .from("email_contacts")
    .select("id", { count: "exact" });

  // Check if any status rule is defined
  const hasStatusRule = rules.some(r => r.field === "status");
  if (!hasStatusRule) {
    query = query.eq("status", "subscribed");
  }

  for (const rule of rules) {
    const value = rule.value;

    switch (rule.field) {
      case "tags":
        if (rule.operator === "contains" && typeof value === "string") {
          query = query.contains("tags", [value]);
        } else if (rule.operator === "not_contains" && typeof value === "string") {
          query = query.not("tags", "cs", `{${value}}`);
        }
        break;

      case "source":
        if (rule.operator === "equals" && typeof value === "string") {
          query = query.eq("source", value);
        } else if (rule.operator === "not_equals" && typeof value === "string") {
          query = query.neq("source", value);
        }
        break;

      case "status":
        if (rule.operator === "equals" && typeof value === "string") {
          query = query.eq("status", value as "subscribed" | "unsubscribed" | "bounced" | "complained");
        } else if (rule.operator === "not_equals" && typeof value === "string") {
          query = query.neq("status", value as "subscribed" | "unsubscribed" | "bounced" | "complained");
        }
        break;
    }
  }

  return query;
}

export function useRefreshSegmentCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (segmentId: string) => {
      // Get segment rules
      const { data: segment, error: segmentError } = await supabase
        .from("email_segments")
        .select("rules")
        .eq("id", segmentId)
        .single();

      if (segmentError) throw segmentError;

      const rules = parseRules(segment.rules);
      const query = buildContactQuery(rules);

      const { count, error: countError } = await query;

      if (countError) throw countError;

      // Update segment with new count
      await callAdminEmailApi("segments", "PATCH", { id: segmentId, contact_count: count ?? 0 });

      return count || 0;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-segments"] });
    },
  });
}
