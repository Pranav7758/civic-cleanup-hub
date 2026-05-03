import { useState } from "react";
import { Heart, MapPin, CheckCircle, Filter, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/ngo.css";

const CATS = [
  { value: "all",         label: "All",         emoji: "📋" },
  { value: "clothes",     label: "Clothes",     emoji: "👗" },
  { value: "food",        label: "Food",        emoji: "🍱" },
  { value: "electronics", label: "Electronics", emoji: "📱" },
  { value: "furniture",   label: "Furniture",   emoji: "🪑" },
  { value: "books",       label: "Books",       emoji: "📚" },
  { value: "other",       label: "Other",       emoji: "📦" },
];

const STATUS_TABS = [
  { value: "pending",   label: "Pending",   cls: "gov-badge gov-badge-yellow" },
  { value: "scheduled", label: "Scheduled", cls: "gov-badge gov-badge-blue"   },
  { value: "completed", label: "Completed", cls: "gov-badge gov-badge-green"  },
];

const CAT_BG: Record<string, string> = {
  clothes:     "linear-gradient(135deg,#f3e5f5,#e1bee7)",
  food:        "linear-gradient(135deg,#fff3e0,#ffe0b2)",
  electronics: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
  furniture:   "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
  books:       "linear-gradient(135deg,#fce4ec,#f8bbd0)",
  other:       "linear-gradient(135deg,#f5f5f5,#e8e8e8)",
};

export default function NgoDonationsPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [catFilter, setCatFilter]       = useState("all");
  const [statusTab, setStatusTab]       = useState("pending");
  const [donations, setDonations]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [fetched, setFetched]           = useState(false);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  async function fetchDonations() {
    setLoading(true);
    try {
      const res = await fetch(`/api/donations?status=${statusTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setDonations(json.data || []);
      setFetched(true);
    } catch {
      toast({ title: "Failed to load donations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Fetch when status tab changes
  const [lastTab, setLastTab] = useState("");
  if (statusTab !== lastTab) {
    setLastTab(statusTab);
    setFetched(false);
    fetchDonations();
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/donations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, rewardPoints: 60 }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: status === "scheduled" ? "Pickup scheduled! Donor notified." : "Donation completed! Donor rewarded 60 pts." });
      fetchDonations();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = catFilter === "all" ? donations : donations.filter(d => d.category === catFilter);

  const counts = CATS.slice(1).reduce((acc, c) => {
    acc[c.value] = donations.filter(d => d.category === c.value).length;
    return acc;
  }, {} as Record<string, number>);

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Donations">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Donation Management</h2>
            <div style={{ fontSize: 12, color: "#7d8fa0", marginTop: 3 }}>
              Citizens donate items — schedule pickup and mark completion to reward them
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e8f5e9", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#2e7d32" }}>
            <Heart style={{ width: 14, height: 14 }} /> Live donations from citizens
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_TABS.map(t => (
            <button key={t.value}
              onClick={() => setStatusTab(t.value)}
              className={`gov-btn gov-btn-sm ${statusTab === t.value ? "gov-btn-primary" : "gov-btn-outline"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Category filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#7d8fa0" }}>
            <Filter style={{ width: 12, height: 12 }} /> Filter:
          </div>
          {CATS.map(c => {
            const count = c.value === "all" ? donations.length : (counts[c.value] || 0);
            return (
              <button key={c.value}
                onClick={() => setCatFilter(c.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                  borderRadius: 999, border: `1.5px solid ${catFilter === c.value ? "#2e7d32" : "#d0e8d0"}`,
                  background: catFilter === c.value ? "#e8f5e9" : "#fff",
                  cursor: "pointer", fontSize: 12, fontWeight: catFilter === c.value ? 700 : 500,
                  color: catFilter === c.value ? "#1b5e20" : "#374151",
                  transition: "all .15s",
                }}>
                <span style={{ fontSize: 14 }}>{c.emoji}</span>
                {c.label}
                {count > 0 && (
                  <span style={{ background: catFilter === c.value ? "#2e7d32" : "#e0ece0", color: catFilter === c.value ? "#fff" : "#2e7d32", borderRadius: 999, padding: "0 6px", fontSize: 10, fontWeight: 700 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Donation list */}
        <div className="ngo-section">
          <div className="ngo-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Heart style={{ width: 15, height: 15, color: "#e91e63" }} />
              <span className="ngo-section-title">
                {STATUS_TABS.find(t => t.value === statusTab)?.label} Donations
              </span>
            </div>
            <span className="gov-badge gov-badge-yellow">{filtered.length} items</span>
          </div>

          {loading ? (
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 72, background: "#f4f6f9", borderRadius: 14, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 42, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2833" }}>
                {catFilter === "all" ? `No ${statusTab} donations` : `No ${statusTab} ${catFilter} donations`}
              </div>
              <div style={{ fontSize: 12, color: "#7d8fa0", marginTop: 4 }}>
                {statusTab === "pending" ? "Citizens will appear here when they submit donations" : "Nothing here yet"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filtered.map((d: any) => {
                const cat = CATS.find(c => c.value === d.category) || CATS[CATS.length - 1];
                const timeAgo = (() => {
                  const ms = Date.now() - new Date(d.createdAt).getTime();
                  const m = Math.floor(ms / 60000);
                  if (m < 60) return `${m} min ago`;
                  const h = Math.floor(m / 60);
                  if (h < 24) return `${h} hr ago`;
                  return `${Math.floor(h / 24)} days ago`;
                })();

                return (
                  <div key={d.id} className="ngo-item-row">
                    {/* Category icon */}
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: CAT_BG[d.category] || CAT_BG.other, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
                      {cat.emoji}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#1c2833", textTransform: "capitalize" }}>
                          {cat.label}
                        </span>
                        <span className={STATUS_TABS.find(t => t.value === d.status)?.cls || "gov-badge gov-badge-yellow"} style={{ fontSize: 10 }}>
                          {d.status}
                        </span>
                      </div>

                      {d.description && (
                        <div style={{ fontSize: 12, color: "#374151", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.description}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {d.citizenName && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7d8fa0" }}>
                            <User style={{ width: 10, height: 10 }} />{d.citizenName}
                          </span>
                        )}
                        {d.address && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7d8fa0" }}>
                            <MapPin style={{ width: 10, height: 10 }} />{d.address}
                          </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7d8fa0" }}>
                          <Clock style={{ width: 10, height: 10 }} />{timeAgo}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      {d.status === "pending" && (
                        <button
                          className="gov-btn gov-btn-xs gov-btn-primary"
                          onClick={() => updateStatus(d.id, "scheduled")}
                          disabled={updatingId === d.id}
                          style={{ whiteSpace: "nowrap" }}>
                          📅 Schedule Pickup
                        </button>
                      )}
                      {(d.status === "pending" || d.status === "scheduled") && (
                        <button
                          className="gov-btn gov-btn-xs gov-btn-green"
                          onClick={() => updateStatus(d.id, "completed")}
                          disabled={updatingId === d.id}
                          style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                          <CheckCircle style={{ width: 10, height: 10 }} />
                          {updatingId === d.id ? "Saving…" : "Mark Collected"}
                        </button>
                      )}
                      {d.status === "completed" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#2e7d32" }}>
                          <CheckCircle style={{ width: 12, height: 12 }} /> Collected
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info box */}
        <div style={{ background: "linear-gradient(135deg,#e8f5e9,#f1f8e9)", borderRadius: 14, padding: "14px 18px", border: "1px solid #c8e6c9", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1b5e20", marginBottom: 3 }}>How it works</div>
            <div style={{ fontSize: 11, color: "#2e7d32", lineHeight: 1.6 }}>
              Citizens submit donations from their app → they appear here as <b>Pending</b>.<br />
              Schedule a pickup → citizen is notified. Mark as Collected → citizen earns <b>+60 points</b>.
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
