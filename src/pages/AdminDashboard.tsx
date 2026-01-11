import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/AppHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { 
  LayoutDashboard,
  Users,
  Briefcase,
  Heart,
  Package,
  Shield,
  TrendingUp,
  TrendingDown,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Coins,
  Building,
  Lightbulb,
  Droplets,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Bell,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const overviewStats = [
    { title: "Total Citizens", value: "52,340", trend: "+12%", isUp: true, icon: Users, color: "green" as const },
    { title: "Active Workers", value: "2,450", trend: "+8%", isUp: true, icon: Briefcase, color: "blue" as const },
    { title: "Registered NGOs", value: "156", trend: "+5%", isUp: true, icon: Heart, color: "rose" as const },
    { title: "Scrap Dealers", value: "89", trend: "+15%", isUp: true, icon: Package, color: "amber" as const },
  ];

  const wasteStats = [
    { label: "Dry Waste", value: 45, color: "bg-eco-amber" },
    { label: "Wet Waste", value: 30, color: "bg-eco-green" },
    { label: "Recyclable", value: 18, color: "bg-eco-sky" },
    { label: "Hazardous", value: 7, color: "bg-eco-rose" },
  ];

  const recentActivities = [
    { type: "report", message: "New illegal dumping report in Sector 15", time: "5 mins ago", icon: AlertTriangle, color: "text-status-warning" },
    { type: "user", message: "150 new citizen registrations today", time: "1 hour ago", icon: Users, color: "text-eco-green" },
    { type: "benefit", message: "₹45,000 in benefits approved", time: "2 hours ago", icon: Coins, color: "text-eco-amber" },
    { type: "ngo", message: "Hope Foundation completed 50 donations", time: "3 hours ago", icon: Heart, color: "text-eco-rose" },
  ];

  const pendingApprovals = [
    { id: 1, name: "Rahul Kumar", type: "Light Bill Discount", amount: "15%", score: 785 },
    { id: 2, name: "Priya Sharma", type: "Water Tax Discount", amount: "10%", score: 720 },
    { id: 3, name: "Amit Verma", type: "Property Tax Discount", amount: "5%", score: 650 },
  ];

  const topPerformers = [
    { name: "Suresh Kumar", role: "Worker", metric: "98% completion", trend: "+5%" },
    { name: "Hope Foundation", role: "NGO", metric: "450 donations", trend: "+18%" },
    { name: "Green Recyclers", role: "Dealer", metric: "2.5T recycled", trend: "+22%" },
  ];

  const hotspots = [
    { area: "Sector 15, Industrial Zone", reports: 45, status: "critical" },
    { area: "Old City Market Area", reports: 32, status: "high" },
    { area: "Railway Station Vicinity", reports: 28, status: "medium" },
    { area: "River Bank, South Side", reports: 18, status: "medium" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Admin Dashboard" 
        subtitle="System Overview"
        userName="Admin"
        moduleColor="admin"
        notifications={12}
        icon={<Shield className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Coins className="h-4 w-4" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat, i) => (
                <StatsCard
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  trend={{ value: stat.trend, isPositive: stat.isUp }}
                  color={stat.color}
                />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Waste Distribution */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-eco-purple" />
                    Waste Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wasteStats.map((stat, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{stat.label}</span>
                        <span className="font-medium">{stat.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stat.color} rounded-full transition-all`}
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-eco-sky" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivities.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <activity.icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-eco-green" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPerformers.map((performer, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{performer.metric}</p>
                        <Badge variant="outline" className="text-status-success border-status-success/30 bg-status-success/10">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          {performer.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Dumping Hotspots */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-status-error" />
                      Dumping Hotspots
                    </CardTitle>
                    <Button variant="outline" size="sm">View Map</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hotspots.map((spot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          spot.status === "critical" ? "bg-status-error animate-pulse" :
                          spot.status === "high" ? "bg-status-warning" : "bg-status-info"
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{spot.area}</p>
                          <p className="text-xs text-muted-foreground">{spot.reports} reports</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        spot.status === "critical" ? "border-status-error text-status-error" :
                        spot.status === "high" ? "border-status-warning text-status-warning" : ""
                      }>
                        {spot.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pending Benefit Approvals */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-eco-amber" />
                      Pending Approvals
                    </CardTitle>
                    <Badge variant="secondary">{pendingApprovals.length} pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{approval.name}</p>
                        <p className="text-sm text-muted-foreground">{approval.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-eco-amber">{approval.amount}</p>
                          <p className="text-xs text-muted-foreground">Score: {approval.score}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-status-success">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-status-error">
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-6">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  User management interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6 mt-6">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Benefits Management</CardTitle>
                <CardDescription>Approve and manage government benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  Benefits management interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Detailed analytics and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  Analytics dashboard coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  Settings interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
