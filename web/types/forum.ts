export interface Thread {
  id: string;
  city_slug?: string;
  title?: string;
  author_handle?: string;
  score?: number;
  created_at?: string;
  body_md?: string;
  topic?: string;
  pinned?: boolean; // optional: shown when available
}

export interface Post {
  id: string;
  thread_id?: string;
  body_md?: string;
  author_id?: string;
  created_at?: string;
  score?: number;
}
