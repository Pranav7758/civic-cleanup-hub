import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrackingMap } from "@/components/shared/TrackingMap";
import { useAuth } from "@/hooks/useAuth";
import { useWorkerTasks, useUpdateReport } from "@/hooks/useWasteReports";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
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
  Award,
  Flame,
  IndianRupee,
  Loader2,
  Calendar,
  MessageCircle
} from "lucide-react";

type ActiveTab = "home" | "tasks" | "map" | "history" | "profile";

const WorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionImage, setCompletionImage] = useState<File | null>(null);
  const [qrScanned, setQrScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const { profile, user } = useAuth();
  const { data: allTasks = [], isLoading, refetch } = useWorkerTasks();
  const updateReport = useUpdateReport();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTasks = allTasks.filter(t => t.status !== "completed");
  const completedTasks = allTasks.filter(t => t.status === "completed");
  const selectedTask = allTasks.find(t => t.id === selectedTaskId);

  const navItems = [
    { icon: Home, label: "Home", value: "home" as const },
    { icon: ClipboardList, label: "Tasks", value: "tasks" as const, badge: activeTasks.length },
    { icon: MapPin, label: "Map", value: "map" as const },
    { icon: Clock, label: "History", value: "history" as const },
    { icon: User, label: "Profile", value: "profile" as const },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-status-warning/10 text-status-warning border-status-warning/20";
      case "low": return "bg-status-success/10 text-status-success border-status-success/20";
      default: return "";
    }
  };

  const handleUpdateStatus = async (status: string, payload: any = {}) => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await updateReport.mutateAsync({
        id: selectedTask.id,
        status,
        ...payload
      });
      toast({ title: "Updated", description: "Task status updated successfully." });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    handleUpdateStatus("assigned", { assigned_worker_id: user?.id });
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    if (!completionImage) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo of the completed work.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await apiClient.uploadImage(completionImage, "waste-reports");
      await apiClient.completeWorkerTask(selectedTask.id, imageUrl);

      toast({
        title: "Task Completed!",
        description: "Great job! The citizen has been awarded points.",
      });
      setSelectedTaskId(null);
      setCompletionImage(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark task as completed.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const name = profile?.full_name || "Worker";

  // Task Detail View
  if (selectedTask) {
    const isAssignedToMe = selectedTask.assigned_worker_id === user?.id;

    const handleMockQrScan = () => {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setQrScanned(true);
        toast({ title: "QR Verified! ✅", description: "Location confirmed. You can now complete the job." });
      }, 1500);
    };

    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
        <AppHeader title="Task Details" subtitle={`Task #${selectedTask.id.substring(0,8)}`} moduleColor="worker" showBack onBack={() => {setSelectedTaskId(null); setQrScanned(false);}} icon={<Briefcase className="h-6 w-6 text-white" />} />
        <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6 md:space-y-8">
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedTask.status} size="lg" />
            <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority} priority</Badge>
          </div>
          <Card className="border-0 shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary/10"><MapPin className="h-6 w-6 text-secondary" /></div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-lg mb-1">{selectedTask.address || "Location Captured"}</h3>
                  <div className="flex gap-2.5 mt-3">
                    <Button size="sm" className="bg-gradient-ocean"><Navigation className="h-4 w-4 mr-2" />Navigate</Button>
                    {selectedTask.citizen?.phone && (
                      <Button size="sm" variant="outline"><Phone className="h-4 w-4 mr-2" />{selectedTask.citizen.phone}</Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedTask.image_url && (
            <Card className="border-0 shadow-card overflow-hidden">
               <img src={selectedTask.image_url} alt="Waste Location" className="w-full h-48 object-cover" />
            </Card>
          )}

          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Task Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground mb-1">Waste Type</p><p className="font-medium capitalize">{selectedTask.waste_type}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Reported By</p><p className="font-medium">{selectedTask.citizen?.full_name || "Anonymous"}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Reported At</p><p className="font-medium">{new Date(selectedTask.created_at).toLocaleDateString()}</p></div>
              </div>
              {selectedTask.description && (
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-sm">{selectedTask.description}</p></div>
              )}
            </CardContent>
          </Card>

          {selectedTask.status === "pending" && !isAssignedToMe && (
            <Button className="w-full bg-gradient-ocean" size="lg" disabled={isSubmitting} onClick={() => handleAcceptTask(selectedTask.id)}>
              {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <ClipboardList className="h-5 w-5 mr-2" />}
              Accept Task
            </Button>
          )}

          {selectedTask.status === "assigned" && isAssignedToMe && (
            <Button className="w-full bg-gradient-golden" size="lg" disabled={isSubmitting} onClick={() => handleUpdateStatus("on_the_way")}>
              <Navigation className="h-5 w-5 mr-2" />
              Start Journey
            </Button>
          )}

          {selectedTask.status === "on_the_way" && isAssignedToMe && (
            <TrackingMap
              points={[
                { type: "origin", label: "Your Location" },
                { type: "current", label: "En Route" },
                { type: "destination", label: "Waste Site" },
              ]}
              estimatedTime="15 mins"
              distance="3.2 km"
              isLive
            />
          )}

          {selectedTask.status === "on_the_way" && isAssignedToMe && !qrScanned && (
            <Card className="border-0 shadow-card bg-eco-amber/5 border border-eco-amber/20">
              <CardHeader className="pb-3"><CardTitle className="text-lg font-display text-eco-amber flex items-center"><QrCode className="h-5 w-5 mr-2" />Location Verification</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Scan the QR code printed on the nearby community bin or post to verify collection arrival.</p>
                <Button className="w-full" size="lg" variant="outline" onClick={handleMockQrScan} disabled={isScanning}>
                  {isScanning ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Camera className="h-5 w-5 mr-2" />}
                  {isScanning ? "Scanning..." : "Simulate QR Scan"}
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedTask.status === "on_the_way" && isAssignedToMe && qrScanned && (
            <Card className="border-0 shadow-card bg-primary/5 border border-primary/20">
              <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Complete Task</CardTitle><CardDescription>Upload photo of the cleaned area</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                 <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCompletionImage(file);
                  }}
                />
                
                {completionImage ? (
                  <div className="relative rounded-lg overflow-hidden border">
                     <img src={URL.createObjectURL(completionImage)} alt="Preview" className="w-full h-40 object-cover" />
                     <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setCompletionImage(null)}>Remove</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full h-24 flex-col gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span>Take Photo</span>
                  </Button>
                )}

                <Button className="w-full bg-gradient-eco" size="lg" onClick={handleCompleteTask} disabled={isSubmitting || !completionImage}>
                  {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                  Mark as Completed
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
        <BottomNav items={navItems} activeItem={activeTab} onItemClick={(value) => setActiveTab(value as ActiveTab)} moduleColor="worker" />
      </div>
    );
  }

  // History Tab
  if (activeTab === "history") {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
        <AppHeader title="Task History" subtitle="Your completed pickups" userName={name} moduleColor="worker" icon={<Briefcase className="h-6 w-6 text-white" />} />
        <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-display font-bold text-primary">{completedTasks.length}</p><p className="text-xs text-muted-foreground">Tasks Done</p></CardContent></Card>
            <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-display font-bold text-eco-amber">₹{completedTasks.length * 150}</p><p className="text-xs text-muted-foreground">Est Earnings</p></CardContent></Card>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Completed Tasks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No completed tasks yet.</p>}
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-eco-green/10"><CheckCircle className="h-4 w-4 text-eco-green" /></div>
                    <div>
                      <p className="font-medium text-sm w-40 truncate">{task.address || `Lat: ${task.latitude?.toFixed(4)}`}</p>
                      <p className="text-xs text-muted-foreground capitalize">{task.waste_type} • {new Date(task.completed_at || task.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-medium text-eco-green">+₹150</span>
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
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
        <AppHeader title="My Profile" subtitle="Worker Performance" userName={name} moduleColor="worker" icon={<Briefcase className="h-6 w-6 text-white" />} />
        <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6 md:space-y-8">
          <Card className="border-0 shadow-card overflow-hidden">
            <div className="bg-gradient-ocean p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">{name}</h2>
              <p className="text-white/80 text-sm">Active Worker</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <StatsCard title="Completed" value={completedTasks.length.toString()} icon={CheckCircle} color="green" />
            <StatsCard title="In Progress" value={activeTasks.filter(t => t.assigned_worker_id === user?.id).length.toString()} icon={Clock} color="blue" />
          </div>

        </main>
        <BottomNav items={navItems} activeItem={activeTab} onItemClick={(value) => setActiveTab(value as ActiveTab)} moduleColor="worker" />
      </div>
    );
  }

  // Map Tab
  if (activeTab === "map") {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
        <AppHeader title="Task Map" subtitle="View all tasks on map" userName={name} moduleColor="worker" icon={<MapPin className="h-6 w-6 text-white" />} />
        <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6 md:space-y-8">
          <div className="h-64 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border p-4 text-center">
             <div className="text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-2" />
              <p className="font-display font-medium">Map Available on Mobile</p>
              <p className="text-xs">Location permissions required for live tracking</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-display font-semibold">Active Tasks</h3>
            {activeTasks.length === 0 && <p className="text-sm text-center text-muted-foreground">No active tasks nearby.</p>}
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => setSelectedTaskId(task.id)}>
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${task.priority === "high" ? "bg-destructive" : "bg-eco-amber"}`} />
                  <div>
                    <p className="text-sm font-medium w-48 truncate">{task.address}</p>
                    <p className="text-xs text-muted-foreground capitalize">{task.waste_type}</p>
                  </div>
                </div>
                <StatusBadge status={task.status} size="sm" />
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
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      <AppHeader title="Worker Dashboard" subtitle={`Hello, ${name}`} userName={name} moduleColor="worker" notifications={activeTasks.filter(t => t.status==='pending').length} />
      
      <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard title="Pending" value={activeTasks.filter(t => t.status === "pending").length.toString()} icon={AlertCircle} color="amber" />
          <StatsCard title="My Active" value={activeTasks.filter(t => t.assigned_worker_id === user?.id).length.toString()} icon={Truck} color="blue" />
          <StatsCard title="Completed" value={completedTasks.length.toString()} icon={CheckCircle} color="green" />
        </div>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display">Live Pickup Tasks</CardTitle>
              <Badge variant="secondary">{activeTasks.length} tasks</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : activeTasks.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                 <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                 <p>All clean! No active rubbish reports right now.</p>
              </div>
            ) : activeTasks.map((task) => (
              <div key={task.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${task.priority === "high" ? "bg-destructive/10" : "bg-primary/10"}`}>
                      <MapPin className={`h-5 w-5 ${task.priority === "high" ? "text-destructive" : "text-primary"}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm w-48 truncate">{task.address || "Location Capture"}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{task.waste_type}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(task.created_at).toLocaleDateString()}</span>
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
