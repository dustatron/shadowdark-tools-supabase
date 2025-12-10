"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:gap-4 group-[.toaster]:p-4 group-[.toaster]:pr-12 group-[.toaster]:min-h-[56px] group-[.toaster]:shadow-lg",
          closeButton:
            "!left-auto !right-3 !top-3 !bg-transparent hover:!bg-accent !text-foreground/60 hover:!text-foreground !border-0 !shadow-none",
          title: "font-medium text-sm",
          description: "text-sm opacity-90",
          actionButton:
            "!bg-primary !text-primary-foreground hover:!bg-primary/90",
          cancelButton: "!bg-muted !text-muted-foreground hover:!bg-muted/80",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
