-- Migration: Add Admin RLS Overrides for Listing Dependencies
-- Purpose: Ensure administrators can clean up related records when deleting a listing.

-- 1. Favorites: Add admin-override manage policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' AND policyname = 'Admins can manage all favorites'
    ) THEN
        CREATE POLICY "Admins can manage all favorites"
        ON public.favorites FOR ALL
        TO authenticated
        USING (public.is_admin_or_editor(auth.uid()));
    END IF;
END $$;
-- 2. Conversations: Add admin-override delete policy
-- (Existing policies handled select/insert/update)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' AND policyname = 'Admins can delete all conversations'
    ) THEN
        CREATE POLICY "Admins can delete all conversations"
        ON public.conversations FOR DELETE
        TO authenticated
        USING (public.is_admin_or_editor(auth.uid()));
    END IF;
END $$;
-- 3. Messages: Add admin-override delete policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' AND policyname = 'Admins can delete all messages'
    ) THEN
        CREATE POLICY "Admins can delete all messages"
        ON public.messages FOR DELETE
        TO authenticated
        USING (public.is_admin_or_editor(auth.uid()));
    END IF;
END $$;
