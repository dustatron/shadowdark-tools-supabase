import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
}

export async function getServerSession() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}
