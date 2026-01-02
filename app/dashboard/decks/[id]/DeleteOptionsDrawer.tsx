import { Button } from "@/components/primitives/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/primitives/drawer";
import { Trash2 } from "lucide-react";

type DeleteOptionsDrawer = {
  showDeleteDrawer: boolean;
  setShowDeleteDrawer: (isShowing: boolean) => void;
  isDeletePending: boolean;
  isRemoveAllPending: boolean;
  mutate: () => void;
  removeAll: () => void;
  itemCount: number;
};

export function DeleteOptionsDrawer({
  showDeleteDrawer,
  setShowDeleteDrawer,
  isDeletePending,
  isRemoveAllPending,
  mutate,
  removeAll,
  itemCount,
}: DeleteOptionsDrawer) {
  return (
    <Drawer
      open={showDeleteDrawer}
      onOpenChange={setShowDeleteDrawer}
      direction="right"
    >
      <DrawerContent className="bg-background">
        <DrawerHeader>
          <DrawerTitle>Delete Options</DrawerTitle>
          <DrawerDescription>
            Choose what you&apos;d like to delete
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-3">
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => removeAll()}
            disabled={itemCount === 0 || isRemoveAllPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isRemoveAllPending
              ? "Deleting..."
              : `Delete All Cards (${itemCount})`}
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => mutate()}
            disabled={isDeletePending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeletePending ? "Deleting..." : "Delete Entire Deck"}
          </Button>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
