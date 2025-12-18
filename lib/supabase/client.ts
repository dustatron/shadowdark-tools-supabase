import { createBrowserClient } from "@supabase/ssr";

// Create a new client each time - this is the recommended pattern from Supabase
// The @supabase/ssr package handles cookie management automatically
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );
}
