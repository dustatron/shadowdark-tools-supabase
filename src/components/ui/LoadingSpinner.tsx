'use client';

import { Loader, Center, Stack, Text } from '@mantine/core';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  centered?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  centered = true
}: LoadingSpinnerProps) {
  const content = (
    <Stack align="center" gap="md">
      <Loader size={size} />
      {message && (
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      )}
    </Stack>
  );

  if (centered) {
    return <Center py="xl">{content}</Center>;
  }

  return content;
}