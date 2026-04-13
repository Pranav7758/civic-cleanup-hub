import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

export const useCommunityFeed = () => {
  return useQuery({
    queryKey: ["communityFeed"],
    queryFn: async () => {
      const { data } = await apiClient.getCommunityFeed();
      return data || [];
    },
  });
};

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      donation_id,
      citizen_id,
      content,
      image_url,
    }: {
      donation_id?: string;
      citizen_id: string;
      content: string;
      image_url: string;
    }) => {
      return apiClient.createCommunityPost(donation_id, citizen_id, content, image_url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityFeed"] });
      toast({
        title: "Post Published! 🎉",
        description: "Your transparency proof is now live on the feed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish post.",
        variant: "destructive",
      });
    },
  });
};
