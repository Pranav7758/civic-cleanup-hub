import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, MapPin, Clock, Users, Heart, X, HandHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

interface UrgentNeed {
  id: string;
  title: string;
  description: string;
  location: string;
  required: string;
  deadline: string;
  status: "open" | "in_progress" | "completed";
  responses: { userId: string; name: string; type: "volunteer" | "donate" }[];
  ngoId: string;
  ngoName: string;
  createdAt: string;
}

export default function CitizenUrgentNeedsPage() {
  const { token, user } = useAuth();
  const { toast }       = useToast();

  const [needs, setNeeds]             = useState<UrgentNeed[]>([]);
  const [loading, setLoading]         = useState(true);
  const [respondModal, setRespondModal] = useState<UrgentNeed | null>(null);
  const [respondType, setRespondType] = useState<"volunteer" | "donate">("volunteer");
  const [submitting, setSubmitting]   = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress">("all");

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

  async function handleRespond() {
    if (!respondModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/urgent-needs/${respondModal.id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: respondType, name: user?.fullName || "Volunteer" }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Failed");
      }
      toast({ title: "Response submitted!", description: `You offered to ${respondType === "volunteer" ? "volunteer" : "donate"}.` });
      setRespondModal(null);
      fetchNeeds();
    } catch (err: any) {
      toast({ title: err.message || "Failed to respond", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = needs.filter(n => {
    if (filterStatus === "all") return n.status !== "completed";
    return n.status === filterStatus;
  });

  const openCount = needs.filter(n => n.status === "open").length;
  const myResponses = needs.filter(n => n.responses.some(r => r.userId === user?.id)).length;

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="Help NGOs">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg,#b71c1c,#c62828,#e53935)", borderRadius: 20, padding: "22px 28px", color: "#fff", boxShadow: "0 10px 32px rgba(183,28,28,0.3)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                🚨
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 900 }}>NGO Urgent Needs</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>
                  Help local NGOs with volunteers or donations
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{openCount}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Open Needs</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{myResponses}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>My Responses</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>+20</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Points per help</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "all",         label: "All Active" },
            { key: "open",        label: "🔴 Urgent" },
            { key: "in_progress", label: "🟡 In Progress" },
          ].map(f => (
            <button key={f.key}
              onClick={() => setFilterStatus(f.key as any)}
              className={`gov-btn gov-btn-sm ${filterStatus === f.key ? "gov-btn-primary" : "gov-btn-outline"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 130, background: "#f4f6f9", borderRadius: 16, border: "1px solid #e0e6f0" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "52px 24px", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🙌</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1c2833" }}>No urgent needs right now</div>
            <div style={{ fontSize: 12, color: "#7d8fa0", marginTop: 4 }}>Come back later — NGOs post urgent needs when they need help</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(need => {
              const deadlineDate = new Date(need.deadline);
              const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = need.status === "open" && daysLeft <= 3;
              const alreadyResponded = need.responses.some(r => r.userId === user?.id);
              const volunteers = need.responses.filter(r => r.type === "volunteer");
              const donors = need.responses.filter(r => r.type === "donate");

              return (
                <div key={need.id} style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: `1.5px solid ${isUrgent ? "#ef9a9a" : "#e0ece0"}`,
                  boxShadow: isUrgent ? "0 4px 20px rgba(231,76,60,0.1)" : "0 4px 16px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  transition: "transform .2s ease, box-shadow .2s ease",
                }}>
                  {/* Urgent banner */}
                  {isUrgent && (
                    <div style={{ background: "linear-gradient(90deg,#c62828,#e53935)", padding: "6px 18px", display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertTriangle style={{ width: 12, height: 12, color: "#fff" }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: ".08em", textTransform: "uppercase" }}>
                        HIGH PRIORITY — {daysLeft <= 0 ? "DEADLINE PASSED" : `${daysLeft} DAY${daysLeft !== 1 ? "S" : ""} LEFT`}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: "16px 18px" }}>
                    {/* Title + NGO */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#1c2833" }}>{need.title}</span>
                        {need.status === "in_progress" && <span className="gov-badge gov-badge-yellow" style={{ fontSize: 10 }}>🟡 In Progress</span>}
                        {need.status === "open" && !isUrgent && <span className="gov-badge gov-badge-red" style={{ fontSize: 10 }}>Open</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#7d8fa0", fontWeight: 600 }}>by {need.ngoName}</div>
                    </div>

                    {need.description && (
                      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55, marginBottom: 10 }}>{need.description}</div>
                    )}

                    {/* Meta */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                      {need.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#5d6d7e" }}>
                          <MapPin style={{ width: 11, height: 11 }} />{need.location}
                        </span>
                      )}
                      {need.required && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#1565c0", background: "#e3f2fd", borderRadius: 999, padding: "2px 9px" }}>
                          <Users style={{ width: 11, height: 11 }} />{need.required}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: isUrgent ? "#c62828" : "#5d6d7e", fontWeight: isUrgent ? 700 : 400 }}>
                        <Clock style={{ width: 11, height: 11 }} />
                        Deadline: {deadlineDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>

                    {/* Response count */}
                    {need.responses.length > 0 && (
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12, padding: "8px 12px", background: "#f8faf8", borderRadius: 10, border: "1px solid #e0ece0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#1b5e20" }}>
                          <Users style={{ width: 11, height: 11 }} /> {volunteers.length} volunteer{volunteers.length !== 1 ? "s" : ""}
                        </span>
                        {donors.length > 0 && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#6a1b9a" }}>
                            <Heart style={{ width: 11, height: 11 }} /> {donors.length} donor{donors.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Help Now button */}
                    {alreadyResponded ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#2e7d32", padding: "8px 0" }}>
                        ✅ You've responded — thank you!
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondModal(need)}
                        style={{
                          width: "100%", padding: "11px 16px",
                          background: isUrgent ? "linear-gradient(135deg,#c62828,#e53935)" : "linear-gradient(135deg,#1b5e20,#2e7d32)",
                          color: "#fff", border: "none", borderRadius: 12,
                          cursor: "pointer", fontSize: 13, fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          boxShadow: isUrgent ? "0 4px 16px rgba(198,40,40,0.3)" : "0 4px 16px rgba(27,94,32,0.3)",
                          transition: "transform .2s ease",
                        }}>
                        <HandHeart style={{ width: 16, height: 16 }} />
                        Help Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Respond modal */}
        {respondModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setRespondModal(null)}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", maxWidth: 400, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1c2833" }}>How would you like to help?</div>
                <button onClick={() => setRespondModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X style={{ width: 16, height: 16, color: "#aaa" }} />
                </button>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 2 }}>{respondModal.title}</div>
              {respondModal.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7d8fa0", marginBottom: 18 }}>
                  <MapPin style={{ width: 11, height: 11 }} />{respondModal.location}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                {(["volunteer","donate"] as const).map(type => (
                  <button key={type}
                    onClick={() => setRespondType(type)}
                    style={{
                      flex: 1, padding: "16px 8px", borderRadius: 14,
                      border: `2px solid ${respondType === type ? "#2e7d32" : "#e0ece0"}`,
                      background: respondType === type ? "#e8f5e9" : "#fff",
                      cursor: "pointer", textAlign: "center", transition: "all .15s",
                    }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{type === "volunteer" ? "🙋" : "❤️"}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: respondType === type ? "#1b5e20" : "#5d6d7e" }}>
                      {type === "volunteer" ? "Volunteer" : "Donate"}
                    </div>
                    <div style={{ fontSize: 10, color: "#7d8fa0", marginTop: 2 }}>
                      {type === "volunteer" ? "Give your time" : "Give resources"}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#2e7d32", marginBottom: 16 }}>
                <b>+20 points</b> will be added to your wallet for helping!
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="gov-btn gov-btn-green"
                  style={{ flex: 1 }}
                  onClick={handleRespond}
                  disabled={submitting}>
                  {submitting ? "Submitting…" : "Confirm — I'll Help!"}
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
