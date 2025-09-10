import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  LogOut,
  User,
  Recycle,
  Bell,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import WorkerTaskView from "@/components/WorkerTaskView";

interface Task {
  id: string;
  location: string;
  type: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  assignedDate: string;
  description: string;
}

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "12345",
      location: "Street A, Sector 12",
      type: "Illegal Dumping Cleanup",
      priority: "high",
      status: "pending",
      assignedDate: "2024-01-15",
      description: "Remove unauthorized waste near residential area"
    },
    {
      id: "12346", 
      location: "Park Avenue, Sector 8",
      type: "Scheduled Collection",
      priority: "medium",
      status: "in-progress",
      assignedDate: "2024-01-14",
      description: "Regular waste collection from commercial district"
    },
    {
      id: "12347",
      location: "Market Road, Sector 5",
      type: "Compost Distribution",
      priority: "low", 
      status: "completed",
      assignedDate: "2024-01-13",
      description: "Deliver compost kits to registered citizens"
    },
    {
      id: "12348",
      location: "Industrial Zone B",
      type: "Hazardous Waste",
      priority: "high",
      status: "pending",
      assignedDate: "2024-01-15",
      description: "Safe disposal of industrial chemical waste"
    }
  ]);

  const handleMarkComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: "completed" as const }
          : task
      )
    );
    toast.success("Task marked as completed!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50";
      case "in-progress": return "text-blue-600 bg-blue-50";
      case "pending": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in-progress": return <Clock className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Show WorkerTaskView component when active
  if (activeView === "detailed-tasks") {
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
                  <h1 className="text-xl font-bold text-civic-dark">Task Details</h1>
                  <p className="text-sm text-muted-foreground">Detailed task management</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <WorkerTaskView />
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
                <h1 className="text-xl font-bold text-civic-dark">Worker Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Sarah Wilson</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="default"
                size="sm"
                onClick={() => setActiveView("detailed-tasks")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Task Details
              </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {tasks.filter(t => t.status === "pending").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === "in-progress").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === "completed").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="text-2xl font-bold text-civic-dark">94%</p>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">Excellent</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Management Table */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-civic-dark flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Task Management
            </CardTitle>
            <CardDescription>
              View and manage your assigned waste management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-sm">{task.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{task.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(task.assignedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {task.status !== "completed" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkComplete(task.id)}
                            className="whitespace-nowrap"
                          >
                            Mark Complete
                          </Button>
                        )}
                        {task.status === "completed" && (
                          <Badge variant="outline" className="text-green-600">
                            ✓ Done
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="shadow-card border-0 cursor-pointer hover:shadow-hover transition-all">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-civic-dark mb-2">View Route Map</h3>
              <p className="text-sm text-muted-foreground">Optimize your collection routes</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 cursor-pointer hover:shadow-hover transition-all">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-civic-dark mb-2">Report Issue</h3>
              <p className="text-sm text-muted-foreground">Log equipment or safety concerns</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 cursor-pointer hover:shadow-hover transition-all">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-civic-dark mb-2">Performance Report</h3>
              <p className="text-sm text-muted-foreground">View your monthly statistics</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;