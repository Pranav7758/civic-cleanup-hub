import { useState, useRef } from "react";
import { useGetDonations, useCreateDonation, getGetDonationsQueryKey } from "@workspace/api-client-react";
import { Heart, Plus, MapPin, Upload, Sparkles, X, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

const CATEGORIES = [
  { value: "clothes",     label: "Clothes",     emoji: "👕" },
  { value: "food",        label: "Food",        emoji: "🍱" },
  { value: "electronics", label: "Electronics", emoji: "📱" },
  { value: "furniture",   label: "Furniture",   emoji: "🪑" },
  { value: "books",       label: "Books",       emoji: "📚" },
  { value: "other",       label: "Other",       emoji: "📦" },
];

const STATUS_BADGE: Record<string, string> = {
  pending:   "gov-badge gov-badge-yellow",
  scheduled: "gov-badge gov-badge-blue",
  completed: "gov-badge gov-badge-green",
  cancelled: "gov-badge gov-badge-red",
};

const CONDITION_COLOR: Record<string, string> = {
  new: "#1e8449", good: "#1a5276", fair: "#b7950b", poor: "#c0392b",
};

interface AiResult {
  category: string;
  condition: string;
  label: string;
  description: string;
  suggestedNgo: string;
  confidence: number;
}

export default function DonationsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "clothes", description: "", address: "" });
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [imgMime, setImgMime]     = useState("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult]   = useState<AiResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: donationsData, isLoading } = useGetDonations({});
  const createDonation = useCreateDonation();
  const donations: any[] = (donationsData as any)?.data || [];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Please upload an image file", variant: "destructive" }); return; }
    setImgMime(file.type);
    setAiResult(null);
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      setImgPreview(dataUrl);
      setImgBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const analyzeImage = async () => {
    if (!imgBase64) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: imgBase64, mimeType: imgMime }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");
      setAiResult(json.data as AiResult);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAiSuggestions = () => {
    if (!aiResult) return;
    setForm(f => ({
      ...f,
      category: aiResult.category || f.category,
      description: aiResult.description || f.description,
    }));
    toast({ title: "AI suggestions applied!", description: "Form filled with detected item details." });
  };

  const clearImage = () => {
    setImgPreview(null);
    setImgBase64(null);
    setAiResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!form.category) { toast({ title: "Category required", variant: "destructive" }); return; }
    createDonation.mutate({ data: form }, {
      onSuccess: () => {
        toast({ title: "Donation created!", description: "An NGO will schedule a pickup soon." });
        setOpen(false);
        setSelectedCat(null);
        setForm({ category: "clothes", description: "", address: "" });
        clearImage();
        qc.invalidateQueries({ queryKey: getGetDonationsQueryKey({}) });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const openWithCategory = (cat: string) => {
    setForm(f => ({ ...f, category: cat }));
    setSelectedCat(cat);
    setOpen(true);
  };

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Donate Items">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header row ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Donate Items to NGOs</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>Give to NGOs and earn +50 points per donation</div>
          </div>
          <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setSelectedCat(null); clearImage(); } }}>
            <DialogTrigger asChild>
              <button className="gov-btn gov-btn-green" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Plus style={{ width: 13, height: 13 }} /> Donate Items
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Donation</DialogTitle></DialogHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8, maxHeight: "80vh", overflowY: "auto" }}>

                {/* ── AI Image Analyzer ── */}
                <div style={{ border: "1.5px solid #a9dfbf", borderRadius: 10, overflow: "hidden", background: "#f0faf4" }}>
                  <div style={{ padding: "8px 12px", background: "linear-gradient(135deg,#1b5e20,#2e7d32)", display: "flex", alignItems: "center", gap: 7 }}>
                    <Sparkles style={{ width: 14, height: 14, color: "#a5d6a7" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>AI Item Detector</span>
                    <span style={{ fontSize: 10, color: "#a5d6a7", marginLeft: "auto" }}>Upload a photo to auto-fill the form</span>
                  </div>

                  {!imgPreview ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => fileRef.current?.click()}
                      style={{ padding: "20px 16px", textAlign: "center", cursor: "pointer", borderTop: "1.5px dashed #a9dfbf" }}
                    >
                      <Upload style={{ width: 28, height: 28, color: "#2e7d32", margin: "0 auto 8px" }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1e8449" }}>Drop image here or click to upload</div>
                      <div style={{ fontSize: 10, color: "#5d6d7e", marginTop: 3 }}>JPG, PNG, WEBP — AI will detect items automatically</div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    </div>
                  ) : (
                    <div style={{ padding: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img src={imgPreview} alt="upload" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid #a9dfbf" }} />
                          <button onClick={clearImage} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", border: "none", background: "#c0392b", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                            <X style={{ width: 10, height: 10 }} />
                          </button>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {!aiResult ? (
                            <button
                              onClick={analyzeImage}
                              disabled={analyzing}
                              style={{ width: "100%", padding: "8px 12px", background: analyzing ? "#95a5a6" : "linear-gradient(135deg,#1b5e20,#2e7d32)", color: "#fff", border: "none", borderRadius: 7, cursor: analyzing ? "default" : "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                            >
                              <Sparkles style={{ width: 13, height: 13 }} />
                              {analyzing ? "Analyzing image…" : "Analyze with AI"}
                            </button>
                          ) : (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                                <CheckCircle style={{ width: 13, height: 13, color: "#1e8449" }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#1e8449" }}>Analysis complete — {aiResult.confidence}% confident</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#1c2833", fontWeight: 600, marginBottom: 2 }}>{aiResult.label}</div>
                              <div style={{ fontSize: 10, color: "#5d6d7e", marginBottom: 4, lineHeight: 1.4 }}>{aiResult.description}</div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "#d5f5e3", color: "#1e8449", fontWeight: 600 }}>
                                  {CATEGORIES.find(c => c.value === aiResult.category)?.emoji} {aiResult.category}
                                </span>
                                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "#eaf2ff", color: CONDITION_COLOR[aiResult.condition] || "#1a5276", fontWeight: 600 }}>
                                  {aiResult.condition} condition
                                </span>
                                {aiResult.suggestedNgo && (
                                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "#fef9e7", color: "#b7950b", fontWeight: 600 }}>
                                    → {aiResult.suggestedNgo}
                                  </span>
                                )}
                              </div>
                              <button onClick={applyAiSuggestions} style={{ width: "100%", padding: "5px 10px", background: "#d5f5e3", color: "#1e8449", border: "1.5px solid #a9dfbf", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                                ✓ Use these details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Manual Form ── */}
                <div>
                  <label className="gov-label">Category</label>
                  <select className="gov-select" style={{ width: "100%" }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gov-label">Description</label>
                  <textarea className="gov-input" rows={2} placeholder="Describe the items (e.g. 5 shirts, good condition)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label className="gov-label">Pickup Address</label>
                  <input className="gov-input" placeholder="Enter your address for pickup" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <button className="gov-btn gov-btn-green" style={{ width: "100%" }} onClick={handleSubmit} disabled={createDonation.isPending}>
                  {createDonation.isPending ? "Submitting…" : "Submit Donation"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Quick Donate ── */}
        <div className="gov-card">
          <div className="gov-card-header"><span className="gov-section-title">Quick Donate by Category</span></div>
          <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => openWithCategory(c.value)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 6px", border: `1px solid ${selectedCat === c.value ? "#1a6b3c" : "#d5dae1"}`,
                  borderRadius: 3, cursor: "pointer",
                  background: selectedCat === c.value ? "#d5f5e3" : "#fff",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f4f6f9")}
                onMouseLeave={e => (e.currentTarget.style.background = selectedCat === c.value ? "#d5f5e3" : "#fff")}
              >
                <span style={{ fontSize: 24 }}>{c.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1c2833" }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── My Donations ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Heart style={{ width: 14, height: 14, color: "#6c3483" }} />
              <span className="gov-section-title">My Donations</span>
            </div>
            <span className="gov-badge gov-badge-purple">{donations.length} total</span>
          </div>
          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 48, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : donations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Heart style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "#5d6d7e", marginBottom: 12 }}>No donations yet. Help your community by donating items!</div>
              <button className="gov-btn gov-btn-green gov-btn-sm" onClick={() => setOpen(true)}>Donate Now</button>
            </div>
          ) : (
            <table className="gov-table">
              <thead><tr><th>Category</th><th>Description</th><th>Pickup Address</th><th>Status</th><th>Reward</th></tr></thead>
              <tbody>
                {donations.map((d: any) => {
                  const cat = CATEGORIES.find(c => c.value === d.category);
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{cat?.emoji || "📦"}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2833", textTransform: "capitalize" }}>{cat?.label || d.category}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{d.description || "—"}</td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                        {d.address ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin style={{ width: 10, height: 10 }} />{d.address}
                          </div>
                        ) : "—"}
                      </td>
                      <td><span className={STATUS_BADGE[d.status] || STATUS_BADGE.pending}>{d.status}</span></td>
                      <td>
                        {d.rewardPoints && d.status === "completed" ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1e8449" }}>+{d.rewardPoints} pts</span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
