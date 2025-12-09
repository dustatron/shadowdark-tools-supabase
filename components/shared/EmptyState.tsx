"use client";

import { Button } from "@/components/primitives/button";
import { FileQuestion, Plus } from "lucide-react";
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
  const IconComponent = icon || <FileQuestion className="h-8 w-8" />;

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="rounded-full bg-muted p-4 text-muted-foreground">
          {IconComponent}
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {action && (
          <Button onClick={action.onClick}>
            {action.icon || <Plus className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
