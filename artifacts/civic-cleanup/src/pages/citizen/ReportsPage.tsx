import { useState, useRef, useCallback } from "react";
import { useGetReports, useCreateReport, useGetPendingVerificationReports, useVerifyReport } from "@workspace/api-client-react";
import {
  Camera, Plus, MapPin, CheckCircle, X, ImagePlus, Loader2,
  Navigation, Sparkles, AlertTriangle, RefreshCw,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetReportsQueryKey,
  getGetCitizenDashboardQueryKey,
  getGetPendingVerificationReportsQueryKey,
} from "@workspace/api-client-react";
import DashboardLayout from "@/components/DashboardLayout";
import { uploadFile } from "@/lib/supabase";
import "@/styles/dashboard.css";

const STATUS_BADGE: Record<string, string> = {
  completed: "gov-badge gov-badge-green",
  pending:   "gov-badge gov-badge-yellow",
  assigned:  "gov-badge gov-badge-blue",
  rejected:  "gov-badge gov-badge-red",
};
const STATUS_LABEL: Record<string, string> = {
  completed: "Completed", pending: "Pending", assigned: "Assigned", rejected: "Rejected",
};

const TABS = [
  { key: "my-reports", label: "My Reports" },
  { key: "verify",     label: "Peer Verify" },
] as const;

const WASTE_TYPES = ["mixed","organic","plastic","metal","hazardous","ewaste","construction"];

/* ── Waste type emoji map ── */
const WASTE_EMOJI: Record<string, string> = {
  mixed: "🗑️", organic: "🌿", plastic: "♻️", metal: "🔩",
  hazardous: "☠️", ewaste: "💻", construction: "🏗️",
};

/* ── AI classification result ── */
interface WasteClassification {
  wasteType: string;
  confidence: number;
  label: string;
  description: string;
  priority: string;
}

