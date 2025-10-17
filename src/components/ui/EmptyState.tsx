"use client";

import { Center, Stack, Text, Button, ThemeIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Center py="xl">
      <Stack align="center" gap="md" maw={400}>
        {icon && (
          <ThemeIcon size="xl" variant="light" color="gray">
            {icon}
          </ThemeIcon>
        )}

        <Stack align="center" gap="xs">
          <Text size="lg" fw={500} ta="center">
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed" ta="center">
              {description}
            </Text>
          )}
        </Stack>

        {action && (
          <Button
            leftSection={action.icon || <IconPlus size={16} />}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </Stack>
    </Center>
  );
}
