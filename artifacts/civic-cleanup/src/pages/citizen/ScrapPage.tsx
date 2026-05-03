import { useState, useRef } from "react";
import { useGetScrapPrices, useGetScrapListings, useCreateScrapListing, getGetScrapListingsQueryKey } from "@workspace/api-client-react";
import { Recycle, Plus, Trash2, ArrowUp, ArrowDown, Upload, Sparkles, X, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

interface ScrapItem { itemName: string; category: string; weightKg: string; pricePerKg: string; }

const STATUS_BADGE: Record<string, string> = {
  pending:   "gov-badge gov-badge-yellow",
  accepted:  "gov-badge gov-badge-blue",
  completed: "gov-badge gov-badge-green",
  cancelled: "gov-badge gov-badge-red",
};

const CAT_EMOJI: Record<string, string> = { metal: "⚙️", paper: "📄", plastic: "♻️", ewaste: "💻" };
const CAT_COLOR: Record<string, string> = { metal: "#b7950b", paper: "#1a5276", plastic: "#1e8449", ewaste: "#6c3483" };

const TABS = [{ key: "listings", label: "My Listings" }, { key: "prices", label: "Market Prices" }] as const;

interface AiScrapResult {
  category: string;
  itemName: string;
  estimatedWeightKg: number;
  estimatedPricePerKg: number;
  description: string;
  tips: string;
  confidence: number;
}

export default function ScrapPage() {
  const [tab,       setTab]       = useState<"listings"|"prices">("listings");
  const [open,      setOpen]      = useState(false);
  const [address,   setAddress]   = useState("");
  const [items,     setItems]     = useState<ScrapItem[]>([{ itemName: "", category: "metal", weightKg: "", pricePerKg: "" }]);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgBase64,  setImgBase64]  = useState<string | null>(null);
  const [imgMime,    setImgMime]    = useState("image/jpeg");
  const [analyzing,  setAnalyzing]  = useState(false);
  const [aiResult,   setAiResult]   = useState<AiScrapResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: pricesData              } = useGetScrapPrices();
  const { data: listingsData, isLoading } = useGetScrapListings({});
  const createListing = useCreateScrapListing();

  const prices:   any[] = (pricesData   as any)?.data || [];
  const listings: any[] = (listingsData as any)?.data || [];

  const priceByCategory: Record<string, any[]> = {};
  prices.forEach(p => {
    if (!priceByCategory[p.category]) priceByCategory[p.category] = [];
    priceByCategory[p.category].push(p);
  });

  const addItem    = () => setItems(prev => [...prev, { itemName: "", category: "metal", weightKg: "", pricePerKg: "" }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ScrapItem, value: string) => {
    setItems(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      if (field === "category") {
        const catPrices = priceByCategory[value] || [];
        copy[i].pricePerKg = catPrices[0]?.pricePerKg?.toFixed(2) || "";
      }
      return copy;
    });
  };

  const totalEstimate = items.reduce((s, it) => s + (parseFloat(it.weightKg) || 0) * (parseFloat(it.pricePerKg) || 0), 0);

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

  const clearImage = () => {
    setImgPreview(null);
    setImgBase64(null);
    setAiResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const analyzeImage = async () => {
    if (!imgBase64) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-scrap", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: imgBase64, mimeType: imgMime }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");
      setAiResult(json.data as AiScrapResult);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAiSuggestions = () => {
    if (!aiResult) return;
    const cat = aiResult.category || "metal";
    const catPrices = priceByCategory[cat] || [];
    const marketPrice = catPrices[0]?.pricePerKg?.toFixed(2) || String(aiResult.estimatedPricePerKg || "");
    setItems([{
      itemName:   aiResult.itemName || "",
      category:   cat,
      weightKg:   aiResult.estimatedWeightKg ? String(aiResult.estimatedWeightKg) : "",
      pricePerKg: marketPrice,
    }]);
    toast({ title: "AI suggestions applied!", description: "Scrap item filled with detected details." });
  };

  const handleSubmit = () => {
    if (items.some(it => !it.itemName || !it.weightKg)) { toast({ title: "Fill all item fields", variant: "destructive" }); return; }
    createListing.mutate(
      { data: { items: items.map(it => ({ ...it, weightKg: parseFloat(it.weightKg), pricePerKg: parseFloat(it.pricePerKg) || 0 })), address } },
      {
        onSuccess: () => {
          toast({ title: "Listing created!", description: "A scrap dealer will contact you soon." });
          setOpen(false);
          setItems([{ itemName: "", category: "metal", weightKg: "", pricePerKg: "" }]);
          setAddress("");
          clearImage();
          qc.invalidateQueries({ queryKey: getGetScrapListingsQueryKey({}) });
        },
        onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Sell Scrap">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header row ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Sell Scrap Materials</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>List scrap for pickup and earn reward points</div>
          </div>
          <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) clearImage(); }}>
            <DialogTrigger asChild>
              <button className="gov-btn gov-btn-primary" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Plus style={{ width: 13, height: 13 }} /> New Listing
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Scrap Listing</DialogTitle></DialogHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8, maxHeight: "80vh", overflowY: "auto" }}>

                {/* ── AI Image Analyzer ── */}
                <div style={{ border: "1.5px solid #aed6f1", borderRadius: 10, overflow: "hidden", background: "#eaf4fb" }}>
                  <div style={{ padding: "8px 12px", background: "linear-gradient(135deg,#1a5276,#2980b9)", display: "flex", alignItems: "center", gap: 7 }}>
                    <Sparkles style={{ width: 14, height: 14, color: "#aed6f1" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>AI Scrap Identifier</span>
                    <span style={{ fontSize: 10, color: "#aed6f1", marginLeft: "auto" }}>Upload photo → auto-detect type & price</span>
                  </div>

                  {!imgPreview ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => fileRef.current?.click()}
                      style={{ padding: "20px 16px", textAlign: "center", cursor: "pointer", borderTop: "1.5px dashed #aed6f1" }}
                    >
                      <Upload style={{ width: 28, height: 28, color: "#1a5276", margin: "0 auto 8px" }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a5276" }}>Drop image here or click to upload</div>
                      <div style={{ fontSize: 10, color: "#5d6d7e", marginTop: 3 }}>AI identifies scrap type, weight estimate &amp; market price</div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    </div>
                  ) : (
                    <div style={{ padding: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img src={imgPreview} alt="upload" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid #aed6f1" }} />
                          <button onClick={clearImage} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", border: "none", background: "#c0392b", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X style={{ width: 10, height: 10 }} />
                          </button>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {!aiResult ? (
                            <button
                              onClick={analyzeImage}
                              disabled={analyzing}
                              style={{ width: "100%", padding: "8px 12px", background: analyzing ? "#95a5a6" : "linear-gradient(135deg,#1a5276,#2980b9)", color: "#fff", border: "none", borderRadius: 7, cursor: analyzing ? "default" : "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                            >
                              <Sparkles style={{ width: 13, height: 13 }} />
                              {analyzing ? "Analyzing image…" : "Identify with AI"}
                            </button>
                          ) : (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                                <CheckCircle style={{ width: 13, height: 13, color: "#1e8449" }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#1e8449" }}>Identified — {aiResult.confidence}% confident</span>
                              </div>
                              <div style={{ fontSize: 12, color: "#1c2833", fontWeight: 700, marginBottom: 2 }}>{aiResult.itemName}</div>
                              <div style={{ fontSize: 10, color: "#5d6d7e", marginBottom: 4, lineHeight: 1.4 }}>{aiResult.description}</div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "#fef9e7", color: CAT_COLOR[aiResult.category] || "#b7950b", fontWeight: 600 }}>
                                  {CAT_EMOJI[aiResult.category] || "♻️"} {aiResult.category}
                                </span>
                                {aiResult.estimatedWeightKg > 0 && (
                                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "#eaf2ff", color: "#1a5276", fontWeight: 600 }}>
                                    ~{aiResult.estimatedWeightKg} kg
                                  </span>
                                )}
                                {aiResult.estimatedPricePerKg > 0 && (
                                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "#d5f5e3", color: "#1e8449", fontWeight: 600 }}>
                                    ₹{aiResult.estimatedPricePerKg}/kg
                                  </span>
                                )}
                              </div>
                              {aiResult.tips && (
                                <div style={{ fontSize: 10, color: "#7d6608", background: "#fef9e7", border: "1px solid #f9e79f", borderRadius: 5, padding: "4px 7px", marginBottom: 5 }}>
                                  💡 {aiResult.tips}
                                </div>
                              )}
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

                {/* ── Address ── */}
                <div>
                  <label className="gov-label">Pickup Address</label>
                  <input className="gov-input" placeholder="Enter your address" value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                {/* ── Scrap Items ── */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label className="gov-label" style={{ margin: 0 }}>Scrap Items</label>
                    <button type="button" className="gov-btn gov-btn-outline gov-btn-xs" onClick={addItem}>
                      <Plus style={{ width: 10, height: 10, display: "inline", marginRight: 3 }} />Add
                    </button>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} style={{ border: "1px solid #d5dae1", borderRadius: 3, padding: 10, marginBottom: 8, background: "#fafbfc" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <input className="gov-input" style={{ flex: 1 }} placeholder="Item name (e.g. Old pipe)" value={item.itemName} onChange={e => updateItem(i, "itemName", e.target.value)} />
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} style={{ border: "none", background: "#fadbd8", borderRadius: 3, padding: "4px 8px", cursor: "pointer", color: "#c0392b" }}>
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        <select className="gov-select" value={item.category} onChange={e => updateItem(i, "category", e.target.value)}>
                          {["metal","paper","plastic","ewaste"].map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                        </select>
                        <input className="gov-input" placeholder="Weight (kg)" type="number" value={item.weightKg}   onChange={e => updateItem(i, "weightKg",   e.target.value)} />
                        <input className="gov-input" placeholder="₹/kg"        type="number" value={item.pricePerKg} onChange={e => updateItem(i, "pricePerKg", e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>

                {totalEstimate > 0 && (
                  <div style={{ background: "#d5f5e3", border: "1px solid #a9dfbf", borderRadius: 3, padding: "10px 14px" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e8449" }}>
                      Estimated Total: <strong>₹{totalEstimate.toFixed(2)}</strong>
                    </span>
                  </div>
                )}
                <button className="gov-btn gov-btn-green" style={{ width: "100%" }} onClick={handleSubmit} disabled={createListing.isPending}>
                  {createListing.isPending ? "Creating…" : "Create Listing"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Tabs ── */}
        <div className="gov-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`gov-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
              {t.key === "listings" && listings.length > 0 && (
                <span style={{ marginLeft: 5, background: "#1a5276", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}>{listings.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── My Listings ── */}
        {tab === "listings" && (
          <div className="gov-card">
            <div className="gov-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Recycle style={{ width: 14, height: 14, color: "#1a5276" }} />
                <span className="gov-section-title">My Scrap Listings</span>
              </div>
            </div>
            {isLoading ? (
              <div style={{ padding: 18 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 52, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
              </div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Recycle style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
                <div style={{ fontSize: 13, color: "#5d6d7e", marginBottom: 12 }}>No listings yet. Create your first scrap listing!</div>
                <button className="gov-btn gov-btn-primary gov-btn-sm" onClick={() => setOpen(true)}>Create Listing</button>
              </div>
            ) : (
              <table className="gov-table">
                <thead><tr><th>Items</th><th>Address</th><th>Weight</th><th>Est. Value</th><th>Status</th></tr></thead>
                <tbody>
                  {listings.map((l: any) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2833" }}>{l.items?.length || 0} item type{(l.items?.length || 0) !== 1 ? "s" : ""}</div>
                        {l.items?.slice(0, 2).map((item: any, i: number) => (
                          <div key={i} style={{ fontSize: 11, color: "#5d6d7e" }}>• {item.itemName} ({item.weightKg}kg)</div>
                        ))}
                      </td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{l.address || "—"}</td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{l.totalWeight ? `${l.totalWeight}kg` : "—"}</td>
                      <td style={{ fontSize: 14, fontWeight: 800, color: "#1e8449" }}>
                        {l.totalEstimate ? `₹${l.totalEstimate?.toFixed(2)}` : "—"}
                      </td>
                      <td><span className={STATUS_BADGE[l.status] || STATUS_BADGE.pending}>{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Market Prices ── */}
        {tab === "prices" && (
          <div className="gov-card">
            <div className="gov-card-header">
              <span className="gov-section-title">Current Market Prices</span>
              <span style={{ fontSize: 11, color: "#5d6d7e" }}>Updated daily</span>
            </div>
            {prices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#5d6d7e" }}>
                <div style={{ fontSize: 32 }}>📋</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>Price list not available</div>
              </div>
            ) : (
              <table className="gov-table">
                <thead><tr><th>Category</th><th>Item</th><th>Price / kg</th><th>Trend</th></tr></thead>
                <tbody>
                  {prices.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16 }}>{CAT_EMOJI[p.category] || "📦"}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: CAT_COLOR[p.category] || "#1c2833", textTransform: "capitalize" }}>{p.category}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "#1c2833" }}>{p.itemName}</td>
                      <td style={{ fontWeight: 800, fontSize: 14, color: "#1e8449" }}>₹{p.pricePerKg}/kg</td>
                      <td>
                        {p.previousPrice ? (
                          p.pricePerKg > p.previousPrice
                            ? <span style={{ fontSize: 12, color: "#1e8449", display: "flex", alignItems: "center", gap: 3 }}><ArrowUp style={{ width: 11, height: 11 }} />Up</span>
                            : <span style={{ fontSize: 12, color: "#c0392b", display: "flex", alignItems: "center", gap: 3 }}><ArrowDown style={{ width: 11, height: 11 }} />Down</span>
                        ) : <span style={{ fontSize: 11, color: "#909caa" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
