import { useState } from "react";
import { useGetScrapListings, useUpdateScrapListing, getGetScrapListingsQueryKey } from "@workspace/api-client-react";
import { Recycle, Search, MapPin, CheckCircle, Filter, Clock, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/scrap.css";

const STATUS_TABS = [
  { value: "pending",   label: "Pending",   emoji: "🔔" },
  { value: "accepted",  label: "Accepted",  emoji: "✅" },
  { value: "completed", label: "Completed", emoji: "🎉" },
];

const CAT_ICONS: Record<string, string> = {
  metal: "⚙️", paper: "📄", plastic: "🧴", ewaste: "💻", glass: "🍶", cardboard: "📦",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: "#fff3e0", text: "#e65100", border: "#ffccbc" },
  accepted:  { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  completed: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  cancelled: { bg: "#fce4ec", text: "#c62828", border: "#ef9a9a" },
};

export default function ScrapListingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [statusTab, setStatusTab] = useState("pending");
  const [searchQ,   setSearchQ]   = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [actingId,  setActingId]  = useState<string | null>(null);

  const { data, isLoading } = useGetScrapListings({ status: statusTab } as any);
  const updateListing = useUpdateScrapListing();

  const listings: any[] = (data as any)?.data || [];

  const categories = ["all", ...Array.from(new Set(
    listings.flatMap((l: any) => l.items?.map((i: any) => i.category) || [])
  ))];

  const filtered = listings.filter((l: any) => {
    const matchSearch = !searchQ ||
      l.items?.some((i: any) => i.itemName?.toLowerCase().includes(searchQ.toLowerCase())) ||
      l.address?.toLowerCase().includes(searchQ.toLowerCase());
    const matchCat = catFilter === "all" ||
      l.items?.some((i: any) => i.category === catFilter);
    return matchSearch && matchCat;
  });

  const handleAccept = (id: string) => {
    setActingId(id);
    updateListing.mutate({ id, data: { status: "accepted", dealerId: user?.id } }, {
      onSuccess: () => { toast({ title: "Request accepted! Citizen notified." }); qc.invalidateQueries({ queryKey: getGetScrapListingsQueryKey({}) }); },
      onError:   (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      onSettled: () => setActingId(null),
    });
  };

  const handleComplete = (id: string) => {
    setActingId(id);
    updateListing.mutate({ id, data: { status: "completed" } }, {
      onSuccess: () => { toast({ title: "Pickup completed! Citizen rewarded 50 pts." }); qc.invalidateQueries({ queryKey: getGetScrapListingsQueryKey({}) }); },
      onError:   (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      onSettled: () => setActingId(null),
    });
  };

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Citizen Requests">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#2d2d2d", margin: 0 }}>Citizen Scrap Requests</h2>
            <div style={{ fontSize: 12, color: "#8d6e63", marginTop: 3 }}>Accept requests → schedule pickups → collect & complete to reward citizens</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff3e0", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#e64a19", border: "1px solid #ffccbc" }}>
            <Recycle style={{ width: 14, height: 14 }} /> Live from citizens
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_TABS.map(t => (
            <button key={t.value} onClick={() => setStatusTab(t.value)}
              style={{
                padding: "7px 16px", borderRadius: 10, border: "1.5px solid",
                borderColor: statusTab === t.value ? "#e64a19" : "#ffccbc",
                background: statusTab === t.value ? "linear-gradient(135deg,#e64a19,#f57c00)" : "#fff",
                color: statusTab === t.value ? "#fff" : "#8d6e63",
                cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all .15s",
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Search + Category filter */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #ffccbc", borderRadius: 10, padding: "8px 14px", background: "#fff", flex: 1, minWidth: 200 }}>
            <Search style={{ width: 13, height: 13, color: "#bbb" }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search by item or address…"
              style={{ border: "none", outline: "none", fontSize: 12, color: "#2d2d2d", background: "transparent", flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <Filter style={{ width: 12, height: 12, color: "#8d6e63" }} />
            {categories.slice(0, 6).map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{
                  padding: "5px 12px", borderRadius: 999,
                  border: `1.5px solid ${catFilter === c ? "#e64a19" : "#ffccbc"}`,
                  background: catFilter === c ? "#fff3e0" : "#fff",
                  color: catFilter === c ? "#e64a19" : "#8d6e63",
                  cursor: "pointer", fontSize: 11, fontWeight: catFilter === c ? 700 : 400,
                  textTransform: "capitalize",
                }}>
                {c === "all" ? "All Types" : `${CAT_ICONS[c] || "📦"} ${c}`}
              </button>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ffccbc", boxShadow: "0 4px 20px rgba(230,74,25,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #ffe0b2", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fffaf7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Package style={{ width: 14, height: 14, color: "#e64a19" }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#2d2d2d" }}>{STATUS_TABS.find(t => t.value === statusTab)?.label} Listings</span>
            </div>
            <span style={{ fontSize: 11, background: "#fff3e0", color: "#e64a19", padding: "3px 10px", borderRadius: 999, fontWeight: 700 }}>
              {filtered.length} results
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 80, background: "#fafafa", borderRadius: 12 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "52px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>♻️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2d2d2d" }}>No {statusTab} listings found</div>
              <div style={{ fontSize: 12, color: "#8d6e63", marginTop: 4 }}>
                {statusTab === "pending" ? "New citizen requests will appear here" : "Nothing here yet"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filtered.map((l: any, idx: number) => {
                const sColor = STATUS_COLORS[l.status] || STATUS_COLORS.pending;
                return (
                  <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: idx < filtered.length - 1 ? "1px solid #fff3e0" : "none", transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fffaf7"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>

                    {/* Icon */}
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#fff3e0,#ffe0b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: "1.5px solid #ffccbc" }}>
                      {CAT_ICONS[l.items?.[0]?.category] || "♻️"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#2d2d2d" }}>
                          {l.items?.length || 0} item type{(l.items?.length || 0) !== 1 ? "s" : ""}
                        </span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: sColor.bg, color: sColor.text, border: `1px solid ${sColor.border}`, fontWeight: 700 }}>
                          {l.status}
                        </span>
                      </div>

                      {l.items?.slice(0, 2).map((item: any, j: number) => (
                        <div key={j} style={{ fontSize: 11, color: "#8d6e63", marginBottom: 1 }}>
                          {CAT_ICONS[item.category] || "📦"} {item.itemName} — {item.weightKg}kg @ ₹{item.pricePerKg}/kg
                        </div>
                      ))}
                      {l.items?.length > 2 && <div style={{ fontSize: 11, color: "#bbb" }}>+{l.items.length - 2} more items</div>}

                      <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                        {l.address && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#8d6e63" }}>
                            <MapPin style={{ width: 10, height: 10 }} />{l.address}
                          </span>
                        )}
                        {l.totalWeight && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#8d6e63" }}>⚖️ {l.totalWeight}kg total</span>
                        )}
                      </div>
                    </div>

                    {/* Value + Actions */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      {l.totalEstimate && (
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#e64a19" }}>₹{l.totalEstimate?.toFixed(0)}</div>
                      )}
                      {l.status === "pending" && (
                        <button onClick={() => handleAccept(l.id)} disabled={actingId === l.id}
                          style={{ padding: "6px 14px", background: "linear-gradient(135deg,#e64a19,#f57c00)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, boxShadow: "0 3px 10px rgba(230,74,25,0.3)", whiteSpace: "nowrap" }}>
                          {actingId === l.id ? "…" : "✓ Accept"}
                        </button>
                      )}
                      {l.status === "accepted" && (
                        <button onClick={() => handleComplete(l.id)} disabled={actingId === l.id}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", background: "linear-gradient(135deg,#2e7d32,#1b5e20)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, boxShadow: "0 3px 10px rgba(46,125,50,0.3)", whiteSpace: "nowrap" }}>
                          <CheckCircle style={{ width: 11, height: 11 }} />
                          {actingId === l.id ? "Saving…" : "Collected"}
                        </button>
                      )}
                      {l.status === "completed" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#2e7d32" }}>
                          <CheckCircle style={{ width: 12, height: 12 }} /> Done
                        </div>
                      )}
                      {l.createdAt && (
                        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#bbb" }}>
                          <Clock style={{ width: 9, height: 9 }} />
                          {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
