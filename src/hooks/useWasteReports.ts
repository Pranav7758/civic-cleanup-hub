import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "./useAuth";

export function useMyReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["waste-reports", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("waste_reports")
        .select("*")
        .eq("citizen_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useWorkerTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["waste-reports", "worker", user?.id],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("waste_reports")
        .select("*, citizen:profiles!waste_reports_citizen_id_fkey(full_name, phone)")
        .or(`status.eq.pending,assigned_worker_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllReports() {
  return useQuery({
    queryKey: ["waste-reports", "all"],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("waste_reports")
        .select("*, citizen:profiles!waste_reports_citizen_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (report: {
      image_url?: string;
      waste_type: string;
      description?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    }) => {
      const { data, error } = await apiClient
        .from("waste_reports")
        .insert({ ...report, citizen_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waste-reports"] });
    },
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await apiClient
        .from("waste_reports")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waste-reports"] });
    },
  });
}

export async function uploadImage(file: File, bucket: string): Promise<string> {
  return apiClient.uploadImage(file, bucket);
}
