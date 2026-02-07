export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      podcasts: {
        Row: {
          id: string;
          podcast_index_id: number | null;
          title: string;
          author: string;
          description: string;
          image: string;
          categories: string[];
          locked: boolean;
          medium: "podcast" | "music" | "video" | "audiobook";
          language: string;
          episode_count: number;
          license: string | null;
          location: string | null;
          feed_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          podcast_index_id?: number | null;
          title: string;
          author: string;
          description: string;
          image: string;
          categories?: string[];
          locked?: boolean;
          medium?: "podcast" | "music" | "video" | "audiobook";
          language?: string;
          episode_count?: number;
          license?: string | null;
          location?: string | null;
          feed_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          podcast_index_id?: number | null;
          title?: string;
          author?: string;
          description?: string;
          image?: string;
          categories?: string[];
          locked?: boolean;
          medium?: "podcast" | "music" | "video" | "audiobook";
          language?: string;
          episode_count?: number;
          license?: string | null;
          location?: string | null;
          feed_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      episodes: {
        Row: {
          id: string;
          podcast_id: string;
          podcast_index_id: number | null;
          title: string;
          description: string;
          date_published: string;
          duration: number;
          enclosure_url: string;
          image: string | null;
          season: number | null;
          episode: number | null;
          is_trailer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          podcast_index_id?: number | null;
          title: string;
          description: string;
          date_published: string;
          duration: number;
          enclosure_url: string;
          image?: string | null;
          season?: number | null;
          episode?: number | null;
          is_trailer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          podcast_index_id?: number | null;
          title?: string;
          description?: string;
          date_published?: string;
          duration?: number;
          enclosure_url?: string;
          image?: string | null;
          season?: number | null;
          episode?: number | null;
          is_trailer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          episode_id: string;
          start_time: number;
          end_time: number | null;
          title: string;
          img: string | null;
          url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          start_time: number;
          end_time?: number | null;
          title: string;
          img?: string | null;
          url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          start_time?: number;
          end_time?: number | null;
          title?: string;
          img?: string | null;
          url?: string | null;
          created_at?: string;
        };
      };
      transcript_segments: {
        Row: {
          id: string;
          episode_id: string;
          start_time: number;
          end_time: number;
          speaker: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          start_time: number;
          end_time: number;
          speaker: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          start_time?: number;
          end_time?: number;
          speaker?: string;
          text?: string;
          created_at?: string;
        };
      };
      soundbites: {
        Row: {
          id: string;
          episode_id: string;
          start_time: number;
          duration: number;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          start_time: number;
          duration: number;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          start_time?: number;
          duration?: number;
          title?: string;
          created_at?: string;
        };
      };
      persons: {
        Row: {
          id: string;
          name: string;
          role: "host" | "guest" | "editor" | "producer";
          group_name: string | null;
          img: string;
          href: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: "host" | "guest" | "editor" | "producer";
          group_name?: string | null;
          img: string;
          href?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: "host" | "guest" | "editor" | "producer";
          group_name?: string | null;
          img?: string;
          href?: string | null;
          created_at?: string;
        };
      };
      episode_persons: {
        Row: {
          episode_id: string;
          person_id: string;
          created_at: string;
        };
        Insert: {
          episode_id: string;
          person_id: string;
          created_at?: string;
        };
        Update: {
          episode_id?: string;
          person_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          episode_id: string;
          parent_id: string | null;
          user_id: string | null;
          author: string;
          author_avatar: string;
          text: string;
          platform: "mastodon" | "fountain" | "podcastindex" | "nostr";
          boost_amount: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          parent_id?: string | null;
          user_id?: string | null;
          author: string;
          author_avatar: string;
          text: string;
          platform: "mastodon" | "fountain" | "podcastindex" | "nostr";
          boost_amount?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          parent_id?: string | null;
          user_id?: string | null;
          author?: string;
          author_avatar?: string;
          text?: string;
          platform?: "mastodon" | "fountain" | "podcastindex" | "nostr";
          boost_amount?: number | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          created_at?: string;
        };
      };
      podcast_funding: {
        Row: {
          id: string;
          podcast_id: string;
          url: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          url: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          url?: string;
          message?: string;
          created_at?: string;
        };
      };
      value_configs: {
        Row: {
          id: string;
          podcast_id: string | null;
          episode_id: string | null;
          type: string;
          method: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id?: string | null;
          episode_id?: string | null;
          type?: string;
          method?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string | null;
          episode_id?: string | null;
          type?: string;
          method?: string;
          created_at?: string;
        };
      };
      value_recipients: {
        Row: {
          id: string;
          value_config_id: string;
          name: string;
          type: "wallet" | "host" | "guest" | "app";
          address: string;
          split: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          value_config_id: string;
          name: string;
          type: "wallet" | "host" | "guest" | "app";
          address: string;
          split: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          value_config_id?: string;
          name?: string;
          type?: "wallet" | "host" | "guest" | "app";
          address?: string;
          split?: number;
          created_at?: string;
        };
      };
      live_streams: {
        Row: {
          id: string;
          podcast_id: string;
          title: string;
          status: "live" | "scheduled" | "ended";
          start_time: string;
          listener_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          title: string;
          status?: "live" | "scheduled" | "ended";
          start_time: string;
          listener_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          title?: string;
          status?: "live" | "scheduled" | "ended";
          start_time?: string;
          listener_count?: number;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          live_stream_id: string;
          user_id: string | null;
          author: string;
          text: string;
          is_boost: boolean;
          boost_amount: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          live_stream_id: string;
          user_id?: string | null;
          author: string;
          text: string;
          is_boost?: boolean;
          boost_amount?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          live_stream_id?: string;
          user_id?: string | null;
          author?: string;
          text?: string;
          is_boost?: boolean;
          boost_amount?: number | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          user_id: string;
          podcast_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          podcast_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          podcast_id?: string;
          created_at?: string;
        };
      };
      listening_history: {
        Row: {
          id: string;
          user_id: string;
          episode_id: string;
          progress: number;
          last_played: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          episode_id: string;
          progress: number;
          last_played?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          episode_id?: string;
          progress?: number;
          last_played?: string;
          created_at?: string;
        };
      };
      user_wallets: {
        Row: {
          user_id: string;
          balance: number;
          streaming_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          streaming_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          balance?: number;
          streaming_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallet_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "boost" | "stream" | "topup";
          amount: number;
          recipient: string | null;
          message: string | null;
          episode_title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "boost" | "stream" | "topup";
          amount: number;
          recipient?: string | null;
          message?: string | null;
          episode_title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "boost" | "stream" | "topup";
          amount?: number;
          recipient?: string | null;
          message?: string | null;
          episode_title?: string | null;
          created_at?: string;
        };
      };
      social_interact: {
        Row: {
          id: string;
          episode_id: string;
          uri: string;
          protocol: "activitypub" | "twitter" | "nostr";
          account_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          uri: string;
          protocol: "activitypub" | "twitter" | "nostr";
          account_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          uri?: string;
          protocol?: "activitypub" | "twitter" | "nostr";
          account_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier access
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
