import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/primitives/drawer";
import { Button } from "@/components/ui/button";
import { ExportLayout } from "./page";

type ExportDrawerProps = {
  exportLayout: ExportLayout;
  showExportDialog: boolean;
  setShowExportDialog: (string: boolean) => void;
  setExportLayout: (layout: ExportLayout) => void;
  isPending: boolean;
  mutate: (layout: ExportLayout) => void;
};

export function ExportDrawer({
  exportLayout,
  showExportDialog,
  setShowExportDialog,
  setExportLayout,
  isPending,
  mutate,
}: ExportDrawerProps) {
  return (
    <Drawer
      open={showExportDialog}
      onOpenChange={setShowExportDialog}
      direction="right"
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Export Deck as PDF</DrawerTitle>
          <DrawerDescription>
            Choose a layout for your PDF export
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:bg-accent transition-colors">
              <input
                type="radio"
                name="layout"
                value="grid"
                checked={exportLayout === "grid"}
                onChange={(e) => setExportLayout(e.target.value as "grid")}
                className="w-4 h-4 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium">Grid Layout (9 per page)</div>
                <div className="text-sm text-muted-foreground">
                  3x3 grid on 8.5&quot; x 11&quot; pages - efficient for
                  printing
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:bg-accent transition-colors">
              <input
                type="radio"
                name="layout"
                value="single"
                checked={exportLayout === "single"}
                onChange={(e) => setExportLayout(e.target.value as "single")}
                className="w-4 h-4 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium">Single Card Layout</div>
                <div className="text-sm text-muted-foreground">
                  One 2.5&quot; x 3.5&quot; card per page - easy to cut
                </div>
              </div>
            </label>
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={() => mutate(exportLayout)} disabled={isPending}>
            {isPending ? "Generating..." : "Export PDF"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
