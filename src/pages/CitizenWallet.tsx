import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { useCleanlinessScore, useWalletTransactions, useGovernmentBenefits, useRedeemItems } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import {
  Coins, ArrowUpRight, Gift, Lightbulb, Droplets, Building, ShoppingBag, Recycle, Heart, AlertTriangle, Sparkles, TreePine, Copy,
} from "lucide-react";

const CitizenWallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<"overview" | "history" | "redeem">("overview");
  const { data: score } = useCleanlinessScore();
  const { data: transactions } = useWalletTransactions();
  const { data: benefits } = useGovernmentBenefits();
  const { data: redeemItems } = useRedeemItems();

  const totalPoints = score?.score || 0;
  const earnedThisMonth = (transactions || [])
    .filter(t => t.type === "earned" && new Date(t.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.points, 0);

  const txIcons: Record<string, React.ElementType> = {
    "Waste Report": AlertTriangle, "Scrap": Recycle, "Donation": Heart, "Cleanup": TreePine, "Redeem": ShoppingBag, "Bonus": Sparkles,
  };
  const getIcon = (action: string) => {
    const match = Object.keys(txIcons).find(k => action.toLowerCase().includes(k.toLowerCase()));
    return match ? txIcons[match] : Coins;
  };

  const benefitIcons: Record<string, React.ElementType> = { light_bill: Lightbulb, water_tax: Droplets, property_tax: Building };
  const benefitLabels: Record<string, string> = { light_bill: "Light Bill Discount", water_tax: "Water Tax Waiver", property_tax: "Property Tax Rebate" };
  const benefitProviders: Record<string, string> = { light_bill: "State Electricity Board", water_tax: "Municipal Corporation", property_tax: "Revenue Department" };
  const benefitColors: Record<string, string> = { light_bill: "text-clay", water_tax: "text-[#5A8A9E]", property_tax: "text-[#7A6890]" };

  const uniqueRedeemItems = (redeemItems || []).filter((item: any, index: number, self: any[]) =>
    index === self.findIndex((t: any) => t.title === item.title)
  );

  const govBenefitItems = [
    { id: 'gov-light', title: 'Light Bill Discount', image_emoji: '💡', points_cost: 500 },
    { id: 'gov-water', title: 'Water Tax Waiver', image_emoji: '🚰', points_cost: 800 },
    { id: 'gov-property', title: 'Property Tax Rebate', image_emoji: '🏢', points_cost: 1500 },
  ];

  const combinedRedeemItems = [ ...uniqueRedeemItems ];
  govBenefitItems.forEach(govItem => {
    if (!combinedRedeemItems.find((item: any) => item.title === govItem.title)) {
      combinedRedeemItems.push(govItem);
    }
  });

  return (
    <div className="min-h-screen bg-rice-paper pb-6">
      <AppHeader title="Incentive Wallet" subtitle="Earn & redeem rewards" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<Coins className="h-5 w-5 text-white" />} />
      <main className="container mx-auto px-4 sm:px-6 py-6 md:py-10 max-w-7xl space-y-6 md:space-y-8">
        <Card className="border-timber/30 shadow-soft rounded-[1.5rem] overflow-hidden">
          <div className="bg-gradient-eco p-8 md:p-10 shadow-inner">
            <p className="text-white/80 text-sm md:text-base font-medium">Available Points</p>
            <p className="text-5xl md:text-7xl font-display font-bold text-white mt-1 drop-shadow-md">{totalPoints.toLocaleString()}</p>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-6">
              <Badge className="bg-white/20 text-white border-0 py-1.5 px-3 backdrop-blur-md text-sm"><ArrowUpRight className="h-4 w-4 mr-1" />+{earnedThisMonth} earned this month</Badge>
              <Badge className="bg-white/20 text-white border-0 py-1.5 px-3 backdrop-blur-md text-sm"><Sparkles className="h-4 w-4 mr-1" />{score?.tier || "Bronze"} Member</Badge>
            </div>
          </div>
        </Card>

        {/* Mobile Tabs (Hidden on Desktop) */}
        <div className="md:hidden flex gap-2 p-1 bg-muted rounded-xl w-fit">
          {(["overview", "history", "redeem"] as const).map((tab) => (
            <Button key={tab} variant={activeSection === tab ? "default" : "ghost"} size="sm"
              className={activeSection === tab ? "bg-rice-paper text-foreground shadow-sm rounded-lg" : "rounded-lg text-muted-foreground hover:text-foreground"} onClick={() => setActiveSection(tab)}>
              {tab === "overview" ? "Benefits" : tab === "history" ? "History" : "Redeem Offers"}
            </Button>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Active Coupons & Earn Logic */}
          <div className={`md:col-span-7 space-y-6 md:space-y-8 ${activeSection !== "overview" ? "hidden md:block" : "animate-in fade-in slide-in-from-bottom-4 duration-500"}`}>
            <Card className="border-timber/30 shadow-soft rounded-[1.5rem] overflow-hidden">
              <CardHeader className="pb-4 bg-muted/30 border-b">
                <CardTitle className="text-xl md:text-2xl font-display">Active Coupons</CardTitle>
                <CardDescription className="text-base text-muted-foreground">Government discounts unlocked from your cleanliness score</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                {(benefits || []).length === 0 ? (
                  <div className="text-center py-10">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-medium text-muted-foreground">No benefits unlocked yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Keep improving your score to earn automatic utility discounts!</p>
                  </div>
                ) : (benefits || []).map((benefit: any, i: number) => {
                  const Icon = benefitIcons[benefit.benefit_type] || Lightbulb;
                  return (
                    <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-5 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/20 border hover:shadow-md transition-shadow">
                      <div className={`p-4 rounded-2xl bg-rice-paper shadow-sm ${benefitColors[benefit.benefit_type] || ""}`}><Icon className="h-8 w-8 md:h-10 md:w-10" /></div>
                      <div className="flex-1 text-center md:text-left w-full">
                        <p className="font-semibold text-lg md:text-xl font-display">{benefitLabels[benefit.benefit_type] || benefit.benefit_type}</p>
                        <p className="text-sm text-muted-foreground mt-1">{benefitProviders[benefit.benefit_type] || ""}</p>
                        {benefit.valid_until && <p className="text-xs text-muted-foreground mt-2">Valid till {new Date(benefit.valid_until).toLocaleDateString()}</p>}
                      </div>
                      <div className="flex flex-col items-center md:items-end gap-3 text-right w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                        <p className="text-3xl md:text-4xl font-display font-bold text-primary">{benefit.discount_percent}% <span className="text-xl">OFF</span></p>
                        {benefit.coupon_code ? (
                          <Button 
                            variant="secondary" 
                            className="w-full md:w-auto gap-2 font-mono tracking-widest font-bold border-2" 
                            onClick={() => { 
                              navigator.clipboard.writeText(benefit.coupon_code); 
                              toast({title:"Coupon Copied! 🎉", description: "You can now paste it during your bill checkout."})
                            }}
                          >
                            <Copy className="h-4 w-4" /> {benefit.coupon_code}
                          </Button>
                        ) : (
                           <Badge variant="outline" className="text-moss border-eco-green/30 py-1.5 px-3">{benefit.status}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            
            <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
              <CardHeader className="pb-3 border-b bg-muted/10"><CardTitle className="text-lg font-display">How You Earn</CardTitle></CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Waste Reports", points: "50/report", icon: AlertTriangle, color: "text-clay" },
                    { label: "Scrap Sales", points: "15/kg", icon: Recycle, color: "text-eco-teal" },
                    { label: "Donations", points: "100/donation", icon: Heart, color: "text-burnt-sienna" },
                    { label: "Cleanup Drives", points: "150/event", icon: TreePine, color: "text-moss" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/30 text-center border shadow-sm hover:shadow-md transition-shadow">
                      <item.icon className={`h-8 w-8 mx-auto mb-3 ${item.color}`} />
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-base font-bold text-primary mt-1">{item.points}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: History & Redeem */}
          <div className="md:col-span-5 space-y-6 md:space-y-8">
            
            {/* History Section */}
            <div className={`${activeSection !== "history" ? "hidden md:block" : "animate-in fade-in duration-500"}`}>
              <Card className="border-timber/30 shadow-soft rounded-[1.5rem] h-full max-h-[500px] flex flex-col">
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display">Recent History</CardTitle>
                    <Badge variant="secondary" className="bg-muted">+{earnedThisMonth} this month</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-4 overflow-y-auto">
                  {(transactions || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
                  ) : (transactions || []).map((tx: any) => {
                    const Icon = getIcon(tx.action);
                    return (
                      <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div className={`p-2.5 rounded-lg ${tx.type === "earned" ? "bg-moss/10" : "bg-burnt-sienna/10"}`}>
                          <Icon className={`h-5 w-5 ${tx.type === "earned" ? "text-moss" : "text-burnt-sienna"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{tx.action}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className={`font-display font-bold text-lg ${tx.type === "earned" ? "text-moss" : "text-burnt-sienna"}`}>
                          {tx.type === "earned" ? "+" : ""}{tx.points}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Redeem Section */}
            <div className={`${activeSection !== "redeem" ? "hidden md:block" : "animate-in fade-in duration-500"}`}>
               <Card className="border-timber/30 shadow-soft rounded-[1.5rem] bg-muted/20">
                <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Quick Redeem</CardTitle><CardDescription>Trade points for local vouchers</CardDescription></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {combinedRedeemItems.map((item: any) => (
                      <div key={item.id} className="bg-card p-4 rounded-xl text-center border hover:shadow-md transition-all cursor-pointer group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.image_emoji}</div>
                        <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                        <Badge className="mt-2 bg-gradient-eco text-white border-0"><Coins className="h-3 w-3 mr-1" />{item.points_cost}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenWallet;
