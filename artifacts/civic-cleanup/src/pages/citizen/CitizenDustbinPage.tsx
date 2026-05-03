import { useState, useEffect, useRef } from "react";
import { QrCode, Droplets, RefreshCw, CheckCircle, Clock, MapPin, AlertTriangle, MessageSquareWarning } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import QRCode from "qrcode";
import "@/styles/dashboard.css";
import "@/styles/mobile.css";

const LEVELS = [
  { value: 0,  label: "Empty",  emoji: "🟢", color: "#1e8449", bg: "#d5f5e3", border: "#a9dfbf", desc: "Dustbin is empty"         },
  { value: 30, label: "Low",    emoji: "🟡", color: "#b7950b", bg: "#fef9e7", border: "#f9e79f", desc: "Less than one-third full"  },
  { value: 65, label: "Medium", emoji: "🟠", color: "#ca6f1e", bg: "#fdebd0", border: "#f0b27a", desc: "About two-thirds full"     },
  { value: 90, label: "Full",   emoji: "🔴", color: "#c0392b", bg: "#fadbd8", border: "#f1948a", desc: "Needs collection urgently" },
];

const COMPLAINT_TYPES = [
  { value: "worker_not_arrived", label: "Worker not arrived — bin is full" },
  { value: "missed_collection",  label: "Collection was missed today"     },
  { value: "late_collection",    label: "Collection is very late"         },
  { value: "other",              label: "Other issue"                     },
];

function getLevelInfo(v: number) {
  if (v >= 80) return LEVELS[3];
  if (v >= 50) return LEVELS[2];
  if (v >= 15) return LEVELS[1];
  return LEVELS[0];
}

