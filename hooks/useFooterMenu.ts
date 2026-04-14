import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getValidAccessToken } from "@/lib/authToken";
import { toast } from "sonner";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  fetchFooterLinkTranslations,
  fetchFooterSectionTranslations,
  normalizePublicContentLocale,
} from "@/lib/publicContentLocale";

export interface FooterSection {
  id: string;
  title: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterLink {
  id: string;
  section_id: string;
  name: string;
  href: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterSectionWithLinks extends FooterSection {
  links: FooterLink[];
}

// Fetch all footer sections with their links
export function useFooterMenu() {
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["footer-menu", locale],
    queryFn: async (): Promise<FooterSectionWithLinks[]> => {
      const { data: combinedData, error: combinedError } = await supabase
        .from("footer_sections")
        .select(`
          id,
          title,
          slug,
          display_order,
          is_active,
          created_at,
          updated_at,
          links:footer_links!footer_links_section_id_fkey(
            id,
            section_id,
            name,
            href,
            display_order,
            is_active,
            open_in_new_tab,
            created_at,
            updated_at
          )
        `)
        .order("display_order", { ascending: true });

      let sectionsWithLinks: FooterSectionWithLinks[];

      if (!combinedError && combinedData) {
        const typedCombined = combinedData as unknown as Array<
          FooterSection & { links: FooterLink[] | null }
        >;

        sectionsWithLinks = typedCombined
          .filter((section) => section.is_active)
          .map((section) => ({
            ...section,
            links: [...(section.links ?? [])]
              .filter((link) => link.is_active)
              .sort((a, b) => a.display_order - b.display_order),
          }));
      } else {
        // Backward-compatible fallback when relation embed isn't available
        const { data: sections, error: sectionsError } = await supabase
          .from("footer_sections")
          .select("*")
          .order("display_order", { ascending: true });

        if (sectionsError) throw sectionsError;

        const { data: links, error: linksError } = await supabase
          .from("footer_links")
          .select("*")
          .order("display_order", { ascending: true });

        if (linksError) throw linksError;

        const typedSections = sections as FooterSection[];
        const typedLinks = links as FooterLink[];

        sectionsWithLinks = typedSections
          .filter((section) => section.is_active)
          .map((section) => ({
            ...section,
            links: typedLinks.filter((link) => link.section_id === section.id && link.is_active),
          }));
      }

      if (locale === "en" || sectionsWithLinks.length === 0) {
        return sectionsWithLinks;
      }

      const sectionIds = sectionsWithLinks.map((section) => section.id);
      const linkIds = sectionsWithLinks.flatMap((section) => section.links.map((link) => link.id));

      const [sectionTranslations, linkTranslations] = await Promise.all([
        fetchFooterSectionTranslations(locale, sectionIds),
        fetchFooterLinkTranslations(locale, linkIds),
      ]);

      const sectionTranslationMap = new Map(
        sectionTranslations.map((translation) => [translation.section_id, translation]),
      );
      const linkTranslationMap = new Map(
        linkTranslations.map((translation) => [translation.link_id, translation]),
      );

      return sectionsWithLinks.map((section) => ({
        ...section,
        title: sectionTranslationMap.get(section.id)?.title?.trim() ?? section.title,
        links: section.links.map((link) => ({
          ...link,
          name: linkTranslationMap.get(link.id)?.name?.trim() ?? link.name,
        })),
      }));
    },
    enabled: isBrowser,
    initialData: [] as FooterSectionWithLinks[],
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes — footer rarely changes
  });
}

// Fetch sections for admin (including inactive)
export function useAdminFooterSections() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["admin-footer-sections"],
    queryFn: async (): Promise<FooterSection[]> => {
      const { data, error } = await supabase
        .from("footer_sections")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as FooterSection[];
    },
    enabled: isBrowser,
    initialData: [] as FooterSection[],
  });
}

// Fetch links for a specific section (admin)
export function useAdminFooterLinks(sectionId: string | null) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["admin-footer-links", sectionId],
    queryFn: async (): Promise<FooterLink[]> => {
      if (!sectionId) return [];
      
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .eq("section_id", sectionId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as FooterLink[];
    },
    enabled: isBrowser && !!sectionId,
    initialData: [] as FooterLink[],
  });
}

// Section mutations
export function useFooterSectionMutations() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const callFooterSectionsApi = async (
    method: "POST" | "PATCH" | "DELETE" | "PUT",
    payload: Record<string, unknown>,
  ) => {
    const accessToken = await getValidAccessToken();
    const response = await fetch("/api/admin/footer/sections", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; data?: FooterSection; error?: { message?: string } }
      | null;

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error?.message || "Failed to update footer sections.");
    }

    return data.data;
  };

  const createSection = useMutation({
    mutationFn: async (data: { title: string; slug: string }) => {
      if (!isBrowser) return {} as FooterSection;
      const created = await callFooterSectionsApi("POST", data);
      return (created ?? {}) as FooterSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-sections"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
      toast.success("Section created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create section: ${error.message}`);
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FooterSection> & { id: string }) => {
      if (!isBrowser) return {} as FooterSection;
      const updated = await callFooterSectionsApi("PATCH", { id, ...data });
      return (updated ?? {}) as FooterSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-sections"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
      toast.success("Section updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      if (!isBrowser) return;
      await callFooterSectionsApi("DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-sections"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
      toast.success("Section deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });

  const reorderSections = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!isBrowser) return;
      await callFooterSectionsApi("PUT", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-sections"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder sections: ${error.message}`);
    },
  });

  return { createSection, updateSection, deleteSection, reorderSections };
}

// Link mutations
export function useFooterLinkMutations() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const callFooterLinksApi = async (
    method: "POST" | "PATCH" | "DELETE" | "PUT",
    payload: Record<string, unknown>,
  ) => {
    const accessToken = await getValidAccessToken();
    const response = await fetch("/api/admin/footer/links", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; data?: FooterLink; error?: { message?: string } }
      | null;

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error?.message || "Failed to update footer links.");
    }

    return data.data;
  };

  const createLink = useMutation({
    mutationFn: async (data: { section_id: string; name: string; href: string; icon?: string; open_in_new_tab?: boolean }) => {
      if (!isBrowser) return {} as FooterLink;
      const created = await callFooterLinksApi("POST", data);
      return (created ?? {}) as FooterLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
      toast.success("Link created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create link: ${error.message}`);
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FooterLink> & { id: string }) => {
      if (!isBrowser) return {} as FooterLink;
      const updated = await callFooterLinksApi("PATCH", { id, ...data });
      return (updated ?? {}) as FooterLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
      toast.success("Link updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update link: ${error.message}`);
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      if (!isBrowser) return;
      await callFooterLinksApi("DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
      toast.success("Link deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete link: ${error.message}`);
    },
  });

  const reorderLinks = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!isBrowser) return;
      await callFooterLinksApi("PUT", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-menu"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder links: ${error.message}`);
    },
  });

  return { createLink, updateLink, deleteLink, reorderLinks };
}
