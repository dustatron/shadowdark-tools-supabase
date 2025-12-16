"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Form } from "@/components/primitives/form";
import { createMonsterSchema } from "@/lib/validations/monster";
import { logger } from "@/lib/utils/logger";

import {
  monsterFormSchema,
  MonsterFormData,
  MonsterCreateEditFormProps,
} from "./types";
import { BasicInfoSection } from "./BasicInfoSection";
import { AbilityScoresSection } from "./AbilityScoresSection";
import { AttacksSection } from "./AttacksSection";
import { AbilitiesSection } from "./AbilitiesSection";
import { AdditionalDetailsSection } from "./AdditionalDetailsSection";
import { FormActions } from "./FormActions";

export function MonsterCreateEditForm({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
}: MonsterCreateEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSpeed, setCustomSpeed] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({
    abilityScores: true,
    attacks: true,
    abilities: true,
    details: true,
  });

  const form = useForm<MonsterFormData>({
    resolver: zodResolver(monsterFormSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      challenge_level: initialData?.challenge_level || 1,
      hit_points: initialData?.hit_points || 4,
      armor_class: initialData?.armor_class || 12,
      speed: initialData?.speed || "near",
      customSpeed: "",
      attacks: initialData?.attacks || [],
      abilities: initialData?.abilities || [],
      treasure: initialData?.treasure || null,
      tags: initialData?.tags || { type: [], location: [] },
      source: initialData?.source || "Custom",
      author_notes: initialData?.author_notes || "",
      tactics: initialData?.tactics || "",
      wants: initialData?.wants || "",
      gm_notes: initialData?.gm_notes || "",
      icon_url: initialData?.icon_url || "",
      alignment: initialData?.alignment || "N",
      strength_mod: initialData?.strength_mod || 0,
      dexterity_mod: initialData?.dexterity_mod || 0,
      constitution_mod: initialData?.constitution_mod || 0,
      intelligence_mod: initialData?.intelligence_mod || 0,
      wisdom_mod: initialData?.wisdom_mod || 0,
      charisma_mod: initialData?.charisma_mod || 0,
      is_public: initialData?.is_public ?? false,
    },
  });

  const handleSubmit = async (values: MonsterFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare the data
      const submitData = {
        ...values,
        speed:
          values.speed === "custom" ? values.customSpeed || "" : values.speed,
        icon_url: values.icon_url || undefined,
      };

      // Remove customSpeed field
      const { customSpeed: _, ...finalData } = submitData;

      if (onSubmit) {
        await onSubmit(finalData as z.infer<typeof createMonsterSchema>);
      } else {
        const url =
          mode === "edit" && initialData?.id
            ? `/api/monsters/${initialData.id}`
            : "/api/monsters";

        const method = mode === "edit" ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to ${mode} monster`);
        }

        const monster = await response.json();

        toast.success(
          `Monster ${mode === "create" ? "created" : "updated"} successfully!`,
          {
            icon: <Check className="h-4 w-4" />,
          },
        );

        router.push(`/monsters/${monster.id}`);
      }
    } catch (error) {
      logger.error(`Error ${mode}ing monster:`, error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${mode} monster`,
        {
          icon: <AlertCircle className="h-4 w-4" />,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <BasicInfoSection
          form={form}
          customSpeed={customSpeed}
          setCustomSpeed={setCustomSpeed}
        />

        <AbilityScoresSection
          form={form}
          isOpen={sectionsOpen.abilityScores}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, abilityScores: open }))
          }
        />

        <AttacksSection
          form={form}
          isOpen={sectionsOpen.attacks}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, attacks: open }))
          }
        />

        <AbilitiesSection
          form={form}
          isOpen={sectionsOpen.abilities}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, abilities: open }))
          }
        />

        <AdditionalDetailsSection
          form={form}
          isOpen={sectionsOpen.details}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, details: open }))
          }
        />

        <FormActions
          mode={mode}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </form>
    </Form>
  );
}

// Re-export types for consumers
export type { MonsterCreateEditFormProps, MonsterFormData } from "./types";
