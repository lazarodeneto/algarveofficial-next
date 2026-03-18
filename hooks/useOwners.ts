"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Owner {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

/**
 * Fetches all users with the 'owner' role for admin listing assignment
 */
export function useOwners() {
  return useQuery({
    queryKey: ['admin-owners'],
    queryFn: async () => {
      // First get all users with owner role
      const { data: ownerRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'owner');

      if (rolesError) throw rolesError;

      if (!ownerRoles || ownerRoles.length === 0) {
        return [];
      }

      const ownerIds = ownerRoles.map(r => r.user_id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await (supabase.from('profiles' as any) as any)
        .select('id, email, full_name, created_at')
        .in('id', ownerIds);

      if (profilesError) throw profilesError;

      return (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: 'owner',
        created_at: p.created_at,
      })) as Owner[];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
  });
}

/**
 * Fetches all users that can own listings (owners + admins + editors)
 */
export function useListingOwnerCandidates() {
  return useQuery({
    queryKey: ['admin-listing-owner-candidates'],
    queryFn: async () => {
      // Get all users with owner, admin, or editor role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['owner', 'admin', 'editor']);

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        return [];
      }

      const userIds = [...new Set(roles.map(r => r.user_id))];

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await (supabase.from('profiles' as any) as any)
        .select('id, email, full_name, created_at')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Map profiles with their roles
      return (profiles || []).map((p: any) => {
        const userRole = roles.find(r => r.user_id === p.id);
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          role: userRole?.role || 'owner',
          created_at: p.created_at,
        };
      }) as Owner[];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
  });
}
