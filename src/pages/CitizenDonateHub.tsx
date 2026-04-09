import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/layout/AppHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Heart,
  Shirt,
  BookOpen,
  Gamepad2,
  Sofa,
  Package,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  CheckCircle,
  Clock,
  ChevronRight,
  Navigation,
  Camera,
  Truck,
  Gift,
  Eye,
} from "lucide-react";

const CitizenDonateHub = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "ngos" | "tracking" | "history">("form");
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const categories = [
    { value: "clothing", label: "Clothes & Shoes", icon: Shirt },
    { value: "books", label: "Books & Stationery", icon: BookOpen },
    { value: "toys", label: "Toys & Games", icon: Gamepad2 },
    { value: "furniture", label: "Furniture", icon: Sofa },
    { value: "other", label: "Other Items", icon: Package },
  ];

  const nearbyNgos = [
    { name: "Hope Foundation", rating: 4.9, distance: "2.1 km", focus: "Children & Education", donations: 1250, verified: true },
    { name: "Helping Hands Trust", rating: 4.7, distance: "3.4 km", focus: "Women & Elderly", donations: 890, verified: true },
    { name: "Green Earth Society", rating: 4.6, distance: "5.0 km", focus: "Community Welfare", donations: 650, verified: false },
  ];

  const donationHistory = [
    { id: 1, items: "Winter Clothes, Blankets", ngo: "Hope Foundation", date: "2 weeks ago", status: "completed" as const, proofImage: true },
    { id: 2, items: "School Books, Notebooks", ngo: "Helping Hands Trust", date: "1 month ago", status: "completed" as const, proofImage: true },
    { id: 3, items: "Toys, Board Games", ngo: "Hope Foundation", date: "5 days ago", status: "in_progress" as const, proofImage: false },
  ];

  if (step === "history") {
    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title="My Donations" subtitle="Track where your items went" moduleColor="citizen" showBack onBack={() => setStep("form")} icon={<Heart className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-4">
          {donationHistory.map((donation) => (
            <Card key={donation.id} className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm">{donation.items}</h4>
                    <p className="text-xs text-muted-foreground">{donation.ngo} • {donation.date}</p>
                  </div>
                  <StatusBadge status={donation.status} size="sm" />
                </div>
                {donation.proofImage && (
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Eye className="h-4 w-4 mr-2" />
                    View Distribution Proof
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    );
  }

  if (step === "tracking") {
    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title="Pickup Tracking" subtitle="NGO volunteer is on the way" moduleColor="citizen" showBack onBack={() => setStep("ngos")} icon={<Heart className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <Card className="border-0 shadow-card overflow-hidden">
            <div className="bg-gradient-sunset p-5">
              <div className="flex items-center gap-3 text-white">
                <Truck className="h-6 w-6" />
                <div>
                  <p className="font-display font-bold">Hope Foundation volunteer</p>
                  <p className="text-sm text-white/80">Arriving in ~8 mins</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <Navigation className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Live Tracking</p>
              <p className="text-xs">Volunteer moving towards you</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1"><Phone className="h-4 w-4 mr-2" />Call</Button>
            <Button variant="outline" className="flex-1"><MessageCircle className="h-4 w-4 mr-2" />Chat</Button>
          </div>

          <div className="p-4 rounded-xl bg-eco-rose/10 border border-eco-rose/20">
            <p className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-eco-rose" />
              After distribution, the NGO will upload proof photos
            </p>
            <p className="text-xs text-muted-foreground mt-1">You'll see exactly where your donation went!</p>
          </div>
        </main>
      </div>
    );
  }

  if (step === "ngos") {
    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title="Choose NGO" subtitle="Select a verified NGO near you" moduleColor="citizen" showBack onBack={() => setStep("form")} icon={<Heart className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-4">
          {nearbyNgos.map((ngo, i) => (
            <Card key={i} className="border-0 shadow-card hover:shadow-hover transition-all cursor-pointer" onClick={() => setStep("tracking")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold">{ngo.name}</h3>
                      {ngo.verified && (
                        <Badge variant="outline" className="text-eco-green border-eco-green/30 bg-eco-green/10 text-[10px]">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{ngo.focus}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-score-gold fill-score-gold" />
                    <span className="font-medium">{ngo.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ngo.distance}</span>
                  <span className="flex items-center gap-1"><Gift className="h-3 w-3" />{ngo.donations} donations handled</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-gradient-sunset flex-1">Schedule Pickup</Button>
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
      <AppHeader title="Donate Items" subtitle="Help those in need" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<Heart className="h-6 w-6 text-white" />} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setStep("history")}>
            <Clock className="h-4 w-4 mr-1" /> My Donations
          </Button>
        </div>

        <ImageUpload
          onImageSelect={(_, preview) => setImage(preview)}
          currentImage={image || undefined}
          onImageRemove={() => setImage(null)}
          label="Item Photo"
          description="Upload a clear photo of items to donate"
        />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Category</Label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  category === cat.value ? "border-eco-rose bg-eco-rose/5" : "border-border hover:border-eco-rose/30"
                }`}
              >
                <cat.icon className={`h-5 w-5 mx-auto mb-1 ${category === cat.value ? "text-eco-rose" : "text-muted-foreground"}`} />
                <p className="text-[10px] font-medium">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Item Description</Label>
          <Textarea
            placeholder="Describe the items, condition, quantity..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none h-20"
          />
        </div>

        <div className="p-3 rounded-xl bg-eco-green/10 border border-eco-green/20">
          <p className="text-sm font-medium flex items-center gap-2 text-primary">
            <CheckCircle className="h-4 w-4" />
            You'll earn 100 points for each donation
          </p>
        </div>

        <Button className="w-full bg-gradient-sunset" size="lg" disabled={!category || !image} onClick={() => setStep("ngos")}>
          Find Nearby NGOs
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </main>
    </div>
  );
};

export default CitizenDonateHub;