export default function CitizenDustbinPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [bin,         setBin]         = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [selected,    setSelected]    = useState<number | null>(null);
  const [submitted,   setSubmitted]   = useState(false);

  /* complaint state */
  const [complaintType, setComplaintType] = useState("worker_not_arrived");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintSending, setComplaintSending] = useState(false);
  const [complaintSent,    setComplaintSent]    = useState(false);

  const fetchBin = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dustbin/my", { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (j.success) {
        setBin(j.data);
        setSelected(j.data.fillLevel ?? 0);
      }
    } catch {
      toast({ title: "Failed to load dustbin", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBin(); }, []);

  useEffect(() => {
    if (!bin?.qrCode || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, bin.qrCode, {
      width: 200,
      margin: 2,
      color: { dark: "#1b5e20", light: "#f0faf4" },
    });
  }, [bin?.qrCode]);

  const updateLevel = async () => {
    if (selected === null) return;
    setSaving(true);
    try {
      const r = await fetch("/api/dustbin/my/level", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fillLevel: selected }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setBin(j.data);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      toast({ title: "Dustbin level updated!", description: "Worker will be notified." });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitComplaint = async () => {
    setComplaintSending(true);
    try {
      /* We submit it as a waste report with description = complaint details */
      const body = {
        wasteType: "mixed",
        description: `[COMPLAINT — ${COMPLAINT_TYPES.find(c => c.value === complaintType)?.label}] ${complaintDesc}`.trim(),
        latitude:  28.6139,
        longitude: 77.2090,
        address:   bin?.address || "Citizen's registered address",
      };
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Submit failed");
      setComplaintSent(true);
      setComplaintDesc("");
      toast({ title: "Complaint filed!", description: "Your complaint has been logged. A supervisor will follow up." });
      setTimeout(() => setComplaintSent(false), 5000);
    } catch {
      toast({ title: "Could not submit complaint", variant: "destructive" });
    } finally {
      setComplaintSending(false);
    }
  };

  const levelInfo = getLevelInfo(selected ?? bin?.fillLevel ?? 0);

  const S: React.CSSProperties = { fontFamily: "'Inter','Roboto',sans-serif" };

  if (loading) return (
    <DashboardLayout title="My Dustbin">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: 80, background: "linear-gradient(145deg,#f5fbf5,#e8f5e9)", borderRadius: 16, animation: "pulse 1.5s infinite" }} />)}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="My Dustbin">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <QrCode style={{ width: 18, height: 18, color: "#2e7d32" }} /> My Dustbin QR
            </h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>
              Update your fill level — workers will collect based on your report
            </div>
          </div>
          <button onClick={fetchBin} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "linear-gradient(145deg,#fff,#f5fbf5)", border: "1px solid #c8e6c9", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#2e7d32", boxShadow: "3px 3px 8px #c5d8c5,-2px -2px 5px #fff" }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
          </button>
        </div>

        {/* ── Main grid ── */}
        <div className="mob-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18, alignItems: "start" }}>

          {/* QR Code Card */}
          <div style={{ background: "linear-gradient(145deg,#fff,#f0faf4)", borderRadius: 20, border: "1.5px solid #c8e6c9", boxShadow: "6px 6px 16px #c8dcc8,-4px -4px 10px #fff", padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32", letterSpacing: ".08em", marginBottom: 10, textTransform: "uppercase" }}>Your Dustbin QR Code</div>

            <div style={{ display: "inline-flex", padding: 12, background: "#f0faf4", borderRadius: 16, border: "2px solid #a5d6a7", boxShadow: "inset 2px 2px 8px rgba(46,125,50,.08)" }}>
              <canvas ref={canvasRef} style={{ display: "block", borderRadius: 8 }} />
            </div>

            <div style={{ marginTop: 14, padding: "8px 16px", background: "#1b5e20", borderRadius: 10, display: "inline-block" }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: ".12em", fontFamily: "monospace" }}>{bin?.qrCode}</span>
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: "#5d7a5e", lineHeight: 1.5 }}>
              Show this QR to the waste worker<br />when they visit your home for collection
            </div>

            {bin?.lastCollectedAt && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: "#1e8449", background: "#d5f5e3", borderRadius: 8, padding: "5px 10px" }}>
                <CheckCircle style={{ width: 11, height: 11 }} />
                Last collected: {new Date(bin.lastCollectedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
          </div>

          {/* Level Selector Card */}
          <div style={{ background: "linear-gradient(145deg,#fff,#f5fbf5)", borderRadius: 20, border: "1.5px solid #e0ece0", boxShadow: "6px 6px 16px #c8dcc8,-4px -4px 10px #fff", padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1c2833", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Droplets style={{ width: 14, height: 14, color: "#2e7d32" }} />
              How full is your dustbin right now?
            </div>

            {/* Visual bin */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ position: "relative", width: 70, height: 90 }}>
                <div style={{ position: "absolute", bottom: 0, left: 6, right: 6, height: 74, borderRadius: "4px 4px 8px 8px", border: `2.5px solid ${levelInfo.color}`, background: "#f8faf8", overflow: "hidden", boxShadow: `0 4px 14px ${levelInfo.color}30` }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${selected ?? 0}%`, background: levelInfo.bg, borderTop: `2px solid ${levelInfo.border}`, transition: "height .4s ease" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: levelInfo.color, zIndex: 2 }}>
                    {selected ?? 0}%
                  </div>
                </div>
                <div style={{ position: "absolute", top: 4, left: 2, right: 2, height: 14, borderRadius: 5, background: levelInfo.color, boxShadow: `0 2px 8px ${levelInfo.color}50` }} />
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 8, borderRadius: 4, border: `2px solid ${levelInfo.color}`, background: "none" }} />
              </div>
            </div>

            {/* Level buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setSelected(l.value)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "12px 10px", borderRadius: 12, cursor: "pointer",
                    border: `2px solid ${selected === l.value ? l.color : "#e0ece0"}`,
                    background: selected === l.value ? l.bg : "#fff",
                    boxShadow: selected === l.value ? `3px 3px 10px ${l.border}, inset 1px 1px 4px rgba(255,255,255,.6)` : "2px 2px 6px #dde8dd,-1px -1px 4px #fff",
                    transition: "all .18s",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{l.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: selected === l.value ? l.color : "#5d6d7e" }}>{l.label}</span>
                  <span style={{ fontSize: 9, color: "#909caa", textAlign: "center" }}>{l.desc}</span>
                </button>
              ))}
            </div>

            {submitted ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "#d5f5e3", borderRadius: 12, border: "1.5px solid #a9dfbf" }}>
                <CheckCircle style={{ width: 16, height: 16, color: "#1e8449" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e8449" }}>Level saved! Worker notified.</span>
              </div>
            ) : (
              <button
                onClick={updateLevel}
                disabled={saving || selected === null}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: saving ? "#95a5a6" : "linear-gradient(135deg,#1b5e20,#2e7d32)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", boxShadow: "3px 3px 10px rgba(27,94,32,.35)", transition: "all .18s" }}
              >
                {saving ? "Saving…" : `Report as ${LEVELS.find(l => l.value === selected)?.label || "Updated"}`}
              </button>
            )}

            {bin?.lastLevelAt && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#5d6d7e", justifyContent: "center" }}>
                <Clock style={{ width: 10, height: 10 }} />
                Last reported: {new Date(bin.lastLevelAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>
        </div>

        {/* ── Worker Complaint Card ── */}
        <div style={{ background: "linear-gradient(145deg,#fffbf0,#fff8e8)", borderRadius: 20, border: "1.5px solid #f0c040", boxShadow: "6px 6px 16px #e8d8a0,-4px -4px 10px #fff", padding: 22 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(145deg,#fff3cd,#ffe082)", boxShadow: "3px 3px 8px #e8d080,-2px -2px 5px #fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MessageSquareWarning style={{ width: 18, height: 18, color: "#b7950b" }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#7d6008" }}>Worker Not Arrived?</div>
              <div style={{ fontSize: 11, color: "#a08030", marginTop: 1 }}>Dustbin full but no collection yet? File a complaint — we'll follow up</div>
            </div>
            <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: "#fff3cd", border: "1px solid #f0c040", color: "#b7950b" }}>
              ⚡ Priority
            </span>
          </div>

          {complaintSent ? (
            /* ── Success state ── */
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "linear-gradient(135deg,#d5f5e3,#a9dfbf30)", borderRadius: 14, border: "1.5px solid #a9dfbf" }}>
              <CheckCircle style={{ width: 24, height: 24, color: "#1e8449", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e8449" }}>Complaint filed successfully!</div>
                <div style={{ fontSize: 11, color: "#2e7d32", marginTop: 2 }}>A supervisor will review and take action within 24 hours.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Warning banner if bin is full */}
              {(selected ?? bin?.fillLevel ?? 0) >= 65 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#ffebee", borderRadius: 10, border: "1px solid #f1948a" }}>
                  <AlertTriangle style={{ width: 14, height: 14, color: "#c0392b", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#c0392b" }}>Your bin is reported as high fill — complaint is pre-flagged as urgent.</span>
                </div>
              )}

              {/* Complaint type */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#7d6008", marginBottom: 6, display: "block" }}>What is the issue?</label>
                <select
                  value={complaintType}
                  onChange={e => setComplaintType(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #f0c040", background: "#fffdf5", fontSize: 12, fontWeight: 600, color: "#1c2833", outline: "none", cursor: "pointer" }}
                >
                  {COMPLAINT_TYPES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#7d6008", marginBottom: 6, display: "block" }}>Additional details <span style={{ color: "#bbb", fontWeight: 500 }}>(optional)</span></label>
                <textarea
                  value={complaintDesc}
                  onChange={e => setComplaintDesc(e.target.value)}
                  placeholder="e.g. 'Bin has been full since Monday, worker scheduled for Tuesday but didn't come…'"
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #f0c040", background: "#fffdf5", fontSize: 12, color: "#1c2833", resize: "vertical", outline: "none", fontFamily: "'Inter',sans-serif", boxSizing: "border-box" }}
                />
              </div>

              {/* Address auto-filled */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#f0faf4", borderRadius: 8, border: "1px solid #c8e6c9" }}>
                <MapPin style={{ width: 11, height: 11, color: "#2e7d32", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>
                  Location: {bin?.address || "Your registered address"} — auto-attached
                </span>
              </div>

              {/* Submit */}
              <button
                onClick={submitComplaint}
                disabled={complaintSending}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12, border: "none",
                  background: complaintSending ? "#bbb" : "linear-gradient(135deg,#b7950b,#d4ac0d)",
                  color: "#fff", fontSize: 13, fontWeight: 800,
                  cursor: complaintSending ? "default" : "pointer",
                  boxShadow: "3px 3px 10px rgba(183,149,11,.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all .18s",
                }}
              >
                <MessageSquareWarning style={{ width: 15, height: 15 }} />
                {complaintSending ? "Submitting…" : "Submit Complaint"}
              </button>
            </div>
          )}
        </div>

        {/* ── How it works ── */}
        <div style={{ background: "linear-gradient(145deg,#f0faf4,#e8f5e9)", borderRadius: 16, border: "1.5px solid #c8e6c9", padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1b5e20", marginBottom: 12 }}>How it works</div>
          <div className="mob-col-1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { step: "1", icon: "📱", title: "Report Level", desc: "Tap your current fill level above when you think the dustbin needs collection" },
              { step: "2", icon: "🚛", title: "Worker Visits", desc: "A waste worker is dispatched to your address based on the reported level" },
              { step: "3", icon: "✅", title: "QR Scan Proof", desc: "Worker scans your QR code as proof of visit, resets level to empty" },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2e7d32", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1c2833" }}>{s.icon} {s.title}</div>
                  <div style={{ fontSize: 10, color: "#5d6d7e", marginTop: 2, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
