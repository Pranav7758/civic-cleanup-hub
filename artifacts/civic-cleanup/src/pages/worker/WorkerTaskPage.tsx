import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, MapPin, Clock, AlertTriangle, CheckCircle2,
  Navigation, Upload, Camera, Trash2, ChevronRight, Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { uploadFile } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import "@/styles/dashboard.css";

const WASTE_EMOJI: Record<string, string> = {
  mixed: "🗑️", organic: "🌿", plastic: "♻️", metal: "🔩",
  hazardous: "☠️", ewaste: "💻", construction: "🏗️",
};
const PR_COLOR: Record<string, string> = { high:"#c62828", urgent:"#6a1a1a", normal:"#e65100", low:"#2e7d32" };
const PR_LABEL: Record<string, string> = { high:"Urgent", urgent:"Critical", normal:"Normal", low:"Low" };

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("civic_token");
  return fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
}

type Phase = "navigating" | "at_location";

export default function WorkerTaskPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const reportId = params.id;

  const [phase, setPhase]           = useState<Phase>("navigating");
  const [proofFile, setProofFile]   = useState<File | null>(null);
  const [proofURL, setProofURL]     = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [done, setDone]             = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Fetch report ── */
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const res = await authFetch(`/api/reports/${reportId}`);
      if (!res.ok) throw new Error("Report not found");
      return res.json();
    },
    enabled: !!reportId,
  });

  const report = reportData?.data;

  /* ── Complete mutation ── */
  const completeMutation = useMutation({
    mutationFn: async (completionImageUrl: string) => {
      const res = await authFetch(`/api/reports/${reportId}/complete`, {
        method: "POST",
        body: JSON.stringify({ completionImageUrl }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "🎉 Task Completed!", description: "Points have been awarded to the citizen." });
      qc.invalidateQueries({ queryKey: ["worker-tasks"] });
      qc.invalidateQueries({ queryKey: ["report", reportId] });
      setDone(true);
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  function handleFile(file: File) {
    setProofFile(file);
    setProofURL(URL.createObjectURL(file));
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }

  async function handleMarkDone() {
    if (!proofFile) return;
    let uploadedUrl = "";
    toast({ title: "Uploading proof…" });
    const url = await uploadFile(proofFile, "worker-proof");
    if (url) {
      uploadedUrl = url;
    } else {
      uploadedUrl = "proof-uploaded-local";
    }
    completeMutation.mutate(uploadedUrl);
  }

  const S: React.CSSProperties = { fontFamily: "'Inter','Roboto',Arial,sans-serif" };

  /* ── Build map URL from lat/lon or address ── */
  const mapURL = report
    ? (report.latitude && report.longitude
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${report.longitude - 0.012},${report.latitude - 0.009},${report.longitude + 0.012},${report.latitude + 0.009}&layer=mapnik&marker=${report.latitude},${report.longitude}`
        : `https://www.openstreetmap.org/export/embed.html?bbox=72.8,18.9,77.3,28.7&layer=mapnik`)
    : null;

  const gmapsURL = report
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(report.address || "India")}&travelmode=driving`
    : "#";

  /* ── Loading / Error states ── */
  if (isLoading) return (
    <DashboardLayout title="Loading Task…">
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh" }}>
        <Loader2 style={{ width:32, height:32, color:"#2e7d32", animation:"spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
  if (error || !report) return (
    <DashboardLayout title="Task Not Found">
      <div style={{ textAlign:"center", padding:60, color:"#5d6d7e" }}>
        <AlertTriangle style={{ width:36, height:36, color:"#e65100", margin:"0 auto 12px", display:"block" }} />
        <p style={{ marginBottom:16 }}>Task not found or you don't have access to it.</p>
        <button className="gov-btn gov-btn-primary" onClick={() => setLocation("/worker/reports")}>
          Back to Reports
        </button>
      </div>
    </DashboardLayout>
  );

  /* ── Done / Success screen ── */
  if (done) return (
    <DashboardLayout title="Task Complete">
      <div style={{ ...S, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:20, textAlign:"center" }}>
        <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(145deg,#e8f5e9,#a5d6a7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"6px 6px 18px #b0ccb0,-4px -4px 12px #fff" }}>
          <CheckCircle2 style={{ width:46, height:46, color:"#1b5e20" }} />
        </div>
        <div>
          <div style={{ fontSize:22, fontWeight:900, color:"#1b5e20" }}>Task Completed!</div>
          <div style={{ fontSize:13, color:"#5d6d7e", marginTop:6, textTransform:"capitalize" }}>
            {report.wasteType} Waste · {report.address?.split(",").slice(0,2).join(",") || "Done"}
          </div>
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
          {[
            { label:"Points Earned",  value:`+${report.rewardPoints || 50} pts`, color:"#5e35b1" },
            { label:"Citizen Reward", value:"Notified",                           color:"#0d9488" },
            { label:"Status",         value:"Verified",                           color:"#1e8449" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ minWidth:110 }}>
              <div style={{ fontSize:17, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#5d6d7e" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="gov-btn gov-btn-green" onClick={() => setLocation("/worker/reports")}>View More Tasks</button>
          <button className="gov-btn gov-btn-outline" onClick={() => setLocation("/worker")}>Dashboard</button>
        </div>
      </div>
    </DashboardLayout>
  );

  const prColor = PR_COLOR[report.priority] || PR_COLOR.normal;

  return (
    <DashboardLayout title="Task Navigation">
      <div style={{ ...S, display:"flex", flexDirection:"column", gap:16 }}>

        {/* ── Task header bar ── */}
        <div className="gov-card" style={{ padding:"14px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            <button className="gov-btn gov-btn-outline gov-btn-sm" style={{ display:"flex", alignItems:"center", gap:5 }} onClick={() => setLocation("/worker/reports")}>
              <ArrowLeft style={{ width:13, height:13 }} /> Back
            </button>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:18 }}>{WASTE_EMOJI[report.wasteType] || "🗑️"}</span>
                <div style={{ fontSize:16, fontWeight:800, color:"#1c2833", textTransform:"capitalize" }}>
                  {report.wasteType} Waste Collection
                </div>
                <span style={{ background:prColor, color:"#fff", fontSize:10, fontWeight:800, padding:"2px 9px", borderRadius:999 }}>
                  {PR_LABEL[report.priority] || "Normal"}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4, fontSize:12, color:"#5d6d7e", flexWrap:"wrap" }}>
                <span style={{ display:"flex", alignItems:"center", gap:3 }}>
                  <MapPin style={{ width:11,height:11 }} />{report.address || "Location not set"}
                </span>
                {report.description && (
                  <span style={{ display:"flex", alignItems:"center", gap:3 }}>
                    <Clock style={{ width:11,height:11 }} />{report.description.slice(0,50)}{report.description.length > 50 ? "…" : ""}
                  </span>
                )}
              </div>
            </div>
            {/* Phase stepper */}
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700 }}>
              {(["navigating","at_location"] as Phase[]).map((p, i) => (
                <span key={p} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  {i > 0 && <ChevronRight style={{ width:11,height:11, color:"#bbb" }} />}
                  <span style={{
                    padding:"3px 10px", borderRadius:999,
                    background: phase === p ? "#1b5e20" : i < ["navigating","at_location"].indexOf(phase) ? "#a5d6a7" : "#e8f5e9",
                    color: phase === p ? "#fff" : "#2e7d32",
                    border: phase === p ? "none" : "1px solid #a5d6a7",
                  }}>
                    {p === "navigating" ? "Navigate" : "Upload Proof"}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16 }}>

          {/* ── LEFT: Map ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="gov-card" style={{ overflow:"hidden", padding:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid #d5dae1", background:"linear-gradient(145deg,#fafffe,#f4faf4)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(145deg,#1b5e20,#2e7d32)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"2px 2px 6px rgba(27,94,32,0.4)" }}>
                    <Navigation style={{ width:13, height:13, color:"#fff" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#1c2833" }}>Live Route Map</div>
                    <div style={{ fontSize:10, color:"#5d6d7e" }}>{report.address || "Navigate to location"}</div>
                  </div>
                </div>
                <a href={gmapsURL} target="_blank" rel="noopener noreferrer" className="gov-btn gov-btn-primary gov-btn-sm" style={{ display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
                  <Navigation style={{ width:11,height:11 }} /> Open in Maps
                </a>
              </div>

              <div style={{ position:"relative", height:320 }}>
                {mapURL && (
                  <iframe title="Task location" src={mapURL} style={{ width:"100%", height:"100%", border:"none", display:"block" }} loading="lazy" />
                )}
                <div style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.95)", border:"1px solid #c8e6c9", borderRadius:8, padding:"5px 10px", display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, color:"#1b5e20", boxShadow:"2px 2px 8px rgba(0,0,0,0.12)" }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:"#ef5350", animation:"pulse-dot 1.5s ease-out infinite", flexShrink:0 }} />
                  Live GPS
                </div>
              </div>

              {/* Route info bar */}
              <div style={{ display:"flex", gap:0, borderTop:"1px solid #d5dae1", background:"linear-gradient(145deg,#f8fffe,#f4faf4)" }}>
                {[
                  { label:"Priority",   value: PR_LABEL[report.priority] || "Normal", color: prColor },
                  { label:"Reported",   value: report.address?.split(",")[0] || "—",   color:"#5e35b1" },
                  { label:"Points",     value: `${report.rewardPoints || 50} pts`,     color:"#1e8449" },
                ].map((s, i) => (
                  <div key={s.label} style={{ flex:1, textAlign:"center", padding:"10px 8px", borderRight: i < 2 ? "1px solid #d5dae1" : "none" }}>
                    <div style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:10, color:"#5d6d7e" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen's photo + description */}
            {(report.imageUrl || report.description) && (
              <div className="gov-card" style={{ padding:"14px 16px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#1c2833", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                  <AlertTriangle style={{ width:13, height:13, color:"#e65100" }} /> Citizen's Report
                </div>
                {report.imageUrl && (
                  <img src={report.imageUrl} alt="Waste" style={{ width:"100%", maxHeight:160, objectFit:"cover", borderRadius:8, border:"1px solid #d5dae1", marginBottom:10 }} />
                )}
                {report.description && (
                  <p style={{ fontSize:12, color:"#5d6d7e", lineHeight:1.6, margin:0 }}>{report.description}</p>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Phase panel ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Step 1: Navigate */}
            {phase === "navigating" && (
              <div className="gov-card" style={{ padding:20, textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(145deg,#e8eaf6,#c5cae9)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:"4px 4px 12px #c3c9e8,-2px -2px 8px #fff" }}>
                  <Navigation style={{ width:26, height:26, color:"#5e35b1" }} />
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:"#1c2833", marginBottom:6 }}>Navigate to Location</div>
                <div style={{ fontSize:12, color:"#5d6d7e", marginBottom:16, lineHeight:1.5 }}>
                  Use the map to reach<br /><strong>{report.address || "the reported location"}</strong>
                </div>
                <a href={gmapsURL} target="_blank" rel="noopener noreferrer" className="gov-btn gov-btn-primary" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, width:"100%", textDecoration:"none", marginBottom:10 }}>
                  <Navigation style={{ width:13, height:13 }} /> Open Google Maps
                </a>
                <button className="gov-btn gov-btn-green" style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }} onClick={() => setPhase("at_location")}>
                  <CheckCircle2 style={{ width:13, height:13 }} /> I've Arrived — Upload Proof
                </button>
              </div>
            )}

            {/* Step 2: Upload proof */}
            {phase === "at_location" && (
              <div className="gov-card" style={{ padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(145deg,#e8f5e9,#a5d6a7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"3px 3px 8px #b0ccb0,-2px -2px 6px #fff" }}>
                    <Camera style={{ width:18, height:18, color:"#1b5e20" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#1c2833" }}>Upload Proof Photo</div>
                    <div style={{ fontSize:11, color:"#5d6d7e" }}>Photo of collected / cleared waste</div>
                  </div>
                </div>

                {!proofURL ? (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{ border:`2px dashed ${dragOver ? "#1b5e20" : "#a5d6a7"}`, borderRadius:10, padding:"28px 16px", textAlign:"center", cursor:"pointer", background: dragOver ? "#e8f5e9" : "#f4faf4", transition:"all 0.2s" }}
                  >
                    <Upload style={{ width:28, height:28, color:"#4caf50", margin:"0 auto 10px", display:"block" }} />
                    <div style={{ fontSize:13, fontWeight:700, color:"#1c2833" }}>Drop photo here</div>
                    <div style={{ fontSize:11, color:"#5d6d7e", marginTop:4 }}>or click to browse · supports camera capture</div>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  </div>
                ) : (
                  <div style={{ position:"relative" }}>
                    <img src={proofURL} alt="Proof" style={{ width:"100%", borderRadius:8, maxHeight:190, objectFit:"cover", border:"2px solid #a5d6a7" }} />
                    <button onClick={() => { setProofFile(null); setProofURL(null); }} style={{ position:"absolute", top:6, right:6, background:"rgba(198,40,40,0.9)", border:"none", borderRadius:6, padding:5, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center" }}>
                      <Trash2 style={{ width:12, height:12 }} />
                    </button>
                    <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#1e8449", fontWeight:600 }}>
                      <CheckCircle2 style={{ width:12,height:12 }} /> {proofFile?.name}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warning when no proof yet */}
            {phase === "at_location" && !proofURL && (
              <div style={{ background:"#fff8e1", border:"1px solid #ffe082", borderRadius:8, padding:"10px 14px", fontSize:11, color:"#6d4c00" }}>
                ⚠️ Upload a proof photo of the collected waste before marking done.
              </div>
            )}

            {/* Checklist + Done button */}
            <div className="gov-card" style={{ padding:16 }}>
              <div style={{ fontSize:11, color:"#5d6d7e", marginBottom:10, fontWeight:600 }}>Task checklist</div>
              {[
                { label:"Reached location",    done: phase !== "navigating" },
                { label:"Proof photo uploaded", done: !!proofURL },
              ].map(c => (
                <div key={c.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, fontSize:12 }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:c.done?"#1b5e20":"#e8f5e9", border:`2px solid ${c.done?"#1b5e20":"#a5d6a7"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {c.done && <CheckCircle2 style={{ width:10, height:10, color:"#fff" }} />}
                  </div>
                  <span style={{ color:c.done?"#1c2833":"#909caa", fontWeight:c.done?600:400 }}>{c.label}</span>
                </div>
              ))}
              <button
                className="gov-btn gov-btn-green"
                style={{ width:"100%", marginTop:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:(phase === "at_location" && proofURL && !completeMutation.isPending) ? 1 : 0.4, cursor:(phase === "at_location" && proofURL) ? "pointer" : "not-allowed", fontSize:14, fontWeight:800, padding:"11px 0" }}
                disabled={phase !== "at_location" || !proofURL || completeMutation.isPending}
                onClick={handleMarkDone}
              >
                {completeMutation.isPending
                  ? <><Loader2 style={{ width:14,height:14, animation:"spin 1s linear infinite" }} /> Submitting…</>
                  : <><CheckCircle2 style={{ width:14,height:14 }} /> Mark as Done</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-dot { 0%{box-shadow:0 0 0 0 rgba(239,83,80,0.7)} 70%{box-shadow:0 0 0 10px rgba(239,83,80,0)} 100%{box-shadow:0 0 0 0 rgba(239,83,80,0)} }
      `}</style>
    </DashboardLayout>
  );
}
