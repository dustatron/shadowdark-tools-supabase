"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  EquipmentCreateInput,
  EquipmentUpdateInput,
} from "@/lib/schemas/equipment";
import type { UserEquipment } from "@/lib/types/equipment";

// Create equipment mutation
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EquipmentCreateInput) => {
      const response = await fetch("/api/user/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create equipment");
      }

      return response.json() as Promise<UserEquipment>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["user-equipment"] });
      toast.success("Equipment created successfully");
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create equipment");
    },
  });
}

// Update equipment mutation
export function useUpdateEquipment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EquipmentUpdateInput) => {
      const response = await fetch(`/api/user/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update equipment");
      }

      return response.json() as Promise<UserEquipment>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment", id] });
      queryClient.invalidateQueries({ queryKey: ["user-equipment"] });
      toast.success("Equipment updated successfully");
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update equipment");
    },
  });
}

// Delete equipment mutation
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/user/equipment/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete equipment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["user-equipment"] });
      toast.success("Equipment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete equipment");
    },
  });
}
