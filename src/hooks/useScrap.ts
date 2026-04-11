import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useScrapPrices() {
  return useQuery({
    queryKey: ["scrap-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrap_prices")
        .select("*")
        .order("category");
      if (error) throw error;
      return data;
    },
  });
}

export function useMyScrapListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scrap-listings", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrap_listings")
        .select("*, items:scrap_listing_items(*)")
        .eq("citizen_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDealerListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scrap-listings", "dealer", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrap_listings")
        .select("*, items:scrap_listing_items(*), citizen:profiles!scrap_listings_citizen_id_fkey(full_name, phone, address)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateScrapListing() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (listing: {
      image_url?: string;
      items: { item_name: string; category: string; weight_kg: number; price_per_kg: number }[];
      latitude?: number;
      longitude?: number;
      address?: string;
    }) => {
      const totalEstimate = listing.items.reduce((sum, i) => sum + i.weight_kg * i.price_per_kg, 0);
      const totalWeight = listing.items.reduce((sum, i) => sum + i.weight_kg, 0);

      const { data: sl, error: slError } = await supabase
        .from("scrap_listings")
        .insert({
          citizen_id: user!.id,
          image_url: listing.image_url,
          total_estimate: totalEstimate,
          total_weight: totalWeight,
          latitude: listing.latitude,
          longitude: listing.longitude,
          address: listing.address,
        })
        .select()
        .single();
      if (slError) throw slError;

      const itemsToInsert = listing.items.map((item) => ({
        listing_id: sl.id,
        ...item,
      }));

      const { error: itemsError } = await supabase
        .from("scrap_listing_items")
        .insert(itemsToInsert);
      if (itemsError) throw itemsError;

      return sl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scrap-listings"] });
    },
  });
}
