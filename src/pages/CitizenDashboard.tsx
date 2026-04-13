import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatsCard } from "@/components/shared/StatsCard";
import { ScoreCircle } from "@/components/shared/ScoreCircle";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useCleanlinessScore, useWalletTransactions, useGovernmentBenefits } from "@/hooks/useWallet";
import { useMyReports } from "@/hooks/useWasteReports";
import { useDustbinCollections } from "@/hooks/useDustbin";
import { DustbinQR } from "@/components/shared/DustbinQR";
import { useTrainingModules, useTrainingProgress } from "@/hooks/useTraining";
import { 
  Home, AlertTriangle, MapPin, Coins, GraduationCap, Recycle, Heart, Zap, Droplets, Lightbulb, Building, Clock, ChevronRight, Camera, Trophy, Target, Calendar, Sparkles, ShieldCheck
} from "lucide-react";

type ActiveTab = "home" | "report" | "scrap" | "donate" | "wallet";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const { profile, signOut } = useAuth();
  const { data: score } = useCleanlinessScore();
  const { data: transactions } = useWalletTransactions();
  const { data: reports } = useMyReports();
  const { data: benefits } = useGovernmentBenefits();
  const { data: collections } = useDustbinCollections();
  const { data: modules } = useTrainingModules();
  const { data: progress } = useTrainingProgress();

  const navItems = [
    { icon: Home, label: "Home", value: "home" as const },
    { icon: AlertTriangle, label: "Report", value: "report" as const },
    { icon: Recycle, label: "Scrap", value: "scrap" as const },
    { icon: Heart, label: "Donate", value: "donate" as const },
    { icon: Coins, label: "Wallet", value: "wallet" as const },
  ];

  const handleTabClick = (value: string) => {
    switch (value) {
      case "report": navigate("/citizen/report"); break;
      case "scrap": navigate("/citizen/scrap"); break;
      case "donate": navigate("/citizen/donate"); break;
      case "wallet": navigate("/citizen/wallet"); break;
      default: setActiveTab(value as ActiveTab);
    }
  };

  const currentScore = score?.score || 0;
  const tier = score?.tier || "Bronze";
  const totalPoints = transactions?.filter(t => t.type === "earned").reduce((sum, t) => sum + t.points, 0) || 0;
  const recentReports = (reports || []).slice(0, 3);

  const benefitIcons: Record<string, React.ElementType> = { light_bill: Lightbulb, water_tax: Droplets, property_tax: Building };
  const benefitColors: Record<string, string> = { light_bill: "text-clay", water_tax: "text-[#5A8A9E]", property_tax: "text-[#7A6890]" };
  const benefitLabels: Record<string, string> = { light_bill: "Light Bill", water_tax: "Water Tax", property_tax: "Property Tax" };

  const completedModules = (progress || []).filter(p => p.completed).length;
  const totalModules = (modules || []).length;

  const quickActions = [
    { icon: Camera, label: "Report Waste", color: "bg-moss", onClick: () => navigate("/citizen/report") },
    { icon: Recycle, label: "Sell Scrap", color: "bg-[#5A8A9E]", onClick: () => navigate("/citizen/scrap") },
    { icon: Heart, label: "Donate Items", color: "bg-burnt-sienna", onClick: () => navigate("/citizen/donate") },
    { icon: Coins, label: "My Wallet", color: "bg-clay", onClick: () => navigate("/citizen/wallet") },
    { icon: Calendar, label: "Events", color: "bg-[#7A6890]", onClick: () => navigate("/citizen/events") },
  ];

  // Asymmetric radii for quick action cards
  const actionRadii = [
    "rounded-tl-[2.5rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] rounded-br-[2rem]",
    "rounded-tl-[1.5rem] rounded-tr-[2.5rem] rounded-bl-[2rem] rounded-br-[1.5rem]",
    "rounded-tl-[2rem] rounded-tr-[1.5rem] rounded-bl-[2.5rem] rounded-br-[1.5rem]",
    "rounded-tl-[1.5rem] rounded-tr-[2rem] rounded-bl-[1.5rem] rounded-br-[2.5rem]",
    "rounded-tl-[2rem] rounded-tr-[2rem] rounded-bl-[1.5rem] rounded-br-[2.5rem]",
  ];

  return (
    <div className="min-h-screen bg-rice-paper pb-24 md:pb-0 md:pl-64">
      <AppHeader 
        title="Citizen Dashboard" 
        subtitle={`Welcome back, ${profile?.full_name || "Citizen"}`}
        userName={profile?.full_name || "Citizen"}
        moduleColor="citizen"
        icon={<Recycle className="h-5 w-5 text-white" />}
      />

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Cleanliness Score — organic card with blob */}
        <Card className="border-timber/30 shadow-soft overflow-hidden rounded-[2rem]">
          <div className="bg-moss relative p-6 md:p-8">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 blob-1 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-clay/10 blob-2 blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <ScoreCircle score={currentScore} maxScore={1000} size="lg" showLabel={false} />
              <div className="text-center md:text-left text-white flex-1">
                <h2 className="text-2xl font-display font-bold mb-1">Cleanliness Score</h2>
                <p className="text-white/70 mb-3 font-medium">{currentScore > 500 ? "Great job! Keep it up!" : "Keep reporting to earn more points!"}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-white/15 text-white border-0 rounded-full px-3 py-1"><Trophy className="h-3 w-3 mr-1" />{tier} Status</Badge>
                  <Badge className="bg-white/15 text-white border-0 rounded-full px-3 py-1"><Target className="h-3 w-3 mr-1" />{1000 - currentScore} pts to max</Badge>
                </div>
              </div>
              <div className="hidden lg:block">
                <button className="bg-white text-moss hover:bg-white/90 hover:scale-105 active:scale-95 px-6 py-3 rounded-full font-bold shadow-sm transition-all duration-300 flex items-center gap-1" onClick={() => navigate("/citizen/wallet")}>
                  View Full Stats <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Dustbin QR Section */}
        {profile && profile.dustbin_code && (
          <div className="max-w-md mx-auto xl:max-w-none">
            <DustbinQR 
              citizenId={profile.user_id}
              dustbinCode={profile.dustbin_code}
              name={profile.full_name}
              totalCollections={collections?.length || 0}
              lastCollectionDate={collections?.[0]?.created_at}
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Reports" value={String(reports?.length || 0)} icon={AlertTriangle} color="amber" />
          <StatsCard title="Points Earned" value={String(totalPoints)} icon={Coins} color="green" />
          <StatsCard title="Scrap Sold" value="₹0" icon={Recycle} color="teal" />
          <StatsCard title="Donations" value="0" icon={Heart} color="rose" />
        </div>

        {/* Community Transparency Feed Banner */}
        <div 
          onClick={() => navigate("/community")}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-[2rem] p-6 text-white cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">Community Transparency Feed</h3>
              <p className="text-white/80 text-sm mt-1">See your donations reaching real people in real-time.</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full md:w-auto font-bold rounded-xl bg-white text-primary hover:bg-stone-100">
            View Live Feed
          </Button>
        </div>

        {/* Peer Verification Banner */}
        <div 
          onClick={() => navigate("/citizen/verify")}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] p-5 text-white cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-full">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base">Verify Reports & Earn Points</h3>
              <p className="text-white/80 text-xs mt-0.5">Help catch fake reports. Earn 10 pts per review.</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-white/60" />
        </div>

        {/* Government Benefits */}
        {(benefits || []).length > 0 && (
          <Card className="border-timber/30 shadow-soft rounded-[2rem]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2"><Zap className="h-5 w-5 text-clay" />Government Benefits</CardTitle>
              <CardDescription className="font-medium">Discounts earned from your cleanliness score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(benefits || []).map((benefit, i) => {
                  const Icon = benefitIcons[benefit.benefit_type] || Lightbulb;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-stone/50 hover:bg-stone transition-colors duration-300">
                      <div className={`p-3 rounded-2xl bg-rice-paper ${benefitColors[benefit.benefit_type] || ""}`}><Icon className="h-6 w-6" /></div>
                      <div className="flex-1">
                        <p className="font-semibold">{benefitLabels[benefit.benefit_type] || benefit.benefit_type}</p>
                        <p className="text-2xl font-display font-bold text-moss">{benefit.discount_percent}%</p>
                      </div>
                      <Badge variant={benefit.status === "active" ? "default" : "secondary"} className="rounded-full">{benefit.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <Card className="border-timber/30 shadow-soft rounded-[2rem]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Recent Reports</CardTitle>
                <button className="text-sm text-moss font-semibold hover:underline flex items-center gap-1" onClick={() => navigate("/citizen/report")}>View All <ChevronRight className="h-4 w-4" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 font-medium">No reports yet. Start reporting waste!</p>
              ) : recentReports.map((report: any) => (
                <div key={report.id} className="flex items-center gap-3 p-3 rounded-2xl bg-stone/30 hover:bg-stone/60 transition-colors duration-300 cursor-pointer">
                  <div className="p-2 rounded-xl bg-rice-paper"><MapPin className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{report.address || "Location captured"}</p>
                    <p className="text-xs text-muted-foreground font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={report.status} size="sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Training Progress */}
          <Card className="border-timber/30 shadow-soft rounded-[2rem]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2"><GraduationCap className="h-5 w-5 text-[#7A6890]" />Training Modules</CardTitle>
                <Badge variant="secondary" className="rounded-full font-semibold">{completedModules}/{totalModules} Complete</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(modules || []).slice(0, 3).map((mod: any) => {
                const prog = (progress || []).find((p: any) => p.module_id === mod.id);
                const pct = prog?.progress || 0;
                return (
                  <div key={mod.id} className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-sm font-semibold">{mod.title}</span><span className="text-xs text-muted-foreground font-medium">{pct}%</span></div>
                    <Progress value={pct} className="h-2 rounded-full" />
                  </div>
                );
              })}
              <button className="w-full mt-2 border-2 border-timber text-foreground hover:bg-stone hover:scale-[1.02] active:scale-95 rounded-full h-11 font-bold transition-all duration-300" onClick={() => navigate("/citizen/training")}>Continue Training</button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions — organic asymmetric cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {quickActions.map((action, i) => (
            <Card key={i} className={`border-timber/30 shadow-soft cursor-pointer hover:shadow-float hover:-translate-y-1 transition-all duration-300 group ${actionRadii[i]}`} onClick={action.onClick}>
              <CardContent className="p-5 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${action.color} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-sm">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav items={navItems} activeItem={activeTab} onItemClick={handleTabClick} moduleColor="citizen" />
    </div>
  );
};

export default CitizenDashboard;
