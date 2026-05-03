import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle, MapPin, WifiOff, Wifi, Navigation,
  ClipboardList, Loader2, Play, QrCode, GraduationCap, Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import "@/styles/dashboard.css";
import "@/styles/worker.css";

const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const WASTE_EMOJI: Record<string, string> = {
  mixed:"🗑️", organic:"🌿", plastic:"♻️", metal:"🔩",
  hazardous:"☠️", ewaste:"💻", construction:"🏗️",
};
const PR_COLOR: Record<string, string> = {
  high:"#c62828", urgent:"#6a1a1a", normal:"#e65100", low:"#2e7d32",
};
const PR_BADGE: Record<string, string> = {
  high:"gov-badge gov-badge-red", urgent:"gov-badge gov-badge-red",
  normal:"gov-badge gov-badge-yellow", low:"gov-badge gov-badge-green",
};
const PR_LABEL: Record<string, string> = {
  high:"Urgent", urgent:"Critical", normal:"Normal", low:"Low",
};

/* Daily collection counts — last 7 days */
const DAILY_BINS = [14, 22, 18, 27, 24, 31, 28];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function authFetch(url: string) {
  const token = localStorage.getItem("civic_token");
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
}

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [online, setOnline] = useState(true);

  const firstName = (user?.fullName || "Worker").split(" ")[0];
  const todayIdx  = (new Date().getDay() + 6) % 7;
  const maxBins   = Math.max(...DAILY_BINS);

  const { data, isLoading } = useQuery({
    queryKey: ["worker-tasks"],
    queryFn: async () => {
      const res = await authFetch("/api/reports/worker-tasks");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const available: any[] = data?.data?.available || [];
  const myTasks:   any[] = data?.data?.myTasks   || [];
  const stats             = data?.data?.stats     || {};

  const totalActive    = myTasks.length + available.length;
  const completedTotal = stats.completedTotal ?? 0;
  const shiftPct       = totalActive + completedTotal > 0
    ? Math.round((completedTotal / (totalActive + completedTotal)) * 100)
    : 0;

  const todayBins = DAILY_BINS[todayIdx];
  const weekTotal = DAILY_BINS.reduce((a, b) => a + b, 0);

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Worker Dashboard">
      <div style={{ ...S, display:"flex", flexDirection:"column", gap:18 }}>

        {/* ── Row 1: Status card + Collection stats ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr 1fr", gap:14 }}>

          {/* Worker status card */}
          <div className="gov-card" style={{ padding:18 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"#1c2833" }}>Hey, {firstName}!</div>
                <div style={{ fontSize:11, color:"#5d6d7e" }}>Field Worker · ID #W{String(user?.id ?? "042").slice(0,4)}</div>
              </div>
              <button
                onClick={() => setOnline(v => !v)}
                className={`gov-btn gov-btn-sm ${online ? "gov-btn-green" : "gov-btn-outline"}`}
                style={{ display:"flex", alignItems:"center", gap:5 }}
              >
                {online
                  ? <><Wifi style={{ width:12, height:12 }} />Online</>
                  : <><WifiOff style={{ width:12, height:12 }} />Offline</>}
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[
                { label:"Available", value: isLoading ? "…" : available.length, badge:"gov-badge gov-badge-yellow" },
                { label:"My Tasks",  value: isLoading ? "…" : myTasks.length,   badge:"gov-badge gov-badge-blue"  },
                { label:"Done Today",value: isLoading ? "…" : completedTotal,   badge:"gov-badge gov-badge-green" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center", padding:"8px 6px", border:"1px solid #d5dae1", borderRadius:3 }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#1c2833" }}>{s.value}</div>
                  <div style={{ fontSize:10, color:"#5d6d7e", marginTop:1 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#5d6d7e", marginBottom:3 }}>
                <span>Shift Progress</span>
                <span style={{ fontWeight:700, color:"#1c2833" }}>{shiftPct}%</span>
              </div>
              <div className="gov-progress-track">
                <div className="gov-progress-fill" style={{ width:`${shiftPct}%` }} />
              </div>
            </div>
          </div>

          {/* Collection stat tiles */}
          {[
            { icon:"🗑️", label:"Bins Today",     value: todayBins,            color:"#1e8449" },
            { icon:"📅", label:"This Week",       value: weekTotal,            color:"#1a5276" },
            { icon:"🛣️", label:"Distance (km)",   value:"18.4",               color:"#ca6f1e" },
            { icon:"⏱️", label:"Avg Per Bin",      value:"~22 min",            color:"#7d3c98" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card">
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color:s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Row 2: My assigned tasks + Quick panel ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:14 }}>

          {/* My Tasks table */}
          <div className="gov-card">
            <div className="gov-card-header">
              <span className="gov-section-title">My Assigned Tasks</span>
              <Link href="/worker/reports" className="gov-btn gov-btn-primary gov-btn-xs" style={{ display:"flex", alignItems:"center", gap:4, textDecoration:"none" }}>
                <ClipboardList style={{ width:11, height:11 }} /> View All
              </Link>
            </div>

            {isLoading && (
              <div style={{ padding:24, textAlign:"center", color:"#5d6d7e" }}>
                <Loader2 style={{ width:20, height:20, margin:"0 auto 8px", animation:"spin 1s linear infinite", display:"block" }} />
                Loading tasks…
              </div>
            )}

            {!isLoading && myTasks.length === 0 && (
              <div style={{ padding:"24px 16px", textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#5d6d7e" }}>No tasks assigned yet</div>
                <div style={{ fontSize:11, color:"#909caa", marginTop:4, marginBottom:12 }}>
                  Accept tasks from Available Tasks to start working
                </div>
                <Link href="/worker/reports" style={{ textDecoration:"none" }}>
                  <button className="gov-btn gov-btn-primary gov-btn-sm" style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                    <ClipboardList style={{ width:11, height:11 }} /> Browse Available Tasks
                  </button>
                </Link>
              </div>
            )}

            {!isLoading && myTasks.length > 0 && (
              <div style={{ overflowX:"auto" }}>
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Location</th>
                      <th>Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTasks.map((task: any) => (
                      <tr key={task.id}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontSize:16 }}>{WASTE_EMOJI[task.wasteType] || "🗑️"}</span>
                            <div>
                              <div style={{ fontWeight:600, color:"#1c2833", fontSize:13, textTransform:"capitalize" }}>{task.wasteType} Waste</div>
                              <div style={{ fontSize:11, color:"#5d6d7e" }}>{timeAgo(task.createdAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize:12, color:"#1c2833", display:"flex", alignItems:"center", gap:3 }}>
                            <MapPin style={{ width:11, height:11, color:"#5d6d7e" }} />
                            {task.address?.split(",")[0] || "—"}
                          </div>
                          {task.reporterName && (
                            <div style={{ fontSize:10, color:"#909caa" }}>by {task.reporterName}</div>
                          )}
                        </td>
                        <td>
                          <span className={PR_BADGE[task.priority] || "gov-badge gov-badge-yellow"}>
                            {PR_LABEL[task.priority] || "Normal"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="gov-btn gov-btn-green gov-btn-xs"
                            style={{ display:"flex", alignItems:"center", gap:3 }}
                            onClick={() => setLocation(`/worker/task/${task.id}`)}
                          >
                            <Play style={{ width:10, height:10 }} /> Start
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right panel: Available tasks preview + Quick Actions */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Available tasks count card */}
            <div className="gov-card" style={{ padding:16 }}>
              <div className="gov-card-header" style={{ marginBottom:12 }}>
                <span className="gov-section-title">Available Tasks</span>
                <span style={{ background:"#ea580c", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>
                  {isLoading ? "…" : available.length} open
                </span>
              </div>

              {isLoading && (
                <div style={{ textAlign:"center", padding:"12px 0", color:"#5d6d7e", fontSize:12 }}>
                  <Loader2 style={{ width:16, height:16, margin:"0 auto 4px", animation:"spin 1s linear infinite", display:"block" }} />
                  Loading…
                </div>
              )}

              {!isLoading && available.slice(0, 3).map((task: any) => (
                <div key={task.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f0f4f0" }}>
                  <div style={{ width:6, height:36, borderRadius:3, background:PR_COLOR[task.priority] || "#e65100", flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#1c2833", textTransform:"capitalize" }}>{task.wasteType} Waste</div>
                    <div style={{ fontSize:10, color:"#909caa", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {task.address?.split(",")[0] || "—"}
                    </div>
                  </div>
                  <button
                    className="gov-btn gov-btn-primary gov-btn-xs"
                    style={{ flexShrink:0, display:"flex", alignItems:"center", gap:3 }}
                    onClick={() => setLocation("/worker/reports")}
                  >
                    Accept
                  </button>
                </div>
              ))}

              {!isLoading && available.length === 0 && (
                <div style={{ textAlign:"center", padding:"12px 0", fontSize:12, color:"#909caa" }}>
                  No available tasks right now
                </div>
              )}

              {!isLoading && available.length > 3 && (
                <div style={{ textAlign:"center", marginTop:8 }}>
                  <Link href="/worker/reports" style={{ fontSize:11, fontWeight:700, color:"#2e7d32", textDecoration:"none" }}>
                    +{available.length - 3} more tasks →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="gov-card">
              <div className="gov-card-header"><span className="gov-section-title">Quick Actions</span></div>
              <div style={{ padding:12, display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  { label:"Browse All Tasks", path:"/worker/reports", icon: <ClipboardList style={{ width:16, height:16, color:"#ea580c" }} />, color:"#ea580c" },
                  { label:"Scan Dustbin QR",  path:"/worker/dustbin", icon: <QrCode       style={{ width:16, height:16, color:"#0d9488" }} />, color:"#0d9488" },
                  { label:"View Training",    path:"/worker/training",icon: <GraduationCap style={{ width:16, height:16, color:"#2563eb" }} />, color:"#2563eb" },
                  { label:"Navigate Route",   path:"/worker/bins",    icon: <Navigation   style={{ width:16, height:16, color:"#dc2626" }} />, color:"#dc2626" },
                ].map(a => (
                  <Link key={a.label} href={a.path} style={{ textDecoration:"none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", border:"1px solid #d5dae1", borderRadius:6, cursor:"pointer", background:"#fff", transition:"background .1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f4f6f9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                    >
                      <div style={{ width:30, height:30, borderRadius:8, background:`${a.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {a.icon}
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color:"#1c2833" }}>{a.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Daily Collection History ── */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Trash2 style={{ width:15, height:15, color:"#1e8449" }} />
              <span className="gov-section-title">Daily Collection History</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:13, fontWeight:800, color:"#1e8449" }}>{weekTotal} bins</span>
              <span style={{ fontSize:11, color:"#1e8449", fontWeight:600 }}>this week</span>
            </div>
          </div>
          <div className="gov-card-body">
            {/* Bar chart */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:96 }}>
              {DAILY_BINS.map((v, i) => {
                const isToday = i === todayIdx;
                const pct = (v / maxBins) * 100;
                return (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{ fontSize:10, fontWeight:isToday?800:500, color:isToday?"#1e8449":"#5d6d7e" }}>{v}</div>
                    <div style={{
                      width:"100%", height:`${pct}%`,
                      borderRadius:"4px 4px 0 0",
                      background: isToday
                        ? "linear-gradient(to top,#1b5e20,#2e7d32,#4caf50)"
                        : "linear-gradient(to top,#c8e6c9,#a5d6a7)",
                      border: isToday ? "none" : "1px solid #c8e6c9",
                      minHeight:6,
                      boxShadow: isToday ? "0 -2px 8px rgba(46,125,50,0.35)" : "none",
                      transition:"height .3s",
                    }} />
                    <div style={{ fontSize:10, color:isToday?"#1e8449":"#909caa", fontWeight:isToday?800:400 }}>{DAYS[i]}</div>
                  </div>
                );
              })}
            </div>

            {/* Summary row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:16, paddingTop:12, borderTop:"1px solid #eaf2ea" }}>
              {[
                { label:"Today",      value:`${todayBins} bins`,           color:"#1e8449" },
                { label:"This Week",  value:`${weekTotal} bins`,           color:"#1a5276" },
                { label:"Best Day",   value:`${maxBins} bins`,             color:"#7d3c98" },
                { label:"Avg/Day",    value:`${Math.round(weekTotal/7)} bins`, color:"#ca6f1e" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center", padding:"8px 6px", background:"#f8fdf8", borderRadius:8, border:"1px solid #eaf2ea" }}>
                  <div style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:10, color:"#5d6d7e", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
