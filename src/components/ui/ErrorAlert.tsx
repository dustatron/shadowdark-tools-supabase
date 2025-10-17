"use client";

import { Alert, Button, Group } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "light" | "filled" | "outline";
}

export function ErrorAlert({
  title = "Error",
  message,
  onRetry,
  variant = "light",
}: ErrorAlertProps) {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={title}
      color="red"
      variant={variant}
    >
      <Group justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>{message}</div>
        {onRetry && (
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Group>
    </Alert>
  );
}
