import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, ThumbsUp, ThumbsDown, Loader2, MapPin, Clock, Coins, CheckCircle, AlertTriangle, Sparkles
} from "lucide-react";

export default function PeerVerify() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await apiClient.getPendingVerifications();
        setReports(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleVerify = async (reportId: string, isLegit: boolean) => {
    setVerifyingId(reportId);
    try {
      const result = await apiClient.verifyReport(reportId, isLegit);
      toast({
        title: isLegit ? "Verified as Genuine ✅" : "Flagged as Suspicious ⚠️",
        description: `+${result.pointsEarned} points earned!`,
      });
      setVerifiedIds(prev => new Set(prev).add(reportId));
      setTotalEarned(prev => prev + (result.pointsEarned || 10));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setVerifyingId(null);
    }
  };

  const pendingReports = reports.filter(r => !verifiedIds.has(r.id));

  return (
    <div className="min-h-screen bg-rice-paper pb-20">
      <AppHeader
        title="Peer Verification"
        subtitle="Help catch fake reports"
        moduleColor="citizen"
        showBack
        onBack={() => navigate("/citizen")}
        icon={<ShieldCheck className="h-5 w-5 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-2xl space-y-6">
        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5 rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full shrink-0">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">Become a Verifier</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Review waste reports from your fellow citizens. Confirm if they're real or flag suspicious ones.
                  You earn <strong>10 points per verification</strong>!
                </p>
                {totalEarned > 0 && (
                  <Badge className="mt-3 bg-gradient-eco text-white border-0 gap-1">
                    <Coins className="h-3.5 w-3.5" /> +{totalEarned} earned this session
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center p-4 border-timber/30 rounded-2xl">
            <p className="text-2xl font-display font-bold text-primary">{reports.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pending</p>
          </Card>
          <Card className="text-center p-4 border-timber/30 rounded-2xl">
            <p className="text-2xl font-display font-bold text-moss">{verifiedIds.size}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Reviewed</p>
          </Card>
          <Card className="text-center p-4 border-timber/30 rounded-2xl">
            <p className="text-2xl font-display font-bold text-clay">{totalEarned}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Points +</p>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        ) : pendingReports.length === 0 ? (
          <div className="text-center p-12 bg-muted/30 rounded-3xl border border-dashed">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-muted-foreground">
              {verifiedIds.size > 0 ? "All done! You've reviewed everything." : "No reports to verify right now."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for new reports!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingReports.map((report) => (
              <Card key={report.id} className="border-timber/30 shadow-soft rounded-[1.5rem] overflow-hidden">
                {/* Image */}
                {report.image_url && (
                  <div className="w-full aspect-video bg-muted overflow-hidden">
                    <img src={report.image_url} alt="Waste report" className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-base">{report.waste_type || "Unknown"} Waste</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.address || "Location captured"}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{report.priority || "medium"}</Badge>
                  </div>

                  {report.description && (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{report.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span>Reported by <strong>{report.reporter_name || "Anonymous"}</strong></span>
                  </div>

                  {/* Verification Controls */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-gradient-eco text-white h-12"
                      onClick={() => handleVerify(report.id, true)}
                      disabled={verifyingId === report.id}
                    >
                      {verifyingId === report.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ThumbsUp className="h-4 w-4 mr-2" />
                      )}
                      It's Real
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-destructive/30 text-destructive hover:bg-destructive/5"
                      onClick={() => handleVerify(report.id, false)}
                      disabled={verifyingId === report.id}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Suspicious
                    </Button>
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground">
                    <Coins className="h-3 w-3 inline mr-1" />
                    Earn 10 points for each verification
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
