'use client';

import { AppShell, Container } from '@mantine/core';
import { Header } from './Header';
import { ReactNode, useEffect, useState } from 'react';
import { createSupabaseClient } from '@/src/lib/supabase/client';
import { notifications } from '@mantine/notifications';

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser({
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        role: data.role,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load user profile',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      notifications.show({
        title: 'Success',
        message: 'Logged out successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to sign out',
        color: 'red',
      });
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
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