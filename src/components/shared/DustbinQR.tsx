import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, Clock } from "lucide-react";

interface DustbinQRProps {
  citizenId: string;
  dustbinCode: string;
  name: string;
  totalCollections: number;
  lastCollectionDate?: string;
}

export function DustbinQR({ citizenId, dustbinCode, name, totalCollections, lastCollectionDate }: DustbinQRProps) {
  const qrPayload = JSON.stringify({
    citizenId,
    dustbinCode,
    name,
  });

  return (
    <Card className="border-timber/30 shadow-soft rounded-[1.5rem] overflow-hidden">
      <div className="bg-moss/10 p-6 flex flex-col items-center justify-center text-center">
        <h3 className="font-display font-bold text-xl mb-1 text-moss">My Dustbin QR</h3>
        <p className="text-sm text-muted-foreground mb-6">Show this to the cleanup worker</p>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
          <QRCodeSVG 
            value={qrPayload} 
            size={160}
            level="H"
            includeMargin={false}
            fgColor="#2C2C24" // loam
          />
        </div>
        
        <Badge variant="outline" className="bg-white font-mono text-sm border-timber mb-2">
          {dustbinCode || "ECO-PENDING"}
        </Badge>
        <p className="font-medium text-foreground">{name}</p>
      </div>
      
      <CardContent className="p-5 bg-background">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-muted-foreground" />
          Collection Stats
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-moss" />
              Total Pickups
            </p>
            <p className="font-display font-bold text-lg">{totalCollections}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-clay" />
              Last Pickup
            </p>
            <p className="font-medium text-sm">
              {lastCollectionDate ? new Date(lastCollectionDate).toLocaleDateString() : "Never"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
