import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChatBox } from "@/components/shared/ChatBox";
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
      <div className="min-h-screen bg-rice-paper pb-6">
        <AppHeader title="Review Listing" subtitle="Confirm your scrap details" moduleColor="citizen" showBack onBack={() => setStep("select")} icon={<Recycle className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl space-y-6">
          <Card className="border-0 shadow-xl overflow-hidden rounded-3xl">
            <div className="bg-gradient-eco p-6 text-white text-center">
              <Scale className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h2 className="text-2xl font-display font-bold">Checkout Estimate</h2>
              <p className="text-white/80">Dealers will contact you to confirm final price</p>
            </div>
            <CardContent className="p-6 md:p-8 space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border/50">
                  <div>
                    <p className="font-semibold text-base">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.weight} kg × ₹{item.pricePerKg}/kg</p>
                  </div>
                  <p className="font-bold text-lg text-clay">₹{item.weight * item.pricePerKg}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-6 border-t mt-4">
                <span className="font-bold text-xl">Total Estimate</span>
                <span className="text-4xl font-display font-bold text-clay">₹{totalEstimate}</span>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-gradient-eco hover:shadow-lg transition-shadow" size="lg" disabled={createListing.isPending} onClick={handleSubmitListing}>
            {createListing.isPending ? "Creating Listing..." : "Submit Listing"}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rice-paper pb-6">
      <AppHeader title="Sell Scrap" subtitle="Select items and get best prices" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<Recycle className="h-6 w-6 text-white" />} />
      
      <main className="container mx-auto px-4 py-8 md:py-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* LEFT COLUMN: The Marketplace & Scrap Form */}
          <div className="md:col-span-7 outer-column space-y-6 md:space-y-8">
            <h2 className="text-2xl font-display font-bold hidden md:block">Scrap Marketplace</h2>
            <ImageUpload
              onImageSelect={(file, preview) => { setImageFile(file); setImagePreview(preview); }}
              currentImage={imagePreview || undefined}
              onImageRemove={() => { setImageFile(null); setImagePreview(null); }}
              label="Scrap Photo (optional)"
              description="Helps dealers assess your scrap condition"
            />

            {isLoading ? (
              <p className="text-center text-muted-foreground py-8 animate-pulse">Loading real-time prices...</p>
            ) : Object.entries(grouped).map(([category, categoryItems]) => {
              const Icon = categoryIcons[category] || Recycle;
              return (
                <Card key={category} className="border-0 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3 border-b bg-muted/20">
                    <CardTitle className="text-lg font-display flex items-center gap-2 capitalize">
                      <Icon className="h-5 w-5 text-clay" />{category === "ewaste" ? "E-Waste" : category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {(categoryItems as any[]).map((item, j) => {
                      const existing = items.find(i => i.name === item.item_name);
                      return (
                        <div key={j} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-colors gap-3">
                          <div>
                            <p className="text-base font-medium">{item.item_name}</p>
                            <p className="text-sm text-clay font-mono font-semibold">₹{item.price_per_kg}/kg</p>
                          </div>
                          {existing ? (
                            <div className="flex items-center gap-2 bg-rice-paper p-1.5 rounded-lg border shadow-sm self-start sm:self-auto">
                              <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-destructive hover:text-white transition-colors" onClick={() => updateWeight(item.item_name, -1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center font-mono font-bold text-base">{existing.weight}</span>
                              <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-primary hover:text-white transition-colors" onClick={() => updateWeight(item.item_name, 1)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                              <span className="text-xs text-muted-foreground font-medium ml-1">kg</span>
                            </div>
                          ) : (
                            <Button variant="outline" className="self-start sm:self-auto border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary transition-all" onClick={() => addItem(item.item_name, category, Number(item.price_per_kg))}>
                              <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Active Basket & Past Listings */}
          <div className="md:col-span-5 space-y-6 md:space-y-8">
            <div className="sticky top-24 space-y-6">
              
              {/* Conditional Active Basket (E-commerce Style checkout cart) */}
              {items.length > 0 && (
                <Card className="border-2 border-eco-green/40 shadow-lg bg-moss/5 ring-1 ring-eco-green/10 animate-in zoom-in-95 duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-display text-moss flex items-center gap-2">
                      <Truck className="h-5 w-5" /> Current Basket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex items-end justify-between mb-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">{items.length} items grouped</p>
                        <p className="text-xs text-muted-foreground">{items.reduce((s, i) => s + i.weight, 0)} kg total</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Estate</p>
                         <p className="text-4xl font-display font-bold text-clay drop-shadow-sm">₹{totalEstimate}</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-eco text-lg h-12 shadow-md hover:shadow-xl transition-all" onClick={() => setStep("review")}>
                      Review Layout <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* History / Existing listings */}
              {(myListings || []).length > 0 && (
                <Card className="border-timber/30 shadow-soft rounded-[1.5rem] bg-muted/10">
                  <CardHeader className="pb-3 border-b"><CardTitle className="text-lg font-display">Your Listings</CardTitle></CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {(myListings || []).map((listing: any) => (
                      <div key={listing.id} className="flex flex-col p-4 rounded-xl bg-rice-paper border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-base font-semibold text-primary">₹{listing.total_estimate}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{listing.total_weight}kg • {new Date(listing.created_at).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={listing.status} size="sm" />
                        </div>
                        
                        {listing.status === "accepted" && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-clay"><MessageCircle className="h-4 w-4" /> Live Negotiation</p>
                            <ChatBox referenceId={listing.id} receiverId={listing.dealer_id} />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CitizenScrapSell;
