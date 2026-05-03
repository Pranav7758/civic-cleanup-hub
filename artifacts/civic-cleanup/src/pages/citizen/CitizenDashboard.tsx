import { useState, useEffect } from "react";
import { useGetCitizenDashboard } from "@workspace/api-client-react";
import { Camera, Heart, Trophy, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight, Zap, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

/* ── Config ── */
const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: "#1b5e20", bg: "#e8f5e9", label: "✓ Done"     },
  pending:   { color: "#e65100", bg: "#fff3e0", label: "⏳ Pending"  },
  assigned:  { color: "#1565c0", bg: "#e3f2fd", label: "🚛 Assigned" },
  rejected:  { color: "#b71c1c", bg: "#fdecea", label: "✗ Rejected"  },
};

const TIER_CFG: Record<string, { icon: string; next: string; color: string; glow: string }> = {
  Bronze:   { icon: "🥉", next: "Silver",   color: "#8d5524", glow: "rgba(141,85,36,.25)"  },
  Silver:   { icon: "🥈", next: "Gold",     color: "#546e7a", glow: "rgba(84,110,122,.25)" },
  Gold:     { icon: "🥇", next: "Platinum", color: "#f57f17", glow: "rgba(245,127,23,.25)" },
  Platinum: { icon: "💎", next: "Diamond",  color: "#4a148c", glow: "rgba(74,20,140,.25)"  },
  Diamond:  { icon: "👑", next: "Diamond",  color: "#1a237e", glow: "rgba(26,35,126,.25)"  },
};

const QUICK_ACTIONS = [
  { label: "Report Waste", path: "/citizen/reports",     emoji: "📸", grad: "linear-gradient(135deg,#e53935,#ef5350)", shadow: "rgba(229,57,53,.35)" },
  { label: "Sell Scrap",   path: "/citizen/scrap",       emoji: "♻️", grad: "linear-gradient(135deg,#1565c0,#1976d2)", shadow: "rgba(21,101,192,.35)" },
  { label: "Donate",       path: "/citizen/donate",      emoji: "❤️", grad: "linear-gradient(135deg,#ad1457,#c2185b)", shadow: "rgba(173,20,87,.35)"  },
  { label: "Join Event",   path: "/citizen/events",      emoji: "🎪", grad: "linear-gradient(135deg,#e65100,#ef6c00)", shadow: "rgba(230,81,0,.35)"  },
  { label: "Leaderboard",  path: "/citizen/leaderboard", emoji: "🏆", grad: "linear-gradient(135deg,#f57f17,#f9a825)", shadow: "rgba(245,127,23,.35)" },
  { label: "Training",     path: "/citizen/training",    emoji: "📚", grad: "linear-gradient(135deg,#2e7d32,#4caf50)", shadow: "rgba(46,125,50,.35)"  },
];

const WEEK_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const WASTE_TYPES = [
  { l: "Plastic", v: "38%", color: "#1565c0", bg: "#e3f2fd" },
  { l: "Metal",   v: "25%", color: "#e65100", bg: "#fff3e0" },
  { l: "Organic", v: "37%", color: "#2e7d32", bg: "#e8f5e9" },
];

/* ── Shared card style ── */
const card3d: React.CSSProperties = {
  background: "linear-gradient(145deg,#fff,#f5fbf5)",
  borderRadius: 20,
  border: "1.5px solid #e0ece0",
  boxShadow: "6px 6px 16px #c8dcc8, -4px -4px 10px #ffffff",
  fontFamily: "'Inter',sans-serif",
  overflow: "hidden",
};

