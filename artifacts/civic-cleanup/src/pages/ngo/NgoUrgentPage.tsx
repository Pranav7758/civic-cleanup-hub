import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Plus, Users, MapPin, Clock, CheckCircle, X, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

type NeedStatus = "open" | "in_progress" | "completed";

interface UrgentNeed {
  id: string;
  title: string;
  description: string;
  location: string;
  required: string;
  deadline: string;
  status: NeedStatus;
  responses: { userId: string; name: string; type: "volunteer" | "donate" }[];
  ngoId: string;
  ngoName: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<NeedStatus, { label: string; cls: string; emoji: string }> = {
  open:        { label: "Open",        cls: "gov-badge gov-badge-red",    emoji: "🔴" },
  in_progress: { label: "In Progress", cls: "gov-badge gov-badge-yellow", emoji: "🟡" },
  completed:   { label: "Completed",   cls: "gov-badge gov-badge-green",  emoji: "✅" },
};

const BLANK_FORM = { title: "", description: "", location: "", required: "", deadline: "" };

export default function NgoUrgentPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [needs, setNeeds]           = useState<UrgentNeed[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState(BLANK_FORM);
  const [creating, setCreating]     = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | NeedStatus>("all");

  const fetchNeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/urgent-needs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setNeeds(json.data || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchNeeds(); }, [fetchNeeds]);

