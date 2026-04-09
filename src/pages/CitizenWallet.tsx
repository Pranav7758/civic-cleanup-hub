import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Lightbulb,
  Droplets,
  Building,
  ShoppingBag,
  Recycle,
  Heart,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Ticket,
  TreePine,
  Trash2,
} from "lucide-react";

const CitizenWallet = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"overview" | "history" | "redeem">("overview");

  const transactions = [
    { id: 1, type: "earned", action: "Waste Report Verified", points: 50, date: "Today, 2:30 PM", icon: AlertTriangle },
    { id: 2, type: "earned", action: "Scrap Sold - 5kg Paper", points: 75, date: "Yesterday", icon: Recycle },
    { id: 3, type: "spent", action: "Redeemed Compost Kit", points: -200, date: "3 days ago", icon: ShoppingBag },
    { id: 4, type: "earned", action: "Clothes Donated to NGO", points: 100, date: "5 days ago", icon: Heart },
    { id: 5, type: "earned", action: "Cleanup Drive Participation", points: 150, date: "1 week ago", icon: TreePine },
    { id: 6, type: "earned", action: "Monthly Score Bonus", points: 200, date: "2 weeks ago", icon: Sparkles },
  ];

  const activeBenefits = [
    { title: "Light Bill Discount", discount: "15%", provider: "State Electricity Board", validTill: "Mar 2025", icon: Lightbulb, color: "text-eco-amber" },
    { title: "Water Tax Waiver", discount: "10%", provider: "Municipal Corporation", validTill: "Jun 2025", icon: Droplets, color: "text-eco-sky" },
    { title: "Property Tax Rebate", discount: "5%", provider: "Revenue Department", validTill: "Dec 2024", icon: Building, color: "text-eco-purple" },
  ];

  const redeemItems = [
    { title: "Steel Dustbin Set", points: 500, image: "🗑️", stock: 23 },
    { title: "Compost Kit", points: 350, image: "🌱", stock: 15 },
    { title: "Eco Tote Bag", points: 150, image: "👜", stock: 50 },
    { title: "₹100 Grocery Coupon", points: 400, image: "🎟️", stock: 8 },
    { title: "Tree Planting Certificate", points: 200, image: "🌳", stock: 99 },
    { title: "Solar Lamp", points: 800, image: "💡", stock: 5 },
  ];

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader
        title="Incentive Wallet"
        subtitle="Earn & redeem rewards"
        moduleColor="citizen"
        showBack
        onBack={() => navigate("/citizen")}
        icon={<Coins className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-eco p-6">
            <p className="text-white/80 text-sm">Available Points</p>
            <p className="text-5xl font-display font-bold text-white mt-1">1,245</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge className="bg-white/20 text-white border-0">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +575 earned this month
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Gold Member
              </Badge>
            </div>
          </div>
        </Card>

        {/* Section Tabs */}
        <div className="flex gap-2">
          {[
            { key: "overview" as const, label: "Benefits" },
            { key: "history" as const, label: "History" },
            { key: "redeem" as const, label: "Redeem" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeSection === tab.key ? "default" : "outline"}
              size="sm"
              className={activeSection === tab.key ? "bg-gradient-eco" : ""}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeSection === "overview" && (
          <>
            {/* Active Government Benefits */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">Active Benefits</CardTitle>
                <CardDescription>Government discounts from your cleanliness score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className={`p-3 rounded-xl bg-background ${benefit.color}`}>
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">{benefit.provider}</p>
                      <p className="text-[10px] text-muted-foreground">Valid till {benefit.validTill}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-primary">{benefit.discount}</p>
                      <Badge variant="outline" className="text-eco-green border-eco-green/30 text-[10px]">Active</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Points Breakdown */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">How You Earn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Waste Reports", points: "50/report", icon: AlertTriangle, color: "text-eco-amber" },
                    { label: "Scrap Sales", points: "15/kg", icon: Recycle, color: "text-eco-teal" },
                    { label: "Donations", points: "100/donation", icon: Heart, color: "text-eco-rose" },
                    { label: "Cleanup Drives", points: "150/event", icon: TreePine, color: "text-eco-green" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/50 text-center">
                      <item.icon className={`h-5 w-5 mx-auto mb-2 ${item.color}`} />
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-sm font-bold text-primary mt-0.5">{item.points}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === "history" && (
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg ${tx.type === "earned" ? "bg-eco-green/10" : "bg-eco-rose/10"}`}>
                    <tx.icon className={`h-4 w-4 ${tx.type === "earned" ? "text-eco-green" : "text-eco-rose"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.action}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <span className={`font-mono font-bold text-sm ${tx.type === "earned" ? "text-eco-green" : "text-eco-rose"}`}>
                    {tx.type === "earned" ? "+" : ""}{tx.points}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "redeem" && (
          <div className="grid grid-cols-2 gap-4">
            {redeemItems.map((item, i) => (
              <Card key={i} className="border-0 shadow-card hover:shadow-hover transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-3">{item.image}</div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.stock} left</p>
                  <Badge className="mt-3 bg-gradient-eco text-white border-0">
                    <Coins className="h-3 w-3 mr-1" />
                    {item.points} pts
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CitizenWallet;
