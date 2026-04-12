import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/AppHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Heart,
  Package,
  Shield,
  TrendingUp,
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
  Search,
  ChevronRight,
  ArrowUpRight,
  Zap,
  Calendar,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  Star,
  Trash2,
  UserCheck,
  UserX,
  FileText,
  Globe,
  Bell,
  Lock,
  Palette,
  Database,
  Mail,
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
    { label: "Dry Waste", value: 45, color: "bg-clay" },
    { label: "Wet Waste", value: 30, color: "bg-moss" },
    { label: "Recyclable", value: 18, color: "bg-eco-sky" },
    { label: "Hazardous", value: 7, color: "bg-burnt-sienna" },
  ];

  const recentActivities = [
    { type: "report", message: "New illegal dumping report in Sector 15", time: "5 mins ago", icon: AlertTriangle, color: "text-status-warning" },
    { type: "user", message: "150 new citizen registrations today", time: "1 hour ago", icon: Users, color: "text-moss" },
    { type: "benefit", message: "₹45,000 in benefits approved", time: "2 hours ago", icon: Coins, color: "text-clay" },
    { type: "ngo", message: "Hope Foundation completed 50 donations", time: "3 hours ago", icon: Heart, color: "text-burnt-sienna" },
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

  // Users data
  const allUsers = [
    { id: 1, name: "Rahul Kumar", email: "rahul@email.com", role: "Citizen", score: 785, status: "active", joined: "Jan 2024", reports: 24 },
    { id: 2, name: "Priya Sharma", email: "priya@email.com", role: "Citizen", score: 720, status: "active", joined: "Feb 2024", reports: 18 },
    { id: 3, name: "Suresh Kumar", email: "suresh@email.com", role: "Worker", score: 0, status: "active", joined: "Dec 2023", reports: 0 },
    { id: 4, name: "Hope Foundation", email: "hope@ngo.org", role: "NGO", score: 0, status: "active", joined: "Nov 2023", reports: 0 },
    { id: 5, name: "Green Recyclers", email: "green@recyclers.com", role: "Dealer", score: 0, status: "active", joined: "Oct 2023", reports: 0 },
    { id: 6, name: "Vikram Singh", email: "vikram@email.com", role: "Citizen", score: 320, status: "suspended", joined: "Mar 2024", reports: 5 },
    { id: 7, name: "Anita Devi", email: "anita@email.com", role: "Citizen", score: 890, status: "active", joined: "Jan 2024", reports: 32 },
    { id: 8, name: "Metro Workers Union", email: "metro@workers.com", role: "Worker", score: 0, status: "pending", joined: "Apr 2024", reports: 0 },
  ];

  // Benefits data
  const benefitSchemes = [
    { name: "Light Bill Discount", minScore: 500, discount: "15%", beneficiaries: 12450, budget: "₹45L", icon: Lightbulb, color: "text-clay" },
    { name: "Water Tax Waiver", minScore: 400, discount: "10%", beneficiaries: 18200, budget: "₹32L", icon: Droplets, color: "text-eco-sky" },
    { name: "Property Tax Rebate", minScore: 700, discount: "5%", beneficiaries: 5600, budget: "₹78L", icon: Building, color: "text-eco-purple" },
  ];

  const allBenefitApprovals = [
    ...pendingApprovals,
    { id: 4, name: "Sunita Devi", type: "Light Bill Discount", amount: "15%", score: 810 },
    { id: 5, name: "Vikram Patel", type: "Water Tax Discount", amount: "10%", score: 680 },
    { id: 6, name: "Meena Kumari", type: "Property Tax Discount", amount: "5%", score: 750 },
  ];

  // Analytics data
  const monthlyData = [
    { month: "Jul", reports: 1200, resolved: 1100, users: 42000 },
    { month: "Aug", reports: 1450, resolved: 1350, users: 44500 },
    { month: "Sep", reports: 1300, resolved: 1250, users: 46800 },
    { month: "Oct", reports: 1600, resolved: 1500, users: 49200 },
    { month: "Nov", reports: 1800, resolved: 1680, users: 51000 },
    { month: "Dec", reports: 1550, resolved: 1480, users: 52340 },
  ];

  return (
    <div className="min-h-screen bg-rice-paper">
      <AppHeader
        title="Admin Dashboard"
        subtitle="System Overview"
        userName="Admin"
        moduleColor="admin"
        notifications={12}
        icon={<Shield className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2"><Coins className="h-4 w-4" />Benefits</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" />Analytics</TabsTrigger>
            <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" />Events</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" />Settings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat, i) => (
                <StatsCard key={i} title={stat.title} value={stat.value} icon={stat.icon} trend={{ value: stat.trend, isPositive: stat.isUp }} color={stat.color} />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display flex items-center gap-2"><PieChart className="h-5 w-5 text-eco-purple" />Waste Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wasteStats.map((stat, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm"><span>{stat.label}</span><span className="font-medium">{stat.value}%</span></div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${stat.value}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display flex items-center gap-2"><Activity className="h-5 w-5 text-eco-sky" />Recent Activity</CardTitle>
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

              <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display flex items-center gap-2"><TrendingUp className="h-5 w-5 text-moss" />Top Performers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPerformers.map((performer, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div><p className="font-medium">{performer.name}</p><p className="text-sm text-muted-foreground">{performer.role}</p></div>
                      <div className="text-right">
                        <p className="font-medium">{performer.metric}</p>
                        <Badge variant="outline" className="text-status-success border-status-success/30 bg-status-success/10"><ArrowUpRight className="h-3 w-3 mr-1" />{performer.trend}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display flex items-center gap-2"><MapPin className="h-5 w-5 text-status-error" />Dumping Hotspots</CardTitle>
                    <Button variant="outline" size="sm">View Map</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hotspots.map((spot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${spot.status === "critical" ? "bg-status-error animate-pulse" : spot.status === "high" ? "bg-status-warning" : "bg-status-info"}`} />
                        <div><p className="font-medium text-sm">{spot.area}</p><p className="text-xs text-muted-foreground">{spot.reports} reports</p></div>
                      </div>
                      <Badge variant="outline" className={spot.status === "critical" ? "border-status-error text-status-error" : spot.status === "high" ? "border-status-warning text-status-warning" : ""}>{spot.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display flex items-center gap-2"><Zap className="h-5 w-5 text-clay" />Pending Approvals</CardTitle>
                    <Badge variant="secondary">{pendingApprovals.length} pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div><p className="font-medium">{approval.name}</p><p className="text-sm text-muted-foreground">{approval.type}</p></div>
                      <div className="flex items-center gap-3">
                        <div className="text-right"><p className="font-bold text-clay">{approval.amount}</p><p className="text-xs text-muted-foreground">Score: {approval.score}</p></div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-status-success"><CheckCircle className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-status-error"><Ban className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filter</Button>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Users" value="55,035" icon={Users} color="green" />
              <StatsCard title="Active Today" value="12,450" icon={UserCheck} color="blue" />
              <StatsCard title="Pending Verification" value="23" icon={Clock} color="amber" />
              <StatsCard title="Suspended" value="8" icon={UserX} color="rose" />
            </div>

            <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground">User</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground">Role</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Score</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-4 text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div><p className="font-medium text-sm">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {user.score > 0 ? <span className="font-mono font-medium">{user.score}</span> : <span className="text-muted-foreground text-sm">—</span>}
                          </td>
                          <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{user.joined}</td>
                          <td className="p-4">
                            <Badge variant={user.status === "active" ? "default" : user.status === "suspended" ? "destructive" : "secondary"} className="text-[10px]">{user.status}</Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BENEFITS TAB */}
          <TabsContent value="benefits" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benefitSchemes.map((scheme, i) => (
                <Card key={i} className="border-timber/30 shadow-soft rounded-[1.5rem]">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl bg-muted ${scheme.color}`}><scheme.icon className="h-6 w-6" /></div>
                      <div>
                        <h3 className="font-display font-semibold text-sm">{scheme.name}</h3>
                        <p className="text-xs text-muted-foreground">Min Score: {scheme.minScore}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-xl font-display font-bold text-primary">{scheme.discount}</p>
                        <p className="text-[10px] text-muted-foreground">Discount</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-xl font-display font-bold">{(scheme.beneficiaries / 1000).toFixed(1)}K</p>
                        <p className="text-[10px] text-muted-foreground">Beneficiaries</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Budget allocated: {scheme.budget}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-display">Pending Approvals</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-moss border-eco-green/30">Approve All</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {allBenefitApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{approval.name}</p>
                        <p className="text-xs text-muted-foreground">{approval.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="font-display font-bold text-clay">{approval.amount}</p>
                        <p className="text-xs text-muted-foreground">Score: {approval.score}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-gradient-eco h-8">Approve</Button>
                        <Button size="sm" variant="outline" className="h-8">Reject</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">Platform Analytics</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-1" />Last 6 months</Button>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Download Report</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Reports Filed" value="8,900" icon={FileText} trend={{ value: "+24%", isPositive: true }} color="green" />
              <StatsCard title="Resolution Rate" value="93.2%" icon={CheckCircle} trend={{ value: "+2.1%", isPositive: true }} color="blue" />
              <StatsCard title="Avg Response Time" value="2.4 hrs" icon={Clock} trend={{ value: "-18%", isPositive: true }} color="amber" />
              <StatsCard title="Scrap Recycled" value="456T" icon={Package} trend={{ value: "+35%", isPositive: true }} color="purple" />
            </div>

            {/* Chart representations using bars */}
            <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">Monthly Report Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((data, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium w-8">{data.month}</span>
                        <span className="text-xs text-muted-foreground">{data.reports} filed / {data.resolved} resolved</span>
                      </div>
                      <div className="flex gap-1 h-5">
                        <div className="bg-primary rounded-sm transition-all" style={{ width: `${(data.reports / 2000) * 100}%` }} />
                        <div className="bg-eco-sky rounded-sm transition-all" style={{ width: `${(data.resolved / 2000) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" />Reports Filed</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-eco-sky" />Resolved</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
                <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Recycling Analytics</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Paper", value: "145T", pct: 32 },
                    { label: "Plastic", value: "98T", pct: 21 },
                    { label: "Metal", value: "125T", pct: 27 },
                    { label: "E-Waste", value: "88T", pct: 20 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span className="font-mono">{item.value} ({item.pct}%)</span></div>
                      <Progress value={item.pct} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
                <CardHeader className="pb-3"><CardTitle className="text-lg font-display">NGO Transparency Report</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Hope Foundation", donations: 450, distributed: 440, verified: true },
                    { name: "Helping Hands Trust", donations: 280, distributed: 275, verified: true },
                    { name: "Green Earth Society", donations: 190, distributed: 180, verified: false },
                  ].map((ngo, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{ngo.name}</p>
                          {ngo.verified && <Badge variant="outline" className="text-[10px] text-moss border-eco-green/30">Verified</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{ngo.donations} received • {ngo.distributed} distributed</p>
                      </div>
                      <span className="font-mono font-medium text-sm">{Math.round((ngo.distributed / ngo.donations) * 100)}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EVENTS TAB */}
          <TabsContent value="events" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">Community Events Management</h2>
              <Button className="bg-gradient-eco"><Calendar className="h-4 w-4 mr-2" />Create Event</Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Active Events" value="5" icon={Calendar} color="green" />
              <StatsCard title="Total Participants" value="2,340" icon={Users} color="blue" />
              <StatsCard title="Areas Cleaned" value="45" icon={MapPin} color="amber" />
              <StatsCard title="Points Distributed" value="58K" icon={Coins} color="purple" />
            </div>

            <Card className="border-timber/30 shadow-soft rounded-[1.5rem]">
              <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Upcoming Drives</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Sector 15 Mega Cleanup", date: "15 Dec 2024", participants: 125, maxP: 200, status: "open" },
                  { title: "River Bank Restoration", date: "21 Dec 2024", participants: 80, maxP: 150, status: "open" },
                  { title: "Industrial Area Audit", date: "28 Dec 2024", participants: 12, maxP: 30, status: "admin_only" },
                ].map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.date} • {event.participants}/{event.maxP} registered</p>
                      <Progress value={(event.participants / event.maxP) * 100} className="h-1.5 mt-2 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.status === "open" ? "default" : "secondary"}>{event.status === "open" ? "Public" : "Admin Only"}</Badge>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <h2 className="font-display font-bold text-lg">Platform Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Globe, title: "General Settings", desc: "Platform name, timezone, language preferences", items: ["Platform Name: EcoConnect", "Region: India", "Language: English, Hindi"] },
                { icon: Bell, title: "Notification Settings", desc: "Configure alerts and communication", items: ["Email notifications", "SMS alerts for workers", "Push notifications"] },
                { icon: Lock, title: "Security & Access", desc: "Authentication and role management", items: ["Two-factor authentication", "Session timeout: 30 min", "API rate limiting"] },
                { icon: Database, title: "Data & Storage", desc: "Database and file management", items: ["Storage used: 45.2 GB / 100 GB", "Auto-backup: Daily", "Data retention: 2 years"] },
                { icon: Palette, title: "Appearance", desc: "Theme and branding options", items: ["Dark mode support", "Custom brand colors", "Logo configuration"] },
                { icon: Mail, title: "Email Templates", desc: "Customize system emails", items: ["Welcome email", "Report confirmation", "Benefit approval"] },
              ].map((section, i) => (
                <Card key={i} className="border-timber/30 shadow-soft rounded-[1.5rem] hover:shadow-float transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-eco-purple/10">
                        <section.icon className="h-6 w-6 text-eco-purple" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold">{section.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{section.desc}</p>
                        <div className="space-y-1">
                          {section.items.map((item, j) => (
                            <p key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-moss" /> {item}
                            </p>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
