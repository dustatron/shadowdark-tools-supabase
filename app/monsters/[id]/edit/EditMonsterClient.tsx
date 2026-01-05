"use client";

import { useRouter } from "next/navigation";
import { MonsterCreateEditForm } from "@/components/monsters/MonsterCreateEditForm";

interface EditMonsterClientProps {
  monster: any;
}

export function EditMonsterClient({ monster }: EditMonsterClientProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Monster</h1>
      <MonsterCreateEditForm
        mode="edit"
        initialData={monster}
        onCancel={() => router.push(`/monsters/${monster.id}`)}
      />
    </div>
  );
}
