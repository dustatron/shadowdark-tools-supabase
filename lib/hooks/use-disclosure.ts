import { useState, useCallback } from "react";

/**
 * Custom hook for managing disclosure state (modals, drawers, dropdowns, etc.)
 * Replacement for Mantine's useDisclosure hook
 *
 * @param initialState - Initial open/closed state (default: false)
 * @returns Object with state and control functions
 *
 * @example
 * ```tsx
 * const { opened, open, close, toggle } = useDisclosure();
 *
 * return (
 *   <>
 *     <Button onClick={open}>Open Modal</Button>
 *     <Dialog open={opened} onOpenChange={(open) => open ? open() : close()}>
 *       <DialogContent>
 *         <Button onClick={close}>Close</Button>
 *       </DialogContent>
 *     </Dialog>
 *   </>
 * );
 * ```
 */
export function useDisclosure(initialState = false) {
  const [opened, setOpened] = useState(initialState);

  const open = useCallback(() => {
    setOpened(true);
  }, []);

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  const toggle = useCallback(() => {
    setOpened((prev) => !prev);
  }, []);

  return {
    opened,
    open,
    close,
    toggle,
    setOpened,
  };
}
