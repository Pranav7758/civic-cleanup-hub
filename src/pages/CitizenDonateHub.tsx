import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/layout/AppHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCreateDonation, useMyDonations } from "@/hooks/useDonations";
import { uploadImage } from "@/hooks/useWasteReports";
import {
  Heart, Shirt, BookOpen, Gamepad2, Sofa, Package, CheckCircle, Clock, ChevronRight, Eye,
} from "lucide-react";
import { toast } from "sonner";

const CitizenDonateHub = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "history">("form");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);

  const createDonation = useCreateDonation();
  const { data: myDonations } = useMyDonations();

  const categories = [
    { value: "clothing", label: "Clothes & Shoes", icon: Shirt },
    { value: "books", label: "Books & Stationery", icon: BookOpen },
    { value: "toys", label: "Toys & Games", icon: Gamepad2 },
    { value: "furniture", label: "Furniture", icon: Sofa },
    { value: "other", label: "Other Items", icon: Package },
  ];

  const handleSubmit = async () => {
    try {
      let image_url: string | undefined;
      if (imageFile) {
        image_url = await uploadImage(imageFile, "donation-images");
      }

      await createDonation.mutateAsync({
        category: category as any,
        description: description || undefined,
        image_url,
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: location?.address,
      });

      toast.success("Donation listed! NGOs will be notified.");
      setImageFile(null);
      setImagePreview(null);
      setCategory("");
      setDescription("");
      setLocation(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-rice-paper pb-6">
      <AppHeader 
        title={step === "history" ? "My Donations" : "Donate Items"} 
        subtitle={step === "history" ? "Track where your items went" : "Help those in need"} 
        moduleColor="citizen" 
        showBack 
        onBack={() => step === "history" ? setStep("form") : navigate("/citizen")} 
        icon={<Heart className="h-6 w-6 text-white" />} 
      />
      
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        {/* Mobile Toggle Button */}
        <div className="flex justify-end mb-6 md:hidden">
          {step === "form" ? (
            <Button variant="outline" size="sm" onClick={() => setStep("history")}><Clock className="h-4 w-4 mr-1" /> My Donations</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setStep("form")}><Heart className="h-4 w-4 mr-1" /> Donate Items</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* LEFT COLUMN: Donation Form */}
          <div className={`space-y-6 ${step === "history" ? "hidden md:block" : "block"} bg-card/50 p-6 rounded-3xl border md:shadow-sm`}>
            <div>
              <h2 className="text-xl font-display font-bold mb-1">New Donation</h2>
              <p className="text-sm text-muted-foreground">List items you wish to give away</p>
            </div>
            
            <ImageUpload
              onImageSelect={(file, preview) => { setImageFile(file); setImagePreview(preview); }}
              currentImage={imagePreview || undefined}
              onImageRemove={() => { setImageFile(null); setImagePreview(null); }}
              label="Item Photo"
              description="Upload a clear photo of items to donate"
            />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Category</Label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      category === cat.value ? "border-eco-rose bg-burnt-sienna/5 shadow-sm" : "border-border hover:border-eco-rose/30"
                    }`}>
                    <cat.icon className={`h-6 w-6 mx-auto mb-2 ${category === cat.value ? "text-burnt-sienna" : "text-muted-foreground"}`} />
                    <p className="text-[11px] font-medium leading-tight">{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Item Description</Label>
              <Textarea placeholder="Describe the items, condition, quantity..." value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none h-24" />
            </div>

            <LocationPicker
              label="Pickup Location (GPS)"
              onLocationSelect={(loc) => setLocation(loc)}
              currentLocation={location || undefined}
            />

            <div className="p-4 rounded-xl bg-moss/10 border border-eco-green/20">
              <p className="text-sm font-medium flex items-center gap-2 text-primary"><CheckCircle className="h-5 w-5" />You'll earn 100 points for each donation</p>
            </div>

            <Button
              className="w-full bg-gradient-sunset shadow-md transition-shadow hover:shadow-lg"
              size="lg"
              disabled={!category || !imageFile || !location || createDonation.isPending}
              onClick={handleSubmit}
            >
              {createDonation.isPending ? "Submitting..." : "Submit Donation"}<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {/* RIGHT COLUMN: Donation History */}
          <div className={`space-y-6 ${step === "form" ? "hidden md:block" : "block"}`}>
             <div className="sticky top-24 space-y-6 bg-card/30 p-2 rounded-3xl md:border-0 md:bg-transparent">
              <div>
                <h2 className="text-xl font-display font-bold mb-1 hidden md:block">Donation Record</h2>
                <p className="text-sm text-muted-foreground hidden md:block">Track where your items went</p>
              </div>
               
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {(myDonations || []).length === 0 ? (
                  <div className="text-center py-10 bg-card rounded-2xl border border-dashed">
                    <Heart className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground font-medium">No donations yet.</p>
                  </div>
                ) : (myDonations || []).map((donation: any) => (
                  <Card key={donation.id} className="border hover:shadow-md transition-all shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-base capitalize">{donation.category} items</h4>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{new Date(donation.created_at).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={donation.status} size="sm" />
                        </div>
                        {donation.description && <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg mb-4">{donation.description}</p>}

                        {donation.proof_image_url && (
                          <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate("/community")}>
                            <Eye className="h-4 w-4 mr-2" />View Transparency Post
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CitizenDonateHub;
