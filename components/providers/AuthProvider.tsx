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
import { User } from "@supabase/supabase-js";
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
}

const PROFILE_FETCH_TIMEOUT = 3000;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
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
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout | undefined;

    // Single source of truth: client-side getUser() validates with Supabase Auth
    const getInitialUser = async () => {
      try {
        logger.debug("Fetching user from Supabase Auth");
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error) {
          logger.warn("getUser error:", error.message);
          setUser(null);
          setLoading(false);
          return;
        }

        if (authUser) {
          timeoutId = setTimeout(() => {
            abortController.abort();
          }, PROFILE_FETCH_TIMEOUT);

          const userData = await fetchUserProfile(
            authUser,
            abortController.signal,
          );

          clearTimeout(timeoutId);

          if (mounted) {
            logger.debug("Setting user data:", userData);
            setUser(userData);
          }
        } else {
          setUser(null);
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        logger.error("Error getting user:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialUser();

    // Listen to auth state changes (login/logout/token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      logger.debug("Auth state change:", event);

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
      // Ignore INITIAL_SESSION - we handle it in getInitialUser
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      abortController.abort();
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
