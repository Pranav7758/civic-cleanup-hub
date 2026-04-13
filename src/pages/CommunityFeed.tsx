import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommunityFeed } from "@/hooks/useCommunity";
import { Heart, MessageCircle, Share2, Sparkles, Building, Loader2 } from "lucide-react";

export default function CommunityFeed() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useCommunityFeed();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    const newLikes = new Set(likedPosts);
    if (newLikes.has(id)) newLikes.delete(id);
    else newLikes.add(id);
    setLikedPosts(newLikes);
  };

  return (
    <div className="min-h-screen bg-rice-paper pb-20">
      <AppHeader
        title="Community Feed"
        subtitle="See the real impact!"
        moduleColor="citizen"
        showBack
        onBack={() => navigate(-1)}
        icon={<Sparkles className="h-5 w-5 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-2xl space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold">Transparency Hub</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Watch as your contributions directly touch lives. NGOs post proof of their
            distributions here to ensure absolute accountability.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        ) : (posts || []).length === 0 ? (
          <div className="text-center p-12 bg-muted/30 rounded-3xl border border-dashed">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-muted-foreground">No posts yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to donate and generate a transparency post!
            </p>
          </div>
        ) : (
          (posts || []).map((post: any) => (
            <Card key={post.id} className="border-timber/30 shadow-soft rounded-[1.5rem] overflow-hidden bg-white">
              <CardHeader className="p-4 flex flex-row items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={post.ngo_avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {post.ngo_name?.charAt(0) || "N"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-none">{post.ngo_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.created_at).toLocaleDateString()} at{" "}
                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </CardHeader>
              
              {/* Image Content */}
              <div className="w-full bg-muted aspect-square sm:aspect-video relative overflow-hidden">
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full h-full object-cover"
                />
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      likedPosts.has(post.id) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                  </button>
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-6 w-6" />
                  </button>
                  <button className="text-muted-foreground hover:text-primary transition-colors ml-auto">
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>

                {/* Likes count */}
                <p className="font-semibold text-sm">
                  {post.likes_count + (likedPosts.has(post.id) ? 1 : 0)} likes
                </p>

                {/* Content with highlighted tag */}
                <div className="text-sm leading-relaxed">
                  <span className="font-semibold mr-2">{post.ngo_name}</span>
                  {post.content}
                </div>
                
                {post.citizen_name && (
                  <p className="text-xs text-muted-foreground">
                    Donation facilitated via <span className="font-bold text-primary">@{post.citizen_name}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
