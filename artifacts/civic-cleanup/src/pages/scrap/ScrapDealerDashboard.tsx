import { useState } from "react";
import { Link } from "wouter";
import {
  useGetScrapListings, useUpdateScrapListing, getGetScrapListingsQueryKey,
} from "@workspace/api-client-react";
import { Recycle, CheckCircle, MapPin, Package, ArrowUp, ArrowDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/scrap.css";

const SCRAP_TYPES = [
  { id:1, name:"Plastic",   icon:"🧴", price:12,  unit:"kg", trend:+8,  stock:"High",   sellers:24, color:"#1a5276" },
  { id:2, name:"Metal",     icon:"⚙️",  price:45,  unit:"kg", trend:+3,  stock:"Medium", sellers:18, color:"#b7950b" },
  { id:3, name:"Paper",     icon:"📄", price:8,   unit:"kg", trend:-2,  stock:"High",   sellers:31, color:"#1e8449" },
  { id:4, name:"E-Waste",   icon:"💻", price:120, unit:"kg", trend:+15, stock:"Low",    sellers:9,  color:"#6c3483" },
  { id:5, name:"Glass",     icon:"🍶", price:6,   unit:"kg", trend:-1,  stock:"Medium", sellers:12, color:"#c0392b" },
  { id:6, name:"Cardboard", icon:"📦", price:5,   unit:"kg", trend:+1,  stock:"High",   sellers:27, color:"#ca6f1e" },
];

const INVENTORY = [
  { id:1, type:"Plastic",   qty:340, unit:"kg", status:"available", value:4080,  icon:"🧴" },
  { id:2, type:"Metal",     qty:120, unit:"kg", status:"available", value:5400,  icon:"⚙️"  },
  { id:3, type:"E-Waste",   qty:28,  unit:"kg", status:"sold",      value:3360,  icon:"💻" },
  { id:4, type:"Paper",     qty:500, unit:"kg", status:"available", value:4000,  icon:"📄" },
  { id:5, type:"Cardboard", qty:200, unit:"kg", status:"reserved",  value:1000,  icon:"📦" },
];

const ORDERS = [
  { id:"ORD-001", type:"Plastic",  qty:80,  price:960,  buyer:"Ravi Scrap Co.",    status:"completed", time:"2h ago"    },
  { id:"ORD-002", type:"E-Waste",  qty:12,  price:1440, buyer:"TechRecycle Ltd.",  status:"pending",   time:"4h ago"    },
  { id:"ORD-003", type:"Metal",    qty:45,  price:2025, buyer:"Metro Metals",      status:"completed", time:"Yesterday" },
  { id:"ORD-004", type:"Paper",    qty:200, price:1600, buyer:"GreenPaper Mills",  status:"accepted",  time:"Yesterday" },
];

function statusBadge(s: string) {
  const m: Record<string, string> = {
    completed: "gov-badge gov-badge-green",
    pending:   "gov-badge gov-badge-yellow",
    accepted:  "gov-badge gov-badge-blue",
    cancelled: "gov-badge gov-badge-red",
    available: "gov-badge gov-badge-green",
    sold:      "gov-badge gov-badge-gray",
    reserved:  "gov-badge gov-badge-purple",
  };
  return m[s] || "gov-badge gov-badge-gray";
}

export default function ScrapDealerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab]           = useState<"marketplace" | "inventory" | "orders">("marketplace");
  const [searchQ, setSearchQ]   = useState("");
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const { data: allData, isLoading: allLoading } = useGetScrapListings({ status: "pending" } as any);
  const { data: myData }                         = useGetScrapListings({ dealerId: user?.id } as any);
  const updateListing = useUpdateScrapListing();

  const allListings: any[] = (allData as any)?.data || [];

  const handleAccept = (id: string) => {
    setBuyingId(id);
    updateListing.mutate({ id, data: { status: "accepted", dealerId: user?.id } }, {
      onSuccess: () => { toast({ title: "Deal accepted!" }); qc.invalidateQueries({ queryKey: getGetScrapListingsQueryKey({}) }); },
      onError:   (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      onSettled: () => setBuyingId(null),
    });
  };

  const handleComplete = (id: string) => {
    updateListing.mutate({ id, data: { status: "completed" } }, {
      onSuccess: () => { toast({ title: "Deal completed! Citizen rewarded." }); qc.invalidateQueries({ queryKey: getGetScrapListingsQueryKey({}) }); },
      onError:   (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const filteredListings = allListings.filter(l =>
    !searchQ ||
    l.items?.some((i: any) => i.itemName?.toLowerCase().includes(searchQ.toLowerCase())) ||
    l.address?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const totalInventoryValue = INVENTORY.filter(i => i.status === "available").reduce((a, b) => a + b.value, 0);

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="Scrap Dealer">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header stats ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Kabadi Hub Dashboard</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>Live marketplace · Prices updated 2 min ago</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#5d6d7e" }}>Wallet Balance</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#b7950b" }}>₹28,450</div>
          </div>
        </div>

        {/* ── Summary stats ── */}
        <div className="cd-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label:"Today's Earnings", value:"₹3,840",   icon:"💰", color:"#b7950b" },
            { label:"Weekly Revenue",   value:"₹21,600",  icon:"📈", color:"#1e8449" },
            { label:"Scrap Sold",       value:"480 kg",   icon:"⚖️", color:"#1a5276" },
            { label:"Active Listings",  value:String(allListings.length||12), icon:"📋", color:"#6c3483" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tab bar ── */}
        <div className="gov-tabs">
          {([
            { key:"marketplace", label:"🛒 Marketplace" },
            { key:"inventory",   label:"📦 Inventory"   },
            { key:"orders",      label:"📋 Orders"      },
          ] as const).map(t => (
            <button key={t.key} className={`gov-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ MARKETPLACE TAB ══ */}
        {tab === "marketplace" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Price ticker */}
            <div className="gov-card">
              <div className="gov-card-header"><span className="gov-section-title">Live Market Prices</span></div>
              <div style={{ overflowX: "auto" }}>
                <table className="gov-table">
                  <thead>
                    <tr><th>Material</th><th>Price</th><th>Trend</th><th>Stock Level</th><th>Sellers</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {SCRAP_TYPES.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{s.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2833" }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 14, fontWeight: 800, color: s.color }}>₹{s.price}/{s.unit}</td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: s.trend > 0 ? "#1e8449" : "#c0392b", display: "flex", alignItems: "center", gap: 2 }}>
                            {s.trend > 0 ? <ArrowUp style={{ width: 12, height: 12 }} /> : <ArrowDown style={{ width: 12, height: 12 }} />}
                            {Math.abs(s.trend)}%
                          </span>
                        </td>
                        <td>
                          <span className={s.stock === "High" ? "gov-badge gov-badge-green" : s.stock === "Low" ? "gov-badge gov-badge-red" : "gov-badge gov-badge-yellow"}>
                            {s.stock}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "#5d6d7e" }}>{s.sellers} sellers</td>
                        <td><button className="gov-btn gov-btn-primary gov-btn-xs">Buy Now</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Citizen Listings */}
            <div className="gov-card">
              <div className="gov-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Recycle style={{ width: 14, height: 14, color: "#b7950b" }} />
                  <span className="gov-section-title">Citizen Listings</span>
                  <span className="gov-badge gov-badge-yellow">{allListings.length} available</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #d5dae1", borderRadius: 3, padding: "4px 8px", background: "#fff" }}>
                  <Search style={{ width: 12, height: 12, color: "#909caa" }} />
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search listings…"
                    style={{ border: "none", outline: "none", fontSize: 12, color: "#1c2833", width: 120, background: "transparent" }}
                  />
                </div>
              </div>

              {allLoading ? (
                <div style={{ padding: 18 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 56, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
                </div>
              ) : filteredListings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 18px", color: "#5d6d7e" }}>
                  <div style={{ fontSize: 28 }}>♻️</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>No listings available right now</div>
                </div>
              ) : (
                <table className="gov-table">
                  <thead><tr><th>Listing</th><th>Location</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredListings.map((l: any) => (
                      <tr key={l.id} data-testid={`dealer-listing-${l.id}`}>
                        <td style={{ fontSize: 12, fontWeight: 600, color: "#1c2833" }}>
                          {l.items?.length || 0} item type{(l.items?.length || 0) !== 1 ? "s" : ""}
                        </td>
                        <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                          {l.address && <div style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin style={{ width: 10, height: 10 }} />{l.address}</div>}
                        </td>
                        <td style={{ fontSize: 11, color: "#5d6d7e" }}>
                          {l.items?.map((item: any, j: number) => (
                            <div key={j}>• {item.itemName} — {item.weightKg}kg @ ₹{item.pricePerKg}/kg</div>
                          ))}
                        </td>
                        <td>
                          {l.totalEstimate && <div style={{ fontWeight: 700, color: "#b7950b", fontSize: 14 }}>₹{l.totalEstimate?.toFixed(0)}</div>}
                          <div style={{ fontSize: 11, color: "#5d6d7e" }}>{l.totalWeight?.toFixed(1)} kg</div>
                        </td>
                        <td><span className={statusBadge(l.status)}>{l.status}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            {l.status === "pending" && (
                              <button className="gov-btn gov-btn-primary gov-btn-xs" onClick={() => handleAccept(l.id)}
                                disabled={updateListing.isPending && buyingId === l.id} data-testid={`button-accept-${l.id}`}>
                                {buyingId === l.id ? "…" : "Accept"}
                              </button>
                            )}
                            {l.status === "accepted" && (
                              <button className="gov-btn gov-btn-green gov-btn-xs" onClick={() => handleComplete(l.id)}
                                disabled={updateListing.isPending} data-testid={`button-complete-${l.id}`}
                                style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <CheckCircle style={{ width: 10, height: 10 }} /> Done
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ INVENTORY TAB ══ */}
        {tab === "inventory" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="cd-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                { label:"Total Value",   value:`₹${totalInventoryValue.toLocaleString("en-IN")}`, icon:"💰", color:"#b7950b" },
                { label:"Total Items",   value:`${INVENTORY.length} types`,                        icon:"📦", color:"#1a5276" },
                { label:"Available Now", value:`${INVENTORY.filter(i => i.status==="available").length} types`, icon:"✅", color:"#1e8449" },
              ].map(c => (
                <div key={c.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${c.color}` }}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <div className="gov-stat-value" style={{ color: c.color }}>{c.value}</div>
                  <div className="gov-stat-label">{c.label}</div>
                </div>
              ))}
            </div>
            <div className="gov-card">
              <div className="gov-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Package style={{ width: 14, height: 14, color: "#1a5276" }} />
                  <span className="gov-section-title">Inventory Stock</span>
                </div>
                <button className="gov-btn gov-btn-primary gov-btn-xs">+ Add Stock</button>
              </div>
              <table className="gov-table">
                <thead><tr><th>Material</th><th>Quantity</th><th>Market Value</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {INVENTORY.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{item.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2833" }}>{item.type}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{item.qty} <span style={{ fontSize: 11, color: "#5d6d7e" }}>{item.unit}</span></td>
                      <td style={{ fontSize: 13, fontWeight: 700, color: "#b7950b" }}>₹{item.value.toLocaleString("en-IN")}</td>
                      <td><span className={statusBadge(item.status)}>{item.status}</span></td>
                      <td>
                        {item.status === "available" && <button className="gov-btn gov-btn-outline gov-btn-xs">List for Sale</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ ORDERS TAB ══ */}
        {tab === "orders" && (
          <div className="gov-card">
            <div className="gov-card-header">
              <span className="gov-section-title">Recent Orders</span>
              <span style={{ fontSize: 12, color: "#5d6d7e" }}>{ORDERS.length} orders</span>
            </div>
            <table className="gov-table">
              <thead><tr><th>Order ID</th><th>Material</th><th>Quantity</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {ORDERS.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontSize: 12, fontWeight: 700, color: "#1a5276" }}>{o.id}</td>
                    <td style={{ fontSize: 12 }}>{o.type}</td>
                    <td style={{ fontSize: 12, color: "#5d6d7e" }}>{o.qty} kg</td>
                    <td style={{ fontSize: 12 }}>{o.buyer}</td>
                    <td style={{ fontSize: 13, fontWeight: 700, color: "#b7950b" }}>₹{o.price.toLocaleString("en-IN")}</td>
                    <td><span className={statusBadge(o.status)}>{o.status}</span></td>
                    <td style={{ fontSize: 11, color: "#909caa" }}>{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
