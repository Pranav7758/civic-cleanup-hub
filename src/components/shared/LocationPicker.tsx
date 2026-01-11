import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MapPin, Navigation, Loader2, Check } from "lucide-react";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  currentLocation?: Location;
  label?: string;
  className?: string;
}

export function LocationPicker({
  onLocationSelect,
  currentLocation,
  label = "Location",
  className,
}: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(currentLocation || null);
  const [manualAddress, setManualAddress] = useState("");

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        };
        setLocation(newLocation);
        onLocationSelect(newLocation);
        setIsLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please enable location services.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualAddress = () => {
    if (manualAddress.trim()) {
      const newLocation: Location = {
        latitude: 0,
        longitude: 0,
        address: manualAddress,
      };
      setLocation(newLocation);
      onLocationSelect(newLocation);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* GPS Location Button */}
      <Button
        type="button"
        variant={location ? "secondary" : "outline"}
        className="w-full justify-start gap-3 h-12"
        onClick={getCurrentLocation}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : location ? (
          <Check className="h-5 w-5 text-status-success" />
        ) : (
          <Navigation className="h-5 w-5" />
        )}
        <div className="flex-1 text-left">
          {isLoading
            ? "Getting location..."
            : location
            ? "Location captured"
            : "Use current location"}
        </div>
        {location && (
          <span className="text-xs text-muted-foreground">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Location preview */}
      {location && (
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-eco-teal/20 to-eco-sky/20">
            {/* Simulated map background */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
                  </pattern>
                </defs>
                <rect width="100" height="60" fill="url(#grid)" />
              </svg>
            </div>
            {/* Location pin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative animate-bounce-gentle">
                <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping" />
                <MapPin className="h-8 w-8 text-primary drop-shadow-lg" />
              </div>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual address input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or enter manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter address manually"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleManualAddress}
            disabled={!manualAddress.trim()}
          >
            Set
          </Button>
        </div>
      </div>
    </div>
  );
}
