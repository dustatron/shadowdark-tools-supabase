import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";

export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logger.error("Error getting server user:", error);
    return null;
  }
}

/**
 * Gets validated user from Supabase Auth server.
 * Use this for protected routes that need security validation.
 */
export async function getServerSession() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.warn("getUser error:", error.message);
      return null;
    }

    return user ? { user } : null;
  } catch (error) {
    logger.error("Error getting server session:", error);
    return null;
  }
}

/**
 * Fast session check from cookies without server validation.
 * Use this only for non-security-critical checks like:
 * - Redirecting logged-in users away from login page
 * - UI hints that don't gate functionality
 * DO NOT use for protecting routes or data access.
 */
export async function getSessionFromCookies() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session ? { user: session.user } : null;
  } catch (error) {
    logger.error("Error getting session from cookies:", error);
    return null;
  }
}
