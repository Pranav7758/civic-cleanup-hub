import { useState, useEffect, useRef } from "react";
import { useGetDustbinCollections, getGetDustbinCollectionsQueryKey } from "@workspace/api-client-react";
import { Package, QrCode, Droplets, Camera, X, CheckCircle, MapPin, User, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import { BrowserQRCodeReader } from "@zxing/browser";

function getFillBadge(level: number): { badgeClass: string; label: string } {
  if (level >= 80) return { badgeClass: "bin-pill-full",   label: `${level}% Full`      };
  if (level >= 50) return { badgeClass: "bin-pill-medium", label: `${level}% Half Full`  };
  return              { badgeClass: "bin-pill-empty",  label: `${level}% Good`      };
}

function getFillStyle(level: number) {
  if (level >= 80) return { color: "#c0392b", bg: "#fadbd8", border: "#f1948a", label: "Full — Needs Urgent Collection", emoji: "🔴" };
  if (level >= 50) return { color: "#b7950b", bg: "#fef9e7", border: "#f9e79f", label: "Half Full",                       emoji: "🟡" };
  if (level >= 15) return { color: "#ca6f1e", bg: "#fdebd0", border: "#f0b27a", label: "Low",                             emoji: "🟠" };
  return              { color: "#1e8449", bg: "#d5f5e3", border: "#a9dfbf", label: "Empty — All Clear",             emoji: "🟢" };
}

export default function DustbinScanPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const qc = useQueryClient();

  const [mode,       setMode]       = useState<"idle"|"camera"|"manual">("idle");
  const [manualCode, setManualCode] = useState("");
  const [scanning,   setScanning]   = useState(false);
  const [result,     setResult]     = useState<any>(null);
  const [collecting, setCollecting] = useState(false);
  const [collected,  setCollected]  = useState(false);
  const [notes,      setNotes]      = useState("");

  const videoRef   = useRef<HTMLVideoElement>(null);
  const readerRef  = useRef<BrowserQRCodeReader | null>(null);
  const controlRef = useRef<any>(null);

  const { data: collectionsData, isLoading } = useGetDustbinCollections();
  const collections: any[] = (collectionsData as any)?.data || [];

  const stopCamera = () => {
    try { controlRef.current?.stop(); } catch {}
    controlRef.current = null;
    readerRef.current  = null;
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setMode("camera");
    setResult(null);
    setCollected(false);
    setTimeout(async () => {
      if (!videoRef.current) return;
      try {
        readerRef.current = new BrowserQRCodeReader();
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const deviceId = devices.find(d => d.label.toLowerCase().includes("back"))?.deviceId || devices[0]?.deviceId;
        controlRef.current = await readerRef.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, _err, controls) => {
            if (result) {
              const code = result.getText();
              controls.stop();
              setMode("idle");
              lookupCode(code);
            }
          }
        );
      } catch (err: any) {
        toast({ title: "Camera not available", description: "Please use manual entry instead.", variant: "destructive" });
        setMode("manual");
      }
    }, 300);
  };

  const lookupCode = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) { toast({ title: "Enter a valid code", variant: "destructive" }); return; }
    setScanning(true);
    setResult(null);
    setCollected(false);
    try {
      const r = await fetch(`/api/dustbin/scan/${encodeURIComponent(clean)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Dustbin not found");
      setResult(j.data);
      setMode("idle");
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const markCollected = async () => {
    if (!result?.bin?.qrCode) return;
    setCollecting(true);
    try {
      const r = await fetch(`/api/dustbin/scan/${result.bin.qrCode}/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setCollected(true);
      setResult((prev: any) => prev ? { ...prev, bin: { ...prev.bin, fillLevel: 0, lastCollectedAt: new Date().toISOString() } } : prev);
      qc.invalidateQueries({ queryKey: getGetDustbinCollectionsQueryKey() });
      toast({ title: "Collection recorded!", description: `Dustbin marked empty. ${j.prevLevel}% waste removed.` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setCollecting(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setCollected(false);
    setNotes("");
    setManualCode("");
    stopCamera();
  };

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Dustbin Scanner">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Dustbin QR Scanner</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>Scan citizen QR code to verify visit &amp; record collection</div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Total Scans",    value: collections.length, icon: "🗑️", color: "#1a5276" },
            { label: "Points Awarded", value: collections.reduce((s: number, c: any) => s + (c.pointsAwarded || 0), 0), icon: "⭐", color: "#b7950b" },
            { label: "Avg Fill Level", value: collections.length ? `${Math.round(collections.reduce((s: number, c: any) => s + (c.fillLevel || 0), 0) / collections.length)}%` : "0%", icon: "📊", color: "#1e8449" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Scan UI ── */}
        <div style={{ background: "linear-gradient(145deg,#fff,#f5fbf5)", borderRadius: 20, border: "1.5px solid #e0ece0", boxShadow: "6px 6px 16px #c8dcc8,-4px -4px 10px #fff", overflow: "hidden" }}>
          {/* Scan header */}
          <div style={{ padding: "12px 18px", background: "linear-gradient(135deg,#1b5e20,#2e7d32)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <QrCode style={{ width: 16, height: 16, color: "#a5d6a7" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Scan Dustbin QR Code</span>
            </div>
            {result && (
              <button onClick={resetScan} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <RefreshCw style={{ width: 11, height: 11 }} /> New Scan
              </button>
            )}
          </div>

          <div style={{ padding: 18 }}>
            {/* No result yet — show scan options */}
            {!result && mode !== "camera" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button
                    onClick={startCamera}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "20px 16px", border: "2px dashed #a5d6a7", borderRadius: 14, background: "#f0faf4", cursor: "pointer", transition: "all .18s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "#e8f5e9"); (e.currentTarget.style.borderColor = "#2e7d32"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "#f0faf4"); (e.currentTarget.style.borderColor = "#a5d6a7"); }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#1b5e20,#2e7d32)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Camera style={{ width: 20, height: 20, color: "#fff" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1b5e20" }}>Scan with Camera</span>
                    <span style={{ fontSize: 10, color: "#5d6d7e", textAlign: "center" }}>Point camera at the citizen's QR code</span>
                  </button>
                  <button
                    onClick={() => setMode("manual")}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "20px 16px", border: "2px dashed #aed6f1", borderRadius: 14, background: "#eaf4fb", cursor: "pointer", transition: "all .18s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "#d6eaf8"); (e.currentTarget.style.borderColor = "#1a5276"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "#eaf4fb"); (e.currentTarget.style.borderColor = "#aed6f1"); }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#1a5276,#2980b9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <QrCode style={{ width: 20, height: 20, color: "#fff" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a5276" }}>Enter Code Manually</span>
                    <span style={{ fontSize: 10, color: "#5d6d7e", textAlign: "center" }}>Type the ECO-XXXXXXXX code</span>
                  </button>
                </div>

                {mode === "manual" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="gov-input"
                      style={{ flex: 1, fontFamily: "monospace", fontWeight: 700, letterSpacing: ".1em", fontSize: 14, textTransform: "uppercase" }}
                      placeholder="ECO-XXXXXXXX"
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === "Enter") lookupCode(manualCode); }}
                      maxLength={12}
                    />
                    <button
                      onClick={() => lookupCode(manualCode)}
                      disabled={scanning || !manualCode}
                      style={{ padding: "8px 18px", background: scanning ? "#95a5a6" : "linear-gradient(135deg,#1b5e20,#2e7d32)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      {scanning ? "Searching…" : "Look Up"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Camera view */}
            {mode === "camera" && (
              <div style={{ position: "relative" }}>
                <video ref={videoRef} style={{ width: "100%", borderRadius: 12, maxHeight: 280, background: "#000", objectFit: "cover" }} />
                {/* Scan frame overlay */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 160, height: 160, border: "3px solid #4caf50", borderRadius: 12, boxShadow: "0 0 0 2000px rgba(0,0,0,.35)" }}>
                  <div style={{ position: "absolute", top: -2, left: -2, width: 24, height: 24, borderTop: "5px solid #4caf50", borderLeft: "5px solid #4caf50", borderRadius: "8px 0 0 0" }} />
                  <div style={{ position: "absolute", top: -2, right: -2, width: 24, height: 24, borderTop: "5px solid #4caf50", borderRight: "5px solid #4caf50", borderRadius: "0 8px 0 0" }} />
                  <div style={{ position: "absolute", bottom: -2, left: -2, width: 24, height: 24, borderBottom: "5px solid #4caf50", borderLeft: "5px solid #4caf50", borderRadius: "0 0 0 8px" }} />
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderBottom: "5px solid #4caf50", borderRight: "5px solid #4caf50", borderRadius: "0 0 8px 0" }} />
                </div>
                <button onClick={() => { stopCamera(); setMode("idle"); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,.6)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#5d6d7e", fontWeight: 600 }}>
                  📷 Point at the citizen's QR code
                </div>
                <button onClick={() => { stopCamera(); setMode("manual"); }} style={{ width: "100%", marginTop: 8, padding: "7px", background: "#f4f6f9", border: "1px solid #d5dae1", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#5d6d7e", fontWeight: 600 }}>
                  Can't scan? Enter code manually instead
                </button>
              </div>
            )}

            {/* Manual entry when mode is manual but no camera */}
            {mode === "manual" && (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="gov-input"
                  style={{ flex: 1, fontFamily: "monospace", fontWeight: 700, letterSpacing: ".1em", fontSize: 14, textTransform: "uppercase" }}
                  placeholder="ECO-XXXXXXXX"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={e => { if (e.key === "Enter") lookupCode(manualCode); }}
                  maxLength={12}
                  autoFocus
                />
                <button
                  onClick={() => lookupCode(manualCode)}
                  disabled={scanning || !manualCode}
                  style={{ padding: "8px 18px", background: scanning ? "#95a5a6" : "linear-gradient(135deg,#1b5e20,#2e7d32)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                >
                  {scanning ? "…" : "Look Up"}
                </button>
                <button onClick={() => setMode("idle")} style={{ padding: "8px 12px", background: "#f4f6f9", border: "1px solid #d5dae1", borderRadius: 8, cursor: "pointer" }}>
                  <X style={{ width: 14, height: 14, color: "#5d6d7e" }} />
                </button>
              </div>
            )}

            {/* Scan Result */}
            {result && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Citizen info banner */}
                <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", background: "#f0faf4", borderRadius: 14, border: "1.5px solid #c8e6c9" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#1b5e20,#2e7d32)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
                    {(result.citizen?.fullName || "?").charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1c2833" }}>{result.citizen?.fullName || "Citizen"}</div>
                    <div style={{ fontSize: 11, color: "#5d6d7e", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin style={{ width: 10, height: 10 }} />
                      {result.citizen?.address || result.citizen?.ward || result.citizen?.city || "Address not set"}
                    </div>
                    <div style={{ fontSize: 11, color: "#909caa", marginTop: 1, fontFamily: "monospace", letterSpacing: ".06em" }}>{result.bin?.qrCode}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "#d5f5e3", borderRadius: 999, border: "1px solid #a9dfbf" }}>
                    <CheckCircle style={{ width: 12, height: 12, color: "#1e8449" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e8449" }}>Verified</span>
                  </div>
                </div>

                {/* Fill level display */}
                {(() => {
                  const lvl   = result.bin?.fillLevel ?? 0;
                  const style = getFillStyle(lvl);
                  return (
                    <div style={{ background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                      {/* Mini bin visual */}
                      <div style={{ position: "relative", width: 52, height: 68, flexShrink: 0 }}>
                        <div style={{ position: "absolute", bottom: 0, left: 4, right: 4, height: 54, borderRadius: "3px 3px 6px 6px", border: `2px solid ${style.color}`, background: "#fff", overflow: "hidden" }}>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${lvl}%`, background: style.bg, borderTop: `1.5px solid ${style.border}`, transition: "height .5s" }} />
                        </div>
                        <div style={{ position: "absolute", top: 3, left: 0, right: 0, height: 10, borderRadius: 4, background: style.color }} />
                        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 18, height: 5, borderRadius: 3, border: `1.5px solid ${style.color}`, background: "none" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: style.color, paddingTop: 12 }}>
                          {lvl}%
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{style.emoji}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: style.color }}>{style.label}</div>
                        <div style={{ fontSize: 11, color: "#5d6d7e", marginTop: 2 }}>
                          Reported by citizen · {result.bin?.lastLevelAt ? new Date(result.bin.lastLevelAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Not updated"}
                        </div>
                      </div>
                      {lvl >= 80 && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <AlertTriangle style={{ width: 22, height: 22, color: "#c0392b" }} />
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#c0392b", textAlign: "center" }}>URGENT</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Collect action */}
                {!collected ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input className="gov-input" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
                    <button
                      onClick={markCollected}
                      disabled={collecting}
                      style={{ width: "100%", padding: "13px", borderRadius: 14, border: "none", background: collecting ? "#95a5a6" : "linear-gradient(135deg,#1b5e20,#2e7d32)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: collecting ? "default" : "pointer", boxShadow: "0 4px 14px rgba(27,94,32,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      <CheckCircle style={{ width: 16, height: 16 }} />
                      {collecting ? "Recording…" : "✓ Mark as Collected — Dustbin Emptied"}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 16px", background: "linear-gradient(145deg,#d5f5e3,#a9dfbf)", borderRadius: 16, border: "2px solid #1e8449", textAlign: "center" }}>
                    <CheckCircle style={{ width: 40, height: 40, color: "#1e8449" }} />
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#1e8449" }}>Collection Recorded!</div>
                    <div style={{ fontSize: 12, color: "#1b5e20" }}>Dustbin reset to 0% — Citizen notified</div>
                    <div style={{ padding: "4px 14px", background: "#1e8449", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>+10 points awarded to citizen</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Collection History ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Package style={{ width: 14, height: 14, color: "#1a5276" }} />
              <span className="gov-section-title">Collection History</span>
            </div>
          </div>
          {isLoading ? (
            <div style={{ padding: 18 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 48, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
            </div>
          ) : collections.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Package style={{ width: 32, height: 32, color: "#909caa", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "#5d6d7e" }}>No collections recorded yet</div>
            </div>
          ) : (
            <table className="gov-table">
              <thead><tr><th>Fill Level</th><th>Status</th><th>Notes</th><th>Date</th><th style={{ textAlign: "right" }}>Points</th></tr></thead>
              <tbody>
                {collections.map((c: any) => {
                  const badge = getFillBadge(c.fillLevel || 0);
                  return (
                    <tr key={c.id}>
                      <td><span className={badge.badgeClass}>{badge.label}</span></td>
                      <td><span className="gov-badge gov-badge-green">✓ Collected</span></td>
                      <td style={{ fontSize: 12, color: "#5d6d7e" }}>{c.notes || "—"}</td>
                      <td style={{ fontSize: 11, color: "#909caa" }}>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "#1e8449" }}>+{c.pointsAwarded}</td>
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
