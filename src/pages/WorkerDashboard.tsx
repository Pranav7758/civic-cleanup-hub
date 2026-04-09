import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrackingMap } from "@/components/shared/TrackingMap";
import {
  Home,
  ClipboardList,
  MapPin,
  CheckCircle,
  User,
  Briefcase,
  Clock,
  AlertCircle,
  Camera,
  Navigation,
  Phone,
  QrCode,
  ChevronRight,
  Truck,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Target,
  MessageCircle,
  Shield,
  Flame,
  ThumbsUp,
  IndianRupee,
  BarChart3,
} from "lucide-react";

type ActiveTab = "home" | "tasks" | "map" | "history" | "profile";

interface Task {
  id: string;
  location: string;
  address: string;
  type: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "accepted" | "in_progress" | "completed";
  citizenName: string;
  citizenPhone: string;
  reportedAt: string;
  wasteType: string;
  notes?: string;
}

const WorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const navItems = [
    { icon: Home, label: "Home", value: "home" as const },
    { icon: ClipboardList, label: "Tasks", value: "tasks" as const, badge: 5 },
    { icon: MapPin, label: "Map", value: "map" as const },
    { icon: Clock, label: "History", value: "history" as const },
    { icon: User, label: "Profile", value: "profile" as const },
  ];

  const tasks: Task[] = [
    { id: "T001", location: "Sector 15, Near Community Park", address: "Plot 45, Sector 15", type: "Illegal Dumping", priority: "high", status: "pending", citizenName: "Rahul Kumar", citizenPhone: "+91 98765 43210", reportedAt: "2 hours ago", wasteType: "Mixed Waste", notes: "Large pile near park entrance" },
    { id: "T002", location: "Main Road, Block B", address: "Shop 12, Main Road", type: "Scheduled Pickup", priority: "medium", status: "accepted", citizenName: "Priya Sharma", citizenPhone: "+91 87654 32109", reportedAt: "4 hours ago", wasteType: "Recyclable" },
    { id: "T003", location: "Industrial Area, Zone 3", address: "Factory Road", type: "Hazardous Waste", priority: "high", status: "in_progress", citizenName: "Admin Report", citizenPhone: "+91 76543 21098", reportedAt: "1 day ago", wasteType: "Chemical", notes: "Requires special handling" },
  ];

  const completedTasks = [
    { id: "T098", location: "Sector 22, Market", type: "Scheduled Pickup", completedAt: "Today, 10:30 AM", rating: 5, earnings: 150 },
    { id: "T097", location: "Old City, Block A", type: "Illegal Dumping", completedAt: "Today, 8:15 AM", rating: 4, earnings: 200 },
    { id: "T096", location: "Highway Service Road", type: "Bulk Waste", completedAt: "Yesterday, 4:00 PM", rating: 5, earnings: 300 },
    { id: "T095", location: "Residential Colony, Phase 3", type: "Scheduled Pickup", completedAt: "Yesterday, 11:00 AM", rating: 5, earnings: 150 },
    { id: "T094", location: "Park Avenue", type: "Illegal Dumping", completedAt: "2 days ago", rating: 4, earnings: 200 },
    { id: "T093", location: "Market Square", type: "Scheduled Pickup", completedAt: "2 days ago", rating: 5, earnings: 150 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-status-warning/10 text-status-warning border-status-warning/20";
      case "low": return "bg-status-success/10 text-status-success border-status-success/20";
      default: return "";
    }
  };

  // Task Detail View
  if (selectedTask) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <AppHeader title="Task Details" subtitle={`Task #${selectedTask.id}`} moduleColor="worker" showBack onBack={() => setSelectedTask(null)} icon={<Briefcase className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedTask.status} size="lg" />
            <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority} priority</Badge>
          </div>
          <Card className="border-0 shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary/10"><MapPin className="h-6 w-6 text-secondary" /></div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-lg mb-1">{selectedTask.location}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{selectedTask.address}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-ocean"><Navigation className="h-4 w-4 mr-2" />Navigate</Button>
                    <Button size="sm" variant="outline"><Phone className="h-4 w-4 mr-2" />Call</Button>
                    <Button size="sm" variant="outline"><MessageCircle className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <TrackingMap points={[{ type: "origin", label: "Your Location" }, { type: "current", label: "En Route" }, { type: "destination", label: selectedTask.location }]} estimatedTime="12 mins" distance="3.2 km" isLive />
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Task Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground mb-1">Waste Type</p><p className="font-medium">{selectedTask.wasteType}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Task Type</p><p className="font-medium">{selectedTask.type}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Reported By</p><p className="font-medium">{selectedTask.citizenName}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Reported</p><p className="font-medium">{selectedTask.reportedAt}</p></div>
              </div>
              {selectedTask.notes && (
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-sm">{selectedTask.notes}</p></div>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Complete Task</CardTitle><CardDescription>Verify your work to complete this task</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2"><QrCode className="h-8 w-8" /><span>Scan QR Code</span></Button>
                <Button variant="outline" className="h-24 flex-col gap-2"><Camera className="h-8 w-8" /><span>Take Photo</span></Button>
              </div>
              <Button className="w-full bg-gradient-eco" size="lg"><CheckCircle className="h-5 w-5 mr-2" />Mark as Completed</Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav items={navItems} activeItem={activeTab} onItemClick={(value) => setActiveTab(value as ActiveTab)} moduleColor="worker" />
      </div>
    );
  }

  // History Tab
  if (activeTab === "history") {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <AppHeader title="Task History" subtitle="Your completed pickups" userName="Suresh Kumar" moduleColor="worker" icon={<Briefcase className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-display font-bold text-primary">156</p><p className="text-xs text-muted-foreground">Total Tasks</p></CardContent></Card>
            <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-display font-bold text-eco-amber">₹18.5K</p><p className="text-xs text-muted-foreground">Total Earned</p></CardContent></Card>
            <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-display font-bold text-eco-sky">4.8</p><p className="text-xs text-muted-foreground">Avg Rating</p></CardContent></Card>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Completed Tasks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-eco-green/10"><CheckCircle className="h-4 w-4 text-eco-green" /></div>
                    <div>
                      <p className="font-medium text-sm">{task.location}</p>
                      <p className="text-xs text-muted-foreground">{task.type} • {task.completedAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-0.5">
                      {Array.from({ length: task.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 text-score-gold fill-score-gold" />
                      ))}
                    </div>
                    <span className="text-sm font-mono font-medium text-eco-green">+₹{task.earnings}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
        <BottomNav items={navItems} activeItem={activeTab} onItemClick={(value) => setActiveTab(value as ActiveTab)} moduleColor="worker" />
      </div>
    );
  }

  // Profile Tab
  if (activeTab === "profile") {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <AppHeader title="My Profile" subtitle="Worker Performance" userName="Suresh Kumar" moduleColor="worker" icon={<Briefcase className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <Card className="border-0 shadow-card overflow-hidden">
            <div className="bg-gradient-ocean p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">Suresh Kumar</h2>
              <p className="text-white/80 text-sm">Ward 12 • Zone A</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0"><Star className="h-3 w-3 mr-1" />4.8 Rating</Badge>
                <Badge className="bg-white/20 text-white border-0"><Award className="h-3 w-3 mr-1" />Top 5%</Badge>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <StatsCard title="Tasks Done" value="156" icon={CheckCircle} color="green" />
            <StatsCard title="On-time Rate" value="94%" icon={Clock} color="blue" />
            <StatsCard title="This Month" value="₹4,500" icon={IndianRupee} color="amber" />
            <StatsCard title="Streak" value="12 days" icon={Flame} color="rose" />
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Performance Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Speed", value: 92 },
                { label: "Quality", value: 96 },
                { label: "Attendance", value: 88 },
                { label: "Citizen Rating", value: 95 },
              ].map((metric, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm"><span>{metric.label}</span><span className="font-mono font-medium">{metric.value}%</span></div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Achievements</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "🏆", label: "100 Tasks", earned: true },
                  { icon: "⚡", label: "Speed Star", earned: true },
                  { icon: "🌟", label: "5-Star Week", earned: true },
                  { icon: "🔥", label: "10-Day Streak", earned: true },
                  { icon: "💎", label: "Elite Worker", earned: false },
                  { icon: "🎯", label: "Perfect Month", earned: false },
                ].map((badge, i) => (
                  <div key={i} className={`p-3 rounded-xl text-center ${badge.earned ? "bg-primary/10" : "bg-muted/50 opacity-50"}`}>
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="text-[10px] font-medium">{badge.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full text-destructive border-destructive/30">
            Log Out
          </Button>
        </main>
        <BottomNav items={navItems} activeItem={activeTab} onItemClick={(value) => setActiveTab(value as ActiveTab)} moduleColor="worker" />
      </div>
    );
  }

  // Map Tab
  if (activeTab === "map") {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <AppHeader title="Task Map" subtitle="View all tasks on map" userName="Suresh Kumar" moduleColor="worker" icon={<Briefcase className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="h-64 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-2" />
              <p className="font-display font-medium">Interactive Task Map</p>
              <p className="text-xs">All assigned tasks plotted with priority colors</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-display font-semibold">Nearby Tasks</h3>
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => { setSelectedTask(task); setActiveTab("home"); }}>
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${task.priority === "high" ? "bg-destructive" : "bg-eco-amber"}`} />
                  <div>
                    <p className="text-sm font-medium">{task.location}</p>
                    <p className="text-xs text-muted-foreground">{task.type}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{task.reportedAt}</span>
              </div>
            ))}
          </div>
        </main>
        <BottomNav items={navItems} activeItem={activeTab} onItemClick={(value) => setActiveTab(value as ActiveTab)} moduleColor="worker" />
      </div>
    );
  }

  // Home / Tasks Tab
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppHeader title="Worker Dashboard" subtitle="Good morning, Suresh Kumar" userName="Suresh Kumar" moduleColor="worker" notifications={5} icon={<Briefcase className="h-6 w-6 text-white" />} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-ocean p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-white/80 mb-1">Today's Performance</p>
                <p className="text-4xl font-display font-bold">94%</p>
                <p className="text-sm text-white/80 mt-1">Excellent work!</p>
              </div>
              <div className="text-right text-white">
                <div className="flex items-center gap-2 mb-2"><Star className="h-5 w-5 text-score-gold" /><span className="font-semibold">4.8 Rating</span></div>
                <Badge className="bg-white/20 text-white border-0"><TrendingUp className="h-3 w-3 mr-1" />+5% vs last week</Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Pending" value={tasks.filter(t => t.status === "pending").length} icon={AlertCircle} color="amber" />
          <StatsCard title="In Progress" value={tasks.filter(t => t.status === "in_progress" || t.status === "accepted").length} icon={Truck} color="blue" />
          <StatsCard title="Completed Today" value="8" icon={CheckCircle} color="green" />
          <StatsCard title="Total Earnings" value="₹1,250" icon={IndianRupee} color="purple" />
        </div>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display">Active Tasks</CardTitle>
              <Badge variant="secondary">{tasks.length} tasks</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => setSelectedTask(task)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${task.priority === "high" ? "bg-destructive/10" : "bg-secondary/10"}`}>
                      <MapPin className={`h-5 w-5 ${task.priority === "high" ? "text-destructive" : "text-secondary"}`} />
                    </div>
                    <div><h4 className="font-medium">{task.location}</h4><p className="text-sm text-muted-foreground">{task.type}</p></div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground">{task.reportedAt}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
      <BottomNav items={navItems} activeItem={activeTab} onItemClick={(value) => setActiveTab(value as ActiveTab)} moduleColor="worker" />
    </div>
  );
};

export default WorkerDashboard;
