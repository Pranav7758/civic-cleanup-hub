import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/layout/AppHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { useCreateReport, uploadImage } from "@/hooks/useWasteReports";
import { apiClient } from "@/lib/apiClient";
import {
  Camera, Send, AlertTriangle, CheckCircle, Trash2, Recycle, Flame, Loader2, Info, ChevronRight, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const CitizenReportWaste = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [wasteType, setWasteType] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    confidence?: number;
    sub_categories?: string[];
    estimated_weight_kg?: number;
    recyclability_score?: number;
  } | null>(null);

  const createReport = useCreateReport();

  const wasteTypes = [
    { value: "dry", label: "Dry Waste", icon: Trash2, desc: "Paper, plastic, glass, metal" },
    { value: "wet", label: "Wet Waste", icon: Recycle, desc: "Food scraps, garden waste" },
    { value: "hazardous", label: "Hazardous", icon: Flame, desc: "Chemicals, batteries, medical" },
    { value: "mixed", label: "Mixed / Bulk", icon: AlertTriangle, desc: "Large dumps, construction debris" },
  ];

  const handleImageSelect = async (file: File | null, preview: string | null) => {
    setImageFile(file);
    setImagePreview(preview);
    setAiAnalysis(null);
    if (file) {
      setIsAnalyzing(true);
      setWasteType(""); 
      try {
        const { analysis } = await apiClient.analyzeWaste(file);
        
        let foundType = "mixed";
        if (["dry", "wet", "hazardous", "mixed"].includes(analysis.waste_type)) {
          foundType = analysis.waste_type;
        }
        
        setWasteType(foundType);
        setAiAnalysis(analysis);
        
        toast.success(`AI Detection: ${foundType} (Confidence: ${analysis.confidence}%)`);
        
        if (analysis.sub_categories && analysis.sub_categories.length > 0) {
          setNotes(`Identified materials: ${analysis.sub_categories.join(', ')}`);
        }
        
        if (step === 1) setStep(2);
      } catch (err: any) {
        toast.error("AI Analysis using vision models failed. Providing mock selection.", { description: err.message });
        const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)].value;
        setWasteType(randomType);
        if (step === 1) setStep(2);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setWasteType("");
    }
  };

  const handleSubmit = async () => {
    try {
      let image_url: string | undefined;
      if (imageFile) {
        image_url = await uploadImage(imageFile, "waste-images");
      }

      const data = await createReport.mutateAsync({
        image_url,
        waste_type: wasteType as any,
        description: notes || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: location?.address,
      });

      setReportId(data.id.slice(0, 8).toUpperCase());
      setSubmitted(true);
      toast.success("Report submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit report");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-rice-paper pb-6">
        <AppHeader title="Report Submitted" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<AlertTriangle className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md w-full mx-auto space-y-6 bg-card p-8 rounded-3xl shadow-xl border border-border">
            <div className="w-20 h-20 rounded-full bg-moss/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-moss" />
            </div>
            <h2 className="text-2xl font-display font-bold">Report Sent!</h2>
            <p className="text-muted-foreground">
              Your waste report has been submitted. A worker will be assigned shortly.
              You'll earn <span className="font-semibold text-primary">50 points</span> once verified.
            </p>
            <div className="p-4 rounded-xl bg-muted/50 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Report ID</span>
                <span className="font-mono font-medium">#{reportId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-clay border-eco-amber/30">Pending</Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/citizen")}>Go Home</Button>
              <Button className="flex-1 bg-gradient-eco" onClick={() => { setSubmitted(false); setStep(1); setImageFile(null); setImagePreview(null); setWasteType(""); setNotes(""); setLocation(null); }}>
                Report Another
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rice-paper pb-6">
      <AppHeader title="Report Waste" subtitle={`Step ${step} of 3`} moduleColor="citizen" showBack onBack={() => step > 1 ? setStep(step - 1) : navigate("/citizen")} icon={<AlertTriangle className="h-6 w-6 text-white" />} />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Mobile progress bar - hidden on desktop */}
        <div className="md:hidden flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-2 rounded-full flex-1 transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* LEFT COLUMN: The Forms (Photo & Details) */}
          <div className="space-y-8">
            {/* Step 1: Photo (Always visible on desktop, step 1 on mobile) */}
            <div className={`space-y-6 ${step !== 1 ? 'hidden md:block' : ''} bg-card/50 p-6 md:p-8 rounded-3xl border md:shadow-sm`}>
              <div><h2 className="text-xl font-display font-bold mb-1">Take a Photo</h2><p className="text-sm text-muted-foreground">Capture or upload a clear photo of the waste</p></div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={imagePreview || undefined}
                onImageRemove={() => handleImageSelect(null, null)}
                label="Waste Photo"
                description="Take a clear photo showing the garbage"
              />
              <Button className="w-full md:hidden bg-gradient-eco" size="lg" disabled={!imageFile || isAnalyzing} onClick={() => setStep(2)}>
                Continue<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Step 2: Details (Always visible on desktop, step 2 on mobile) */}
            <div className={`space-y-6 ${step !== 2 ? 'hidden md:block' : ''} bg-card/50 p-6 md:p-8 rounded-3xl border md:shadow-sm`}>
              <div><h2 className="text-xl font-display font-bold mb-1">Waste Details</h2><p className="text-sm text-muted-foreground">Select the type of waste and add notes</p></div>
              <div className="space-y-3 relative">
                {isAnalyzing && (
                   <div className="absolute inset-0 z-10 bg-rice-paper/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center animate-in fade-in">
                     <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                     <p className="font-medium text-sm">AI is analyzing image...</p>
                   </div>
                )}
                
                <Label className="text-sm font-medium">Waste Type</Label>
                
                {aiAnalysis && (
                  <div className="bg-primary/5 border-2 border-primary/20 p-4 rounded-2xl mb-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold font-display text-primary flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Analysis Result</span>
                      <Badge variant="outline" className="bg-white border-primary/20">{aiAnalysis.confidence}% Match</Badge>
                    </div>
                    {aiAnalysis.sub_categories && aiAnalysis.sub_categories.length > 0 && (
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Detected:</span> {aiAnalysis.sub_categories.join(', ')}</p>
                    )}
                    {(aiAnalysis.estimated_weight_kg || aiAnalysis.recyclability_score) && (
                      <div className="flex gap-4 mt-2">
                        {aiAnalysis.estimated_weight_kg && <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Est. Weight:</span> {aiAnalysis.estimated_weight_kg} kg</p>}
                        {aiAnalysis.recyclability_score && <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Recyclable:</span> {aiAnalysis.recyclability_score}/10</p>}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {wasteTypes.map((type) => (
                    <button key={type.value} onClick={() => setWasteType(type.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${wasteType === type.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                      <type.icon className={`h-6 w-6 mb-3 ${wasteType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-semibold text-sm">{type.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional Notes (optional)</Label>
                <Textarea placeholder="Describe the waste, landmark nearby..." value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none h-24" />
              </div>
              <Button className="w-full md:hidden bg-gradient-eco" size="lg" disabled={!wasteType} onClick={() => setStep(3)}>
                Continue<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Location & Final Submission */}
          <div className="space-y-8">
            <div className={`space-y-6 ${step !== 3 ? 'hidden md:block' : ''} bg-card/50 p-6 md:p-8 rounded-3xl border md:shadow-sm sticky top-24`}>
              <div><h2 className="text-xl font-display font-bold mb-1">Confirm Location</h2><p className="text-sm text-muted-foreground">We'll auto-detect your GPS location</p></div>
              
              <LocationPicker onLocationSelect={(loc) => setLocation(loc)} />
              
              <Card className="border-0 shadow-sm bg-rice-paper">
                <CardHeader className="pb-2"><CardTitle className="text-base font-display">Report Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {imagePreview && (
                    <div className="rounded-xl overflow-hidden h-32 border"><img src={imagePreview} alt="Waste" className="w-full h-full object-cover" /></div>
                  )}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Waste Type</span><span className="font-medium capitalize">{wasteType || "Not selected"}</span></div>
                  {notes && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Notes</span><span className="font-medium text-right max-w-[60%] truncate">{notes}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reward</span><Badge variant="outline" className="text-moss border-eco-green/30 bg-moss/10">+50 points</Badge></div>
                </CardContent>
              </Card>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-eco-sky/10 border border-eco-sky/20">
                <Info className="h-5 w-5 text-eco-sky shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">Your report will be verified by a field worker. Points will be automatically credited to your wallet once the area is cleaned.</p>
              </div>
              
              <Button className="w-full bg-gradient-eco shadow-md hover:shadow-lg transition-all" size="lg" disabled={createReport.isPending || !location || !wasteType || !imageFile} onClick={handleSubmit}>
                {createReport.isPending ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" />Submitting...</>) : (<><Send className="h-5 w-5 mr-2" />Submit Report</>)}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenReportWaste;
