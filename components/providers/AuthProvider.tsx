"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";

export interface UserData {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
  username_slug?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: UserData | null;
}

const PROFILE_FETCH_TIMEOUT = 3000;

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(initialUser ?? null);
  const [loading, setLoading] = useState(false); // Server provides initial state, no loading needed
  const supabase = createClient();

  const fetchUserProfile = useCallback(
    async (authUser: User, signal?: AbortSignal): Promise<UserData> => {
      logger.debug("Fetching user profile for:", authUser.id);

      let username_slug: string | undefined;

      try {
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("username_slug")
          .eq("id", authUser.id)
          .abortSignal(signal as AbortSignal)
          .single();

        if (!error && profile) {
          username_slug = profile.username_slug;
          logger.debug("Found username_slug:", username_slug);
        }
      } catch (error) {
        // Silently fail if query aborted or fails
        if (error instanceof Error && error.name !== "AbortError") {
          logger.warn("Could not fetch username_slug:", error.message);
        }
      }

      return {
        id: authUser.id,
        email: authUser.email!,
        display_name: authUser.user_metadata?.display_name,
        role: authUser.app_metadata?.role,
        username_slug,
      };
    },
    [supabase],
  );

  useEffect(() => {
    let mounted = true;

    // Listen to auth state changes (login/logout/token refresh)
    // Initial user comes from server, so we only need to react to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        logger.debug("Auth state change:", event, "session:", !!session);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            const userData = await fetchUserProfile(session.user);
            if (mounted) {
              setUser(userData);
              setLoading(false);
            }
          }
        } else if (event === "SIGNED_OUT") {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
        // INITIAL_SESSION is handled by server-provided initialUser
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      logger.error("Error signing out:", error);
      throw error;
    }
  }, [supabase]);

  const value: AuthContextType = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
