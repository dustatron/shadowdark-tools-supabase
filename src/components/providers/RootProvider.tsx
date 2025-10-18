"use client";

import { Header } from "@/src/components/layout/Header";
import { MobileNav } from "@/src/components/layout/MobileNav";
import { ReactNode, useEffect, useState } from "react";
import { createSupabaseClient } from "@/src/lib/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface RootProviderProps {
  children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpened, setMobileOpened] = useState(false);
  const supabase = createSupabaseClient();

  const toggleMobile = () => setMobileOpened((prev) => !prev);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          display_name: session.user.user_metadata?.display_name,
          role: session.user.app_metadata?.role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={handleLogout}
        mobileOpened={mobileOpened}
        onToggleMobile={toggleMobile}
      />

      <MobileNav
        opened={mobileOpened}
        onClose={toggleMobile}
        user={user}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
