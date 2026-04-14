-- WhatsApp Business Chat Integration Tables

-- 1. WhatsApp Accounts (owner phone registration)
CREATE TABLE public.whatsapp_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_phone_e164 TEXT NOT NULL,
  wa_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT whatsapp_accounts_owner_unique UNIQUE(owner_id)
);
-- 2. Chat Threads
CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel = 'whatsapp'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chat_threads_unique UNIQUE(listing_id, owner_id, viewer_id, channel)
);
-- 3. Chat Messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('viewer', 'owner', 'system')),
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  body_text TEXT NOT NULL,
  wa_message_id TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 4. Webhook Events (debug/audit)
CREATE TABLE public.whatsapp_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Indexes for performance
CREATE INDEX idx_chat_threads_viewer ON public.chat_threads(viewer_id);
CREATE INDEX idx_chat_threads_owner ON public.chat_threads(owner_id);
CREATE INDEX idx_chat_threads_listing ON public.chat_threads(listing_id);
CREATE INDEX idx_chat_threads_last_message ON public.chat_threads(last_message_at DESC);
CREATE INDEX idx_chat_messages_thread ON public.chat_messages(thread_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_wa_id ON public.chat_messages(wa_message_id) WHERE wa_message_id IS NOT NULL;
-- Enable RLS on all tables
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
-- ======================
-- RLS POLICIES
-- ======================

-- whatsapp_accounts: owners manage their own, admins view all
CREATE POLICY "Owners can manage their WhatsApp account"
  ON public.whatsapp_accounts FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can view all WhatsApp accounts"
  ON public.whatsapp_accounts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
-- chat_threads: viewers see their threads
CREATE POLICY "Viewers can view their threads"
  ON public.chat_threads FOR SELECT
  USING (viewer_id = auth.uid());
CREATE POLICY "Viewers can create threads"
  ON public.chat_threads FOR INSERT
  WITH CHECK (viewer_id = auth.uid());
-- chat_threads: owners see threads for their listings
CREATE POLICY "Owners can view threads for their listings"
  ON public.chat_threads FOR SELECT
  USING (owner_id = auth.uid());
-- chat_threads: admins can view all for moderation
CREATE POLICY "Admins can view all threads"
  ON public.chat_threads FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
-- chat_messages: helper function to check thread access
CREATE OR REPLACE FUNCTION public.can_access_thread(_thread_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_threads
    WHERE id = _thread_id
      AND (viewer_id = _user_id OR owner_id = _user_id)
  )
$$;
-- chat_messages: users can view messages in their threads
CREATE POLICY "Users can view messages in their threads"
  ON public.chat_messages FOR SELECT
  USING (can_access_thread(thread_id, auth.uid()));
-- chat_messages: users can insert messages in their threads
CREATE POLICY "Users can insert messages in their threads"
  ON public.chat_messages FOR INSERT
  WITH CHECK (can_access_thread(thread_id, auth.uid()));
-- chat_messages: admins can view all for moderation
CREATE POLICY "Admins can view all messages"
  ON public.chat_messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
-- whatsapp_webhook_events: only admins can view
CREATE POLICY "Admins can view webhook events"
  ON public.whatsapp_webhook_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Service role insert for webhooks (no user context)
CREATE POLICY "Service can insert webhook events"
  ON public.whatsapp_webhook_events FOR INSERT
  WITH CHECK (true);
-- Service role can insert messages (for inbound from webhooks)
CREATE POLICY "Service can manage messages"
  ON public.chat_messages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Trigger for updated_at on whatsapp_accounts
CREATE TRIGGER update_whatsapp_accounts_updated_at
  BEFORE UPDATE ON public.whatsapp_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Enable Realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
