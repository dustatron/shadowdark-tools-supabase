"use client";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  mode: "create" | "edit";
  isSubmitting: boolean;
  onCancel: () => void;
}

export function FormActions({
  mode,
  isSubmitting,
  onCancel,
}: FormActionsProps) {
  return (
    <div className="sticky bottom-4 md:static flex justify-end gap-2 bg-background p-4 md:p-0 rounded-lg shadow-lg md:shadow-none border md:border-0 -mx-4 md:mx-0">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isSubmitting}
        className="min-h-[44px]"
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting} className="min-h-[44px]">
        {isSubmitting
          ? "Saving..."
          : mode === "create"
            ? "Create Monster"
            : "Save Changes"}
      </Button>
    </div>
  );
}
