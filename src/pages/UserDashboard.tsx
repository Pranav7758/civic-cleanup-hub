import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  MapPin, 
  Package, 
  Coins, 
  Calendar, 
  BookOpen,
  LogOut,
  User,
  Recycle,
  Bell
} from "lucide-react";
import ReportGarbage from "@/components/ReportGarbage";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string | null>(null);

  const dashboardItems = [
    {
      title: "Report Illegal Dumping",
      description: "Report unauthorized waste disposal in your area",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      action: () => setActiveView("report-dumping")
    },
    {
      title: "View Nearby Facilities", 
      description: "Find waste collection centers and recycling points",
      icon: MapPin,
      color: "text-primary",
      bgColor: "bg-primary/10",
      action: () => console.log("View facilities")
    },
    {
      title: "Order Compost Kit",
      description: "Request organic waste compost kits for delivery",
      icon: Package,
      color: "text-secondary",
      bgColor: "bg-secondary/10", 
      action: () => console.log("Order compost")
    },
    {
      title: "View Incentive Points",
      description: "Check your rewards and environmental contributions",
      icon: Coins,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      action: () => console.log("View points")
    },
    {
      title: "Participate in Cleanup Event",
      description: "Join community cleaning drives and initiatives",
      icon: Calendar,
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      action: () => console.log("Join cleanup")
    },
    {
      title: "View Training Materials",
      description: "Access waste management guides and best practices",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: () => console.log("View training")
    }
  ];

  // Show ReportGarbage component when active
  if (activeView === "report-dumping") {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <header className="bg-white shadow-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveView(null)}
                  className="mr-2"
                >
                  ← Back
                </Button>
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-civic-dark">Report Illegal Dumping</h1>
                  <p className="text-sm text-muted-foreground">Submit a new waste report</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <ReportGarbage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-civic-dark">Citizen Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, John Doe</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reports Submitted</p>
                  <p className="text-2xl font-bold text-civic-dark">12</p>
                </div>
                <Badge variant="secondary">+2 this month</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reward Points</p>
                  <p className="text-2xl font-bold text-civic-dark">1,245</p>
                </div>
                <Badge className="bg-amber-100 text-amber-700">Gold Status</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Events Joined</p>
                  <p className="text-2xl font-bold text-civic-dark">8</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-hover transition-all duration-300 cursor-pointer shadow-card border-0"
                onClick={item.action}
              >
                <CardHeader className="pb-4">
                  <div className={`p-3 ${item.bgColor} rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <CardTitle className="text-lg text-civic-dark">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Access Service
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-civic-dark">Recent Activity</CardTitle>
            <CardDescription>Your latest interactions with the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reported illegal dumping</p>
                  <p className="text-xs text-muted-foreground">Sector 15, Near Park - 2 days ago</p>
                </div>
                <Badge variant="secondary">Resolved</Badge>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                <div className="p-2 bg-secondary/10 rounded-full">
                  <Package className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ordered compost kit</p>
                  <p className="text-xs text-muted-foreground">Home delivery - 1 week ago</p>
                </div>
                <Badge variant="outline">Delivered</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;