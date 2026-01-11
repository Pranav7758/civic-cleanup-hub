import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Upload,
  ChevronRight,
  Truck,
  Star,
  Calendar,
  TrendingUp
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
  image?: string;
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
    {
      id: "T001",
      location: "Sector 15, Near Community Park",
      address: "Plot 45, Sector 15, Near Community Park",
      type: "Illegal Dumping",
      priority: "high",
      status: "pending",
      citizenName: "Rahul Kumar",
      citizenPhone: "+91 98765 43210",
      reportedAt: "2 hours ago",
      wasteType: "Mixed Waste",
      notes: "Large pile near the park entrance",
    },
    {
      id: "T002",
      location: "Main Road, Block B",
      address: "Shop 12, Main Road, Block B",
      type: "Scheduled Pickup",
      priority: "medium",
      status: "accepted",
      citizenName: "Priya Sharma",
      citizenPhone: "+91 87654 32109",
      reportedAt: "4 hours ago",
      wasteType: "Recyclable",
    },
    {
      id: "T003",
      location: "Industrial Area, Zone 3",
      address: "Factory Road, Industrial Area",
      type: "Hazardous Waste",
      priority: "high",
      status: "in_progress",
      citizenName: "Admin Report",
      citizenPhone: "+91 76543 21098",
      reportedAt: "1 day ago",
      wasteType: "Chemical",
      notes: "Requires special handling",
    },
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
        <AppHeader 
          title="Task Details" 
          subtitle={`Task #${selectedTask.id}`}
          moduleColor="worker"
          showBack
          onBack={() => setSelectedTask(null)}
          icon={<Briefcase className="h-6 w-6 text-white" />}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Status & Priority */}
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedTask.status} size="lg" />
            <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
              {selectedTask.priority} priority
            </Badge>
          </div>

          {/* Location Card */}
          <Card className="border-0 shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{selectedTask.location}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{selectedTask.address}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-ocean">
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Tracking */}
          <TrackingMap
            points={[
              { type: "origin", label: "Your Location" },
              { type: "current", label: "En Route" },
              { type: "destination", label: selectedTask.location },
            ]}
            estimatedTime="12 mins"
            distance="3.2 km"
            isLive
          />

          {/* Task Info */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Waste Type</p>
                  <p className="font-medium">{selectedTask.wasteType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Task Type</p>
                  <p className="font-medium">{selectedTask.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reported By</p>
                  <p className="font-medium">{selectedTask.citizenName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reported</p>
                  <p className="font-medium">{selectedTask.reportedAt}</p>
                </div>
              </div>
              {selectedTask.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedTask.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Actions */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Complete Task</CardTitle>
              <CardDescription>Verify your work to complete this task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <QrCode className="h-8 w-8" />
                  <span>Scan QR Code</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </Button>
              </div>
              <Button className="w-full bg-gradient-eco" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Completed
              </Button>
            </CardContent>
          </Card>
        </main>

        <BottomNav 
          items={navItems} 
          activeItem={activeTab} 
          onItemClick={(value) => setActiveTab(value as ActiveTab)}
          moduleColor="worker"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppHeader 
        title="Worker Dashboard" 
        subtitle="Good morning, Suresh Kumar"
        userName="Suresh Kumar"
        moduleColor="worker"
        notifications={5}
        icon={<Briefcase className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Performance Card */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-ocean p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-white/80 mb-1">Today's Performance</p>
                <p className="text-4xl font-bold">94%</p>
                <p className="text-sm text-white/80 mt-1">Excellent work!</p>
              </div>
              <div className="text-right text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-score-gold" />
                  <span className="font-semibold">4.8 Rating</span>
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% vs last week
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Pending"
            value={tasks.filter(t => t.status === "pending").length}
            icon={AlertCircle}
            color="amber"
          />
          <StatsCard
            title="In Progress"
            value={tasks.filter(t => t.status === "in_progress" || t.status === "accepted").length}
            icon={Truck}
            color="blue"
          />
          <StatsCard
            title="Completed Today"
            value="8"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Earnings"
            value="₹1,250"
            icon={Briefcase}
            color="purple"
          />
        </div>

        {/* Active Tasks */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Tasks</CardTitle>
              <Badge variant="secondary">{tasks.length} tasks</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      task.priority === "high" ? "bg-destructive/10" : "bg-secondary/10"
                    }`}>
                      <MapPin className={`h-5 w-5 ${
                        task.priority === "high" ? "text-destructive" : "text-secondary"
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{task.location}</h4>
                      <p className="text-sm text-muted-foreground">{task.type}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground">{task.reportedAt}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNav 
        items={navItems} 
        activeItem={activeTab} 
        onItemClick={(value) => setActiveTab(value as ActiveTab)}
        moduleColor="worker"
      />
    </div>
  );
};

export default WorkerDashboard;
