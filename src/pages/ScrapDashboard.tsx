import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrackingMap } from "@/components/shared/TrackingMap";
import { useScrapPrices, useDealerListings, useUpdateScrapListing } from "@/hooks/useScrap";
import { 
  Home, Package, ListFilter, Clock, User, MapPin, Phone, MessageCircle, CheckCircle, Navigation, Recycle, TrendingUp, ChevronRight, Scale, Newspaper, Box, Cpu, CircleDollarSign, Settings
} from "lucide-react";
import { toast } from "sonner";

type ActiveTab = "home" | "listings" | "pickups" | "prices" | "profile";

const ScrapDashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const { data: listings, isLoading: isLoadingListings } = useDealerListings();
  const { data: prices, isLoading: isLoadingPrices } = useScrapPrices();
  const updateListing = useUpdateScrapListing();

  const handleUpdateStatus = async (status: string) => {
    if (!selectedListing) return;
    try {
      await updateListing.mutateAsync({
        id: selectedListing.id,
        status,
      });
      setSelectedListing(null);
      toast.success("Listing updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update listing");
    }
  };

  const navItems = [
    { icon: Home, label: "Home", value: "home" as const },
    { icon: Package, label: "Listings", value: "listings" as const, badge: (listings || []).filter((l: any) => l.status === "available" || l.status === "pending").length },
    { icon: Clock, label: "Pickups", value: "pickups" as const, badge: (listings || []).filter((l: any) => l.status === "on_the_way").length },
    { icon: CircleDollarSign, label: "Prices", value: "prices" as const },
    { icon: User, label: "Profile", value: "profile" as const },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "paper": return Newspaper;
      case "plastic": return Box;
      case "metal": return Scale;
      case "ewaste": return Cpu;
      default: return Recycle;
    }
  };

  const groupedPrices = Object.values((prices || []).reduce((acc: any, p: any) => {
    if (!acc[p.category]) acc[p.category] = { category: p.category, icon: getCategoryIcon(p.category), items: [] };
    acc[p.category].items.push(p);
    return acc;
  }, {}));

  // Listing Detail View
  if (selectedListing) {
    const CategoryIcon = getCategoryIcon(selectedListing.items?.[0]?.category || 'other');
    
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
        <AppHeader 
          title="Scrap Details" 
          subtitle={`Listing #${selectedListing.id.slice(0, 8)}`}
          moduleColor="scrap"
          showBack
          onBack={() => setSelectedListing(null)}
          icon={<Recycle className="h-6 w-6 text-white" />}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Status & Category */}
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedListing.status === "available" ? "pending" : selectedListing.status} size="lg" />
            {selectedListing.items?.[0] && (
               <Badge variant="outline" className="capitalize">
                 <CategoryIcon className="h-3 w-3 mr-1" />
                 {selectedListing.items[0].category}
               </Badge>
            )}
          </div>

          {/* Items & Pricing */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scrap Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedListing.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-muted-foreground">{item.weight_kg} kg</p>
                  </div>
                  <p className="font-semibold text-eco-amber">₹{item.total_price || (item.weight_kg * item.price_per_kg)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-semibold">Total Estimate</span>
                <span className="text-xl font-bold text-eco-amber">₹{selectedListing.total_estimate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="border-0 shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-eco-amber/10">
                  <MapPin className="h-6 w-6 text-eco-amber" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{selectedListing.citizen?.full_name || "Unknown Seller"}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{selectedListing.citizen?.address || selectedListing.address || "No address provided"}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-golden text-white">
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.location.href=`tel:${selectedListing.citizen?.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          {selectedListing.status === "on_the_way" && (
            <TrackingMap
              points={[
                { type: "origin", label: "Your Location" },
                { type: "current", label: "En Route" },
                { type: "destination", label: "Seller" },
              ]}
              estimatedTime="10 mins"
              distance="2.8 km"
              isLive
            />
          )}

          {/* Actions */}
          {(selectedListing.status === "available" || selectedListing.status === "pending") && (
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-eco" size="lg" onClick={() => handleUpdateStatus("accepted")} disabled={updateListing.isPending}>
                <CheckCircle className="h-5 w-5 mr-2" />
                Accept & Schedule
              </Button>
            </div>
          )}

          {selectedListing.status === "accepted" && (
            <Button className="w-full bg-gradient-golden" size="lg" onClick={() => handleUpdateStatus("on_the_way")} disabled={updateListing.isPending}>
              <Navigation className="h-5 w-5 mr-2" />
              Start Pickup Journey
            </Button>
          )}

          {selectedListing.status === "on_the_way" && (
            <Button className="w-full bg-gradient-eco" size="lg" onClick={() => handleUpdateStatus("completed")} disabled={updateListing.isPending}>
              <CheckCircle className="h-5 w-5 mr-2" />
              Complete Pickup
            </Button>
          )}
        </main>

        <BottomNav 
          items={navItems} 
          activeItem={activeTab} 
          onItemClick={(value) => setActiveTab(value as ActiveTab)}
          moduleColor="scrap"
        />
      </div>
    );
  }

  // Prices Tab
  if (activeTab === "prices") {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
        <AppHeader 
          title="Price Management" 
          subtitle="Update your buying rates"
          userName="Green Recyclers"
          moduleColor="scrap"
          icon={<Recycle className="h-6 w-6 text-white" />}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {isLoadingPrices ? (
             <p className="text-center text-muted-foreground py-8">Loading prices...</p>
          ) : (groupedPrices as any[]).map((category, i) => (
            <Card key={i} className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 capitalize">
                  <category.icon className="h-5 w-5 text-eco-amber" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.items.map((item: any, j: number) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-sm">{item.item_name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        ₹{item.price_per_kg}/kg
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </main>

        <BottomNav 
          items={navItems} 
          activeItem={activeTab} 
          onItemClick={(value) => setActiveTab(value as ActiveTab)}
          moduleColor="scrap"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      <AppHeader 
        title="Scrap Dealer" 
        subtitle="Green Recyclers"
        userName="Green Recyclers"
        moduleColor="scrap"
        notifications={0}
        icon={<Recycle className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Earnings Card */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-golden p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-white/80 mb-1">Total Procurement</p>
                <p className="text-4xl font-bold">
                  ₹{(listings || []).filter((l: any) => l.status === "completed").reduce((sum: number, l: any) => sum + (Number(l.total_estimate) || 0), 0)}
                </p>
                <p className="text-sm text-white/80 mt-1">
                  From {(listings || []).filter((l: any) => l.status === "completed").length} pickups
                </p>
              </div>
              <div className="text-right text-white hidden sm:block">
                <Badge className="bg-white/20 text-white border-0 mb-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Sourced
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="New Listings"
            value={(listings || []).filter((l: any) => l.status === "pending" || l.status === "available").length.toString()}
            icon={Package}
            color="amber"
          />
          <StatsCard
            title="Active Pickups"
            value={(listings || []).filter((l: any) => l.status === "accepted" || l.status === "on_the_way").length.toString()}
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Completed"
            value={(listings || []).filter((l: any) => l.status === "completed").length.toString()}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Weight"
            value={`${(listings || []).filter((l: any) => l.status === "completed").reduce((sum: number, l: any) => sum + (Number(l.total_weight) || 0), 0)} kg`}
            icon={Scale}
            color="purple"
          />
        </div>

        {/* Scrap Listings */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Available Scrap</CardTitle>
              <Button variant="outline" size="sm">
                <ListFilter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingListings ? (
               <p className="text-center text-muted-foreground py-8">Loading listings...</p>
            ) : (listings || []).length === 0 ? (
               <p className="text-center text-muted-foreground py-8">No scrap listings available.</p>
            ) : (listings as any[]).map((listing: any) => {
              const CategoryIcon = getCategoryIcon(listing.items?.[0]?.category);
              return (
                <div 
                  key={listing.id} 
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setSelectedListing(listing)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-eco-amber/10">
                        <CategoryIcon className="h-5 w-5 text-eco-amber" />
                      </div>
                      <div>
                        <h4 className="font-medium">{listing.citizen?.full_name || "Unknown"}</h4>
                        <p className="text-sm text-muted-foreground">{listing.items?.map((i: any) => i.item_name).join(", ") || listing.category || "Mixed Scrap"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-eco-amber">₹{listing.total_estimate}</p>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={listing.status === "available" ? "pending" : listing.status} size="sm" />
                    <span className="text-xs text-muted-foreground">{new Date(listing.created_at).toLocaleDateString()}</span>
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
        moduleColor="scrap"
      />
    </div>
  );
};

export default ScrapDashboard;