/* ── Animated counter ── */
function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const step  = Math.ceil(value / 30);
    const timer = setInterval(() => { setCur(c => { const next = Math.min(c + step, value); if (next >= value) clearInterval(timer); return next; }); }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{cur.toLocaleString("en-IN")}{suffix}</span>;
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetCitizenDashboard();

  const score              = (data as any)?.score;
  const reportCount        = (data as any)?.reportCount      ?? 0;
  const donationCount      = (data as any)?.donationCount    ?? 0;
  const totalPoints        = (data as any)?.totalPoints      ?? score?.score ?? 0;
  const tier               = score?.tier                     || "Bronze";
  const recentReports      = ((data as any)?.recentReports    ?? []) as any[];
  const upcomingEvents     = ((data as any)?.upcomingEvents   ?? []) as any[];
  const recentTransactions = ((data as any)?.recentTransactions ?? []) as any[];
  const rawWeekly          = ((data as any)?.weeklyReports   ?? []) as number[];
  /* Normalise to 0–100% heights; fall back to empty bars if no data yet */
  const weeklyMax          = Math.max(...rawWeekly, 1);
  const weeklyBars         = rawWeekly.length === 7
    ? rawWeekly.map(v => Math.round((v / weeklyMax) * 90) + 10)   // min 10%, max 100%
    : Array(7).fill(0);

  const tierCfg   = TIER_CFG[tier] ?? TIER_CFG.Bronze;
  const firstName = (user?.fullName || "Friend").split(" ")[0];
  const pct       = Math.min(Math.floor((totalPoints / 1000) * 100), 100);
  const todayIdx  = (new Date().getDay() + 6) % 7;

  /* ── stat cards data ── */
  const STATS = [
    { Icon: Camera,   label: "Waste Reports",  value: reportCount,   gradient: "linear-gradient(135deg,#e8f5e9,#dcedc8)", border:"#a5d6a7", iconBg:"#2e7d32", trend:"+12%" },
    { Icon: Heart,    label: "Donations Made", value: donationCount, gradient: "linear-gradient(135deg,#fce4ec,#f8bbd0)", border:"#f48fb1", iconBg:"#c62828", trend:"+8%"  },
    { Icon: Trophy,   label: "Total Points",   value: totalPoints,   gradient: "linear-gradient(135deg,#fff8e1,#fff3e0)", border:"#ffcc80", iconBg:"#e65100", trend:"+15%" },
    { Icon: BookOpen, label: "Modules Done",   value: 0,             gradient: "linear-gradient(135deg,#e3f2fd,#bbdefb)", border:"#90caf9", iconBg:"#1565c0", trend: ""    },
  ];

  return (
    <DashboardLayout title="Citizen Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: 18,
        fontFamily: "'Inter',sans-serif" }}>

        {/* ═══ ROW 1: HERO WELCOME CARD ═══ */}
        <div style={{
          ...card3d,
          background: "linear-gradient(135deg,#1b5e20 0%,#2e7d32 40%,#388e3c 70%,#1a5e2a 100%)",
          padding: "26px 28px",
          position: "relative", overflow: "hidden",
        }}>
          {/* decorative rings */}
          {[160,220,280].map((s,i) => (
            <div key={i} style={{ position:"absolute", right:-s/3, top:-s/3,
              width:s, height:s, borderRadius:"50%",
              border:"1px solid rgba(165,214,167,.12)", pointerEvents:"none" }} />
          ))}
          <div style={{ position:"absolute", bottom:-40, left:-40,
            width:160, height:160, borderRadius:"50%",
            background:"rgba(76,175,80,.08)", pointerEvents:"none" }} />

          <div className="cd-hero" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:20, position:"relative" }}>
            {/* Left: greeting */}
            <div>
              <div style={{ fontSize:12, color:"rgba(165,214,167,.75)", fontWeight:700,
                letterSpacing:".08em", textTransform:"uppercase", marginBottom:4 }}>
                Welcome back 👋
              </div>
              <div style={{ fontSize:28, fontWeight:900, color:"#fff", lineHeight:1.15,
                marginBottom:12 }}>
                {firstName}
              </div>

              {/* Tier + points row */}
              <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8,
                  background:"rgba(255,255,255,.12)", borderRadius:12,
                  padding:"7px 14px", border:"1px solid rgba(255,255,255,.18)" }}>
                  <span style={{ fontSize:22 }}>{tierCfg.icon}</span>
                  <div>
                    <div style={{ fontSize:10, color:"rgba(165,214,167,.7)", fontWeight:700,
                      textTransform:"uppercase", letterSpacing:".07em" }}>Tier</div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{tier}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8,
                  background:"rgba(255,255,255,.12)", borderRadius:12,
                  padding:"7px 14px", border:"1px solid rgba(255,255,255,.18)" }}>
                  <span style={{ fontSize:22 }}>🪙</span>
                  <div>
                    <div style={{ fontSize:10, color:"rgba(165,214,167,.7)", fontWeight:700,
                      textTransform:"uppercase", letterSpacing:".07em" }}>Points</div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>
                      {isLoading ? "—" : <Counter value={totalPoints} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress to next tier */}
              <div style={{ maxWidth:320 }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  fontSize:11, color:"rgba(165,214,167,.8)", fontWeight:600, marginBottom:6 }}>
                  <span>Progress to {tierCfg.next}</span>
                  <span style={{ fontWeight:800, color:"#a5d6a7" }}>{pct}%</span>
                </div>
                <div style={{ height:8, borderRadius:999,
                  background:"rgba(255,255,255,.15)", overflow:"hidden",
                  boxShadow:"inset 0 2px 4px rgba(0,0,0,.2)" }}>
                  <div style={{ height:"100%", width:`${pct}%`, borderRadius:999,
                    background:"linear-gradient(90deg,#a5d6a7,#69f0ae)",
                    boxShadow:"0 0 8px rgba(105,240,174,.5)",
                    transition:"width 1s ease" }} />
                </div>
              </div>
            </div>

            {/* Right: action links */}
            <div className="cd-hide-mobile" style={{ display:"flex", flexDirection:"column", gap:8, alignSelf:"center" }}>
              {[
                { label:"View Wallet",  path:"/citizen/wallet",  emoji:"💳" },
                { label:"My Reports",   path:"/citizen/reports", emoji:"📸" },
                { label:"Join Event",   path:"/citizen/events",  emoji:"🎪" },
              ].map(a => (
                <Link key={a.path} href={a.path} style={{ textDecoration:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8,
                    background:"rgba(255,255,255,.12)", borderRadius:11,
                    padding:"8px 14px", border:"1px solid rgba(255,255,255,.2)",
                    cursor:"pointer", transition:"background .15s",
                    fontSize:12, fontWeight:700, color:"#fff", whiteSpace:"nowrap" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.12)")}>
                    <span>{a.emoji}</span>{a.label}
                    <ArrowRight style={{ width:12, height:12, marginLeft:2, opacity:.7 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ ROW 2: STAT CHIPS ═══ */}
        <div className="cd-4col" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              ...card3d,
              background: s.gradient,
              borderColor: s.border,
              padding: "18px 18px 16px",
              transition: "transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .2s",
              cursor: "default",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.01)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "8px 10px 24px #c0d8c0,-4px -4px 12px #fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "6px 6px 16px #c8dcc8,-4px -4px 10px #ffffff";
              }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ width:38, height:38, borderRadius:12,
                  background:s.iconBg, display:"flex", alignItems:"center",
                  justifyContent:"center",
                  boxShadow:`3px 3px 8px ${s.border}` }}>
                  <s.Icon style={{ width:18, height:18, color:"#fff" }} />
                </div>
                {s.trend && (
                  <div style={{ display:"flex", alignItems:"center", gap:3,
                    fontSize:10, fontWeight:800, color:s.iconBg,
                    background:"rgba(255,255,255,.6)", borderRadius:999,
                    padding:"2px 7px" }}>
                    <TrendingUp style={{ width:9, height:9 }} />{s.trend}
                  </div>
                )}
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:"#1a2e1a",
                lineHeight:1, marginBottom:4 }}>
                {isLoading ? "—" : <Counter value={s.value} />}
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:"#5d7a5e",
                textTransform:"uppercase", letterSpacing:".06em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ ROW 3: QUICK ACTIONS + WEEKLY CHART ═══ */}
        <div className="cd-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

          {/* Quick Actions */}
          <div style={{ ...card3d, padding:"0" }}>
            <div style={{ padding:"16px 20px 12px",
              borderBottom:"1px solid #e8f0e8",
              display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:8,
                background:"linear-gradient(135deg,#2e7d32,#4caf50)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"2px 2px 6px rgba(46,125,50,.3)" }}>
                <Zap style={{ width:14, height:14, color:"#fff" }} />
              </div>
              <span style={{ fontSize:14, fontWeight:800, color:"#1a2e1a" }}>Quick Actions</span>
            </div>
            <div style={{ padding:"14px 16px",
              display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.path} href={a.path} style={{ textDecoration:"none" }}>
                  <div style={{
                    borderRadius:14, padding:"14px 8px 12px",
                    textAlign:"center", cursor:"pointer",
                    background:"linear-gradient(145deg,#fff,#f5fbf5)",
                    border:"1.5px solid #e0ece0",
                    boxShadow:"3px 3px 8px rgba(200,230,201,.7),-1px -1px 5px rgba(255,255,255,.9)",
                    transition:"transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.04)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "4px 6px 16px rgba(76,175,80,.2),-1px -1px 6px rgba(255,255,255,.9)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = "";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "3px 3px 8px rgba(200,230,201,.7),-1px -1px 5px rgba(255,255,255,.9)";
                    }}
                    onMouseDown={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(1px) scale(.97)";
                    }}
                  >
                    <div style={{ width:36, height:36, borderRadius:10,
                      background:a.grad, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:18,
                      boxShadow:`2px 3px 8px ${a.shadow}` }}>
                      {a.emoji}
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:"#1a2e1a",
                      lineHeight:1.2, textAlign:"center" }}>{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Weekly Activity */}
          <div style={{ ...card3d, padding:0 }}>
            <div style={{ padding:"16px 20px 12px",
              borderBottom:"1px solid #e8f0e8",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8,
                  background:"linear-gradient(135deg,#1565c0,#1976d2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"2px 2px 6px rgba(21,101,192,.3)" }}>
                  <TrendingUp style={{ width:14, height:14, color:"#fff" }} />
                </div>
                <span style={{ fontSize:14, fontWeight:800, color:"#1a2e1a" }}>Activity This Week</span>
              </div>
              <span style={{ fontSize:10, color:"#81c784", fontWeight:700,
                background:"#e8f5e9", borderRadius:999, padding:"3px 8px",
                border:"1px solid #c8e6c9" }}>
                This Week
              </span>
            </div>
            <div style={{ padding:"14px 18px" }}>
              {/* 3D chart bars */}
              <div style={{ display:"flex", alignItems:"flex-end", gap:6,
                height:80, marginBottom:8 }}>
                {weeklyBars.map((h, i) => {
                  const isToday = i === todayIdx;
                  const rawVal  = rawWeekly[i] ?? 0;
                  return (
                    <div key={i} title={`${WEEK_DAYS[i]}: ${rawVal} report${rawVal !== 1 ? "s" : ""}`}
                      style={{ flex:1, display:"flex",
                        flexDirection:"column", alignItems:"center", gap:2 }}>
                      {rawVal > 0 && (
                        <div style={{ fontSize:9, fontWeight:800,
                          color: isToday ? "#2e7d32" : "#81c784",
                          marginBottom:1 }}>{rawVal}</div>
                      )}
                      <div style={{
                        width:"100%", height: h > 0 ? `${h}%` : 6,
                        borderRadius:"4px 4px 2px 2px",
                        background: isToday
                          ? "linear-gradient(180deg,#69f0ae,#2e7d32)"
                          : h > 0
                            ? "linear-gradient(180deg,#a5d6a7,#c8e6c9)"
                            : "linear-gradient(180deg,#e8f5e9,#f1f8f1)",
                        boxShadow: isToday
                          ? "0 3px 8px rgba(46,125,50,.4),inset 0 1px 0 rgba(255,255,255,.3)"
                          : h > 0
                            ? "0 2px 4px rgba(200,230,201,.8),inset 0 1px 0 rgba(255,255,255,.5)"
                            : "inset 0 1px 3px rgba(0,0,0,.06)",
                        minHeight:6,
                        transition:"height .7s cubic-bezier(.34,1.56,.64,1)",
                      }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                {WEEK_DAYS.map((d, i) => (
                  <div key={i} style={{ flex:1, textAlign:"center",
                    fontSize:9, fontWeight:i === todayIdx ? 800 : 500,
                    color:i === todayIdx ? "#2e7d32" : "#8fa98f" }}>{d}</div>
                ))}
              </div>

              {/* Waste type chips */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {WASTE_TYPES.map(x => (
                  <div key={x.l} style={{
                    background:x.bg, border:`1.5px solid ${x.color}22`,
                    borderRadius:10, padding:"8px 6px", textAlign:"center",
                    boxShadow:"2px 2px 5px rgba(0,0,0,.05)",
                  }}>
                    <div style={{ fontSize:15, fontWeight:900, color:x.color }}>{x.v}</div>
                    <div style={{ fontSize:10, color:"#5d7a5e", fontWeight:600,
                      marginTop:1 }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ROW 4: REPORTS + TRANSACTIONS + EVENTS ═══ */}
        <div className="cd-3col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>

          {/* Recent Reports */}
          <div style={{ ...card3d }}>
            <div style={{ padding:"14px 18px 10px",
              borderBottom:"1px solid #e8f0e8",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:24, height:24, borderRadius:7,
                  background:"linear-gradient(135deg,#e53935,#ef5350)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"2px 2px 5px rgba(229,57,53,.3)", fontSize:12 }}>📸</div>
                <span style={{ fontSize:13, fontWeight:800, color:"#1a2e1a" }}>Recent Reports</span>
              </div>
              <Link href="/citizen/reports"
                style={{ fontSize:11, color:"#2e7d32", textDecoration:"none",
                  fontWeight:700, display:"flex", alignItems:"center", gap:2 }}>
                All <ArrowRight style={{ width:10, height:10 }} />
              </Link>
            </div>

            {isLoading ? (
              <div style={{ padding:"12px 16px" }}>
                {[1,2,3].map(i => <div key={i} style={{ height:38, background:"linear-gradient(135deg,#f5fbf5,#edf7ed)", borderRadius:10, marginBottom:8, border:"1px solid #e0ece0" }} />)}
              </div>
            ) : recentReports.length === 0 ? (
              <div style={{ textAlign:"center", padding:"28px 18px" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📸</div>
                <div style={{ fontSize:12, color:"#5d7a5e", marginBottom:12,
                  fontFamily:"'Inter',sans-serif" }}>No reports yet. Be the first!</div>
                <Link href="/citizen/reports">
                  <div style={{ display:"inline-block", padding:"8px 18px",
                    background:"linear-gradient(145deg,#4caf50,#2e7d32)", color:"#fff",
                    borderRadius:12, fontSize:12, fontWeight:800, cursor:"pointer",
                    boxShadow:"3px 3px 8px rgba(46,125,50,.35)", textDecoration:"none" }}>
                    Report Now
                  </div>
                </Link>
              </div>
            ) : (
              <div style={{ padding:"8px 0" }}>
                {recentReports.slice(0, 5).map((r: any) => {
                  const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.pending;
                  return (
                    <div key={r.id} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"9px 16px", borderBottom:"1px solid #f0f7f0",
                    }}
                      data-testid={`report-${r.id}`}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#1a2e1a",
                          textTransform:"capitalize" }}>{r.wasteType} waste</div>
                        <div style={{ fontSize:10, color:"#8fa98f", marginTop:1 }}>{r.address || "No address"}</div>
                      </div>
                      <div style={{ fontSize:10, fontWeight:800, color:cfg.color,
                        background:cfg.bg, borderRadius:999, padding:"3px 9px",
                        border:`1px solid ${cfg.color}33`, whiteSpace:"nowrap" }}>
                        {cfg.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Points Activity */}
          <div style={{ ...card3d }}>
            <div style={{ padding:"14px 18px 10px",
              borderBottom:"1px solid #e8f0e8",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:24, height:24, borderRadius:7,
                  background:"linear-gradient(135deg,#f57f17,#ffa000)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"2px 2px 5px rgba(245,127,23,.3)", fontSize:12 }}>🪙</div>
                <span style={{ fontSize:13, fontWeight:800, color:"#1a2e1a" }}>Your Points</span>
              </div>
              <Link href="/citizen/wallet"
                style={{ fontSize:11, color:"#2e7d32", textDecoration:"none", fontWeight:700 }}>
                Wallet
              </Link>
            </div>

            {/* Balance strip */}
            <div style={{ margin:"10px 16px",
              borderRadius:14, padding:"12px 16px",
              background:"linear-gradient(145deg,#fff8e1,#fff3e0)",
              border:"1.5px solid #ffcc8088",
              display:"flex", alignItems:"center", gap:10,
              boxShadow:"2px 2px 6px rgba(245,127,23,.12)" }}>
              <span style={{ fontSize:22 }}>🏆</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:20, fontWeight:900, color:"#e65100", lineHeight:1 }}>
                  {isLoading ? "—" : <Counter value={totalPoints} />}
                </div>
                <div style={{ fontSize:10, color:"#bf360c", fontWeight:700, marginTop:2 }}>Available Points</div>
              </div>
              <Link href="/citizen/wallet" style={{ textDecoration:"none" }}>
                <div style={{ padding:"6px 12px",
                  background:"linear-gradient(145deg,#f57f17,#e65100)",
                  color:"#fff", borderRadius:999,
                  fontSize:11, fontWeight:800, cursor:"pointer",
                  boxShadow:"2px 2px 6px rgba(230,81,0,.35)" }}>
                  Redeem
                </div>
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"18px 18px", color:"#5d7a5e" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>💸</div>
                <div style={{ fontSize:12 }}>No points earned yet</div>
              </div>
            ) : (
              <div style={{ padding:"4px 0" }}>
                {recentTransactions.slice(0, 5).map((t: any) => (
                  <div key={t.id}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"8px 16px", borderBottom:"1px solid #f0f7f0" }}
                    data-testid={`transaction-${t.id}`}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#1a2e1a" }}>{t.action}</div>
                      <div style={{ fontSize:10, color:"#8fa98f", marginTop:1 }}>
                        {new Date(t.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                      </div>
                    </div>
                    <div style={{ fontWeight:900, fontSize:14,
                      color:t.type === "earned" ? "#2e7d32" : "#c62828" }}>
                      {t.type === "earned" ? "+" : "−"}{t.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events + Eco Tip */}
          <div style={{ ...card3d }}>
            <div style={{ padding:"14px 18px 10px",
              borderBottom:"1px solid #e8f0e8",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:24, height:24, borderRadius:7,
                  background:"linear-gradient(135deg,#ad1457,#c2185b)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"2px 2px 5px rgba(173,20,87,.3)", fontSize:12 }}>🎪</div>
                <span style={{ fontSize:13, fontWeight:800, color:"#1a2e1a" }}>Upcoming Events</span>
              </div>
              <Link href="/citizen/events"
                style={{ fontSize:11, color:"#2e7d32", textDecoration:"none", fontWeight:700 }}>
                All →
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div style={{ textAlign:"center", padding:"18px 18px", color:"#5d7a5e" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>🎪</div>
                <div style={{ fontSize:12, marginBottom:8 }}>No events at the moment</div>
                <Link href="/citizen/events"
                  style={{ fontSize:12, color:"#2e7d32", textDecoration:"none", fontWeight:700 }}>
                  See all events →
                </Link>
              </div>
            ) : (
              <div style={{ padding:"4px 0" }}>
                {upcomingEvents.slice(0, 4).map((e: any) => (
                  <div key={e.id}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"9px 16px", borderBottom:"1px solid #f0f7f0" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#1a2e1a" }}>{e.title}</div>
                      <div style={{ fontSize:10, color:"#8fa98f", marginTop:1 }}>{e.location}</div>
                    </div>
                    <div style={{ fontSize:10, fontWeight:800, color:"#1565c0",
                      background:"#e3f2fd", borderRadius:999, padding:"3px 8px",
                      border:"1px solid #90caf9", whiteSpace:"nowrap" }}>
                      {new Date(e.date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Eco tip */}
            <div style={{ margin:"10px 14px 14px",
              borderRadius:14, padding:"12px 14px",
              background:"linear-gradient(145deg,#e8f5e9,#dcedc8)",
              border:"1.5px solid #a5d6a7",
              boxShadow:"2px 2px 6px rgba(76,175,80,.12)" }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#1b5e20", marginBottom:3 }}>
                🌿 Eco Tip of the Day
              </div>
              <div style={{ fontSize:11, color:"#2e7d32", lineHeight:1.5 }}>
                Segregating waste at source can reduce landfill waste by up to 60%. Start today!
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
