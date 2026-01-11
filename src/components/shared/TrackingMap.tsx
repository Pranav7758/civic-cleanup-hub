import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Navigation, User, Truck, Clock } from "lucide-react";

interface TrackingPoint {
  type: "origin" | "destination" | "current";
  label: string;
  coordinates?: { lat: number; lng: number };
}

interface TrackingMapProps {
  points: TrackingPoint[];
  estimatedTime?: string;
  distance?: string;
  isLive?: boolean;
  className?: string;
}

export function TrackingMap({
  points,
  estimatedTime,
  distance,
  isLive = false,
  className,
}: TrackingMapProps) {
  const originPoint = points.find(p => p.type === "origin");
  const destinationPoint = points.find(p => p.type === "destination");
  const currentPoint = points.find(p => p.type === "current");

  return (
    <Card className={cn("border-0 shadow-card overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Live Tracking</CardTitle>
          {isLive && (
            <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
              <span className="h-2 w-2 bg-status-success rounded-full animate-pulse mr-1.5" />
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simulated map area */}
        <div className="relative h-48 bg-gradient-to-br from-eco-sky/10 via-eco-teal/10 to-eco-green/10 rounded-xl overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              <defs>
                <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
                </pattern>
              </defs>
              <rect width="200" height="100" fill="url(#mapGrid)" />
              {/* Simulated roads */}
              <path d="M 20,50 Q 50,30 100,50 T 180,50" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
              <path d="M 100,10 L 100,90" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" />
            </svg>
          </div>

          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--eco-green))" />
                <stop offset="100%" stopColor="hsl(var(--eco-sky))" />
              </linearGradient>
            </defs>
            <path 
              d="M 30,70 Q 70,40 100,50 T 170,30" 
              fill="none" 
              stroke="url(#routeGradient)" 
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8,4"
            />
          </svg>

          {/* Origin point */}
          {originPoint && (
            <div className="absolute left-[15%] bottom-[30%] transform -translate-x-1/2">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-eco-green flex items-center justify-center shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-card px-2 py-0.5 rounded shadow">
                  {originPoint.label}
                </span>
              </div>
            </div>
          )}

          {/* Current location (moving point) */}
          {currentPoint && (
            <div className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-eco-sky/30 rounded-full animate-ping" />
                <div className="h-12 w-12 rounded-full bg-eco-sky flex items-center justify-center shadow-lg relative z-10 animate-bounce-gentle">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Destination point */}
          {destinationPoint && (
            <div className="absolute right-[15%] top-[30%] transform translate-x-1/2">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-eco-rose flex items-center justify-center shadow-lg">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-card px-2 py-0.5 rounded shadow">
                  {destinationPoint.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="text-sm font-semibold">{estimatedTime || "15 mins"}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-semibold">{distance || "2.5 km"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
