import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrackingMap } from "@/components/shared/TrackingMap";
import { 
  Home,
  Package,
  ListFilter,
  Clock,
  User,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  Navigation,
  Recycle,
  TrendingUp,
  ChevronRight,
  IndianRupee,
  Scale,
  Newspaper,
  Box,
  Cpu,
  CircleDollarSign,
  Settings
} from "lucide-react";

type ActiveTab = "home" | "listings" | "pickups" | "prices" | "profile";

interface ScrapListing {
  id: string;
  items: { name: string; weight: string; estimatedPrice: number }[];
  category: string;
  citizenName: string;
  citizenPhone: string;
  address: string;
  postedAt: string;
  status: "available" | "accepted" | "on_the_way" | "completed";
  totalEstimate: number;
  image?: string;
}

const ScrapDashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedListing, setSelectedListing] = useState<ScrapListing | null>(null);

  const navItems = [
    { icon: Home, label: "Home", value: "home" as const },
    { icon: Package, label: "Listings", value: "listings" as const, badge: 12 },
    { icon: Clock, label: "Pickups", value: "pickups" as const, badge: 3 },
    { icon: CircleDollarSign, label: "Prices", value: "prices" as const },
    { icon: User, label: "Profile", value: "profile" as const },
  ];

  const scrapListings: ScrapListing[] = [
    {
      id: "S001",
      items: [
        { name: "Newspapers", weight: "15 kg", estimatedPrice: 225 },
        { name: "Cardboard", weight: "8 kg", estimatedPrice: 80 },
      ],
      category: "Paper",
      citizenName: "Rajesh Kumar",
      citizenPhone: "+91 98765 43210",
      address: "House 23, Sector 18, Near Metro Station",
      postedAt: "30 mins ago",
      status: "available",
      totalEstimate: 305,
    },
    {
      id: "S002",
      items: [
        { name: "Plastic Bottles", weight: "5 kg", estimatedPrice: 50 },
        { name: "Plastic Containers", weight: "3 kg", estimatedPrice: 36 },
      ],
      category: "Plastic",
      citizenName: "Meena Devi",
      citizenPhone: "+91 87654 32109",
      address: "Flat 8B, Sunrise Apartments, MG Road",
      postedAt: "2 hours ago",
      status: "accepted",
      totalEstimate: 86,
    },
    {
      id: "S003",
      items: [
        { name: "Old Laptop", weight: "2 kg", estimatedPrice: 500 },
        { name: "Mobile Phones", weight: "0.5 kg", estimatedPrice: 200 },
      ],
      category: "E-Waste",
      citizenName: "Vikram Singh",
      citizenPhone: "+91 76543 21098",
      address: "Office 12, Tech Park, Phase 1",
      postedAt: "4 hours ago",
      status: "on_the_way",
      totalEstimate: 700,
    },
  ];

  const priceList = [
    { category: "Paper", icon: Newspaper, items: [
      { name: "Newspapers", price: "₹15/kg" },
      { name: "Cardboard", price: "₹10/kg" },
      { name: "Books/Magazines", price: "₹12/kg" },
    ]},
    { category: "Plastic", icon: Box, items: [
      { name: "PET Bottles", price: "₹10/kg" },
      { name: "HDPE", price: "₹15/kg" },
      { name: "Mixed Plastic", price: "₹8/kg" },
    ]},
    { category: "Metal", icon: Scale, items: [
      { name: "Iron/Steel", price: "₹25/kg" },
      { name: "Aluminum", price: "₹80/kg" },
      { name: "Copper", price: "₹450/kg" },
    ]},
    { category: "E-Waste", icon: Cpu, items: [
      { name: "Laptops", price: "₹250/pc" },
      { name: "Phones", price: "₹150/pc" },
      { name: "Batteries", price: "₹50/kg" },
    ]},
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Paper": return Newspaper;
      case "Plastic": return Box;
      case "Metal": return Scale;
      case "E-Waste": return Cpu;
      default: return Recycle;
    }
  };

  // Listing Detail View
  if (selectedListing) {
    const CategoryIcon = getCategoryIcon(selectedListing.category);
    
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <AppHeader 
          title="Scrap Details" 
          subtitle={`Listing #${selectedListing.id}`}
          moduleColor="scrap"
          showBack
          onBack={() => setSelectedListing(null)}
          icon={<Recycle className="h-6 w-6 text-white" />}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Status & Category */}
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedListing.status === "available" ? "pending" : selectedListing.status} size="lg" />
            <Badge variant="outline">
              <CategoryIcon className="h-3 w-3 mr-1" />
              {selectedListing.category}
            </Badge>
          </div>

          {/* Items & Pricing */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scrap Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedListing.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.weight}</p>
                  </div>
                  <p className="font-semibold text-eco-amber">₹{item.estimatedPrice}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-semibold">Total Estimate</span>
                <span className="text-xl font-bold text-eco-amber">₹{selectedListing.totalEstimate}</span>
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
                  <h3 className="font-semibold mb-1">{selectedListing.citizenName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{selectedListing.address}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-golden text-white">
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
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
          {selectedListing.status === "available" && (
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-eco" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Accept & Schedule
              </Button>
            </div>
          )}

          {selectedListing.status === "on_the_way" && (
            <Button className="w-full bg-gradient-eco" size="lg">
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
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <AppHeader 
          title="Price Management" 
          subtitle="Update your buying rates"
          userName="Green Recyclers"
          moduleColor="scrap"
          icon={<Recycle className="h-6 w-6 text-white" />}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {priceList.map((category, i) => (
            <Card key={i} className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-eco-amber" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {item.price}
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppHeader 
        title="Scrap Dealer" 
        subtitle="Green Recyclers"
        userName="Green Recyclers"
        moduleColor="scrap"
        notifications={12}
        icon={<Recycle className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Earnings Card */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-golden p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-white/80 mb-1">Today's Earnings</p>
                <p className="text-4xl font-bold">₹4,250</p>
                <p className="text-sm text-white/80 mt-1">From 8 pickups</p>
              </div>
              <div className="text-right text-white">
                <Badge className="bg-white/20 text-white border-0 mb-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +22% vs yesterday
                </Badge>
                <p className="text-sm text-white/80">Great day!</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="New Listings"
            value="12"
            icon={Package}
            color="amber"
          />
          <StatsCard
            title="Active Pickups"
            value="3"
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Completed"
            value="8"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Weight"
            value="156 kg"
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
            {scrapListings.map((listing) => {
              const CategoryIcon = getCategoryIcon(listing.category);
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
                        <h4 className="font-medium">{listing.citizenName}</h4>
                        <p className="text-sm text-muted-foreground">{listing.items.map(i => i.name).join(", ")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-eco-amber">₹{listing.totalEstimate}</p>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={listing.status === "available" ? "pending" : listing.status} size="sm" />
                    <span className="text-xs text-muted-foreground">{listing.postedAt}</span>
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
