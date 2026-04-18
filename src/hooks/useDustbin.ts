import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "./useAuth";

export function useDustbinCollections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dustbin-collections", user?.id],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("dustbin_collections")
        .select("*")
        .eq("citizen_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useCollectDustbin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dustbinCode, fillLevel, notes }: { dustbinCode: string; fillLevel: string; notes?: string }) => {
      return apiClient.collectDustbinByCode(dustbinCode, fillLevel, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dustbin-collections"] });
      // Invalidate cleanliness score since total_collections might be updated
      qc.invalidateQueries({ queryKey: ["cleanliness-score"] });
    },
  });
}
