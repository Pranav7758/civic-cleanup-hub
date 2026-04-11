import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useTrainingModules() {
  return useQuery({
    queryKey: ["training-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_modules")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useTrainingProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["training-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_progress")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateTrainingProgress() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, progress }: { moduleId: string; progress: number }) => {
      const completed = progress >= 100;
      const { data, error } = await supabase
        .from("training_progress")
        .upsert({
          user_id: user!.id,
          module_id: moduleId,
          progress: Math.min(progress, 100),
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        }, { onConflict: "user_id,module_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training-progress"] });
    },
  });
}
