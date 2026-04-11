import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatsCard } from "@/components/shared/StatsCard";
import { ScoreCircle } from "@/components/shared/ScoreCircle";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useCleanlinessScore, useWalletTransactions, useGovernmentBenefits } from "@/hooks/useWallet";
import { useMyReports } from "@/hooks/useWasteReports";
import { useTrainingModules, useTrainingProgress } from "@/hooks/useTraining";
import { 
  Home, AlertTriangle, MapPin, Coins, GraduationCap, Recycle, Heart, Zap, Droplets, Lightbulb, Building, Clock, ChevronRight, Camera, Trophy, Target, Calendar,
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
  const benefitColors: Record<string, string> = { light_bill: "text-eco-amber", water_tax: "text-eco-sky", property_tax: "text-eco-purple" };
  const benefitLabels: Record<string, string> = { light_bill: "Light Bill", water_tax: "Water Tax", property_tax: "Property Tax" };

  const completedModules = (progress || []).filter(p => p.completed).length;
  const totalModules = (modules || []).length;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppHeader 
        title="Citizen Dashboard" 
        subtitle={`Welcome back, ${profile?.full_name || "Citizen"}`}
        userName={profile?.full_name || "Citizen"}
        moduleColor="citizen"
        icon={<Recycle className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Cleanliness Score Card */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-eco p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ScoreCircle score={currentScore} maxScore={1000} size="lg" showLabel={false} />
              <div className="text-center md:text-left text-white">
                <h2 className="text-2xl font-display font-bold mb-1">Cleanliness Score</h2>
                <p className="text-white/80 mb-3">{currentScore > 500 ? "Great job! Keep it up!" : "Keep reporting to earn more points!"}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-white/20 text-white border-0"><Trophy className="h-3 w-3 mr-1" />{tier} Status</Badge>
                  <Badge className="bg-white/20 text-white border-0"><Target className="h-3 w-3 mr-1" />{1000 - currentScore} pts to max</Badge>
                </div>
              </div>
              <div className="hidden lg:block ml-auto">
                <Button className="bg-white text-primary hover:bg-white/90" onClick={() => navigate("/citizen/wallet")}>
                  View Full Stats <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Reports" value={String(reports?.length || 0)} icon={AlertTriangle} color="amber" />
          <StatsCard title="Points Earned" value={String(totalPoints)} icon={Coins} color="green" />
          <StatsCard title="Scrap Sold" value="₹0" icon={Recycle} color="teal" />
          <StatsCard title="Donations" value="0" icon={Heart} color="rose" />
        </div>

        {/* Government Benefits */}
        {(benefits || []).length > 0 && (
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2"><Zap className="h-5 w-5 text-eco-amber" />Government Benefits</CardTitle>
              <CardDescription>Discounts earned from your cleanliness score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(benefits || []).map((benefit, i) => {
                  const Icon = benefitIcons[benefit.benefit_type] || Lightbulb;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`p-3 rounded-xl bg-background ${benefitColors[benefit.benefit_type] || ""}`}><Icon className="h-6 w-6" /></div>
                      <div className="flex-1">
                        <p className="font-medium">{benefitLabels[benefit.benefit_type] || benefit.benefit_type}</p>
                        <p className="text-2xl font-display font-bold text-primary">{benefit.discount_percent}%</p>
                      </div>
                      <Badge variant={benefit.status === "active" ? "default" : "secondary"}>{benefit.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Recent Reports</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/citizen/report")}>View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No reports yet. Start reporting waste!</p>
              ) : recentReports.map((report: any) => (
                <div key={report.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-background"><MapPin className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{report.address || "Location captured"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={report.status} size="sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Training Progress */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2"><GraduationCap className="h-5 w-5 text-eco-purple" />Training Modules</CardTitle>
                <Badge variant="secondary">{completedModules}/{totalModules} Complete</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(modules || []).slice(0, 3).map((mod: any) => {
                const prog = (progress || []).find((p: any) => p.module_id === mod.id);
                const pct = prog?.progress || 0;
                return (
                  <div key={mod.id} className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{mod.title}</span><span className="text-xs text-muted-foreground">{pct}%</span></div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
              <Button className="w-full mt-2" variant="outline" onClick={() => navigate("/citizen/training")}>Continue Training</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Camera, label: "Report Waste", color: "bg-gradient-eco", onClick: () => navigate("/citizen/report") },
            { icon: Recycle, label: "Sell Scrap", color: "bg-gradient-ocean", onClick: () => navigate("/citizen/scrap") },
            { icon: Heart, label: "Donate Items", color: "bg-gradient-sunset", onClick: () => navigate("/citizen/donate") },
            { icon: Coins, label: "My Wallet", color: "bg-gradient-golden", onClick: () => navigate("/citizen/wallet") },
            { icon: Calendar, label: "Events", color: "bg-gradient-royal", onClick: () => navigate("/citizen/events") },
          ].map((action, i) => (
            <Card key={i} className="border-0 shadow-card cursor-pointer hover:shadow-hover transition-all group" onClick={action.onClick}>
              <CardContent className="p-5 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${action.color} mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-sm">{action.label}</p>
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
