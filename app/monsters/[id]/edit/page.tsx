'use client';

import { useState, useEffect } from 'react';
import { Container, Title, LoadingOverlay, Alert } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { MonsterCreateEditForm } from '@/src/components/monsters/MonsterCreateEditForm';
import { IconAlertCircle } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

export default function EditMonsterPage() {
  const params = useParams();
  const router = useRouter();
  const monsterId = params?.id as string;

  const [monster, setMonster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (monsterId) {
      fetchMonster();
    }
  }, [monsterId]);

  const fetchMonster = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if user is authenticated
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/monsters/${monsterId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Monster not found');
        } else {
          setError('Failed to load monster');
        }
        return;
      }

      const data = await response.json();

      // Check if user owns this monster
      if (data.user_id !== user.id) {
        setError('You can only edit your own monsters');
        return;
      }

      setMonster(data);
    } catch (err) {
      console.error('Error fetching monster:', err);
      setError('An error occurred while loading the monster');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl" pos="relative" mih={400}>
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Edit Monster
      </Title>
      {monster && (
        <MonsterCreateEditForm
          mode="edit"
          initialData={{ ...monster, id: monsterId }}
          onCancel={() => router.push(`/monsters/${monsterId}`)}
        />
      )}
    </Container>
  );
}