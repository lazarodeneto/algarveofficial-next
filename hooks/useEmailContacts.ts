"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { invokeFunctionWithAuthRetry } from "@/lib/supabaseFunctionInvoke";
import { getSupabaseFunctionErrorMessage } from "@/lib/supabaseFunctionError";

export interface EmailContact {
  id: string;
  email: string;
  full_name: string | null;
  user_id: string | null;
  status: "subscribed" | "unsubscribed" | "bounced" | "complained";
  tags: string[];
  preferences: Record<string, unknown>;
  source: string | null;
  consent_given_at: string | null;
  last_email_sent_at: string | null;
  last_email_opened_at: string | null;
  last_email_clicked_at: string | null;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  bounce_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailContactInsert {
  email: string;
  full_name?: string;
  status?: "subscribed" | "unsubscribed" | "bounced" | "complained";
  tags?: string[];
  source?: string;
}

type ResendSyncType = "INSERT" | "UPDATE" | "DELETE";

async function syncContactToResend(payload: {
  type: ResendSyncType;
  table: "email_contacts";
  record: unknown;
  old_record: unknown;
}) {
  const { error } = await invokeFunctionWithAuthRetry("sync-contact-to-resend", {
    body: payload,
  });

  if (error) {
    const message = await getSupabaseFunctionErrorMessage(
      error,
      "Failed to sync contact to Resend",
    );
    throw new Error(message);
  }
}

export function useEmailContacts(options?: {
  status?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["email-contacts", options],
    queryFn: async () => {
      let query = supabase
        .from("email_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status as "subscribed" | "unsubscribed" | "bounced" | "complained");
      }

      if (options?.search) {
        query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EmailContact[];
    },
  });
}

export function useEmailContactStats() {
  return useQuery({
    queryKey: ["email-contact-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_contacts")
        .select("status");

      if (error) throw error;

      const stats = {
        total: data.length,
        subscribed: data.filter(c => c.status === "subscribed").length,
        unsubscribed: data.filter(c => c.status === "unsubscribed").length,
        bounced: data.filter(c => c.status === "bounced").length,
        complained: data.filter(c => c.status === "complained").length,
      };

      return stats;
    },
  });
}

export function useCreateEmailContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: EmailContactInsert) => {
      const { data, error } = await supabase
        .from("email_contacts")
        .insert({
          email: contact.email,
          full_name: contact.full_name || null,
          status: contact.status || "subscribed",
          tags: contact.tags || [],
          source: contact.source || "manual",
          consent_given_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      try {
        await syncContactToResend({
          type: "INSERT",
          table: "email_contacts",
          record: data,
          old_record: null,
        });
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : String(syncError);
        console.warn("Failed to sync to Resend:", message);
        toast({
          title: "Contact saved, but Resend sync failed",
          description: message,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["email-contact-stats"] });
      toast({ title: "Contact added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add contact", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateEmailContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; email?: string; full_name?: string; status?: "subscribed" | "unsubscribed" | "bounced" | "complained"; tags?: string[] }) => {
      // Get old record for Resend sync
      const { data: oldRecord } = await supabase
        .from("email_contacts")
        .select("id, email, full_name, status, user_id")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("email_contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      try {
        await syncContactToResend({
          type: "UPDATE",
          table: "email_contacts",
          record: data,
          old_record: oldRecord,
        });
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : String(syncError);
        console.warn("Failed to sync to Resend:", message);
        toast({
          title: "Contact updated, but Resend sync failed",
          description: message,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["email-contact-stats"] });
      toast({ title: "Contact updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update contact", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteEmailContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, get the contact data before deleting (needed for Resend sync)
      const { data: contact, error: fetchError } = await supabase
        .from("email_contacts")
        .select("id, email, full_name, status, user_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!contact) throw new Error("Contact not found");

      // Best-effort delete in Resend before local delete (contact may already be absent remotely).
      try {
        await syncContactToResend({
          type: "DELETE",
          table: "email_contacts",
          record: null,
          old_record: contact,
        });
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : String(syncError);
        console.warn("Failed to delete from Resend:", message);
        toast({
          title: "Local contact deleted, but Resend deletion failed",
          description: message,
        });
      }

      // Delete from local database
      const { error } = await supabase
        .from("email_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["email-contact-stats"] });
      toast({ title: "Contact deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete contact", description: error.message, variant: "destructive" });
    },
  });
}

export function useImportEmailContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contacts: EmailContactInsert[]) => {
      const contactsToInsert = contacts.map(c => ({
        email: c.email,
        full_name: c.full_name || null,
        status: c.status || "subscribed" as const,
        tags: c.tags || [],
        source: c.source || "import",
        consent_given_at: new Date().toISOString(),
      }));

      const candidateEmails = Array.from(
        new Set(
          contactsToInsert
            .map((contact) => contact.email.trim().toLowerCase())
            .filter(Boolean),
        ),
      );

      if (candidateEmails.length === 0) {
        return [] as EmailContact[];
      }

      const { data: existingContacts } = await supabase
        .from("email_contacts")
        .select("id, email, full_name, status, user_id")
        .in("email", candidateEmails);

      const existingByEmail = new Map(
        (existingContacts || []).map((contact) => [contact.email.toLowerCase(), contact]),
      );

      const { data, error } = await supabase
        .from("email_contacts")
        .upsert(contactsToInsert, { onConflict: "email", ignoreDuplicates: false })
        .select();

      if (error) throw error;

      // Sync imported contacts to Resend (new + updated).
      let syncFailures = 0;
      await Promise.all(
        (data || []).map(async (contact) => {
          const oldRecord = existingByEmail.get(contact.email.toLowerCase()) || null;
          const type: ResendSyncType = oldRecord ? "UPDATE" : "INSERT";

          try {
            await syncContactToResend({
              type,
              table: "email_contacts",
              record: contact,
              old_record: oldRecord,
            });
          } catch (syncError) {
            syncFailures += 1;
            const message = syncError instanceof Error ? syncError.message : String(syncError);
            console.warn("Failed to sync imported contact to Resend:", message);
          }
        }),
      );

      if (syncFailures > 0) {
        toast({
          title: `${syncFailures} imported contact(s) failed to sync to Resend`,
          description: "Local import completed. You can retry sync from the contacts list.",
        });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["email-contact-stats"] });
      toast({ title: `${data.length} contacts imported successfully` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to import contacts", description: error.message, variant: "destructive" });
    },
  });
}
