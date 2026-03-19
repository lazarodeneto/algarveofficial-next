export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          owner_id: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          owner_id: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          owner_id?: string
          type?: string
        }
        Relationships: []
      }
      admin_rate_limits: {
        Row: {
          created_at: string
          id: string
          operation_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          operation_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          operation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_generation_logs: {
        Row: {
          category_slug: string | null
          created_at: string
          created_by: string | null
          entity_id: string
          entity_name: string
          entity_type: string
          error_message: string | null
          id: string
          image_url: string | null
          status: string
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_name: string
          entity_type: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          status: string
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_name?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          status?: string
        }
        Relationships: []
      }
      analytics_daily: {
        Row: {
          date: string
          favorites: number
          id: string
          inquiries: number
          listing_id: string | null
          unique_views: number
          views: number
        }
        Insert: {
          date: string
          favorites?: number
          id?: string
          inquiries?: number
          listing_id?: string | null
          unique_views?: number
          views?: number
        }
        Update: {
          date?: string
          favorites?: number
          id?: string
          inquiries?: number
          listing_id?: string | null
          unique_views?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_daily_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_daily_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          consent_given: boolean | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          listing_id: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_given?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          listing_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_given?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          listing_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_enrollments: {
        Row: {
          automation_id: string
          completed_at: string | null
          contact_id: string
          current_step: number | null
          enrolled_at: string
          id: string
          next_step_at: string | null
          status: string | null
        }
        Insert: {
          automation_id: string
          completed_at?: string | null
          contact_id: string
          current_step?: number | null
          enrolled_at?: string
          id?: string
          next_step_at?: string | null
          status?: string | null
        }
        Update: {
          automation_id?: string
          completed_at?: string | null
          contact_id?: string
          current_step?: number | null
          enrolled_at?: string
          id?: string
          next_step_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_enrollments_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "email_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_enrollments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "email_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["blog_category"]
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          reading_time: number | null
          related_listing_ids: string[] | null
          scheduled_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          tags: string[] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          category?: Database["public"]["Enums"]["blog_category"]
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          related_listing_ids?: string[] | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["blog_category"]
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          related_listing_ids?: string[] | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          bounced_at: string | null
          campaign_id: string
          clicked_at: string | null
          contact_id: string
          created_at: string
          delivered_at: string | null
          id: string
          opened_at: string | null
          resend_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id: string
          clicked_at?: string | null
          contact_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string
          clicked_at?: string | null
          contact_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "email_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          short_description: string | null
          slug: string
          template_fields: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          short_description?: string | null
          slug: string
          template_fields?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          short_description?: string | null
          slug?: string
          template_fields?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body_text: string
          created_at: string
          delivery_status: string
          direction: string
          id: string
          recipient_id: string | null
          sender_type: string
          thread_id: string
          wa_message_id: string | null
        }
        Insert: {
          body_text: string
          created_at?: string
          delivery_status?: string
          direction: string
          id?: string
          recipient_id?: string | null
          sender_type: string
          thread_id: string
          wa_message_id?: string | null
        }
        Update: {
          body_text?: string
          created_at?: string
          delivery_status?: string
          direction?: string
          id?: string
          recipient_id?: string | null
          sender_type?: string
          thread_id?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          channel: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          owner_id: string
          status: string
          unread_owner_count: number
          unread_viewer_count: number
          viewer_id: string | null
        }
        Insert: {
          channel?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          owner_id: string
          status?: string
          unread_owner_count?: number
          unread_viewer_count?: number
          viewer_id?: string | null
        }
        Update: {
          channel?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          owner_id?: string
          status?: string
          unread_owner_count?: number
          unread_viewer_count?: number
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          hero_image_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      city_region_mapping: {
        Row: {
          city_id: string
          created_at: string
          id: string
          is_primary: boolean
          region_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          region_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_region_mapping_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_region_mapping_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          display_email: string | null
          form_description: string | null
          form_title: string | null
          forwarding_email: string | null
          get_in_touch_description: string | null
          get_in_touch_title: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          office_location: string | null
          success_message: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          display_email?: string | null
          form_description?: string | null
          form_title?: string | null
          forwarding_email?: string | null
          get_in_touch_description?: string | null
          get_in_touch_title?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          office_location?: string | null
          success_message?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          display_email?: string | null
          form_description?: string | null
          form_title?: string | null
          forwarding_email?: string | null
          get_in_touch_description?: string | null
          get_in_touch_title?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          office_location?: string | null
          success_message?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          listing_id: string
          owner_id: string
          owner_unread_count: number
          user_id: string
          user_unread_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id: string
          owner_id: string
          owner_unread_count?: number
          user_id: string
          user_unread_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id?: string
          owner_id?: string
          owner_unread_count?: number
          user_id?: string
          user_unread_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_banner_settings: {
        Row: {
          accept_button_text: string | null
          data_retention_text: string | null
          decline_button_text: string | null
          description: string | null
          gdpr_badge_text: string | null
          id: string
          learn_more_link: string | null
          learn_more_text: string | null
          show_data_retention: boolean | null
          show_gdpr_badge: boolean | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          accept_button_text?: string | null
          data_retention_text?: string | null
          decline_button_text?: string | null
          description?: string | null
          gdpr_badge_text?: string | null
          id?: string
          learn_more_link?: string | null
          learn_more_text?: string | null
          show_data_retention?: boolean | null
          show_gdpr_badge?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          accept_button_text?: string | null
          data_retention_text?: string | null
          decline_button_text?: string | null
          description?: string | null
          gdpr_badge_text?: string | null
          id?: string
          learn_more_link?: string | null
          learn_more_text?: string | null
          show_data_retention?: boolean | null
          show_gdpr_badge?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cookie_settings: {
        Row: {
          id: string
          introduction: string | null
          last_updated_date: string | null
          meta_description: string | null
          meta_title: string | null
          page_title: string | null
          sections: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          introduction?: string | null
          last_updated_date?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_title?: string | null
          sections?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          introduction?: string | null
          last_updated_date?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_title?: string | null
          sections?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      curated_assignments: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string
          display_order: number
          id: string
          listing_id: string
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          display_order?: number
          id?: string
          listing_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          display_order?: number
          id?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_assignments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_assignments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["automation_status"]
          steps: Json
          total_completed: number | null
          total_enrolled: number | null
          trigger_config: Json | null
          trigger_type: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["automation_status"]
          steps?: Json
          total_completed?: number | null
          total_enrolled?: number | null
          trigger_config?: Json | null
          trigger_type: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["automation_status"]
          steps?: Json
          total_completed?: number | null
          total_enrolled?: number | null
          trigger_config?: Json | null
          trigger_type?: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          from_email: string
          from_name: string
          id: string
          name: string
          reply_to: string | null
          scheduled_at: string | null
          segment_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["email_campaign_status"]
          subject: string
          template_id: string | null
          total_bounced: number | null
          total_clicked: number | null
          total_complained: number | null
          total_delivered: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
          total_unsubscribed: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          from_email: string
          from_name?: string
          id?: string
          name: string
          reply_to?: string | null
          scheduled_at?: string | null
          segment_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_campaign_status"]
          subject: string
          template_id?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_complained?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          from_email?: string
          from_name?: string
          id?: string
          name?: string
          reply_to?: string | null
          scheduled_at?: string | null
          segment_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_campaign_status"]
          subject?: string
          template_id?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_complained?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "email_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_contacts: {
        Row: {
          bounce_count: number | null
          consent_given_at: string | null
          created_at: string
          email: string
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          full_name: string | null
          id: string
          ip_address: string | null
          last_email_clicked_at: string | null
          last_email_opened_at: string | null
          last_email_sent_at: string | null
          preferences: Json | null
          source: string | null
          status: Database["public"]["Enums"]["email_contact_status"]
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bounce_count?: number | null
          consent_given_at?: string | null
          created_at?: string
          email: string
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          last_email_clicked_at?: string | null
          last_email_opened_at?: string | null
          last_email_sent_at?: string | null
          preferences?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["email_contact_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bounce_count?: number | null
          consent_given_at?: string | null
          created_at?: string
          email?: string
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          last_email_clicked_at?: string | null
          last_email_opened_at?: string | null
          last_email_sent_at?: string | null
          preferences?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["email_contact_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_events: {
        Row: {
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["email_event_type"]
          id: string
          metadata: Json | null
          recipient_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["email_event_type"]
          id?: string
          metadata?: Json | null
          recipient_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["email_event_type"]
          id?: string
          metadata?: Json | null
          recipient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "email_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_events_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "campaign_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      email_segments: {
        Row: {
          contact_count: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_dynamic: boolean | null
          name: string
          rules: Json
          updated_at: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          name: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          name?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_subscribed: boolean
          source: string | null
          subscribed_at: string
          tags: string[] | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_subscribed?: boolean
          source?: string | null
          subscribed_at?: string
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_subscribed?: boolean
          source?: string | null
          subscribed_at?: string
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          text_content: string | null
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          city_id: string
          created_at: string
          description: string | null
          end_date: string
          end_time: string | null
          event_data: Json | null
          id: string
          image: string | null
          is_featured: boolean
          is_recurring: boolean
          listing_id: string | null
          location: string | null
          meta_description: string | null
          meta_title: string | null
          price_range: string | null
          recurrence_pattern: string | null
          rejection_reason: string | null
          related_listing_ids: string[] | null
          short_description: string | null
          slug: string
          start_date: string
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"]
          submitter_id: string
          tags: string[] | null
          ticket_url: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          category: string
          city_id: string
          created_at?: string
          description?: string | null
          end_date: string
          end_time?: string | null
          event_data?: Json | null
          id?: string
          image?: string | null
          is_featured?: boolean
          is_recurring?: boolean
          listing_id?: string | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          price_range?: string | null
          recurrence_pattern?: string | null
          rejection_reason?: string | null
          related_listing_ids?: string[] | null
          short_description?: string | null
          slug: string
          start_date: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          submitter_id: string
          tags?: string[] | null
          ticket_url?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          category?: string
          city_id?: string
          created_at?: string
          description?: string | null
          end_date?: string
          end_time?: string | null
          event_data?: Json | null
          id?: string
          image?: string | null
          is_featured?: boolean
          is_recurring?: boolean
          listing_id?: string | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          price_range?: string | null
          recurrence_pattern?: string | null
          rejection_reason?: string | null
          related_listing_ids?: string[] | null
          short_description?: string | null
          slug?: string
          start_date?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          submitter_id?: string
          tags?: string[] | null
          ticket_url?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          category_id: string | null
          city_id: string | null
          created_at: string
          id: string
          listing_id: string | null
          region_id: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          region_id?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          region_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_links: {
        Row: {
          created_at: string
          display_order: number
          href: string
          id: string
          is_active: boolean
          name: string
          open_in_new_tab: boolean
          section_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          href: string
          id?: string
          is_active?: boolean
          name: string
          open_in_new_tab?: boolean
          section_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          href?: string
          id?: string
          is_active?: boolean
          name?: string
          open_in_new_tab?: boolean
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "footer_links_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "footer_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_sections: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          category: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string | null
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          category?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      google_ratings_refresh_log: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          failure_count: number | null
          id: string
          success_count: number | null
          total_listings: number | null
          week_started_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          failure_count?: number | null
          id?: string
          success_count?: number | null
          total_listings?: number | null
          week_started_at: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          failure_count?: number | null
          id?: string
          success_count?: number | null
          total_listings?: number | null
          week_started_at?: string
        }
        Relationships: []
      }
      google_ratings_sync_status: {
        Row: {
          batch_size: number
          completed_at: string | null
          failure_count: number | null
          id: string
          last_cursor: string | null
          processed_count: number | null
          started_at: string | null
          status: string
          success_count: number | null
          total_listings: number | null
          updated_at: string | null
        }
        Insert: {
          batch_size?: number
          completed_at?: string | null
          failure_count?: number | null
          id?: string
          last_cursor?: string | null
          processed_count?: number | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          total_listings?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_size?: number
          completed_at?: string | null
          failure_count?: number | null
          id?: string
          last_cursor?: string | null
          processed_count?: number | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          total_listings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      header_menu_items: {
        Row: {
          created_at: string
          display_order: number
          href: string
          icon: string
          id: string
          is_active: boolean
          name: string
          open_in_new_tab: boolean
          translation_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          href: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          open_in_new_tab?: boolean
          translation_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          href?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          open_in_new_tab?: boolean
          translation_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_settings: {
        Row: {
          hero_autoplay: boolean
          hero_cta_primary_link: string | null
          hero_cta_primary_text: string | null
          hero_cta_secondary_link: string | null
          hero_cta_secondary_text: string | null
          hero_loop: boolean
          hero_media_type: string
          hero_muted: boolean
          hero_overlay_intensity: number
          hero_poster_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          hero_video_url: string | null
          hero_youtube_url: string | null
          id: string
          section_order: Json | null
          show_all_listings_section: boolean
          show_categories_section: boolean
          show_cities_section: boolean
          show_cta_section: boolean
          show_curated_section: boolean
          show_regions_section: boolean
          show_vip_section: boolean
          updated_at: string
        }
        Insert: {
          hero_autoplay?: boolean
          hero_cta_primary_link?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_link?: string | null
          hero_cta_secondary_text?: string | null
          hero_loop?: boolean
          hero_media_type?: string
          hero_muted?: boolean
          hero_overlay_intensity?: number
          hero_poster_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_video_url?: string | null
          hero_youtube_url?: string | null
          id?: string
          section_order?: Json | null
          show_all_listings_section?: boolean
          show_categories_section?: boolean
          show_cities_section?: boolean
          show_cta_section?: boolean
          show_curated_section?: boolean
          show_regions_section?: boolean
          show_vip_section?: boolean
          updated_at?: string
        }
        Update: {
          hero_autoplay?: boolean
          hero_cta_primary_link?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_link?: string | null
          hero_cta_secondary_text?: string | null
          hero_loop?: boolean
          hero_media_type?: string
          hero_muted?: boolean
          hero_overlay_intensity?: number
          hero_poster_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_video_url?: string | null
          hero_youtube_url?: string | null
          id?: string
          section_order?: Json | null
          show_all_listings_section?: boolean
          show_categories_section?: boolean
          show_cities_section?: boolean
          show_cta_section?: boolean
          show_curated_section?: boolean
          show_regions_section?: boolean
          show_vip_section?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      i18n_locale_data: {
        Row: {
          data: Json
          key_count: number
          locale: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key_count?: number
          locale: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key_count?: number
          locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      listing_reviews: {
        Row: {
          approved_at: string | null
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          moderated_at: string | null
          moderated_by: string | null
          rating: number
          rejection_reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          moderated_at?: string | null
          moderated_by?: string | null
          rating: number
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          rating?: number
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_claims: {
        Row: {
          assigned_listing_id: string | null
          business_name: string
          business_website: string | null
          contact_name: string
          created_at: string
          email: string
          id: string
          listing_id: string | null
          message: string | null
          phone: string | null
          rejection_reason: string | null
          request_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_listing_id?: string | null
          business_name: string
          business_website?: string | null
          contact_name: string
          created_at?: string
          email: string
          id?: string
          listing_id?: string | null
          message?: string | null
          phone?: string | null
          rejection_reason?: string | null
          request_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_listing_id?: string | null
          business_name?: string
          business_website?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          listing_id?: string | null
          message?: string | null
          phone?: string | null
          rejection_reason?: string | null
          request_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_claims_assigned_listing_id_fkey"
            columns: ["assigned_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_claims_assigned_listing_id_fkey"
            columns: ["assigned_listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_claims_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_claims_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_featured: boolean
          listing_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_featured?: boolean
          listing_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_featured?: boolean
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_slugs: {
        Row: {
          created_at: string
          id: string
          is_current: boolean
          listing_id: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean
          listing_id: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean
          listing_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_slugs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_slugs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          listing_id: string
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          source_hash: string | null
          title: string
          translated_at: string | null
          translation_status: Database["public"]["Enums"]["translation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          listing_id: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          source_hash?: string | null
          title: string
          translated_at?: string | null
          translation_status?: Database["public"]["Enums"]["translation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          listing_id?: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          source_hash?: string | null
          title?: string
          translated_at?: string | null
          translation_status?: Database["public"]["Enums"]["translation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_translations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_translations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          admin_notes: string | null
          category_data: Json | null
          category_id: string
          city_id: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          facebook_url: string | null
          featured_image_url: string | null
          google_business_url: string | null
          google_rating: number | null
          google_review_count: number | null
          id: string
          instagram_url: string | null
          is_curated: boolean
          latitude: number | null
          linkedin_url: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          owner_id: string
          price_currency: string | null
          price_from: number | null
          price_to: number | null
          published_at: string | null
          region_id: string | null
          rejection_notes: string | null
          rejection_reason: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          tags: string[] | null
          telegram_url: string | null
          tier: Database["public"]["Enums"]["listing_tier"]
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          view_count: number
          website_url: string | null
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          category_data?: Json | null
          category_id: string
          city_id: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          featured_image_url?: string | null
          google_business_url?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: string
          instagram_url?: string | null
          is_curated?: boolean
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          owner_id: string
          price_currency?: string | null
          price_from?: number | null
          price_to?: number | null
          published_at?: string | null
          region_id?: string | null
          rejection_notes?: string | null
          rejection_reason?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[] | null
          telegram_url?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"]
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          view_count?: number
          website_url?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          category_data?: Json | null
          category_id?: string
          city_id?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          featured_image_url?: string | null
          google_business_url?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: string
          instagram_url?: string | null
          is_curated?: boolean
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          owner_id?: string
          price_currency?: string | null
          price_from?: number | null
          price_to?: number | null
          published_at?: string | null
          region_id?: string | null
          rejection_notes?: string | null
          rejection_reason?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[] | null
          telegram_url?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"]
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          view_count?: number
          website_url?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      media_library: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          folder: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          folder?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_rate_limits: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      owner_subscriptions: {
        Row: {
          billing_period: string
          created_at: string
          current_period_end: string | null
          id: string
          owner_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["listing_tier"]
          updated_at: string
        }
        Insert: {
          billing_period: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          owner_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
        }
        Update: {
          billing_period?: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          owner_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_settings: {
        Row: {
          benefit_1_description: string | null
          benefit_1_title: string | null
          benefit_2_description: string | null
          benefit_2_title: string | null
          benefit_3_description: string | null
          benefit_3_title: string | null
          benefits_title: string | null
          claim_business_cta: string | null
          claim_business_description: string | null
          claim_business_title: string | null
          faq_title: string | null
          faqs: Json | null
          form_title: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          new_listing_cta: string | null
          new_listing_description: string | null
          new_listing_title: string | null
          success_message: string | null
          updated_at: string
        }
        Insert: {
          benefit_1_description?: string | null
          benefit_1_title?: string | null
          benefit_2_description?: string | null
          benefit_2_title?: string | null
          benefit_3_description?: string | null
          benefit_3_title?: string | null
          benefits_title?: string | null
          claim_business_cta?: string | null
          claim_business_description?: string | null
          claim_business_title?: string | null
          faq_title?: string | null
          faqs?: Json | null
          form_title?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          new_listing_cta?: string | null
          new_listing_description?: string | null
          new_listing_title?: string | null
          success_message?: string | null
          updated_at?: string
        }
        Update: {
          benefit_1_description?: string | null
          benefit_1_title?: string | null
          benefit_2_description?: string | null
          benefit_2_title?: string | null
          benefit_3_description?: string | null
          benefit_3_title?: string | null
          benefits_title?: string | null
          claim_business_cta?: string | null
          claim_business_description?: string | null
          claim_business_title?: string | null
          faq_title?: string | null
          faqs?: Json | null
          form_title?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          new_listing_cta?: string | null
          new_listing_description?: string | null
          new_listing_title?: string | null
          success_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          id: string
          introduction: string | null
          last_updated_date: string | null
          meta_description: string | null
          meta_title: string | null
          page_title: string | null
          sections: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          introduction?: string | null
          last_updated_date?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_title?: string | null
          sections?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          introduction?: string | null
          last_updated_date?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_title?: string | null
          sections?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotional_codes: {
        Row: {
          applicable_billing: string[]
          applicable_tiers: string[]
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          max_uses: number | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          applicable_billing?: string[]
          applicable_tiers?: string[]
          code: string
          created_at?: string
          current_uses?: number
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          applicable_billing?: string[]
          applicable_tiers?: string[]
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          hero_image_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_visible_destinations: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_visible_destinations?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_visible_destinations?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_approved: boolean
          listing_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          listing_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          listing_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address_masked: string | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address_masked?: string | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address_masked?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string | null
          contact_email: string | null
          favicon_url: string | null
          ga_dashboard_url: string | null
          ga_measurement_id: string | null
          id: string
          logo_url: string | null
          maintenance_ip_whitelist: string[] | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          primary_color: string | null
          secondary_color: string | null
          site_name: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          contact_email?: string | null
          favicon_url?: string | null
          ga_dashboard_url?: string | null
          ga_measurement_id?: string | null
          id?: string
          logo_url?: string | null
          maintenance_ip_whitelist?: string[] | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          contact_email?: string | null
          favicon_url?: string | null
          ga_dashboard_url?: string | null
          ga_measurement_id?: string | null
          id?: string
          logo_url?: string | null
          maintenance_ip_whitelist?: string[] | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_pricing: {
        Row: {
          billing_period: string
          display_price: string
          id: string
          monthly_equivalent: string | null
          note: string
          price: number
          savings: number | null
          tier: string
          updated_at: string
        }
        Insert: {
          billing_period: string
          display_price: string
          id: string
          monthly_equivalent?: string | null
          note: string
          price?: number
          savings?: number | null
          tier: string
          updated_at?: string
        }
        Update: {
          billing_period?: string
          display_price?: string
          id?: string
          monthly_equivalent?: string | null
          note?: string
          price?: number
          savings?: number | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_settings: {
        Row: {
          categories: Json | null
          email: string | null
          faqs: Json | null
          form_description: string | null
          form_title: string | null
          help_center_label: string | null
          help_center_url: string | null
          id: string
          phone: string | null
          phone_hours: string | null
          response_time: string | null
          response_time_note: string | null
          success_message: string | null
          updated_at: string | null
        }
        Insert: {
          categories?: Json | null
          email?: string | null
          faqs?: Json | null
          form_description?: string | null
          form_title?: string | null
          help_center_label?: string | null
          help_center_url?: string | null
          id?: string
          phone?: string | null
          phone_hours?: string | null
          response_time?: string | null
          response_time_note?: string | null
          success_message?: string | null
          updated_at?: string | null
        }
        Update: {
          categories?: Json | null
          email?: string | null
          faqs?: Json | null
          form_description?: string | null
          form_title?: string | null
          help_center_label?: string | null
          help_center_url?: string | null
          id?: string
          phone?: string | null
          phone_hours?: string | null
          response_time?: string | null
          response_time_note?: string | null
          success_message?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      terms_settings: {
        Row: {
          id: string
          introduction: string | null
          last_updated_date: string | null
          meta_description: string | null
          meta_title: string | null
          page_title: string | null
          sections: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          introduction?: string | null
          last_updated_date?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_title?: string | null
          sections?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          introduction?: string | null
          last_updated_date?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_title?: string | null
          sections?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translation_jobs: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          listing_id: string
          locked_at: string | null
          source_lang: string
          status: Database["public"]["Enums"]["translation_status"]
          target_lang: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          listing_id: string
          locked_at?: string | null
          source_lang?: string
          status?: Database["public"]["Enums"]["translation_status"]
          target_lang: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          listing_id?: string
          locked_at?: string | null
          source_lang?: string
          status?: Database["public"]["Enums"]["translation_status"]
          target_lang?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_jobs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_jobs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      view_tracking: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      whatsapp_accounts: {
        Row: {
          business_phone_e164: string
          created_at: string
          id: string
          owner_id: string
          updated_at: string
          wa_enabled: boolean
        }
        Insert: {
          business_phone_e164: string
          created_at?: string
          id?: string
          owner_id: string
          updated_at?: string
          wa_enabled?: boolean
        }
        Update: {
          business_phone_e164?: string
          created_at?: string
          id?: string
          owner_id?: string
          updated_at?: string
          wa_enabled?: boolean
        }
        Relationships: []
      }
      whatsapp_webhook_events: {
        Row: {
          id: string
          payload: Json
          received_at: string
        }
        Insert: {
          id?: string
          payload: Json
          received_at?: string
        }
        Update: {
          id?: string
          payload?: Json
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_views_daily: {
        Row: {
          day: string | null
          entity_id: string | null
          entity_type: string | null
          views: number | null
        }
        Relationships: []
      }
      owner_subscription_status: {
        Row: {
          billing_period: string | null
          created_at: string | null
          current_period_end: string | null
          owner_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
        }
        Insert: {
          billing_period?: string | null
          created_at?: string | null
          current_period_end?: string | null
          owner_id?: string | null
          status?: string | null
          stripe_customer_id?: never
          stripe_subscription_id?: never
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
        }
        Update: {
          billing_period?: string | null
          created_at?: string | null
          current_period_end?: string | null
          owner_id?: string | null
          status?: string | null
          stripe_customer_id?: never
          stripe_subscription_id?: never
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_listings: {
        Row: {
          address: string | null
          category_data: Json | null
          category_id: string | null
          city_id: string | null
          created_at: string | null
          description: string | null
          facebook_url: string | null
          featured_image_url: string | null
          google_business_url: string | null
          google_rating: number | null
          google_review_count: number | null
          id: string | null
          instagram_url: string | null
          is_curated: boolean | null
          latitude: number | null
          linkedin_url: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          owner_id: string | null
          price_currency: string | null
          price_from: number | null
          price_to: number | null
          published_at: string | null
          region_id: string | null
          short_description: string | null
          slug: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          tags: string[] | null
          telegram_url: string | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string | null
          view_count: number | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          category_data?: Json | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          facebook_url?: string | null
          featured_image_url?: string | null
          google_business_url?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: string | null
          instagram_url?: string | null
          is_curated?: boolean | null
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string | null
          owner_id?: string | null
          price_currency?: string | null
          price_from?: number | null
          price_to?: number | null
          published_at?: string | null
          region_id?: string | null
          short_description?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          tags?: string[] | null
          telegram_url?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          view_count?: number | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          category_data?: Json | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          facebook_url?: string | null
          featured_image_url?: string | null
          google_business_url?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: string | null
          instagram_url?: string | null
          is_curated?: boolean | null
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string | null
          owner_id?: string | null
          price_currency?: string | null
          price_from?: number | null
          price_to?: number | null
          published_at?: string | null
          region_id?: string | null
          short_description?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          tags?: string[] | null
          telegram_url?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          view_count?: number | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      user_role_view: {
        Row: {
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      views_daily_stats: {
        Row: {
          day: string | null
          entity_id: string | null
          entity_type: string | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _policy_role_ident: { Args: { role_name: string }; Returns: string }
      admin_delete_listings: {
        Args: { listing_ids: string[] }
        Returns: undefined
      }
      admin_set_user_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      admin_owner_crm_summaries: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_sort?: string
          p_status_filter?: string
        }
        Returns: Json
      }
      approve_claim_and_assign_listing: {
        Args: { _claim_id: string; _listing_id: string; _reviewer_id: string }
        Returns: Json
      }
      archive_past_event_listings: { Args: never; Returns: undefined }
      can_access_thread: {
        Args: { _thread_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_categories: { Args: never; Returns: boolean }
      can_manage_content: { Args: never; Returns: boolean }
      can_manage_regions: { Args: never; Returns: boolean }
      check_admin_rate_limit: {
        Args: {
          _max_operations: number
          _operation_type: string
          _user_id: string
          _window_hours?: number
        }
        Returns: Json
      }
      cleanup_newsletter_rate_limits: { Args: never; Returns: undefined }
      cleanup_old_analytics_events: { Args: never; Returns: number }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_old_view_tracking: { Args: never; Returns: number }
      cleanup_tracking: { Args: { days: number }; Returns: undefined }
      cleanup_view_tracking: { Args: { days: number }; Returns: undefined }
      get_jwt_role: { Args: never; Returns: string }
      get_listing_contact_for_user: {
        Args: { _listing_id: string; _user_id: string }
        Returns: Json
      }
      get_owner_subscription_status: {
        Args: { _owner_id: string }
        Returns: Json
      }
      get_public_profile: { Args: { _profile_id: string }; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_en_translation: {
        Args: {
          p_desc: string
          p_seo_desc: string
          p_seo_title: string
          p_short: string
          p_title: string
        }
        Returns: string
      }
      increment_blog_views:
        | { Args: { _post_id: string }; Returns: undefined }
        | { Args: { _post_id: string; _session_id: string }; Returns: boolean }
      increment_listing_views:
        | { Args: { _listing_id: string }; Returns: undefined }
        | {
            Args: { _listing_id: string; _session_id: string }
            Returns: boolean
          }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_editor:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      is_listing_owner: {
        Args: { _listing_id: string; _user_id: string }
        Returns: boolean
      }
      jwt_role: { Args: never; Returns: string }
      log_sensitive_access: {
        Args: {
          _action: string
          _details?: Json
          _resource_id?: string
          _resource_type: string
        }
        Returns: undefined
      }
      mask_ip_address: { Args: { ip: unknown }; Returns: string }
      owner_has_whatsapp: { Args: { _owner_id: string }; Returns: boolean }
      refresh_all_segment_counts: { Args: never; Returns: undefined }
      subscribe_newsletter: {
        Args: {
          _email: string
          _full_name?: string
          _ip_hash?: string
          _source?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "owner" | "viewer_logged"
      automation_status: "active" | "paused" | "draft"
      automation_trigger_type:
        | "signup"
        | "tag_added"
        | "segment_joined"
        | "manual"
        | "date_based"
      blog_category:
        | "lifestyle"
        | "travel-guides"
        | "food-wine"
        | "golf"
        | "real-estate"
        | "events"
        | "wellness"
        | "insider-tips"
      blog_status: "draft" | "scheduled" | "published"
      email_campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "paused"
        | "cancelled"
      email_contact_status:
        | "subscribed"
        | "unsubscribed"
        | "bounced"
        | "complained"
      email_event_type:
        | "delivered"
        | "opened"
        | "clicked"
        | "bounced"
        | "complained"
        | "unsubscribed"
      event_status:
        | "draft"
        | "pending_review"
        | "published"
        | "rejected"
        | "cancelled"
      listing_status:
        | "draft"
        | "pending_review"
        | "published"
        | "rejected"
        | "archived"
      listing_tier: "unverified" | "verified" | "signature"
      message_status: "unread" | "read" | "replied" | "archived"
      translation_status:
        | "missing"
        | "queued"
        | "auto"
        | "reviewed"
        | "edited"
        | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "owner", "viewer_logged"],
      automation_status: ["active", "paused", "draft"],
      automation_trigger_type: [
        "signup",
        "tag_added",
        "segment_joined",
        "manual",
        "date_based",
      ],
      blog_category: [
        "lifestyle",
        "travel-guides",
        "food-wine",
        "golf",
        "real-estate",
        "events",
        "wellness",
        "insider-tips",
      ],
      blog_status: ["draft", "scheduled", "published"],
      email_campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "paused",
        "cancelled",
      ],
      email_contact_status: [
        "subscribed",
        "unsubscribed",
        "bounced",
        "complained",
      ],
      email_event_type: [
        "delivered",
        "opened",
        "clicked",
        "bounced",
        "complained",
        "unsubscribed",
      ],
      event_status: [
        "draft",
        "pending_review",
        "published",
        "rejected",
        "cancelled",
      ],
      listing_status: [
        "draft",
        "pending_review",
        "published",
        "rejected",
        "archived",
      ],
      listing_tier: ["unverified", "verified", "signature"],
      message_status: ["unread", "read", "replied", "archived"],
      translation_status: [
        "missing",
        "queued",
        "auto",
        "reviewed",
        "edited",
        "failed",
      ],
    },
  },
} as const
