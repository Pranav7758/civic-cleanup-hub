import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/layout/AppHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
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
      });

      toast.success("Donation listed! NGOs will be notified.");
      setImageFile(null);
      setImagePreview(null);
      setCategory("");
      setDescription("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (step === "history") {
    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title="My Donations" subtitle="Track where your items went" moduleColor="citizen" showBack onBack={() => setStep("form")} icon={<Heart className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-4">
          {(myDonations || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No donations yet.</p>
          ) : (myDonations || []).map((donation: any) => (
            <Card key={donation.id} className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm capitalize">{donation.category} donation</h4>
                    <p className="text-xs text-muted-foreground">{new Date(donation.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={donation.status} size="sm" />
                </div>
                {donation.description && <p className="text-sm text-muted-foreground">{donation.description}</p>}
                {donation.proof_image_url && (
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Eye className="h-4 w-4 mr-2" />View Distribution Proof
                  </Button>
                )}
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
          <Button variant="outline" size="sm" onClick={() => setStep("history")}><Clock className="h-4 w-4 mr-1" /> My Donations</Button>
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
                  category === cat.value ? "border-eco-rose bg-eco-rose/5" : "border-border hover:border-eco-rose/30"
                }`}>
                <cat.icon className={`h-5 w-5 mx-auto mb-1 ${category === cat.value ? "text-eco-rose" : "text-muted-foreground"}`} />
                <p className="text-[10px] font-medium">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Item Description</Label>
          <Textarea placeholder="Describe the items, condition, quantity..." value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none h-20" />
        </div>

        <div className="p-3 rounded-xl bg-eco-green/10 border border-eco-green/20">
          <p className="text-sm font-medium flex items-center gap-2 text-primary"><CheckCircle className="h-4 w-4" />You'll earn 100 points for each donation</p>
        </div>

        <Button className="w-full bg-gradient-sunset" size="lg" disabled={!category || !imageFile || createDonation.isPending} onClick={handleSubmit}>
          {createDonation.isPending ? "Submitting..." : "Submit Donation"}<ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </main>
    </div>
  );
};

export default CitizenDonateHub;
