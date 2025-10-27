"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

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
  initialSession?: any;
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Get initial user - uses session from server if available, otherwise fetches from client
    const getInitialUser = async () => {
      try {
        // If we have an initial session from the server, use it directly
        if (initialSession?.user) {
          console.log("Using initial session from server");
          if (mounted) {
            await fetchUserProfile(initialSession.user);
          }
        } else {
          // Otherwise, get the session from the client
          console.log("Fetching session from client");
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (mounted) {
            if (session?.user) {
              await fetchUserProfile(session.user);
            } else {
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Error getting user:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialUser();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log("Fetching user profile for:", authUser.id);

      // Try to fetch user profile to get username_slug with timeout
      let username_slug: string | undefined;
      try {
        // Add a timeout to prevent hanging indefinitely
        const profilePromise = supabase
          .from("user_profiles")
          .select("username_slug")
          .eq("id", authUser.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile fetch timeout")), 3000),
        );

        const { data: profile } = (await Promise.race([
          profilePromise,
          timeoutPromise,
        ])) as any;

        username_slug = profile?.username_slug;
        console.log("Found username_slug:", username_slug);
      } catch (error) {
        // Silently fail if username_slug column doesn't exist yet or query times out
        console.log(
          "Could not fetch username_slug:",
          error instanceof Error ? error.message : "Unknown error",
        );
      }

      // Always set user data, even if profile fetch failed
      const userData = {
        id: authUser.id,
        email: authUser.email!,
        display_name: authUser.user_metadata?.display_name,
        role: authUser.app_metadata?.role,
        username_slug,
      };

      console.log("Setting user data:", userData);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback: set basic user data without profile info
      const userData = {
        id: authUser.id,
        email: authUser.email!,
        display_name: authUser.user_metadata?.display_name,
        role: authUser.app_metadata?.role,
      };
      console.log("Setting fallback user data:", userData);
      setUser(userData);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

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
