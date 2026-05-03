import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetScrapListings, useUpdateScrapListing, getGetScrapListingsQueryKey,
} from "@workspace/api-client-react";
import { Recycle, TrendingUp, BarChart3, Truck, MapPin, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/scrap.css";

const WEEK_EARNINGS = [3200, 5800, 4100, 7200, 3840, 6500, 5100];
const WEEK_LABELS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_EARN = Math.max(...WEEK_EARNINGS);

const MATERIAL_BREAKDOWN = [
  { name: "Metal",     pct: 38, color: "#ffa000", icon: "⚙️"  },
  { name: "E-Waste",   pct: 27, color: "#e64a19", icon: "💻" },
  { name: "Plastic",   pct: 20, color: "#ff6f00", icon: "🧴" },
  { name: "Paper",     pct: 10, color: "#ffb300", icon: "📄" },
  { name: "Other",     pct:  5, color: "#ff8f00", icon: "📦" },
];

export default function ScrapDealerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [accepting, setAccepting] = useState<string | null>(null);

  const { data: allData, isLoading } = useGetScrapListings({ status: "pending" } as any);
  const updateListing = useUpdateScrapListing();

  const allListings: any[] = (allData as any)?.data || [];
  const recentRequests = allListings.slice(0, 4);

  const handleAccept = (id: string) => {
    setAccepting(id);
    updateListing.mutate({ id, data: { status: "accepted", dealerId: user?.id } }, {
      onSuccess: () => {
        toast({ title: "Request accepted!", description: "Citizen notified. Added to your schedule." });
        qc.invalidateQueries({ queryKey: getGetScrapListingsQueryKey({}) });
      },
      onError:   (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      onSettled: () => setAccepting(null),
    });
  };

  const QUICK_ACTIONS = [
    { label: "Citizen Requests", icon: Recycle, color: "#e64a19", desc: `${allListings.length} pending`, path: "/scrap/listings" },
    { label: "Pickup Schedule",  icon: Truck,     color: "#f57c00", desc: "Today's route",              path: "/scrap/schedule"  },
    { label: "Market Pricing",   icon: TrendingUp, color: "#ffa000", desc: "Live prices",               path: "/scrap/prices"    },
    { label: "Analytics",        icon: BarChart3,  color: "#ff6f00", desc: "Earnings & stats",          path: "/scrap/analytics" },
  ];

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Kabadi Hub">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg,#7f2500 0%,#bf360c 35%,#e64a19 65%,#f57c00 100%)", borderRadius: 22, padding: "22px 26px", color: "#fff", boxShadow: "0 12px 36px rgba(191,54,12,0.4)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "inset 1px 1px 4px rgba(255,255,255,0.2)" }}>
                  ♻️
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em" }}>Kabadi Hub Dashboard</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>Scrap Pickup & Recycling</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div><div style={{ fontSize: 24, fontWeight: 900 }}>₹28,450</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Wallet Balance</div></div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
                <div><div style={{ fontSize: 24, fontWeight: 900 }}>₹35,840</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>This Month</div></div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
                <div><div style={{ fontSize: 24, fontWeight: 900 }}>1,240</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>kg Collected</div></div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => setLocation("/scrap/listings")}
                style={{ padding: "9px 18px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, backdropFilter: "blur(4px)", whiteSpace: "nowrap" }}>
                🔔 {allListings.length} New Requests
              </button>
              <button onClick={() => setLocation("/scrap/schedule")}
                style={{ padding: "9px 18px", background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                🗺️ View Today's Route
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Today's Earnings",   value: "₹3,840",  icon: "💰", color: "#e64a19", bg: "linear-gradient(135deg,#fff3e0,#fbe9e7)" },
            { label: "This Week's Earnings", value: "₹21,600", icon: "📈", color: "#f57c00", bg: "linear-gradient(135deg,#fff8e1,#fff3e0)" },
            { label: "Waiting for Pickup",  value: String(allListings.length || 0), icon: "🚛", color: "#ff8f00", bg: "linear-gradient(135deg,#fffde7,#fff8e1)" },
            { label: "Kg Collected",        value: "480 kg",  icon: "⚖️", color: "#ffa000", bg: "linear-gradient(135deg,#fff3e0,#fce4ec)" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "16px 18px", border: `1.5px solid ${s.color}30`, boxShadow: `0 4px 16px ${s.color}18`, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 26 }}>{s.icon}</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8d6e63", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={() => setLocation(a.path)}
              style={{
                background: "#fff", borderRadius: 18, padding: "18px 14px",
                border: `1.5px solid ${a.color}30`,
                boxShadow: `0 6px 20px ${a.color}18`,
                cursor: "pointer", textAlign: "center",
                transition: "transform .2s ease, box-shadow .2s ease",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${a.color}30`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${a.color}18`; }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${a.color},${a.color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${a.color}50` }}>
                <a.icon style={{ width: 22, height: 22, color: "#fff" }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#2d2d2d" }}>{a.label}</div>
              <div style={{ fontSize: 10, color: "#8d6e63" }}>{a.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Recent citizen requests */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", boxShadow: "0 4px 20px rgba(230,74,25,0.08)" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #ffe0b2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Recycle style={{ width: 15, height: 15, color: "#e64a19" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>Recent Requests</span>
              </div>
              <button onClick={() => setLocation("/scrap/listings")} style={{ fontSize: 11, fontWeight: 700, color: "#e64a19", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
            </div>
            {isLoading ? (
              <div style={{ padding: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 52, background: "#fafafa", borderRadius: 10, marginBottom: 8 }} />)}</div>
            ) : recentRequests.length === 0 ? (
              <div style={{ padding: "36px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 13, color: "#8d6e63" }}>No pending requests</div>
              </div>
            ) : (
              <div style={{ padding: "8px 0" }}>
                {recentRequests.map((l: any) => {
                  const firstItem = l.items?.[0];
                  return (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "1px solid #fff3e0" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#fff3e0,#ffe0b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        ♻️
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#2d2d2d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {firstItem?.itemName || "Scrap items"}
                        </div>
                        {l.address && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#8d6e63", marginTop: 1 }}>
                            <MapPin style={{ width: 9, height: 9 }} />{l.address}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        {l.totalEstimate && <span style={{ fontSize: 12, fontWeight: 800, color: "#e64a19" }}>₹{l.totalEstimate?.toFixed(0)}</span>}
                        <button
                          onClick={() => handleAccept(l.id)}
                          disabled={accepting === l.id}
                          style={{ padding: "3px 10px", background: "#e64a19", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                          {accepting === l.id ? "…" : "Accept"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly earnings chart */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", boxShadow: "0 4px 20px rgba(230,74,25,0.08)", padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 style={{ width: 15, height: 15, color: "#e64a19" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>Weekly Earnings</span>
              </div>
              <span style={{ fontSize: 11, color: "#8d6e63" }}>This week</span>
            </div>

            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
              {WEEK_EARNINGS.map((val, i) => {
                const heightPct = (val / MAX_EARN) * 100;
                const isToday = i === 4;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? "#e64a19" : "#bbb" }}>
                      ₹{(val/1000).toFixed(1)}k
                    </div>
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: 80 }}>
                      <div style={{
                        width: "100%",
                        height: `${heightPct}%`,
                        borderRadius: "6px 6px 0 0",
                        background: isToday
                          ? "linear-gradient(180deg,#e64a19,#f57c00)"
                          : "linear-gradient(180deg,#ffccbc,#ffe0b2)",
                        boxShadow: isToday ? "0 3px 12px rgba(230,74,25,0.4)" : "none",
                        transition: "height .3s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: 9, color: isToday ? "#e64a19" : "#bbb", fontWeight: isToday ? 800 : 400 }}>
                      {WEEK_LABELS[i]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Material breakdown */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #fff3e0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8d6e63", marginBottom: 8 }}>Material Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {MATERIAL_BREAKDOWN.map(m => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, width: 18, textAlign: "center" }}>{m.icon}</span>
                    <div style={{ fontSize: 11, color: "#555", width: 52 }}>{m.name}</div>
                    <div style={{ flex: 1, height: 6, background: "#ffe0b2", borderRadius: 999 }}>
                      <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 999 }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: m.color, width: 28, textAlign: "right" }}>{m.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div style={{ background: "linear-gradient(135deg,#fff3e0,#fbe9e7)", borderRadius: 14, padding: "14px 18px", border: "1px solid #ffccbc", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>♻️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#bf360c", marginBottom: 2 }}>How it works</div>
            <div style={{ fontSize: 11, color: "#8d6e63", lineHeight: 1.6 }}>
              Citizens list their scrap → You accept &amp; pick it up → They earn reward points. Check <b>Market Pricing</b> for fair rates.
            </div>
          </div>
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <CheckCircle style={{ width: 14, height: 14, color: "#2e7d32" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32" }}>Live</span>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