/* ── Inline styles ── */
const PAGE_CSS = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }

  .rp-loc-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px; border-radius: 0 10px 10px 0;
    background: linear-gradient(145deg, #2e7d32, #1b5e20);
    color: #fff; border: none; cursor: pointer; font-size: 12px; font-weight: 700;
    font-family: 'Inter', sans-serif; transition: transform .15s, box-shadow .15s;
    box-shadow: 3px 3px 8px #1a4d1d, -1px -1px 4px #4caf5040; white-space: nowrap;
    flex-shrink: 0;
  }
  .rp-loc-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 4px 5px 12px #1a4d1d; }
  .rp-loc-btn:active:not(:disabled) { transform: translateY(1px); }
  .rp-loc-btn:disabled { opacity: .6; cursor: not-allowed; }

  .rp-loc-input-wrap {
    display: flex; border-radius: 10px; overflow: hidden;
    box-shadow: inset 2px 2px 5px #d0e8d0, inset -1px -1px 4px #fff;
    border: 1px solid #c8e6c9;
  }
  .rp-loc-input {
    flex: 1; padding: 9px 10px 9px 34px; border: none; outline: none;
    font-size: 13px; color: #1a2e1a; background: linear-gradient(145deg,#fff,#f5fbf5);
    font-family: 'Inter', sans-serif;
    border-radius: 10px 0 0 10px;
  }
  .rp-loc-input:focus { border-color: #4caf50; }

  .rp-upload-zone {
    margin-top: 6px; width: 100%; display: flex; flex-direction: column;
    align-items: center; gap: 8px; padding: 22px 14px;
    border: 2px dashed #a5d6a7; border-radius: 12px;
    background: linear-gradient(145deg, #f5fbf5, #eaf4ea);
    cursor: pointer; color: #5d7a5e;
    transition: border-color .2s, background .2s, transform .15s;
  }
  .rp-upload-zone:hover { border-color: #4caf50; background: linear-gradient(145deg,#e8f5e9,#dcedc8); transform: scale(1.01); }

  .rp-ai-banner {
    margin-top: 8px; padding: 12px 14px; border-radius: 12px;
    background: linear-gradient(145deg, #e8f5e9, #f1f8e9);
    border: 1px solid #a5d6a7;
    box-shadow: 3px 3px 8px #c5d8c5, -2px -2px 6px #fff;
  }
  .rp-ai-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: linear-gradient(135deg,#2e7d32,#1b5e20);
    color:#fff; font-size:10px; font-weight:800; padding:2px 8px;
    border-radius:999px; box-shadow: 0 2px 5px rgba(27,94,32,.4);
    font-family: 'Inter', sans-serif; margin-bottom: 6px;
  }
  .rp-ai-analyzing {
    display: flex; align-items: center; gap: 10px; padding: 14px;
    background: linear-gradient(145deg,#f5fbf5,#eaf4ea);
    border-radius: 12px; border: 1px solid #c8e6c9;
    margin-top: 8px;
  }
  .rp-confidence-bar-track {
    height: 6px; background: #d0e8d0; border-radius: 999px; overflow: hidden;
    flex: 1; margin: 0 6px; box-shadow: inset 1px 1px 3px #b8ccb8;
  }
  .rp-confidence-bar-fill {
    height: 100%; background: linear-gradient(90deg,#66bb6a,#2e7d32);
    border-radius: 999px; transition: width .5s ease;
    box-shadow: 0 0 5px rgba(76,175,80,.5);
  }
  .rp-loc-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #4caf50; flex-shrink: 0;
    box-shadow: 0 0 6px rgba(76,175,80,.7);
    animation: pulse-dot 1.4s infinite;
  }
`;

/* ── Reverse geocode via Nominatim (free, no key) ── */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "SwachhSaathi/1.0" } }
    );
    const data = await res.json();
    if (data?.display_name) {
      const a = data.address || {};
      const parts = [
        a.road || a.pedestrian || a.footway,
        a.suburb || a.neighbourhood || a.quarter,
        a.city || a.town || a.village || a.municipality,
        a.state,
      ].filter(Boolean);
      return parts.length >= 2 ? parts.join(", ") : data.display_name.split(",").slice(0, 3).join(",").trim();
    }
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

/* ── Call our classify endpoint ── */
async function classifyWasteImage(file: File): Promise<WasteClassification | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";
      try {
        const res = await fetch("/api/classify-waste", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        const json = await res.json();
        if (json.success && json.data) resolve(json.data as WasteClassification);
        else resolve(null);
      } catch {
        resolve(null);
      }
    };
    reader.readAsDataURL(file);
  });
}

export default function ReportsPage() {
  const [tab,          setTab]          = useState<"my-reports"|"verify">("my-reports");
  const [open,         setOpen]         = useState(false);
  const [form,         setForm]         = useState({ wasteType: "mixed", description: "", address: "", priority: "normal" });
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [locLoading,   setLocLoading]   = useState(false);
  const [locCoords,    setLocCoords]    = useState<{lat:number;lng:number} | null>(null);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiResult,     setAiResult]     = useState<WasteClassification | null>(null);
  const [aiError,      setAiError]      = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: reportsData, isLoading         } = useGetReports({});
  const { data: pendingData, isLoading: pendingLoading } = useGetPendingVerificationReports();
  const createReport = useCreateReport();
  const verifyReport = useVerifyReport();

  const reports:        any[] = (reportsData as any)?.data || [];
  const pendingReports: any[] = (pendingData  as any)?.data || [];

  /* ── Live location ── */
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "Not supported", description: "Your browser doesn't support geolocation.", variant: "destructive" });
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocCoords({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        setForm(f => ({ ...f, address: addr }));
        setLocLoading(false);
        toast({ title: "📍 Location detected!", description: addr.slice(0, 60) });
      },
      (err) => {
        setLocLoading(false);
        const msg = err.code === 1 ? "Location permission denied. Please allow access in browser settings."
                  : err.code === 2 ? "Location unavailable. Please enter address manually."
                  : "Location request timed out.";
        toast({ title: "Location error", description: msg, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }, [toast]);

  /* ── Image select + AI classify ── */
  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB allowed.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiResult(null);
    setAiError(false);

    /* kick off AI classification */
    setAiLoading(true);
    const result = await classifyWasteImage(file);
    setAiLoading(false);
    if (result) {
      setAiResult(result);
      if (result.wasteType && WASTE_TYPES.includes(result.wasteType)) {
        setForm(f => ({
          ...f,
          wasteType: result.wasteType,
          priority: result.priority || f.priority,
          description: f.description || result.description || "",
        }));
      }
    } else {
      setAiError(true);
    }
  }, [toast]);

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAiResult(null);
    setAiError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Re-classify ── */
  const handleReClassify = async () => {
    if (!imageFile) return;
    setAiLoading(true);
    setAiError(false);
    const result = await classifyWasteImage(imageFile);
    setAiLoading(false);
    if (result) {
      setAiResult(result);
      if (result.wasteType && WASTE_TYPES.includes(result.wasteType)) {
        setForm(f => ({ ...f, wasteType: result.wasteType, priority: result.priority || f.priority }));
      }
    } else {
      setAiError(true);
    }
  };

  const handleSubmit = async () => {
    if (!form.address) { toast({ title: "Address required", variant: "destructive" }); return; }
    let imageUrl: string | undefined;
    if (imageFile) {
      setUploading(true);
      const url = await uploadFile(imageFile, "waste-reports");
      setUploading(false);
      if (!url) toast({ title: "Image upload failed", description: "Report will be submitted without photo.", variant: "destructive" });
      else imageUrl = url;
    }
    const extraDesc = aiResult?.description && !form.description ? aiResult.description : form.description;
    createReport.mutate({ data: { ...form, description: extraDesc, imageUrl, latitude: locCoords?.lat, longitude: locCoords?.lng } as any }, {
      onSuccess: () => {
        toast({ title: "✅ Report submitted!", description: "You earned 50 points." });
        setOpen(false);
        setForm({ wasteType: "mixed", description: "", address: "", priority: "normal" });
        setLocCoords(null);
        handleRemoveImage();
        qc.invalidateQueries({ queryKey: getGetReportsQueryKey({}) });
        qc.invalidateQueries({ queryKey: getGetCitizenDashboardQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleVerify = (reportId: string, isLegit: boolean) => {
    verifyReport.mutate({ data: { reportId, isLegit } }, {
      onSuccess: () => {
        toast({ title: isLegit ? "✅ Verified! +10 pts" : "🚩 Flagged! +10 pts", description: "Thanks for your contribution." });
        qc.invalidateQueries({ queryKey: getGetPendingVerificationReportsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const isBusy = uploading || createReport.isPending;

  return (
    <DashboardLayout title="Waste Reports">
      <style>{PAGE_CSS}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: "'Inter','Roboto',Arial,sans-serif" }}>

        {/* ── Header row ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1a2e1a", margin: 0, fontFamily: "'Inter',sans-serif" }}>Waste Reports</h2>
            <div style={{ fontSize: 12, color: "#5d7a5e", marginTop: 2 }}>Report waste &amp; earn 50 points per verified report</div>
          </div>
          <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { handleRemoveImage(); setLocCoords(null); } }}>
            <DialogTrigger asChild>
              <button className="gov-btn gov-btn-green" style={{ display: "flex", alignItems: "center", gap: 6 }} data-testid="button-new-report">
                <Plus style={{ width: 14, height: 14 }} /> New Report
              </button>
            </DialogTrigger>

            <DialogContent style={{ maxWidth: 480, borderRadius: 16, padding: 0, overflow: "hidden" }}>
              {/* Modal header */}
              <div style={{
                background: "linear-gradient(145deg, #2e7d32, #1b5e20)",
                padding: "18px 22px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 2px 2px 5px rgba(255,255,255,0.15)" }}>
                  <Camera style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <DialogHeader>
                    <DialogTitle style={{ color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: "'Inter',sans-serif", margin: 0 }}>
                      Report Waste
                    </DialogTitle>
                  </DialogHeader>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>Earn 50 points for each verified report</div>
                </div>
              </div>

              {/* Form body */}
              <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 14, background: "linear-gradient(145deg,#fff,#f5fbf5)", overflowY: "auto", maxHeight: "70vh" }}>

                {/* ── Photo upload FIRST with AI ── */}
                <div>
                  <label className="gov-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles style={{ width: 11, height: 11, color: "#2e7d32" }} />
                    Photo + AI Classification
                    <span style={{ fontSize: 10, color: "#5d7a5e", fontWeight: 500 }}>(optional, but earns AI analysis)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={handleImageSelect}
                    data-testid="input-image"
                  />

                  {imagePreview ? (
                    <div>
                      <div style={{ position: "relative", marginTop: 6 }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 12, border: "2px solid #c8e6c9", boxShadow: "3px 3px 8px #c5d8c5" }}
                        />
                        <button
                          onClick={handleRemoveImage}
                          data-testid="button-remove-image"
                          style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}
                        >
                          <X style={{ width: 13, height: 13 }} />
                        </button>
                      </div>

                      {/* AI result / loading / error */}
                      {aiLoading && (
                        <div className="rp-ai-analyzing">
                          <Loader2 style={{ width: 18, height: 18, color: "#2e7d32", animation: "spin 1s linear infinite", flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", fontFamily: "'Inter',sans-serif" }}>🤖 AI analysing image…</div>
                            <div style={{ fontSize: 11, color: "#5d7a5e", marginTop: 2 }}>Identifying waste type, priority &amp; description</div>
                          </div>
                        </div>
                      )}

                      {!aiLoading && aiResult && (
                        <div className="rp-ai-banner">
                          <div className="rp-ai-chip">
                            <Sparkles style={{ width: 9, height: 9 }} /> AI Classified
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 22 }}>{WASTE_EMOJI[aiResult.wasteType] || "🗑️"}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#1a2e1a", fontFamily: "'Inter',sans-serif" }}>{aiResult.label}</div>
                              <div style={{ fontSize: 11, color: "#5d7a5e", marginTop: 1 }}>{aiResult.description}</div>
                              <div style={{ display: "flex", alignItems: "center", marginTop: 5, gap: 6 }}>
                                <span style={{ fontSize: 10, color: "#5d7a5e", fontWeight: 600 }}>Confidence</span>
                                <div className="rp-confidence-bar-track">
                                  <div className="rp-confidence-bar-fill" style={{ width: `${aiResult.confidence}%` }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#2e7d32", fontFamily: "'Inter',sans-serif" }}>{aiResult.confidence}%</span>
                                <button onClick={handleReClassify} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#5d7a5e", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                                  <RefreshCw style={{ width: 10, height: 10 }} /> Retry
                                </button>
                              </div>
                            </div>
                          </div>
                          <div style={{ marginTop: 8, fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>
                            ✅ Waste type auto-set to <strong style={{ textTransform: "capitalize" }}>{aiResult.wasteType}</strong> · Priority: <strong style={{ textTransform: "capitalize" }}>{aiResult.priority}</strong>
                          </div>
                        </div>
                      )}

                      {!aiLoading && aiError && (
                        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "linear-gradient(135deg,#fff8e1,#fff3cd)", border: "1px solid #ffe082" }}>
                          <AlertTriangle style={{ width: 14, height: 14, color: "#e65100", flexShrink: 0 }} />
                          <div style={{ fontSize: 12, color: "#e65100" }}>AI couldn't classify — please select waste type manually.</div>
                          <button onClick={handleReClassify} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#e65100", display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            <RefreshCw style={{ width: 10, height: 10 }} /> Retry
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="rp-upload-zone" onClick={() => fileInputRef.current?.click()} data-testid="button-upload-image">
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(145deg,#e8f5e9,#c8e6c9)", boxShadow: "3px 3px 8px #b0ccb2,-2px -2px 6px #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ImagePlus style={{ width: 22, height: 22, color: "#2e7d32" }} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32", fontFamily: "'Inter',sans-serif" }}>Tap to add a photo</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#5d7a5e" }}>
                        <Sparkles style={{ width: 10, height: 10, color: "#4caf50" }} />
                        AI will auto-detect waste type · JPG, PNG up to 10MB
                      </div>
                    </button>
                  )}
                </div>

                {/* ── Address / Location ── */}
                <div>
                  <label className="gov-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin style={{ width: 11, height: 11, color: "#2e7d32" }} />
                    Address / Location <span style={{ color: "#c62828" }}>*</span>
                  </label>
                  <div className="rp-loc-input-wrap">
                    <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                      {locCoords ? (
                        <div className="rp-loc-dot" style={{ position: "absolute", left: 11 }} />
                      ) : (
                        <MapPin style={{ position: "absolute", left: 10, width: 14, height: 14, color: "#8fa98f" }} />
                      )}
                      <input
                        className="rp-loc-input"
                        placeholder="Enter waste location or use live GPS"
                        value={form.address}
                        onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setLocCoords(null); }}
                        data-testid="input-address"
                      />
                    </div>
                    <button
                      className="rp-loc-btn"
                      onClick={handleGetLocation}
                      disabled={locLoading}
                      data-testid="button-live-location"
                      title="Detect my current location"
                    >
                      {locLoading
                        ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />
                        : <Navigation style={{ width: 13, height: 13 }} />
                      }
                      {locLoading ? "Locating…" : "Live GPS"}
                    </button>
                  </div>
                  {locCoords && (
                    <div style={{ marginTop: 5, fontSize: 10, color: "#2e7d32", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <div className="rp-loc-dot" />
                      GPS locked · {locCoords.lat.toFixed(4)}, {locCoords.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* ── Waste Type ── */}
                <div>
                  <label className="gov-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    Waste Type
                    {aiResult && <span style={{ fontSize: 9, color: "#2e7d32", fontWeight: 700, background: "#e8f5e9", padding: "1px 6px", borderRadius: 999, border: "1px solid #a5d6a7" }}>AI auto-filled</span>}
                  </label>
                  <select
                    className="gov-select"
                    style={{ width: "100%" }}
                    value={form.wasteType}
                    onChange={e => setForm(f => ({ ...f, wasteType: e.target.value }))}
                    data-testid="select-waste-type"
                  >
                    {WASTE_TYPES.map(t => (
                      <option key={t} value={t}>
                        {WASTE_EMOJI[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ── Description ── */}
                <div>
                  <label className="gov-label">Description</label>
                  <input
                    className="gov-input"
                    placeholder="Describe the waste (optional — AI fills this in)"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    data-testid="input-description"
                  />
                </div>

                {/* ── Priority ── */}
                <div>
                  <label className="gov-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    Priority
                    {aiResult && <span style={{ fontSize: 9, color: "#2e7d32", fontWeight: 700, background: "#e8f5e9", padding: "1px 6px", borderRadius: 999, border: "1px solid #a5d6a7" }}>AI auto-filled</span>}
                  </label>
                  <select
                    className="gov-select"
                    style={{ width: "100%" }}
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    data-testid="select-priority"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="normal">🔵 Normal</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>

                {/* ── Submit ── */}
                <button
                  className="gov-btn gov-btn-green"
                  style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "11px", marginTop: 4 }}
                  onClick={handleSubmit}
                  disabled={isBusy || aiLoading}
                  data-testid="button-submit-report"
                >
                  {uploading
                    ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Uploading photo…</>
                    : createReport.isPending
                    ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Submitting…</>
                    : aiLoading
                    ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Waiting for AI…</>
                    : "📤 Submit Report (+50 pts)"
                  }
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Tabs ── */}
        <div className="gov-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`gov-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
              data-testid={`tab-${t.key}`}
            >
              {t.label}
              {t.key === "verify" && pendingReports.length > 0 && (
                <span style={{ marginLeft: 6, background: "linear-gradient(135deg,#2e7d32,#1b5e20)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999 }}>
                  {pendingReports.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── My Reports ── */}
        {tab === "my-reports" && (
          <div className="gov-card">
            <div className="gov-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="eco-icon-bubble" style={{ width: 30, height: 30 }}>
                  <Camera style={{ width: 14, height: 14, color: "#2e7d32" }} />
                </div>
                <span className="gov-section-title">My Reports</span>
              </div>
              <span className="gov-badge gov-badge-blue">{reports.length} total</span>
            </div>
            {isLoading ? (
              <div style={{ padding: 18 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: 52, background: "linear-gradient(145deg,#f5fbf5,#eaf4ea)", borderRadius: 10, marginBottom: 8, boxShadow: "3px 3px 8px #c5d8c5" }} />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(145deg,#e8f5e9,#c8e6c9)", boxShadow: "4px 4px 10px #b0ccb2,-2px -2px 6px #fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Camera style={{ width: 28, height: 28, color: "#2e7d32" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 4 }}>No reports yet</div>
                <div style={{ fontSize: 12, color: "#5d7a5e", marginBottom: 16 }}>Submit your first waste report to earn 50 points!</div>
                <button className="gov-btn gov-btn-green gov-btn-sm" onClick={() => setOpen(true)}>📸 Report Now</button>
              </div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Waste Type</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r: any) => (
                    <tr key={r.id} data-testid={`report-card-${r.id}`}>
                      <td>
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt="Waste" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "2px solid #c8e6c9", boxShadow: "2px 2px 5px #c5d8c5" }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(145deg,#e8f5e9,#c8e6c9)", boxShadow: "2px 2px 5px #c5d8c5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Camera style={{ width: 18, height: 18, color: "#2e7d32" }} />
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 700 }}>
                        {WASTE_EMOJI[r.wasteType] || "🗑️"} <span style={{ textTransform: "capitalize" }}>{r.wasteType} waste</span>
                      </td>
                      <td style={{ fontSize: 12, color: "#5d7a5e" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin style={{ width: 10, height: 10 }} />{r.address || "No address"}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "#5d7a5e", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.description || "—"}
                      </td>
                      <td>
                        <span className={STATUS_BADGE[r.status] || STATUS_BADGE.pending}>{STATUS_LABEL[r.status] || r.status}</span>
                      </td>
                      <td style={{ fontSize: 11, color: "#8fa98f", whiteSpace: "nowrap" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td>
                        {r.rewardPoints && r.status === "completed"
                          ? <span style={{ fontSize: 12, fontWeight: 800, color: "#2e7d32", fontFamily: "'Inter',sans-serif" }}>+{r.rewardPoints} pts</span>
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Peer Verify ── */}
        {tab === "verify" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="gov-alert gov-alert-green">
              <CheckCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Earn 10 points for each report you verify!</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>Help the community by verifying waste reports submitted by others.</div>
              </div>
            </div>
            <div className="gov-card">
              <div className="gov-card-header">
                <span className="gov-section-title">Reports Awaiting Verification</span>
                <span className="gov-badge gov-badge-yellow">{pendingReports.length} pending</span>
              </div>
              {pendingLoading ? (
                <div style={{ padding: 18 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: 52, background: "linear-gradient(145deg,#f5fbf5,#eaf4ea)", borderRadius: 10, marginBottom: 8 }} />
                  ))}
                </div>
              ) : pendingReports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <CheckCircle style={{ width: 32, height: 32, color: "#8fa98f", margin: "0 auto 10px" }} />
                  <div style={{ fontSize: 13, color: "#5d7a5e" }}>No reports to verify right now. Check back later!</div>
                </div>
              ) : (
                <table className="gov-table">
                  <thead><tr><th>Photo</th><th>Waste Type</th><th>Location</th><th>Reporter</th><th>Verdict</th></tr></thead>
                  <tbody>
                    {pendingReports.map((r: any) => (
                      <tr key={r.id} data-testid={`verify-card-${r.id}`}>
                        <td>
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt="Waste" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "2px solid #c8e6c9" }} />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(145deg,#f5fbf5,#eaf4ea)", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Camera style={{ width: 18, height: 18, color: "#8fa98f" }} />
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 700 }}>
                          {WASTE_EMOJI[r.wasteType] || "🗑️"} <span style={{ textTransform: "capitalize" }}>{r.wasteType} waste</span>
                        </td>
                        <td style={{ fontSize: 12, color: "#5d7a5e" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin style={{ width: 10, height: 10 }} />{r.address || "No address"}
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: "#5d7a5e" }}>{r.reporterName || "Anonymous"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button
                              className="gov-btn gov-btn-green gov-btn-xs"
                              style={{ display: "flex", alignItems: "center", gap: 4 }}
                              onClick={() => handleVerify(r.id, true)}
                              data-testid={`button-verify-legit-${r.id}`}
                            >
                              <CheckCircle style={{ width: 10, height: 10 }} /> Legit
                            </button>
                            <button
                              className="gov-btn gov-btn-red gov-btn-xs"
                              style={{ display: "flex", alignItems: "center", gap: 4 }}
                              onClick={() => handleVerify(r.id, false)}
                              data-testid={`button-verify-fake-${r.id}`}
                            >
                              <X style={{ width: 10, height: 10 }} /> Fake
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
