import { useState } from "react";
import { useGetScrapPrices } from "@workspace/api-client-react";
import { TrendingUp, ArrowUp, ArrowDown, RefreshCw, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/scrap.css";

const LIVE_PRICES = [
  { id:1, name:"Metal",     cat:"metal",     icon:"⚙️",  price:45,  unit:"kg", trend:+3,  stock:"Medium", buyers:18, bg:"linear-gradient(135deg,#fff3e0,#ffe0b2)", color:"#f57c00" },
  { id:2, name:"E-Waste",   cat:"ewaste",    icon:"💻", price:120, unit:"kg", trend:+15, stock:"Low",    buyers:9,  bg:"linear-gradient(135deg,#fbe9e7,#ffccbc)", color:"#e64a19" },
  { id:3, name:"Plastic",   cat:"plastic",   icon:"🧴", price:12,  unit:"kg", trend:+8,  stock:"High",   buyers:24, bg:"linear-gradient(135deg,#fff8e1,#ffe0b2)", color:"#ffa000" },
  { id:4, name:"Paper",     cat:"paper",     icon:"📄", price:8,   unit:"kg", trend:-2,  stock:"High",   buyers:31, bg:"linear-gradient(135deg,#f1f8e9,#dcedc8)", color:"#7cb342" },
  { id:5, name:"Glass",     cat:"glass",     icon:"🍶", price:6,   unit:"kg", trend:-1,  stock:"Medium", buyers:12, bg:"linear-gradient(135deg,#e3f2fd,#bbdefb)", color:"#1565c0" },
  { id:6, name:"Cardboard", cat:"cardboard", icon:"📦", price:5,   unit:"kg", trend:+1,  stock:"High",   buyers:27, bg:"linear-gradient(135deg,#ede7f6,#d1c4e9)", color:"#6d28d9" },
];

const STOCK_STYLE: Record<string, { bg: string; color: string }> = {
  High:   { bg: "#e8f5e9", color: "#2e7d32" },
  Medium: { bg: "#fff3e0", color: "#e65100" },
  Low:    { bg: "#fce4ec", color: "#c62828" },
};

export default function ScrapPricingPage() {
  const { data: pricesData } = useGetScrapPrices();
  const prices: any[] = (pricesData as any)?.data || [];

  const [view, setView] = useState<"cards" | "table">("cards");
  const [lastUpdated] = useState(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Market Pricing">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#2d2d2d", margin: 0 }}>Live Scrap Market Prices</h2>
            <div style={{ fontSize: 12, color: "#8d6e63", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
              <RefreshCw style={{ width: 11, height: 11 }} /> Updated at {lastUpdated} — prices refresh every 15 min
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["cards","table"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "7px 14px", borderRadius: 9, border: `1.5px solid ${view === v ? "#e64a19" : "#ffccbc"}`, background: view === v ? "#e64a19" : "#fff", color: view === v ? "#fff" : "#8d6e63", cursor: "pointer", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
                {v === "cards" ? "🃏 Cards" : "📊 Table"}
              </button>
            ))}
          </div>
        </div>

        {/* Market summary */}
        <div style={{ background: "linear-gradient(135deg,#7f2500,#bf360c,#e64a19)", borderRadius: 16, padding: "16px 20px", color: "#fff", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp style={{ width: 22, height: 22 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" }}>Market Status</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>6 materials tracked</div>
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)", alignSelf: "stretch" }} />
          {[
            { label: "Rising", count: LIVE_PRICES.filter(p => p.trend > 0).length, color: "#a5d6a7" },
            { label: "Falling", count: LIVE_PRICES.filter(p => p.trend < 0).length, color: "#ef9a9a" },
            { label: "Stable", count: LIVE_PRICES.filter(p => p.trend === 0).length, color: "rgba(255,255,255,0.6)" },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{m.count}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{m.label}</div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            <Info style={{ width: 13, height: 13 }} /> Use these to set your buy prices
          </div>
        </div>

        {/* Card view */}
        {view === "cards" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {LIVE_PRICES.map(p => {
              const stock = STOCK_STYLE[p.stock];
              return (
                <div key={p.id} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", boxShadow: "0 4px 16px rgba(230,74,25,0.07)", overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(230,74,25,0.15)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(230,74,25,0.07)"; }}>

                  {/* Gradient top strip */}
                  <div style={{ height: 5, background: `linear-gradient(90deg,${p.color},${p.color}88)` }} />

                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 13, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1.5px solid ${p.color}30` }}>
                        {p.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#8d6e63" }}>{p.buyers} active sellers</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: p.color }}>₹{p.price}</div>
                        <div style={{ fontSize: 11, color: "#8d6e63" }}>per {p.unit}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, fontWeight: 800, color: p.trend > 0 ? "#2e7d32" : "#c62828" }}>
                          {p.trend > 0 ? <ArrowUp style={{ width: 14, height: 14 }} /> : <ArrowDown style={{ width: 14, height: 14 }} />}
                          {Math.abs(p.trend)}%
                        </span>
                        <span style={{ fontSize: 10, color: "#8d6e63" }}>vs yesterday</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: stock.bg, color: stock.color }}>
                        {p.stock === "High" ? "⬆" : p.stock === "Low" ? "⬇" : "→"} {p.stock} Supply
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table view */}
        {view === "table" && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", boxShadow: "0 4px 16px rgba(230,74,25,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #ffe0b2", background: "#fffaf7", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp style={{ width: 14, height: 14, color: "#e64a19" }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>All Scrap Materials</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fffaf7" }}>
                  {["Material", "Price", "24h Trend", "Supply Level", "Active Sellers"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", fontSize: 10, fontWeight: 800, color: "#8d6e63", textAlign: "left", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "1px solid #ffe0b2" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LIVE_PRICES.map((p, idx) => {
                  const stock = STOCK_STYLE[p.stock];
                  return (
                    <tr key={p.id} style={{ borderBottom: idx < LIVE_PRICES.length - 1 ? "1px solid #fff3e0" : "none" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{p.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#2d2d2d" }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 16, fontWeight: 900, color: p.color }}>₹{p.price}/{p.unit}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, fontWeight: 800, color: p.trend > 0 ? "#2e7d32" : "#c62828", width: "fit-content" }}>
                          {p.trend > 0 ? <ArrowUp style={{ width: 13, height: 13 }} /> : <ArrowDown style={{ width: 13, height: 13 }} />}
                          {Math.abs(p.trend)}%
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: stock.bg, color: stock.color }}>{p.stock}</span>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 13, color: "#8d6e63", fontWeight: 600 }}>{p.buyers}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* API prices section */}
        {prices.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#2d2d2d", marginBottom: 12 }}>📋 Platform Rate Card</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
              {prices.map((p: any) => (
                <div key={p.id} style={{ background: "#fffaf7", borderRadius: 12, padding: "12px 14px", border: "1.5px solid #ffe0b2" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2d2d2d", textTransform: "capitalize", marginBottom: 4 }}>{p.itemName}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#e64a19" }}>₹{p.pricePerKg}/kg</div>
                  <div style={{ fontSize: 10, color: "#8d6e63", textTransform: "capitalize", marginTop: 2 }}>{p.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
