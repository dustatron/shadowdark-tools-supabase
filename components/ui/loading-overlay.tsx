import { Spinner } from "./spinner";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-white" />
        {message && (
          <p className="text-sm text-white" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
