"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseListOperationsParams {
  userId: string;
  entityId?: string;
  entityType?: "monster" | "spell" | "magic_item" | "equipment";
}

interface UserList {
  id: string;
  title: string;
  description: string | null;
  item_count?: number;
  created_at: string;
  user_id: string;
}

export function useListOperations({
  userId,
  entityId,
  entityType,
}: UseListOperationsParams) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [sessionReady, setSessionReady] = useState(false);

  // Ensure Supabase session is ready before querying
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
    };
    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionReady(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch user lists with item counts
  const { data: lists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ["lists", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("adventure_lists")
        .select(
          `
          id,
          title,
          description,
          created_at,
          user_id
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching lists:", error);
        throw error;
      }
      return data as UserList[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId && sessionReady, // Only run when session is ready
  });

  // Fetch which lists contain this entity
  const { data: existingListIds = [] } = useQuery({
    queryKey: ["list-contains", entityType, entityId],
    queryFn: async () => {
      if (!entityId || !entityType) return [];

      const { data, error } = await supabase
        .from("adventure_list_items")
        .select("list_id")
        .eq("item_id", entityId)
        .eq("item_type", entityType)
        .in(
          "list_id",
          lists.map((l) => l.id),
        );

      if (error) throw error;
      return data.map((item: { list_id: string }) => item.list_id);
    },
    enabled: !!entityId && !!entityType && lists.length > 0,
  });

  // Create new list mutation
  const createListMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: newList, error } = await supabase
        .from("adventure_lists")
        .insert({
          user_id: userId,
          title: data.name,
          description: data.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", userId] });
    },
    onError: (error) => {
      console.error("Failed to create list:", error);
      toast.error("Failed to create list. Please try again.");
    },
  });

  // Add item to list mutation
  const addToListMutation = useMutation({
    mutationFn: async (data: {
      listId: string;
      entityId: string;
      entityType: "monster" | "spell" | "magic_item" | "equipment";
      quantity?: number;
    }) => {
      const { error } = await supabase.from("adventure_list_items").insert({
        list_id: data.listId,
        item_id: data.entityId,
        item_type: data.entityType,
        quantity: data.quantity || 1,
      });

      if (error) {
        // Check if it's a duplicate error
        if (error.code === "23505") {
          throw new Error("DUPLICATE");
        }
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      const list = lists.find((l) => l.id === variables.listId);
      queryClient.invalidateQueries({
        queryKey: ["list-contains", variables.entityType, variables.entityId],
      });
      toast.success(`Added to ${list?.title || "list"}`);
    },
    onError: (error: Error) => {
      if (error.message === "DUPLICATE") {
        toast.error("This item is already in the list");
      } else {
        console.error("Failed to add to list:", error);
        toast.error("Failed to add to list. Please try again.");
      }
    },
  });

  return {
    lists,
    existingListIds,
    isLoading: isLoadingLists,
    createList: createListMutation.mutateAsync,
    addToList: addToListMutation.mutateAsync,
    isCreating: createListMutation.isPending,
    isAdding: addToListMutation.isPending,
  };
}
