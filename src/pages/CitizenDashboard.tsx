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
import { 
  Home,
  AlertTriangle, 
  MapPin, 
  Coins, 
  GraduationCap,
  Recycle,
  Heart,
  Zap,
  Droplets,
  Lightbulb,
  Building,
  Clock,
  ChevronRight,
  Camera,
  Trophy,
  Target,
  Calendar,
  MessageCircle,
} from "lucide-react";

type ActiveTab = "home" | "report" | "scrap" | "donate" | "wallet";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  const navItems = [
    { icon: Home, label: "Home", value: "home" as const },
    { icon: AlertTriangle, label: "Report", value: "report" as const },
    { icon: Recycle, label: "Scrap", value: "scrap" as const },
    { icon: Heart, label: "Donate", value: "donate" as const },
    { icon: Coins, label: "Wallet", value: "wallet" as const, badge: 3 },
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

  const recentReports = [
    { id: 1, location: "Sector 15, Near Park", status: "completed" as const, date: "2 days ago", reward: 50 },
    { id: 2, location: "Main Road, Junction", status: "in_progress" as const, date: "1 day ago", reward: 0 },
    { id: 3, location: "Market Area, Block B", status: "pending" as const, date: "3 hours ago", reward: 0 },
  ];

  const governmentBenefits = [
    { icon: Lightbulb, title: "Light Bill", discount: "15%", status: "active", color: "text-eco-amber" },
    { icon: Droplets, title: "Water Tax", discount: "10%", status: "active", color: "text-eco-sky" },
    { icon: Building, title: "Property Tax", discount: "5%", status: "pending", color: "text-eco-purple" },
  ];

  const trainingModules = [
    { title: "Waste Segregation", progress: 100, completed: true },
    { title: "Composting Basics", progress: 60, completed: false },
    { title: "Environmental Impact", progress: 0, completed: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppHeader 
        title="Citizen Dashboard" 
        subtitle="Welcome back, Rahul Kumar"
        userName="Rahul Kumar"
        moduleColor="citizen"
        notifications={3}
        icon={<Recycle className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Cleanliness Score Card */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-eco p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ScoreCircle score={785} maxScore={1000} size="lg" showLabel={false} />
              <div className="text-center md:text-left text-white">
                <h2 className="text-2xl font-display font-bold mb-1">Cleanliness Score</h2>
                <p className="text-white/80 mb-3">Great job! You're in the top 15% of citizens</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-white/20 text-white border-0"><Trophy className="h-3 w-3 mr-1" />Gold Status</Badge>
                  <Badge className="bg-white/20 text-white border-0"><Target className="h-3 w-3 mr-1" />215 pts to Platinum</Badge>
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
          <StatsCard title="Reports" value="24" icon={AlertTriangle} trend={{ value: "+3 this month", isPositive: true }} color="amber" />
          <StatsCard title="Points Earned" value="1,245" icon={Coins} trend={{ value: "+150 this week", isPositive: true }} color="green" />
          <StatsCard title="Scrap Sold" value="₹2,850" icon={Recycle} color="teal" />
          <StatsCard title="Donations" value="8" icon={Heart} badge={{ text: "Verified", variant: "secondary" }} color="rose" />
        </div>

        {/* Government Benefits */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display flex items-center gap-2"><Zap className="h-5 w-5 text-eco-amber" />Government Benefits</CardTitle>
                <CardDescription>Discounts earned from your cleanliness score</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/citizen/wallet")}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {governmentBenefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className={`p-3 rounded-xl bg-background ${benefit.color}`}><benefit.icon className="h-6 w-6" /></div>
                  <div className="flex-1">
                    <p className="font-medium">{benefit.title}</p>
                    <p className="text-2xl font-display font-bold text-primary">{benefit.discount}</p>
                  </div>
                  <Badge variant={benefit.status === "active" ? "default" : "secondary"}>{benefit.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-background"><MapPin className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{report.location}</p>
                    <p className="text-xs text-muted-foreground">{report.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.reward > 0 && (
                      <Badge variant="outline" className="text-eco-green border-eco-green/30 bg-eco-green/10">+{report.reward} pts</Badge>
                    )}
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Training Progress */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2"><GraduationCap className="h-5 w-5 text-eco-purple" />Training Modules</CardTitle>
                <Badge variant="secondary">2/3 Complete</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {trainingModules.map((module, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">{module.title}</span><span className="text-xs text-muted-foreground">{module.progress}%</span></div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              ))}
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

      <BottomNav 
        items={navItems} 
        activeItem={activeTab} 
        onItemClick={handleTabClick}
        moduleColor="citizen"
      />
    </div>
  );
};

export default CitizenDashboard;
