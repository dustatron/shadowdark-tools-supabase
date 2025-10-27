"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createSupabaseClient } from "@/src/lib/supabase/client";
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
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchUserProfile = async (authUser: User) => {
    try {
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
      } catch (error) {
        // Silently fail if username_slug column doesn't exist yet
        console.log("Could not fetch username_slug, column may not exist yet");
      }

      setUser({
        id: authUser.id,
        email: authUser.email!,
        display_name: authUser.user_metadata?.display_name,
        role: authUser.app_metadata?.role,
        username_slug,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser({
        id: authUser.id,
        email: authUser.email!,
        display_name: authUser.user_metadata?.display_name,
        role: authUser.app_metadata?.role,
      });
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
