import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useEvents() {
  return useQuery({
    queryKey: ["community-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_events")
        .select("*")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useMyRegistrations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["event-registrations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*, event:community_events(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRegisterForEvent() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase
        .from("event_registrations")
        .insert({ event_id: eventId, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}
