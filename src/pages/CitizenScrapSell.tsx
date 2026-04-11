import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useScrapPrices, useCreateScrapListing, useMyScrapListings } from "@/hooks/useScrap";
import { uploadImage } from "@/hooks/useWasteReports";
import {
  Recycle, Newspaper, Box, Cpu, Scale, Plus, Minus, MapPin, Phone, MessageCircle, ChevronRight, Star, Truck, Clock, Navigation,
} from "lucide-react";
import { toast } from "sonner";

interface ScrapItem {
  name: string;
  category: string;
  weight: number;
  pricePerKg: number;
}

const categoryIcons: Record<string, React.ElementType> = { paper: Newspaper, plastic: Box, metal: Scale, ewaste: Cpu };

const CitizenScrapSell = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"select" | "review">("select");
  const [items, setItems] = useState<ScrapItem[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: prices, isLoading } = useScrapPrices();
  const { data: myListings } = useMyScrapListings();
  const createListing = useCreateScrapListing();

  // Group prices by category
  const grouped = (prices || []).reduce((acc: Record<string, any[]>, p: any) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  const addItem = (name: string, category: string, pricePerKg: number) => {
    const existing = items.find(i => i.name === name);
    if (existing) {
      setItems(items.map(i => i.name === name ? { ...i, weight: i.weight + 1 } : i));
    } else {
      setItems([...items, { name, category, weight: 1, pricePerKg }]);
    }
  };

  const updateWeight = (name: string, delta: number) => {
    setItems(items.map(i => {
      if (i.name === name) return { ...i, weight: Math.max(0, i.weight + delta) };
      return i;
    }).filter(i => i.weight > 0));
  };

  const totalEstimate = items.reduce((sum, i) => sum + i.weight * i.pricePerKg, 0);

  const handleSubmitListing = async () => {
    try {
      let image_url: string | undefined;
      if (imageFile) {
        image_url = await uploadImage(imageFile, "scrap-images");
      }

      await createListing.mutateAsync({
        image_url,
        items: items.map(i => ({
          item_name: i.name,
          category: i.category,
          weight_kg: i.weight,
          price_per_kg: i.pricePerKg,
        })),
      });

      toast.success("Scrap listing created! Dealers will be notified.");
      setItems([]);
      setImageFile(null);
      setImagePreview(null);
      setStep("select");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (step === "review") {
    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title="Review Listing" subtitle="Confirm your scrap details" moduleColor="citizen" showBack onBack={() => setStep("select")} icon={<Recycle className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Your Scrap Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.weight} kg × ₹{item.pricePerKg}/kg</p></div>
                  <p className="font-bold text-eco-amber">₹{item.weight * item.pricePerKg}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-semibold">Total Estimate</span>
                <span className="text-2xl font-display font-bold text-eco-amber">₹{totalEstimate}</span>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-gradient-eco" size="lg" disabled={createListing.isPending} onClick={handleSubmitListing}>
            {createListing.isPending ? "Creating..." : "Submit Listing"}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader title="Sell Scrap" subtitle="Select items and get best prices" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<Recycle className="h-6 w-6 text-white" />} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ImageUpload
          onImageSelect={(file, preview) => { setImageFile(file); setImagePreview(preview); }}
          currentImage={imagePreview || undefined}
          onImageRemove={() => { setImageFile(null); setImagePreview(null); }}
          label="Scrap Photo (optional)"
          description="Helps dealers assess your scrap"
        />

        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading prices...</p>
        ) : Object.entries(grouped).map(([category, categoryItems]) => {
          const Icon = categoryIcons[category] || Recycle;
          return (
            <Card key={category} className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2 capitalize">
                  <Icon className="h-5 w-5 text-eco-amber" />{category === "ewaste" ? "E-Waste" : category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(categoryItems as any[]).map((item, j) => {
                  const existing = items.find(i => i.name === item.item_name);
                  return (
                    <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{item.item_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">₹{item.price_per_kg}/kg</p>
                      </div>
                      {existing ? (
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateWeight(item.item_name, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-mono font-medium">{existing.weight}</span>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateWeight(item.item_name, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground w-12 text-right">kg</span>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => addItem(item.item_name, category, Number(item.price_per_kg))}>
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        {/* Existing listings */}
        {(myListings || []).length > 0 && (
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-base font-display">Your Listings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(myListings || []).map((listing: any) => (
                <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">₹{listing.total_estimate} • {listing.total_weight}kg</p>
                    <p className="text-xs text-muted-foreground">{new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={listing.status} size="sm" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {items.length > 0 && (
          <Card className="border-0 shadow-card sticky bottom-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{items.length} items • {items.reduce((s, i) => s + i.weight, 0)} kg</p>
                  <p className="text-2xl font-display font-bold text-eco-amber">₹{totalEstimate}</p>
                </div>
                <Button className="bg-gradient-eco" size="lg" onClick={() => setStep("review")}>
                  Review<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CitizenScrapSell;
