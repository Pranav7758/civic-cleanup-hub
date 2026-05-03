import { useState } from "react";
import { useGetScrapListings, useUpdateScrapListing, getGetScrapListingsQueryKey } from "@workspace/api-client-react";
import { Truck, MapPin, CheckCircle, Navigation, Clock, Package, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/scrap.css";

const CAT_ICONS: Record<string, string> = {
  metal: "⚙️", paper: "📄", plastic: "🧴", ewaste: "💻", glass: "🍶", cardboard: "📦",
};

const TIME_SLOTS = ["09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", "04:30 PM"];

export default function ScrapSchedulePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [routeStarted, setRouteStarted] = useState(false);

  const { data, isLoading } = useGetScrapListings({ status: "accepted" } as any);
  const updateListing = useUpdateScrapListing();

  const pickups: any[] = (data as any)?.data || [];

  const handleComplete = (id: string) => {
    setCompletingId(id);
    updateListing.mutate({ id, data: { status: "completed" } }, {
      onSuccess: () => { toast({ title: "Pickup completed! Citizen gets 50 pts." }); qc.invalidateQueries({ queryKey: getGetScrapListingsQueryKey({}) }); },
      onError:   (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      onSettled: () => setCompletingId(null),
    });
  };

  const totalEstimate = pickups.reduce((s, p) => s + (p.totalEstimate || 0), 0);
  const totalWeight   = pickups.reduce((s, p) => s + (p.totalWeight || 0), 0);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Pickup Schedule">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#2d2d2d", margin: 0 }}>Today's Pickup Route</h2>
            <div style={{ fontSize: 12, color: "#8d6e63", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
              <Clock style={{ width: 11, height: 11 }} /> {today}
            </div>
          </div>
          <button
            onClick={() => setRouteStarted(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
              background: routeStarted ? "linear-gradient(135deg,#2e7d32,#1b5e20)" : "linear-gradient(135deg,#e64a19,#f57c00)",
              color: "#fff", border: "none", borderRadius: 12, cursor: "pointer",
              fontSize: 13, fontWeight: 800,
              boxShadow: routeStarted ? "0 4px 14px rgba(46,125,50,0.3)" : "0 4px 14px rgba(230,74,25,0.3)",
            }}>
            {routeStarted ? <><CheckCircle style={{ width: 16, height: 16 }} /> Route Active</> : <><Navigation style={{ width: 16, height: 16 }} /> Start Route</>}
          </button>
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Total Stops",    value: String(pickups.length), icon: "📍", color: "#e64a19" },
            { label: "Total Weight",   value: `${totalWeight.toFixed(0)} kg`,      icon: "⚖️",  color: "#f57c00" },
            { label: "Est. Earnings",  value: `₹${totalEstimate.toFixed(0)}`,      icon: "💰",  color: "#ffa000" },
            { label: "Route Status",   value: routeStarted ? "Active" : "Idle",    icon: routeStarted ? "🟢" : "🔴", color: routeStarted ? "#2e7d32" : "#e64a19" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${s.color}25`, boxShadow: `0 3px 12px ${s.color}12`, display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8d6e63", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 100, background: "#fff", borderRadius: 16, border: "1.5px solid #ffccbc" }} />)}
          </div>
        ) : pickups.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", padding: "52px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2d2d2d" }}>No pickups scheduled today</div>
            <div style={{ fontSize: 12, color: "#8d6e63", marginTop: 4 }}>
              Accept citizen requests from the <b>Requests</b> page — they'll appear here as stops
            </div>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: 34, top: 24, bottom: 24, width: 2, background: "linear-gradient(180deg,#e64a19,#f57c00,#ffa000)", borderRadius: 999, zIndex: 0 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pickups.map((p: any, idx: number) => {
                const timeSlot = TIME_SLOTS[idx % TIME_SLOTS.length];
                const isPast = idx === 0 && routeStarted;
                const isCurrent = idx === (routeStarted ? 1 : 0);

                return (
                  <div key={p.id} style={{ display: "flex", gap: 16, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                    {/* Stop number circle */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                      background: isPast ? "linear-gradient(135deg,#2e7d32,#1b5e20)" : isCurrent ? "linear-gradient(135deg,#e64a19,#f57c00)" : "#fff",
                      border: `2.5px solid ${isPast ? "#2e7d32" : isCurrent ? "#e64a19" : "#ffccbc"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: isPast ? 16 : 14, fontWeight: 900,
                      color: (isPast || isCurrent) ? "#fff" : "#8d6e63",
                      boxShadow: isCurrent ? "0 4px 14px rgba(230,74,25,0.4)" : "0 2px 6px rgba(0,0,0,0.1)",
                    }}>
                      {isPast ? "✓" : idx + 1}
                    </div>

                    {/* Card */}
                    <div style={{
                      flex: 1, background: "#fff", borderRadius: 16,
                      border: `1.5px solid ${isCurrent ? "#e64a19" : "#ffe0b2"}`,
                      boxShadow: isCurrent ? "0 6px 24px rgba(230,74,25,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
                      overflow: "hidden",
                    }}>
                      {isCurrent && (
                        <div style={{ background: "linear-gradient(90deg,#e64a19,#f57c00)", padding: "5px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                          <Navigation style={{ width: 11, height: 11, color: "#fff" }} />
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: ".06em", textTransform: "uppercase" }}>Next Stop</span>
                        </div>
                      )}
                      <div style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: "#2d2d2d" }}>
                                Stop {idx + 1} — {p.items?.length || 0} item type{(p.items?.length || 0) !== 1 ? "s" : ""}
                              </span>
                              <span style={{ fontSize: 10, background: "#fff3e0", color: "#e64a19", padding: "2px 8px", borderRadius: 999, border: "1px solid #ffccbc", fontWeight: 700 }}>
                                <Clock style={{ width: 9, height: 9, display: "inline", marginRight: 3 }} />{timeSlot}
                              </span>
                            </div>
                            {p.address && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8d6e63", marginBottom: 6 }}>
                                <MapPin style={{ width: 11, height: 11, color: "#e64a19" }} />{p.address}
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {p.items?.slice(0, 3).map((item: any, j: number) => (
                                <span key={j} style={{ fontSize: 11, background: "#fff8e1", color: "#f57c00", padding: "2px 8px", borderRadius: 999, border: "1px solid #ffe0b2", fontWeight: 600 }}>
                                  {CAT_ICONS[item.category] || "📦"} {item.itemName} {item.weightKg}kg
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                            {p.totalEstimate && (
                              <div style={{ fontSize: 16, fontWeight: 900, color: "#e64a19" }}>₹{p.totalEstimate?.toFixed(0)}</div>
                            )}
                            <button
                              onClick={() => handleComplete(p.id)}
                              disabled={completingId === p.id}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: isPast ? "#e8f5e9" : "linear-gradient(135deg,#e64a19,#f57c00)", color: isPast ? "#2e7d32" : "#fff", border: isPast ? "1.5px solid #a5d6a7" : "none", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 700, boxShadow: isPast ? "none" : "0 3px 10px rgba(230,74,25,0.3)", whiteSpace: "nowrap" }}>
                              {isPast ? <><CheckCircle style={{ width: 11, height: 11 }} /> Collected</> : completingId === p.id ? "Saving…" : <><Package style={{ width: 11, height: 11 }} /> Mark Collected</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Route summary */}
        {pickups.length > 0 && (
          <div style={{ background: "linear-gradient(135deg,#fff3e0,#fbe9e7)", borderRadius: 14, padding: "14px 18px", border: "1px solid #ffccbc", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Truck style={{ width: 18, height: 18, color: "#e64a19" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#bf360c" }}>Route Summary</div>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, color: "#8d6e63" }}><b style={{ color: "#e64a19" }}>{pickups.length}</b> stops</div>
              <div style={{ fontSize: 12, color: "#8d6e63" }}><b style={{ color: "#e64a19" }}>{totalWeight.toFixed(0)}kg</b> to collect</div>
              <div style={{ fontSize: 12, color: "#8d6e63" }}><b style={{ color: "#e64a19" }}>₹{totalEstimate.toFixed(0)}</b> est. earnings</div>
            </div>
            {!routeStarted && pickups.length > 0 && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#e65100" }}>
                <AlertCircle style={{ width: 12, height: 12 }} /> Tap "Start Route" to begin navigation
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
