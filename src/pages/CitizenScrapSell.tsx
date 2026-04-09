import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/layout/AppHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Recycle,
  Package,
  Newspaper,
  Box,
  Cpu,
  Scale,
  Plus,
  Minus,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  Star,
  IndianRupee,
  Truck,
  Clock,
  CheckCircle,
  Navigation,
} from "lucide-react";

interface ScrapItem {
  name: string;
  category: string;
  weight: number;
  pricePerKg: number;
}

const CitizenScrapSell = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"select" | "dealers" | "tracking">("select");
  const [items, setItems] = useState<ScrapItem[]>([]);
  const [image, setImage] = useState<string | null>(null);

  const scrapCategories = [
    {
      name: "Paper",
      icon: Newspaper,
      items: [
        { name: "Newspapers", pricePerKg: 15 },
        { name: "Cardboard", pricePerKg: 10 },
        { name: "Books/Magazines", pricePerKg: 12 },
      ],
    },
    {
      name: "Plastic",
      icon: Box,
      items: [
        { name: "PET Bottles", pricePerKg: 10 },
        { name: "HDPE Containers", pricePerKg: 15 },
        { name: "Mixed Plastic", pricePerKg: 8 },
      ],
    },
    {
      name: "Metal",
      icon: Scale,
      items: [
        { name: "Iron/Steel", pricePerKg: 25 },
        { name: "Aluminum Cans", pricePerKg: 80 },
        { name: "Copper Wire", pricePerKg: 450 },
      ],
    },
    {
      name: "E-Waste",
      icon: Cpu,
      items: [
        { name: "Old Laptop", pricePerKg: 250 },
        { name: "Mobile Phone", pricePerKg: 150 },
        { name: "Batteries", pricePerKg: 50 },
      ],
    },
  ];

  const nearbyDealers = [
    { name: "Green Recyclers", rating: 4.8, distance: "1.2 km", speciality: "Paper & Plastic", responseTime: "15 min" },
    { name: "EcoScrap Hub", rating: 4.5, distance: "2.5 km", speciality: "All Categories", responseTime: "30 min" },
    { name: "MetalCraft Dealers", rating: 4.9, distance: "3.1 km", speciality: "Metal & E-Waste", responseTime: "45 min" },
  ];

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
      if (i.name === name) {
        const newWeight = Math.max(0, i.weight + delta);
        return { ...i, weight: newWeight };
      }
      return i;
    }).filter(i => i.weight > 0));
  };

  const totalEstimate = items.reduce((sum, i) => sum + i.weight * i.pricePerKg, 0);

  if (step === "tracking") {
    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title="Pickup Tracking" subtitle="Scrap pickup in progress" moduleColor="citizen" showBack onBack={() => setStep("dealers")} icon={<Recycle className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <Card className="border-0 shadow-card overflow-hidden">
            <div className="bg-gradient-eco p-5">
              <div className="flex items-center gap-3 text-white">
                <Truck className="h-6 w-6" />
                <div>
                  <p className="font-display font-bold">Green Recyclers is on the way</p>
                  <p className="text-sm text-white/80">Estimated arrival: 12 mins</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <Navigation className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Live Map Tracking</p>
              <p className="text-xs">Dealer location updating in real-time</p>
            </div>
          </div>

          <Card className="border-0 shadow-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status="on_the_way" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Items</span>
                <span className="text-sm font-medium">{items.length} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Value</span>
                <span className="text-lg font-display font-bold text-eco-amber">₹{totalEstimate}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1"><Phone className="h-4 w-4 mr-2" />Call Dealer</Button>
            <Button variant="outline" className="flex-1"><MessageCircle className="h-4 w-4 mr-2" />Chat</Button>
          </div>
        </main>
      </div>
    );
  }

  if (step === "dealers") {
    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title="Nearby Dealers" subtitle="Choose a scrap dealer" moduleColor="citizen" showBack onBack={() => setStep("select")} icon={<Recycle className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-4">
          <div className="p-3 rounded-xl bg-eco-amber/10 border border-eco-amber/20">
            <p className="text-sm font-medium">Your scrap: {items.length} items • Estimated ₹{totalEstimate}</p>
          </div>

          {nearbyDealers.map((dealer, i) => (
            <Card key={i} className="border-0 shadow-card hover:shadow-hover transition-all cursor-pointer" onClick={() => setStep("tracking")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold">{dealer.name}</h3>
                    <p className="text-xs text-muted-foreground">{dealer.speciality}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-score-gold fill-score-gold" />
                    <span className="font-medium">{dealer.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{dealer.distance}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{dealer.responseTime}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-gradient-eco flex-1">Request Pickup</Button>
                  <Button size="sm" variant="outline"><Phone className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline"><MessageCircle className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader title="Sell Scrap" subtitle="Select items and get best prices" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<Recycle className="h-6 w-6 text-white" />} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ImageUpload
          onImageSelect={(_, preview) => setImage(preview)}
          currentImage={image || undefined}
          onImageRemove={() => setImage(null)}
          label="Scrap Photo (optional)"
          description="Helps dealers assess your scrap"
        />

        {scrapCategories.map((cat, i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <cat.icon className="h-5 w-5 text-eco-amber" />
                {cat.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cat.items.map((item, j) => {
                const existing = items.find(i => i.name === item.name);
                return (
                  <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">₹{item.pricePerKg}/kg</p>
                    </div>
                    {existing ? (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateWeight(item.name, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-mono font-medium">{existing.weight}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateWeight(item.name, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground w-12 text-right">kg</span>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => addItem(item.name, cat.name, item.pricePerKg)}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {items.length > 0 && (
          <Card className="border-0 shadow-card sticky bottom-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{items.length} items • {items.reduce((s, i) => s + i.weight, 0)} kg</p>
                  <p className="text-2xl font-display font-bold text-eco-amber">₹{totalEstimate}</p>
                </div>
                <Button className="bg-gradient-eco" size="lg" onClick={() => setStep("dealers")}>
                  Find Dealers
                  <ChevronRight className="h-4 w-4 ml-1" />
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
