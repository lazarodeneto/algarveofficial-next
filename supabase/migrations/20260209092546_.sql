-- Add hero_media_type column to homepage_settings
ALTER TABLE public.homepage_settings
ADD COLUMN hero_media_type text NOT NULL DEFAULT 'video';

-- Remove chat_messages from realtime publication to eliminate WAL overhead
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;;
