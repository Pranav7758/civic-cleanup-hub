import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Camera, CheckCircle, Clock, Navigation, Upload, Loader2 } from 'lucide-react';

interface GarbageReport {
  id: string;
  image_url: string;
  location: { lat: number; lng: number };
  address: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  reported_at: string;
  reporter_name: string;
}

// Mock data - this would come from Supabase
const mockReports: GarbageReport[] = [
  {
    id: '1',
    image_url: '/placeholder.svg',
    location: { lat: 28.6139, lng: 77.2090 },
    address: 'Main Street, Near Park Gate, Delhi',
    description: 'Large pile of plastic waste and food containers dumped near the entrance',
    status: 'pending',
    reported_at: '2024-01-15T10:30:00Z',
    reporter_name: 'Rahul Kumar'
  },
  {
    id: '2',
    image_url: '/placeholder.svg',
    location: { lat: 28.6129, lng: 77.2295 },
    address: 'Commercial Area, Sector 14, Delhi',
    description: 'Construction debris and household waste',
    status: 'assigned',
    reported_at: '2024-01-15T09:15:00Z',
    reporter_name: 'Priya Sharma'
  }
];

const WorkerTaskView = () => {
  const [reports, setReports] = useState<GarbageReport[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<GarbageReport | null>(null);
  const [completionImage, setCompletionImage] = useState<File | null>(null);
  const [completionPreview, setCompletionPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-300';
      case 'assigned': return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'in_progress': return 'bg-orange-500/10 text-orange-700 border-orange-300';
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-300';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleAcceptTask = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: 'assigned' as const }
        : report
    ));
    toast({
      title: "Task Accepted",
      description: "You have been assigned to this cleanup task.",
    });
  };

  const handleStartTask = (report: GarbageReport) => {
    setReports(prev => prev.map(r => 
      r.id === report.id 
        ? { ...r, status: 'in_progress' as const }
        : r
    ));
    setSelectedReport(report);
    toast({
      title: "Task Started",
      description: "Task marked as in progress. Complete the cleanup and upload verification photo.",
    });
  };

  const handleCompletionImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompletionImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompletionPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedReport || !completionImage) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo showing the completed cleanup.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would integrate with Supabase to:
      // 1. Upload the completion image to Supabase Storage
      // 2. Update the report status to 'completed'
      // 3. Add completion timestamp and worker ID
      
      setReports(prev => prev.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'completed' as const }
          : r
      ));

      toast({
        title: "Task Completed",
        description: "Cleanup task marked as completed successfully!",
      });

      // Reset completion form
      setSelectedReport(null);
      setCompletionImage(null);
      setCompletionPreview('');
      
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Completion Failed",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openInMaps = (location: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Cleanup Tasks</h1>
        <p className="text-muted-foreground">Manage and complete garbage cleanup assignments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">Report #{report.id}</CardTitle>
                <Badge className={`${getStatusColor(report.status)} capitalize`}>
                  {report.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Reported by {report.reporter_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(report.reported_at)}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Report Image */}
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={report.image_url}
                  alt="Reported garbage"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{report.address}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInMaps(report.location)}
                  className="w-full"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              </div>

              {/* Description */}
              {report.description && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{report.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {report.status === 'pending' && (
                  <Button
                    onClick={() => handleAcceptTask(report.id)}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Task
                  </Button>
                )}
                
                {report.status === 'assigned' && (
                  <Button
                    onClick={() => handleStartTask(report)}
                    className="w-full"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Start Cleanup
                  </Button>
                )}
                
                {report.status === 'completed' && (
                  <Button variant="outline" disabled className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Complete Task #{selectedReport.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a photo showing the area after cleanup completion.
              </p>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {completionPreview ? (
                  <div className="space-y-3">
                    <img
                      src={completionPreview}
                      alt="Completion verification"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('completion-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('completion-upload')?.click()}
                      className="mt-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                )}
                <input
                  id="completion-upload"
                  type="file"
                  onChange={handleCompletionImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReport(null);
                    setCompletionImage(null);
                    setCompletionPreview('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteTask}
                  disabled={isSubmitting || !completionImage}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    'Complete Task'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkerTaskView;