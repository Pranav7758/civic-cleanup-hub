import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { useCleanlinessScore, useWalletTransactions, useGovernmentBenefits, useRedeemItems } from "@/hooks/useWallet";
import {
  Coins, ArrowUpRight, Gift, Lightbulb, Droplets, Building, ShoppingBag, Recycle, Heart, AlertTriangle, Sparkles, TreePine,
} from "lucide-react";

const CitizenWallet = () => {
  const navigate = useNavigate();
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
  const benefitColors: Record<string, string> = { light_bill: "text-eco-amber", water_tax: "text-eco-sky", property_tax: "text-eco-purple" };

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader title="Incentive Wallet" subtitle="Earn & redeem rewards" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<Coins className="h-6 w-6 text-white" />} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-eco p-6">
            <p className="text-white/80 text-sm">Available Points</p>
            <p className="text-5xl font-display font-bold text-white mt-1">{totalPoints.toLocaleString()}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge className="bg-white/20 text-white border-0"><ArrowUpRight className="h-3 w-3 mr-1" />+{earnedThisMonth} earned this month</Badge>
              <Badge className="bg-white/20 text-white border-0"><Sparkles className="h-3 w-3 mr-1" />{score?.tier || "Bronze"} Member</Badge>
            </div>
          </div>
        </Card>

        <div className="flex gap-2">
          {(["overview", "history", "redeem"] as const).map((tab) => (
            <Button key={tab} variant={activeSection === tab ? "default" : "outline"} size="sm"
              className={activeSection === tab ? "bg-gradient-eco" : ""} onClick={() => setActiveSection(tab)}>
              {tab === "overview" ? "Benefits" : tab === "history" ? "History" : "Redeem"}
            </Button>
          ))}
        </div>

        {activeSection === "overview" && (
          <>
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Active Benefits</CardTitle><CardDescription>Government discounts from your cleanliness score</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {(benefits || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No benefits yet. Keep improving your score!</p>
                ) : (benefits || []).map((benefit: any, i: number) => {
                  const Icon = benefitIcons[benefit.benefit_type] || Lightbulb;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                      <div className={`p-3 rounded-xl bg-background ${benefitColors[benefit.benefit_type] || ""}`}><Icon className="h-6 w-6" /></div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{benefitLabels[benefit.benefit_type] || benefit.benefit_type}</p>
                        <p className="text-xs text-muted-foreground">{benefitProviders[benefit.benefit_type] || ""}</p>
                        {benefit.valid_until && <p className="text-[10px] text-muted-foreground">Valid till {benefit.valid_until}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-primary">{benefit.discount_percent}%</p>
                        <Badge variant="outline" className="text-eco-green border-eco-green/30 text-[10px]">{benefit.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-lg font-display">How You Earn</CardTitle></CardHeader>
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
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Transaction History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(transactions || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
              ) : (transactions || []).map((tx: any) => {
                const Icon = getIcon(tx.action);
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg ${tx.type === "earned" ? "bg-eco-green/10" : "bg-eco-rose/10"}`}>
                      <Icon className={`h-4 w-4 ${tx.type === "earned" ? "text-eco-green" : "text-eco-rose"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-mono font-bold text-sm ${tx.type === "earned" ? "text-eco-green" : "text-eco-rose"}`}>
                      {tx.type === "earned" ? "+" : ""}{tx.points}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {activeSection === "redeem" && (
          <div className="grid grid-cols-2 gap-4">
            {(redeemItems || []).map((item: any) => (
              <Card key={item.id} className="border-0 shadow-card hover:shadow-hover transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-3">{item.image_emoji}</div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.stock} left</p>
                  <Badge className="mt-3 bg-gradient-eco text-white border-0"><Coins className="h-3 w-3 mr-1" />{item.points_cost} pts</Badge>
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
