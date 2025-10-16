"use client";

import { AppShell, Container } from "@mantine/core";
import { Header } from "@/src/components/layout/Header";
import { ReactNode, useEffect, useState } from "react";
import { createSupabaseClient } from "@/src/lib/supabase/client";
import { notifications } from "@mantine/notifications";

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
  const supabase = createSupabaseClient();

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
      notifications.show({
        title: "Success",
        message: "Logged out successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      notifications.show({
        title: "Error",
        message: "Failed to sign out",
        color: "red",
      });
    }
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header user={user} onLogout={handleLogout} />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl" py="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
