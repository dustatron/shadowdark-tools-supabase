import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/favorites/monsters");
}
