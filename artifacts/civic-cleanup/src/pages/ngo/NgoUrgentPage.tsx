import { useState } from "react";
import { AlertTriangle, Plus, Users, MapPin, Clock, CheckCircle, X, Heart, HandHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

type NeedStatus = "open" | "in_progress" | "completed";
type ResponseType = "volunteer" | "donate";

interface NeedResponse {
  userId: string;
  name: string;
  type: ResponseType;
}

interface UrgentNeed {
  id: string;
  title: string;
  description: string;
  location: string;
  required: string;
  deadline: string;
  status: NeedStatus;
  responses: NeedResponse[];
  createdAt: string;
}

const INITIAL_NEEDS: UrgentNeed[] = [
  {
    id: "u1",
    title: "Need 30 Volunteers for Yamuna Flood Cleanup",
    description: "Urgent cleanup needed along Yamuna Ghat after heavy flooding. Requires people with rubber boots and gloves. We will provide safety equipment.",
    location: "Yamuna Ghat, Delhi",
    required: "30 volunteers",
    deadline: "2026-05-08",
    status: "open",
    responses: [],
    createdAt: "2026-05-03",
  },
  {
    id: "u2",
    title: "Food & Water Support for Cleanup Workers",
    description: "Our cleanup drive workers need food and water packets for a 6-hour session starting at 8 AM. Any donation of water bottles, snacks or packed meals is welcome.",
    location: "Lajpat Nagar, Delhi",
    required: "100 food packets, 50 water bottles",
    deadline: "2026-05-06",
    status: "in_progress",
    responses: [
      { userId: "c1", name: "Priya S.", type: "donate" },
      { userId: "c2", name: "Rahul G.", type: "donate" },
    ],
    createdAt: "2026-05-02",
  },
  {
    id: "u3",
    title: "Medical Aid — First-Aid Volunteers Needed",
    description: "Need first-aid certified volunteers for our large-scale cleanup event. Basic training provided. Duration: half day.",
    location: "Rohini Sec 11, Delhi",
    required: "5 first-aid certified volunteers",
    deadline: "2026-05-12",
    status: "open",
    responses: [{ userId: "c3", name: "Dr. Ananya K.", type: "volunteer" }],
    createdAt: "2026-05-01",
  },
];

const STATUS_CONFIG: Record<NeedStatus, { label: string; cls: string; emoji: string }> = {
  open:        { label: "Open",        cls: "gov-badge gov-badge-red",    emoji: "🔴" },
  in_progress: { label: "In Progress", cls: "gov-badge gov-badge-yellow", emoji: "🟡" },
  completed:   { label: "Completed",   cls: "gov-badge gov-badge-green",  emoji: "✅" },
};

const BLANK_FORM = {
  title: "", description: "", location: "", required: "", deadline: "",
};

export default function NgoUrgentPage() {
  const { user }  = useAuth();
  const { toast } = useToast();

  const [needs, setNeeds]             = useState<UrgentNeed[]>(INITIAL_NEEDS);
  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState(BLANK_FORM);
  const [respondModal, setRespondModal] = useState<UrgentNeed | null>(null);
  const [respondType, setRespondType] = useState<ResponseType>("volunteer");
  const [filterStatus, setFilterStatus] = useState<"all" | NeedStatus>("all");

  const userName = user?.fullName || "You";
  const userInitial = userName[0]?.toUpperCase() || "U";

  const sortedNeeds = [...needs]
    .sort((a, b) => {
      if (a.status === "open" && b.status !== "open") return -1;
      if (b.status === "open" && a.status !== "open") return 1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .filter(n => filterStatus === "all" || n.status === filterStatus);

  function handleCreate() {
    if (!form.title.trim() || !form.deadline) {
      toast({ title: "Title and deadline are required", variant: "destructive" }); return;
    }
    const newNeed: UrgentNeed = {
      id: `u${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      required: form.required.trim(),
      deadline: form.deadline,
      status: "open",
      responses: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setNeeds(n => [newNeed, ...n]);
    setForm(BLANK_FORM);
    setShowCreate(false);
    toast({ title: "Urgent need posted!", description: "It will appear at the top of the list." });
  }

  function handleRespond() {
    if (!respondModal) return;
    const alreadyResponded = respondModal.responses.some(r => r.userId === (user?.id || "demo"));
    if (alreadyResponded) {
      toast({ title: "Already responded", description: "You have already responded to this need." });
      setRespondModal(null);
      return;
    }
    setNeeds(n => n.map(need =>
      need.id === respondModal.id
        ? { ...need, responses: [...need.responses, { userId: user?.id || "demo", name: userName, type: respondType }] }
        : need
    ));
    setRespondModal(null);
    toast({ title: "Response submitted!", description: `You offered to ${respondType === "volunteer" ? "volunteer" : "donate"}.` });
  }

  function handleStatusUpdate(needId: string, status: NeedStatus) {
    setNeeds(n => n.map(need => need.id === needId ? { ...need, status } : need));
    toast({ title: "Status updated!", description: STATUS_CONFIG[status].label });
  }

  function handleDelete(needId: string) {
    setNeeds(n => n.filter(need => need.id !== needId));
    toast({ title: "Urgent need removed" });
  }

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
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>Post and manage urgent volunteer/donation requests</div>
          </div>
          <button
            className="gov-btn gov-btn-red"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => setShowCreate(v => !v)}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Post Urgent Need
          </button>
        </div>

        {/* Stats */}
        <div className="cd-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Open Needs",     value: openCount,      icon: "🔴", color: "#c0392b" },
            { label: "In Progress",    value: inProgCount,    icon: "🟡", color: "#ca6f1e" },
            { label: "Completed",      value: completedCount, icon: "✅", color: "#1e8449" },
            { label: "Total Responses",value: totalResponses, icon: "🤝", color: "#1a5276" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
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
                <textarea className="gov-input" rows={3} placeholder="Describe the urgency, what is needed, how volunteers can help…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="cd-2col">
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
                <button className="gov-btn gov-btn-red" onClick={handleCreate}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle style={{ width: 13, height: 13 }} /> Post Urgent Need
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

        {/* Urgent needs list */}
        {sortedNeeds.length === 0 ? (
          <div className="gov-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙌</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1c2833", marginBottom: 6 }}>No urgent needs right now</div>
            <div style={{ fontSize: 12, color: "#5d6d7e" }}>Post a need when you require volunteers or donations</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedNeeds.map(need => {
              const sInfo = STATUS_CONFIG[need.status];
              const isOpen = need.status === "open";
              const deadlineDate = new Date(need.deadline);
              const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = isOpen && daysLeft <= 3;
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
                  {/* Priority banner for urgent */}
                  {isUrgent && (
                    <div style={{ background: "#e74c3c", padding: "6px 18px", display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertTriangle style={{ width: 12, height: 12, color: "#fff" }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: ".08em", textTransform: "uppercase" }}>
                        HIGH PRIORITY — {daysLeft <= 0 ? "DEADLINE PASSED" : `${daysLeft} DAY${daysLeft !== 1 ? "S" : ""} LEFT`}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: "16px 18px" }}>
                    {/* Top row */}
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
                      <button
                        onClick={() => handleDelete(need.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 4, flexShrink: 0 }}>
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>

                    {/* Meta chips */}
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

                    {/* Responses */}
                    {need.responses.length > 0 && (
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12, padding: "10px 14px", background: "#f8faf8", borderRadius: 10, border: "1px solid #e0ece0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Users style={{ width: 12, height: 12, color: "#1a5276" }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1a5276" }}>{volunteers.length} volunteer{volunteers.length !== 1 ? "s" : ""}</span>
                          {volunteers.slice(0, 3).map((r, i) => (
                            <span key={i} style={{ fontSize: 11, color: "#5d6d7e" }}>{r.name}{i < Math.min(volunteers.length - 1, 2) ? "," : ""}</span>
                          ))}
                          {volunteers.length > 3 && <span style={{ fontSize: 11, color: "#5d6d7e" }}>+{volunteers.length - 3} more</span>}
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

                    {/* Actions row */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {/* Help Now (citizen action) */}
                      {need.status !== "completed" && (
                        <button
                          className="gov-btn gov-btn-sm"
                          style={{ background: isUrgent ? "#e74c3c" : "#2e7d32", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 5 }}
                          onClick={() => setRespondModal(need)}>
                          <HandHeart style={{ width: 13, height: 13 }} /> Help Now
                        </button>
                      )}

                      {/* NGO status update */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {need.status !== "in_progress" && need.status !== "completed" && (
                          <button className="gov-btn gov-btn-sm gov-btn-outline" onClick={() => handleStatusUpdate(need.id, "in_progress")}>
                            → In Progress
                          </button>
                        )}
                        {need.status !== "completed" && (
                          <button className="gov-btn gov-btn-sm gov-btn-outline"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}
                            onClick={() => handleStatusUpdate(need.id, "completed")}>
                            <CheckCircle style={{ width: 11, height: 11 }} /> Mark Completed
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
                </div>
              );
            })}
          </div>
        )}

        {/* Respond Modal */}
        {respondModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
            onClick={() => setRespondModal(null)}
          >
            <div style={{
              background: "#fff", borderRadius: 16, padding: "24px", maxWidth: 400, width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1c2833" }}>Help Now</div>
                <button onClick={() => setRespondModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X style={{ width: 16, height: 16, color: "#aaa" }} />
                </button>
              </div>

              <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, marginBottom: 4 }}>{respondModal.title}</div>
              {respondModal.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5d6d7e", marginBottom: 16 }}>
                  <MapPin style={{ width: 11, height: 11 }} />{respondModal.location}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", marginBottom: 8 }}>How would you like to help?</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["volunteer","donate"] as ResponseType[]).map(type => (
                    <button key={type} onClick={() => setRespondType(type)}
                      style={{
                        flex: 1, padding: "12px 8px", borderRadius: 10,
                        border: `2px solid ${respondType === type ? "#1b5e20" : "#e0ece0"}`,
                        background: respondType === type ? "#e8f5e9" : "#fff",
                        cursor: "pointer", textAlign: "center",
                        transition: "all .15s",
                      }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{type === "volunteer" ? "🙋" : "❤️"}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: respondType === type ? "#1b5e20" : "#5d6d7e" }}>
                        {type === "volunteer" ? "Volunteer" : "Donate"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="gov-btn gov-btn-green" style={{ flex: 1 }} onClick={handleRespond}>
                  Confirm Response
                </button>
                <button className="gov-btn gov-btn-outline" onClick={() => setRespondModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
