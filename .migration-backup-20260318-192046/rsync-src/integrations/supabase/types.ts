export type Json = any;

type AnyRow = Record<string, any>;

type TableDefinition<Row extends AnyRow = AnyRow> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
};

export interface Database {
  public: {
    Tables: {
      admin_notifications: TableDefinition<{
        id: string;
        owner_id: string | null;
        type: string | null;
        is_read: boolean | null;
        created_at: string | null;
        data: Json | null;
      }>;
      blog_posts: TableDefinition<{
        id: string;
        title: string;
        slug: string;
        excerpt?: string | null;
        content?: string | null;
        featured_image?: string | null;
        featured_image_url?: string | null;
        author_id?: string | null;
        category?: string | null;
        reading_time?: number | null;
        tags?: string[] | null;
        seo_title?: string | null;
        seo_description?: string | null;
        status?: string | null;
        created_at?: string | null;
        published_at?: string | null;
        updated_at?: string | null;
        [key: string]: any;
      }>;
      blog_comments: TableDefinition<{
        id: string;
        post_id: string;
        user_id: string;
        content: string;
        is_approved?: boolean | null;
        created_at?: string | null;
        updated_at?: string | null;
        [key: string]: any;
      }>;
      categories: TableDefinition<{
        id: string;
        name: string;
        slug: string;
        icon?: string | null;
        image_url?: string | null;
        short_description?: string | null;
        is_active?: boolean | null;
        [key: string]: any;
      }>;
      chat_messages: TableDefinition<{
        id: string;
        thread_id?: string | null;
        message_text?: string | null;
        sender_type?: string | null;
        delivery_status?: string | null;
        created_at?: string | null;
        [key: string]: any;
      }>;
      chat_threads: TableDefinition<{
        id: string;
        listing_id?: string | null;
        owner_id?: string | null;
        viewer_id?: string | null;
        contact_name?: string | null;
        contact_email?: string | null;
        status?: string | null;
        created_at?: string | null;
        [key: string]: any;
      }>;
      cities: TableDefinition<{
        id: string;
        name: string;
        slug?: string | null;
        municipality?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        is_active?: boolean | null;
        [key: string]: any;
      }>;
      email_contacts: TableDefinition<{
        id: string;
        owner_id?: string | null;
        email?: string | null;
        [key: string]: any;
      }>;
      events: TableDefinition<{
        id: string;
        title: string;
        slug: string;
        category?: string | null;
        status?: string | null;
        city_id?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        is_featured?: boolean | null;
        [key: string]: any;
      }>;
      global_settings: TableDefinition<{
        id?: string;
        key: string;
        value: Json | null;
        category?: string | null;
        [key: string]: any;
      }>;
      homepage_settings: TableDefinition<{
        id: string;
        key?: string | null;
        value?: Json | null;
        [key: string]: any;
      }>;
      listing_images: TableDefinition<{
        id: string;
        listing_id?: string | null;
        image_url?: string | null;
        url?: string | null;
        alt_text?: string | null;
        sort_order?: number | null;
        [key: string]: any;
      }>;
      listings: TableDefinition<{
        id: string;
        owner_id?: string | null;
        name: string;
        slug: string;
        status?: string | null;
        tier?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
        category_id?: string | null;
        city_id?: string | null;
        region_id?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        description?: string | null;
        short_description?: string | null;
        featured_image_url?: string | null;
        is_curated?: boolean | null;
        [key: string]: any;
      }>;
      owner_subscriptions: TableDefinition<{
        id: string;
        owner_id?: string | null;
        tier?: string | null;
        status?: string | null;
        [key: string]: any;
      }>;
      profiles: TableDefinition<{
        id: string;
        full_name?: string | null;
        avatar_url?: string | null;
        email?: string | null;
        phone?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
        [key: string]: any;
      }>;
      public_profiles: TableDefinition<{
        id: string;
        full_name?: string | null;
        avatar_url?: string | null;
        [key: string]: any;
      }>;
      regions: TableDefinition<{
        id: string;
        name: string;
        slug?: string | null;
        short_description?: string | null;
        image_url?: string | null;
        [key: string]: any;
      }>;
      user_roles: TableDefinition<{
        id?: string;
        role: string;
        [key: string]: any;
      }>;
    };
    Enums: {
      blog_category: string;
      blog_status: string;
    };
  };
}

type PublicTables = Database["public"]["Tables"];

export type Tables<Name extends keyof PublicTables> = PublicTables[Name]["Row"];
export type TablesInsert<Name extends keyof PublicTables> = PublicTables[Name]["Insert"];
export type TablesUpdate<Name extends keyof PublicTables> = PublicTables[Name]["Update"];