  async function handleCreate() {
    if (!form.title.trim() || !form.deadline) {
      toast({ title: "Title and deadline are required", variant: "destructive" }); return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/urgent-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Urgent need posted!", description: "Citizens can now see and respond to it." });
      setForm(BLANK_FORM);
      setShowCreate(false);
      fetchNeeds();
    } catch {
      toast({ title: "Failed to post", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusUpdate(id: string, status: NeedStatus) {
    setUpdatingId(id);
    try {
      await fetch(`/api/urgent-needs/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      toast({ title: `Status updated to: ${STATUS_CONFIG[status].label}` });
      fetchNeeds();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/urgent-needs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Urgent need removed" });
      fetchNeeds();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

  const sortedNeeds = [...needs]
    .filter(n => filterStatus === "all" || n.status === filterStatus);

  const openCount      = needs.filter(n => n.status === "open").length;
  const inProgCount    = needs.filter(n => n.status === "in_progress").length;
  const completedCount = needs.filter(n => n.status === "completed").length;
  const totalResponses = needs.reduce((sum, n) => sum + n.responses.length, 0);

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Urgent Needs">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Urgent Needs</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>
              Post urgent needs — citizens will see them and respond in real-time
            </div>
          </div>
          <button className="gov-btn gov-btn-red" style={{ display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => setShowCreate(v => !v)}>
            <Plus style={{ width: 13, height: 13 }} /> Post Urgent Need
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Open Needs",      value: openCount,      icon: "🔴", color: "#c0392b" },
            { label: "In Progress",     value: inProgCount,    icon: "🟡", color: "#ca6f1e" },
            { label: "Completed",       value: completedCount, icon: "✅", color: "#1e8449" },
            { label: "Total Responses", value: totalResponses, icon: "🤝", color: "#1a5276" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#e8f5e9", borderRadius: 10, border: "1px solid #c8e6c9", fontSize: 12, fontWeight: 600, color: "#2e7d32" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2e7d32", display: "inline-block", boxShadow: "0 0 6px #2e7d32" }} />
          Live — Citizens can see and respond to your posted needs from their "Help NGOs" section
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="gov-card" style={{ border: "2px solid #e74c3c" }}>
            <div className="gov-card-header" style={{ background: "#fff5f5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle style={{ width: 14, height: 14, color: "#c0392b" }} />
                <span className="gov-section-title" style={{ color: "#c0392b" }}>Post Urgent Need</span>
              </div>
              <button className="gov-btn gov-btn-sm gov-btn-outline" onClick={() => setShowCreate(false)}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Title * (be specific)</label>
                <input className="gov-input" placeholder="e.g. Need volunteers for cleanup" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Description</label>
                <textarea className="gov-input" rows={3} placeholder="Describe the urgency, what is needed, how citizens can help…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Location</label>
                  <input className="gov-input" placeholder="e.g. Yamuna Ghat, Delhi" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Required People / Items</label>
                  <input className="gov-input" placeholder="e.g. 20 volunteers / 100 food packets" value={form.required}
                    onChange={e => setForm(f => ({ ...f, required: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Deadline *</label>
                <input className="gov-input" type="date" value={form.deadline} style={{ maxWidth: 200 }}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gov-btn gov-btn-red" onClick={handleCreate} disabled={creating}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle style={{ width: 13, height: 13 }} />
                  {creating ? "Posting…" : "Post Urgent Need"}
                </button>
                <button className="gov-btn gov-btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {([
            { key: "all",         label: "All" },
            { key: "open",        label: "🔴 Open" },
            { key: "in_progress", label: "🟡 In Progress" },
            { key: "completed",   label: "✅ Completed" },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={`gov-btn gov-btn-sm ${filterStatus === f.key ? "gov-btn-primary" : "gov-btn-outline"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 120, background: "#f4f6f9", borderRadius: 14, border: "1px solid #e0e6f0" }} />)}
          </div>
        ) : sortedNeeds.length === 0 ? (
          <div className="gov-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙌</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1c2833", marginBottom: 6 }}>No urgent needs right now</div>
            <div style={{ fontSize: 12, color: "#5d6d7e" }}>Post a need when you require volunteers or donations</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedNeeds.map(need => {
              const sInfo      = STATUS_CONFIG[need.status];
              const isOpen     = need.status === "open";
              const deadlineDate = new Date(need.deadline);
              const daysLeft   = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent   = isOpen && daysLeft <= 3;
              const volunteers = need.responses.filter(r => r.type === "volunteer");
              const donors     = need.responses.filter(r => r.type === "donate");

              return (
                <div key={need.id} style={{
                  background: isUrgent ? "#fff5f5" : "#fff",
                  borderRadius: 14,
                  border: `1.5px solid ${isUrgent ? "#e74c3c" : "#e0ece0"}`,
                  boxShadow: isUrgent ? "0 2px 8px rgba(231,76,60,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}>
                  {isUrgent && (
                    <div style={{ background: "#e74c3c", padding: "6px 18px", display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertTriangle style={{ width: 12, height: 12, color: "#fff" }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: ".08em", textTransform: "uppercase" }}>
                        HIGH PRIORITY — {daysLeft <= 0 ? "DEADLINE PASSED" : `${daysLeft} DAY${daysLeft !== 1 ? "S" : ""} LEFT`}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "#1c2833" }}>{need.title}</span>
                          <span className={sInfo.cls}>{sInfo.emoji} {sInfo.label}</span>
                        </div>
                        {need.description && (
                          <div style={{ fontSize: 12, color: "#5d6d7e", lineHeight: 1.5, marginBottom: 8 }}>{need.description}</div>
                        )}
                      </div>
                      <button onClick={() => handleDelete(need.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 4, flexShrink: 0 }}>
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                      {need.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5d6d7e" }}>
                          <MapPin style={{ width: 11, height: 11 }} />{need.location}
                        </span>
                      )}
                      {need.required && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#1a5276", fontWeight: 600, background: "#eaf2ff", borderRadius: 999, padding: "2px 8px" }}>
                          <Users style={{ width: 11, height: 11 }} />{need.required}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: isUrgent ? "#c0392b" : "#5d6d7e", fontWeight: isUrgent ? 700 : 400 }}>
                        <Clock style={{ width: 11, height: 11 }} />
                        Deadline: {deadlineDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {need.responses.length > 0 && (
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12, padding: "10px 14px", background: "#f8faf8", borderRadius: 10, border: "1px solid #e0ece0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Users style={{ width: 12, height: 12, color: "#1a5276" }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1a5276" }}>{volunteers.length} volunteer{volunteers.length !== 1 ? "s" : ""}</span>
                          {volunteers.slice(0, 3).map((r, i) => (
                            <span key={i} style={{ fontSize: 11, color: "#5d6d7e" }}>{r.name}{i < Math.min(volunteers.length - 1, 2) ? "," : ""}</span>
                          ))}
                        </div>
                        {donors.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Heart style={{ width: 12, height: 12, color: "#6c3483" }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#6c3483" }}>{donors.length} donor{donors.length !== 1 ? "s" : ""}</span>
                            {donors.slice(0, 2).map((r, i) => (
                              <span key={i} style={{ fontSize: 11, color: "#5d6d7e" }}>{r.name}{i < Math.min(donors.length - 1, 1) ? "," : ""}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* NGO status controls only */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {need.status !== "in_progress" && need.status !== "completed" && (
                        <button className="gov-btn gov-btn-sm gov-btn-outline"
                          disabled={updatingId === need.id}
                          onClick={() => handleStatusUpdate(need.id, "in_progress")}>
                          → Mark In Progress
                        </button>
                      )}
                      {need.status !== "completed" && (
                        <button className="gov-btn gov-btn-sm gov-btn-outline"
                          style={{ display: "flex", alignItems: "center", gap: 4 }}
                          disabled={updatingId === need.id}
                          onClick={() => handleStatusUpdate(need.id, "completed")}>
                          <CheckCircle style={{ width: 11, height: 11 }} />
                          {updatingId === need.id ? "Saving…" : "Mark Completed"}
                        </button>
                      )}
                      {need.status === "completed" && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1e8449" }}>
                          <CheckCircle style={{ width: 13, height: 13 }} /> Resolved — Thank you!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
