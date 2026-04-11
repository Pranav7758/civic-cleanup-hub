import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useMyDonations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["donations", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*, ngo:profiles!donations_ngo_id_fkey(full_name)")
        .eq("citizen_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useNgoDonations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["donations", "ngo", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*, citizen:profiles!donations_citizen_id_fkey(full_name, phone, address)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateDonation() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (donation: {
      category: string;
      description?: string;
      image_url?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    }) => {
      const { data, error } = await supabase
        .from("donations")
        .insert({ ...donation, citizen_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["donations"] });
    },
  });
}

export function useUpdateDonation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from("donations")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["donations"] });
    },
  });
}
