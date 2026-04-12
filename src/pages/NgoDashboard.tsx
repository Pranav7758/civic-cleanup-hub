import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrackingMap } from "@/components/shared/TrackingMap";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { useNgoDonations, useUpdateDonation } from "@/hooks/useDonations";
import { uploadImage } from "@/hooks/useWasteReports";
import { 
  Home,
  Heart,
  Package,
  Clock,
  User,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  Camera,
  Navigation,
  Gift,
  Users,
  TrendingUp,
  ChevronRight,
  Shirt,
  BookOpen,
  Gamepad2,
  Sofa
} from "lucide-react";

type ActiveTab = "home" | "requests" | "pickups" | "history" | "profile";

const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);

  const { data: donations, isLoading } = useNgoDonations();
  const updateDonation = useUpdateDonation();

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return;
    try {
      let finalProofUrl = selectedRequest.proof_image_url;
      if (status === "completed" && proofImageFile) {
        finalProofUrl = await uploadImage(proofImageFile, "donations");
      }
      await updateDonation.mutateAsync({
        id: selectedRequest.id,
        status,
        ...(finalProofUrl && { proof_image_url: finalProofUrl }),
      });
      setSelectedRequest(null);
      setProofImage(null);
      setProofImageFile(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const navItems = [
    { icon: Home, label: "Home", value: "home" as const },
    { icon: Gift, label: "Requests", value: "requests" as const, badge: (donations || []).filter((d: any) => d.status === "pending").length },
    { icon: Package, label: "Pickups", value: "pickups" as const, badge: (donations || []).filter((d: any) => d.status === "on_the_way").length },
    { icon: Clock, label: "History", value: "history" as const },
    { icon: User, label: "Profile", value: "profile" as const },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Clothing": return Shirt;
      case "Books": return BookOpen;
      case "Toys": return Gamepad2;
      case "Furniture": return Sofa;
      default: return Gift;
    }
  };

  // Request Detail View
  if (selectedRequest) {
    const CategoryIcon = getCategoryIcon(selectedRequest.category);
    
    return (
      <div className="min-h-screen bg-rice-paper pb-20 md:pb-0 md:pl-64">
        <AppHeader 
          title="Donation Details" 
          subtitle={`Request #${selectedRequest.id}`}
          moduleColor="ngo"
          showBack
          onBack={() => setSelectedRequest(null)}
          icon={<Heart className="h-6 w-6 text-white" />}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedRequest.status} size="lg" />
            <Badge variant="outline">
              <CategoryIcon className="h-3 w-3 mr-1" />
              {selectedRequest.category}
            </Badge>
          </div>

          {/* Items Card */}
          <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Donation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                 <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                 {selectedRequest.image_url && (
                   <img src={selectedRequest.image_url} alt="Donation Content" className="w-full h-48 object-cover rounded-xl mt-4 border border-border" />
                 )}
              </div>
            </CardContent>
          </Card>

          {/* Donor Info */}
          <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-burnt-sienna/10">
                  <MapPin className="h-6 w-6 text-burnt-sienna" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{selectedRequest.citizen?.full_name || "Unknown Donor"}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{selectedRequest.citizen?.address || "Address not provided"}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-sunset">
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.location.href=`tel:${selectedRequest.citizen?.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Tracking */}
          {selectedRequest.status === "on_the_way" && (
            <TrackingMap
              points={[
                { type: "origin", label: "NGO Center" },
                { type: "current", label: "Volunteer" },
                { type: "destination", label: "Donor" },
              ]}
              estimatedTime="8 mins"
              distance="2.1 km"
              isLive
            />
          )}

          {/* Proof of Distribution */}
          {selectedRequest.status === "completed" || selectedRequest.status === "on_the_way" ? (
            <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Proof of Distribution</CardTitle>
                <CardDescription>Upload photos showing items given to beneficiaries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  onImageSelect={(file, preview) => { setProofImageFile(file); setProofImage(preview); }}
                  currentImage={proofImage || undefined}
                  onImageRemove={() => { setProofImageFile(null); setProofImage(null); }}
                  label="Upload Proof Photo"
                  description="Show the donation being distributed"
                />
                {proofImage && (
                  <Button className="w-full bg-gradient-sunset" onClick={() => handleUpdateStatus("completed")} disabled={updateDonation.isPending}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Distribution Proof
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : selectedRequest.status === "pending" ? (
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-eco" size="lg" onClick={() => handleUpdateStatus("accepted")} disabled={updateDonation.isPending}>
                <CheckCircle className="h-5 w-5 mr-2" />
                Accept Request
              </Button>
              <Button variant="outline" size="lg" onClick={() => setSelectedRequest(null)}>
                Reject
              </Button>
            </div>
          ) : selectedRequest.status === "accepted" ? (
            <Button className="w-full bg-gradient-eco" size="lg" onClick={() => handleUpdateStatus("on_the_way")} disabled={updateDonation.isPending}>
              <Navigation className="h-5 w-5 mr-2" />
              Mark En Route
            </Button>
          ) : null}
        </main>

        <BottomNav 
          items={navItems} 
          activeItem={activeTab} 
          onItemClick={(value) => setActiveTab(value as ActiveTab)}
          moduleColor="ngo"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rice-paper pb-20 md:pb-0 md:pl-64">
      <AppHeader 
        title="NGO Dashboard" 
        subtitle="Hope Foundation"
        userName="Hope Foundation"
        moduleColor="ngo"
        notifications={8}
        icon={<Heart className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Impact Card */}
        <Card className="border-timber/30 shadow-soft rounded-[1.5rem] overflow-hidden">
          <div className="bg-gradient-sunset p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-white/80 mb-1">Lives Impacted This Month</p>
                <p className="text-4xl font-bold">2,450</p>
                <p className="text-sm text-white/80 mt-1">Families helped</p>
              </div>
              <div className="text-right text-white">
                <Badge className="bg-white/20 text-white border-0 mb-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18% growth
                </Badge>
                <p className="text-sm text-white/80">Keep up the great work!</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="New Requests"
            value="8"
            icon={Gift}
            color="rose"
          />
          <StatsCard
            title="Active Pickups"
            value="3"
            icon={Package}
            color="amber"
          />
          <StatsCard
            title="Completed"
            value="156"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Volunteers"
            value="24"
            icon={Users}
            color="purple"
          />
        </div>

        {/* Donation Requests */}
        <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Donation Requests</CardTitle>
              <Badge variant="secondary">{(donations || []).length} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
               <p className="text-center text-muted-foreground py-4">Loading requests...</p>
            ) : (donations || []).map((request: any) => {
              const CategoryIcon = getCategoryIcon(request.category);
              return (
                <div 
                  key={request.id} 
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-burnt-sienna/10">
                        <CategoryIcon className="h-5 w-5 text-burnt-sienna" />
                      </div>
                      <div>
                        <h4 className="font-medium">{request.citizen?.full_name || "Unknown Donor"}</h4>
                        <p className="text-sm text-muted-foreground">{request.description || request.category}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={request.status} size="sm" />
                    <span className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      <BottomNav 
        items={navItems} 
        activeItem={activeTab} 
        onItemClick={(value) => setActiveTab(value as ActiveTab)}
        moduleColor="ngo"
      />
    </div>
  );
};

export default NgoDashboard;
