import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto max-w-7xl h-[calc(100vh-5rem)] py-4">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full rounded-lg border"
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <DashboardNav />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <div className="p-6 h-full overflow-auto">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
