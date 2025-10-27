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

      // Try to fetch user profile to get username_slug
      // This may fail if the column doesn't exist yet
      let username_slug: string | undefined;
      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("username_slug")
          .eq("id", authUser.id)
          .single();
        username_slug = profile?.username_slug;
        console.log("Found username_slug:", username_slug);
      } catch (error) {
        // Silently fail if username_slug column doesn't exist yet
        console.log("Could not fetch username_slug, column may not exist yet");
      }

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
