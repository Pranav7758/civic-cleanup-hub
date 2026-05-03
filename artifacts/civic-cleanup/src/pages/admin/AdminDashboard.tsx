import { useState } from "react";
import { Link } from "wouter";
import { useGetAdminDashboard } from "@workspace/api-client-react";
import { Users, Camera, Heart, Calendar, TrendingUp, AlertCircle, Trophy, MapPin, BarChart2, ArrowUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/admin.css";

const WEEKLY_ACTIVITY = [42, 58, 51, 74, 67, 89, 95];
const WEEKLY_LABELS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const WEEKLY_MAX = 110;

const ALERTS = [
  { id:1, level:"critical", msg:"3 waste reports in Sector 12 have no worker assigned yet", time:"5 min ago",  icon:"🚨" },
  { id:2, level:"warn",     msg:"E-Waste price jumped +38% today",                         time:"22 min ago", icon:"⚠️" },
  { id:3, level:"info",     msg:"A new NGO is waiting for approval",                        time:"1 hr ago",   icon:"🤝" },
  { id:4, level:"info",     msg:"Weekly summary is ready to download",                      time:"2 hr ago",   icon:"📊" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview");
  const { data, isLoading } = useGetAdminDashboard();

  const totalUsers     = (data as any)?.totalUsers     ?? 0;
  const totalReports   = (data as any)?.totalReports   ?? 0;
  const totalDonations = (data as any)?.totalDonations ?? 0;
  const totalEvents    = (data as any)?.totalEvents    ?? 0;
  const pendingReports = (data as any)?.pendingReports ?? 0;
  const recentActivity: any[] = (data as any)?.recentActivity || [];
  const topCitizens:   any[] = (data as any)?.topCitizens    || [];

  const kpis = [
    { label: "Total Users",      value: totalUsers,     icon: "👥", trend: "+14%", color: "#1a5276" },
    { label: "Waste Reports",    value: totalReports,   icon: "📋", trend: "+22%", color: "#c0392b" },
    { label: "Donations",        value: totalDonations, icon: "❤️", trend: "+9%",  color: "#6c3483" },
    { label: "Events Held",      value: totalEvents,    icon: "📅", trend: "+7%",  color: "#ca6f1e" },
    { label: "Active Workers",   value: 48,             icon: "🚛", trend: "+3%",  color: "#1a5276" },
    { label: "Revenue (₹)",      value: 284000,         icon: "💰", trend: "+31%", color: "#1e8449" },
    { label: "CO₂ Saved (kg)",   value: 12480,          icon: "🌿", trend: "+18%", color: "#1e8449" },
    { label: "Needs Review",     value: pendingReports, icon: "⏳", trend: "Now",  color: "#c0392b" },
  ];

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  const alertBadge = (level: string) => {
    if (level === "critical") return "gov-badge gov-badge-red";
    if (level === "warn")     return "gov-badge gov-badge-yellow";
    return "gov-badge gov-badge-blue";
  };

  const reportBadge = (status: string) => {
    if (status === "completed") return "gov-badge gov-badge-green";
    if (status === "assigned")  return "gov-badge gov-badge-blue";
    return "gov-badge gov-badge-yellow";
  };

  return (
    <DashboardLayout title="Admin Command Centre">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Critical alert banner ── */}
        {pendingReports > 0 && (
          <div className="gov-alert gov-alert-red">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
              {pendingReports} urgent waste report{pendingReports !== 1 ? "s" : ""} awaiting assignment
            </span>
            <Link href="/admin/reports" className="gov-btn gov-btn-red gov-btn-sm">Review Now →</Link>
          </div>
        )}

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Admin Dashboard</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>All systems are running fine</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["overview","analytics"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`gov-btn gov-btn-sm ${activeTab === t ? "gov-btn-primary" : "gov-btn-outline"}`}
                style={{ textTransform: "capitalize" }}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="cd-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {kpis.slice(0, 4).map((k) => (
            <div key={k.label} className="gov-stat-card" data-testid={`stat-${k.label.toLowerCase().replace(/\s+/g,"‑")}`}
              style={{ borderLeft: `3px solid ${k.color}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{k.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1e8449", display: "flex", alignItems: "center", gap: 2 }}>
                  {k.trend !== "Now" && <ArrowUp style={{ width: 10, height: 10 }} />}{k.trend}
                </span>
              </div>
              <div className="gov-stat-value" style={{ color: k.color }}>{isLoading ? "—" : k.value.toLocaleString("en-IN")}</div>
              <div className="gov-stat-label">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="cd-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {kpis.slice(4).map((k) => (
            <div key={k.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${k.color}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{k.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1e8449", display: "flex", alignItems: "center", gap: 2 }}>
                  {k.trend !== "Now" && <ArrowUp style={{ width: 10, height: 10 }} />}{k.trend}
                </span>
              </div>
              <div className="gov-stat-value" style={{ color: k.color }}>{isLoading ? "—" : k.value.toLocaleString("en-IN")}</div>
              <div className="gov-stat-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="cd-2col-big" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>

            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Recent Reports table */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Camera style={{ width: 14, height: 14, color: "#c0392b" }} />
                    <span className="gov-section-title">Recent Waste Reports</span>
                  </div>
                  <Link href="/admin/reports" className="gov-btn gov-btn-outline gov-btn-xs">View All →</Link>
                </div>
                {isLoading ? (
                  <div style={{ padding: 18 }}>
                    {[1,2,3].map(i => <div key={i} style={{ height: 40, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "28px 18px", color: "#5d6d7e" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📋</div>
                    <div style={{ fontSize: 13 }}>No reports yet</div>
                  </div>
                ) : (
                  <table className="gov-table">
                    <thead>
                      <tr><th>Waste Type</th><th>Location</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((r: any) => (
                        <tr key={r.id} data-testid={`activity-${r.id}`}>
                          <td style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{r.wasteType} waste</td>
                          <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <MapPin style={{ width: 11, height: 11 }} />{r.address || "No address"}
                            </div>
                          </td>
                          <td><span className={reportBadge(r.status)}>{r.status}</span></td>
                          <td>
                            {r.status === "pending" && (
                              <Link href="/admin/reports" className="gov-btn gov-btn-primary gov-btn-xs">Assign</Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* System Alerts */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <span className="gov-section-title">Alerts</span>
                  <span className="gov-badge gov-badge-red">1 urgent</span>
                </div>
                <table className="gov-table">
                  <thead><tr><th>Level</th><th>Message</th><th>Time</th></tr></thead>
                  <tbody>
                    {ALERTS.map(a => (
                      <tr key={a.id}>
                        <td><span className={alertBadge(a.level)}>{a.icon} {a.level}</span></td>
                        <td style={{ fontSize: 12 }}>{a.msg}</td>
                        <td style={{ fontSize: 11, color: "#909caa", whiteSpace: "nowrap" }}>{a.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Top Citizens */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Trophy style={{ width: 14, height: 14, color: "#b7950b" }} />
                    <span className="gov-section-title">Top Citizens</span>
                  </div>
                </div>
                {isLoading ? (
                  <div style={{ padding: 18 }}>
                    {[1,2,3,4,5].map(i => <div key={i} style={{ height: 36, background: "#f4f6f9", borderRadius: 3, marginBottom: 5 }} />)}
                  </div>
                ) : topCitizens.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px", color: "#5d6d7e" }}>
                    <div style={{ fontSize: 24 }}>🏆</div><div style={{ fontSize: 12, marginTop: 4 }}>No data yet</div>
                  </div>
                ) : (
                  <table className="gov-table">
                    <thead><tr><th>#</th><th>Name</th><th>Points</th></tr></thead>
                    <tbody>
                      {topCitizens.map((c: any) => (
                        <tr key={c.userId} data-testid={`top-citizen-${c.rank}`}>
                          <td style={{ fontSize: 14 }}>
                            {c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : c.rank === 3 ? "🥉" : `#${c.rank}`}
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#1c2833" }}>{c.fullName}</div>
                            <span className="gov-badge gov-badge-gray" style={{ fontSize: 9 }}>{c.tier}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: "#b7950b", fontSize: 13 }}>{c.score} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Quick admin actions */}
              <div className="gov-card">
                <div className="gov-card-header"><span className="gov-section-title">Quick Actions</span></div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "Manage Users",   icon: "👥", path: "/admin/users"    },
                    { label: "Review Reports", icon: "📋", path: "/admin/reports"  },
                    { label: "Training",       icon: "📚", path: "/admin/training" },
                    { label: "Rewards",        icon: "🏆", path: "/admin/redeem"   },
                    { label: "Events",         icon: "📅", path: "/admin/events"   },
                  ].map(a => (
                    <Link key={a.label} href={a.path} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                        border: "1px solid #d5dae1", borderRadius: 3, cursor: "pointer",
                        background: "#fff",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f4f6f9")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                      >
                        <span style={{ fontSize: 16 }}>{a.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2833" }}>{a.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && (
          <div className="gov-card">
            <div className="gov-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart2 style={{ width: 14, height: 14, color: "#1a5276" }} />
                <span className="gov-section-title">Activity This Week</span>
              </div>
              <span style={{ fontSize: 11, color: "#1e8449", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                <TrendingUp style={{ width: 12, height: 12 }} /> +26% vs last week
              </span>
            </div>
            <div className="gov-card-body">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, marginBottom: 8 }}>
                {WEEKLY_ACTIVITY.map((v, i) => {
                  const pct   = (v / WEEKLY_MAX) * 100;
                  const today = i === 6;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: today ? 700 : 400, color: today ? "#1a5276" : "#909caa" }}>{v}</span>
                      <div style={{
                        width: "100%", height: `${pct}%`, borderRadius: "2px 2px 0 0",
                        background: today ? "#1a5276" : "#d6eaf8",
                        border: today ? "none" : "1px solid #aed6f1", minHeight: 4,
                      }} />
                      <span style={{ fontSize: 10, fontWeight: today ? 700 : 400, color: today ? "#1a5276" : "#909caa" }}>{WEEKLY_LABELS[i]}</span>
                    </div>
                  );
                })}
              </div>
              <hr className="gov-divider" style={{ margin: "16px 0" }} />
              <div className="cd-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[
                  { label: "Issues Fixed",   value: "84%", color: "#1e8449"  },
                  { label: "Avg Reply Time", value: "2.4h", color: "#1a5276" },
                  { label: "New Sign-ups",   value: "48",   color: "#6c3483" },
                  { label: "CO₂ Offset",     value: "1.2T", color: "#1e8449" },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: "center", padding: "10px 8px", border: "1px solid #d5dae1", borderRadius: 3 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: "#5d6d7e", marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
