import { useGetScrapListings } from "@workspace/api-client-react";
import { BarChart3, TrendingUp, Award, Recycle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/scrap.css";

const WEEKLY_DATA = [
  { day: "Mon", earnings: 3200, pickups: 4 },
  { day: "Tue", earnings: 5800, pickups: 7 },
  { day: "Wed", earnings: 4100, pickups: 5 },
  { day: "Thu", earnings: 7200, pickups: 9 },
  { day: "Fri", earnings: 3840, pickups: 4 },
  { day: "Sat", earnings: 6500, pickups: 8 },
  { day: "Sun", earnings: 5100, pickups: 6 },
];

const MONTHLY_DATA = [
  { month: "Nov", earnings: 62000 },
  { month: "Dec", earnings: 78000 },
  { month: "Jan", earnings: 55000 },
  { month: "Feb", earnings: 83000 },
  { month: "Mar", earnings: 91000 },
  { month: "Apr", earnings: 74000 },
  { month: "May", earnings: 35840 },
];

const MATERIALS = [
  { name: "Metal",     kg: 480, value: 21600, pct: 38, icon: "⚙️",  color: "#ffa000" },
  { name: "E-Waste",  kg: 140, value: 16800, pct: 27, icon: "💻", color: "#e64a19" },
  { name: "Plastic",  kg: 340, value: 4080,  pct: 20, icon: "🧴", color: "#ff6f00" },
  { name: "Paper",    kg: 500, value: 4000,  pct: 10, icon: "📄", color: "#ffb300" },
  { name: "Other",    kg: 60,  value: 360,   pct:  5, icon: "📦", color: "#ff8f00" },
];

const maxWeekly  = Math.max(...WEEKLY_DATA.map(d => d.earnings));
const maxMonthly = Math.max(...MONTHLY_DATA.map(d => d.earnings));

export default function ScrapAnalyticsPage() {
  const { data: completedData } = useGetScrapListings({ status: "completed" } as any);
  const completed: any[] = (completedData as any)?.data || [];

  const totalKg    = MATERIALS.reduce((s, m) => s + m.kg, 0);
  const totalValue = MATERIALS.reduce((s, m) => s + m.value, 0);
  const avgPerPickup = completed.length > 0 ? Math.round(totalValue / (completed.length || 43)) : 860;

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Analytics">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#2d2d2d", margin: 0 }}>Earnings & Performance Analytics</h2>
          <div style={{ fontSize: 12, color: "#8d6e63", marginTop: 3 }}>Your recycling impact and revenue overview</div>
        </div>

        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Total Earned",     value: "₹4,78,000", icon: "💰", color: "#e64a19", sub: "Lifetime" },
            { label: "Total Collected",  value: `${totalKg.toLocaleString()} kg`, icon: "⚖️", color: "#f57c00", sub: "This year" },
            { label: "Avg per Pickup",   value: `₹${avgPerPickup}`, icon: "📈", color: "#ffa000", sub: "Per job" },
            { label: "CO₂ Saved",        value: "2.4 tonnes", icon: "🌿", color: "#2e7d32", sub: "Carbon offset" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", border: `1.5px solid ${s.color}25`, boxShadow: `0 4px 16px ${s.color}12`, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8d6e63", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#bbb" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Weekly earnings chart */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", padding: "18px 20px", boxShadow: "0 4px 16px rgba(230,74,25,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 style={{ width: 15, height: 15, color: "#e64a19" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>Weekly Earnings</span>
              </div>
              <span style={{ fontSize: 11, color: "#8d6e63" }}>This week</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
              {WEEKLY_DATA.map((d, i) => {
                const h = (d.earnings / maxWeekly) * 115;
                const isToday = i === 4;
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? "#e64a19" : "#bbb" }}>₹{(d.earnings/1000).toFixed(1)}k</div>
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: 100 }}>
                      <div style={{ width: "100%", height: h, borderRadius: "8px 8px 3px 3px", background: isToday ? "linear-gradient(180deg,#e64a19,#f57c00)" : "linear-gradient(180deg,#ffccbc,#ffe0b2)", boxShadow: isToday ? "0 4px 12px rgba(230,74,25,0.4)" : "none", transition: "height .3s" }} />
                    </div>
                    <div style={{ fontSize: 9, color: isToday ? "#e64a19" : "#bbb", fontWeight: isToday ? 800 : 400 }}>{d.day}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #fff3e0", display: "flex", gap: 20 }}>
              <div><div style={{ fontSize: 15, fontWeight: 900, color: "#e64a19" }}>₹35,840</div><div style={{ fontSize: 10, color: "#8d6e63" }}>Week total</div></div>
              <div><div style={{ fontSize: 15, fontWeight: 900, color: "#f57c00" }}>43</div><div style={{ fontSize: 10, color: "#8d6e63" }}>Pickups</div></div>
              <div><div style={{ fontSize: 15, fontWeight: 900, color: "#ffa000", display: "flex", alignItems: "center", gap: 3 }}><TrendingUp style={{ width: 13, height: 13 }} />+12%</div><div style={{ fontSize: 10, color: "#8d6e63" }}>vs last week</div></div>
            </div>
          </div>

          {/* Monthly trend */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", padding: "18px 20px", boxShadow: "0 4px 16px rgba(230,74,25,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp style={{ width: 15, height: 15, color: "#f57c00" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>Monthly Trend</span>
              </div>
              <span style={{ fontSize: 11, color: "#8d6e63" }}>Last 7 months</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
              {MONTHLY_DATA.map((d, i) => {
                const h = (d.earnings / maxMonthly) * 100;
                const isCurrent = i === MONTHLY_DATA.length - 1;
                return (
                  <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: isCurrent ? "#e64a19" : "#bbb" }}>₹{(d.earnings/1000).toFixed(0)}k</div>
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: 100 }}>
                      <div style={{ width: "100%", height: `${h}%`, borderRadius: "6px 6px 2px 2px", background: isCurrent ? "linear-gradient(180deg,#ffa000,#ff6f00)" : "linear-gradient(180deg,#ffe0b2,#fff3e0)", boxShadow: isCurrent ? "0 3px 10px rgba(255,160,0,0.4)" : "none" }} />
                    </div>
                    <div style={{ fontSize: 8, color: isCurrent ? "#e64a19" : "#bbb", fontWeight: isCurrent ? 800 : 400 }}>{d.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Material breakdown */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", padding: "18px 20px", boxShadow: "0 4px 16px rgba(230,74,25,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Recycle style={{ width: 15, height: 15, color: "#e64a19" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>Material Breakdown — This Month</span>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {MATERIALS.map(m => (
              <div key={m.name} style={{ flex: 1, minWidth: 140, background: "#fffaf7", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${m.color}30` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#2d2d2d" }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: "#8d6e63" }}>{m.pct}% of total</div>
                  </div>
                </div>
                <div style={{ height: 6, background: "#ffe0b2", borderRadius: 999, marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 999 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 14, fontWeight: 900, color: m.color }}>{m.kg} kg</div><div style={{ fontSize: 9, color: "#8d6e63" }}>Collected</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 900, color: "#2d2d2d" }}>₹{m.value.toLocaleString("en-IN")}</div><div style={{ fontSize: 9, color: "#8d6e63" }}>Revenue</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div style={{ background: "linear-gradient(135deg,#7f2500,#e64a19,#f57c00)", borderRadius: 18, padding: "18px 22px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Award style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 14, fontWeight: 800 }}>Achievements</span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { icon: "🥇", label: "Top Collector", desc: "Rank #1 in your area this week", unlocked: true },
              { icon: "⚡", label: "Speed Dealer", desc: "Accept within 5 min, 10 times", unlocked: true },
              { icon: "🌿", label: "Eco Hero", desc: "Saved 2+ tonnes of CO₂", unlocked: true },
              { icon: "💎", label: "Diamond Dealer", desc: "₹5L lifetime earnings", unlocked: false },
            ].map(a => (
              <div key={a.label} style={{ flex: 1, minWidth: 120, background: a.unlocked ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)", borderRadius: 12, padding: "12px 14px", border: `1px solid ${a.unlocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`, opacity: a.unlocked ? 1 : 0.5 }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{a.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
