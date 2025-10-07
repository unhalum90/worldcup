declare module '@supabase/ssr' {
  // Minimal typing for createServerClient used in this project
  export function createServerClient(url: string, key: string, opts?: any): any;
  export {}; 
}
