"use client";

import { useState } from "react";
import { Copy, Check, Share2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPublic: boolean;
  publicSlug: string | null;
  onTogglePublic: (isPublic: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  isPublic,
  publicSlug,
  onTogglePublic,
  isLoading = false,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  const shareUrl =
    typeof window !== "undefined" && publicSlug
      ? `${window.location.origin}/encounter-tables/public/${publicSlug}`
      : "";

  const handleCopyUrl = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleTogglePublic = async (checked: boolean) => {
    setPendingState(checked);
    try {
      await onTogglePublic(checked);
      toast.success(
        checked ? "Table is now public and shareable" : "Table is now private",
      );
    } catch (error) {
      toast.error("Failed to update sharing settings");
      // Reset to previous state on error
      setPendingState(null);
    } finally {
      setPendingState(null);
    }
  };

  const effectiveIsPublic = pendingState ?? isPublic;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Encounter Table
          </DialogTitle>
          <DialogDescription>
            Make this table public to share it with others via a unique link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Public/Private toggle */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="public-toggle" className="flex flex-col space-y-1">
              <span className="font-medium">Public Access</span>
              <span className="text-sm text-muted-foreground font-normal">
                Anyone with the link can view this table
              </span>
            </Label>
            <Switch
              id="public-toggle"
              checked={effectiveIsPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isLoading || pendingState !== null}
            />
          </div>

          {/* Shareable URL (only shown when public) */}
          {effectiveIsPublic && shareUrl && (
            <div className="space-y-2">
              <Label htmlFor="share-url">Shareable Link</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border truncate">
                  {shareUrl}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyUrl}
                  disabled={!shareUrl}
                  aria-label="Copy link to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Warning when making private */}
          {!effectiveIsPublic && isPublic && (
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Making this table private will break any existing shared links.
                People who have bookmarked or saved the link will no longer be
                able to access it.
              </AlertDescription>
            </Alert>
          )}

          {/* Info when making public */}
          {effectiveIsPublic && !isPublic && (
            <Alert variant="default">
              <AlertDescription>
                Making this table public will generate a unique shareable link.
                Anyone with this link will be able to view (but not edit) your
                encounter table.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || pendingState !== null}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
