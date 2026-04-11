import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "./useAuth";

export function useCleanlinessScore() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cleanliness-score", user?.id],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("cleanliness_scores")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useWalletTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet-transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useGovernmentBenefits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["government-benefits", user?.id],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("government_benefits")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRedeemItems() {
  return useQuery({
    queryKey: ["redeem-items"],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("redeem_items")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data;
    },
  });
}
