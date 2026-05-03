import { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, MapPin, Clock, Users, Heart, X, HandHeart, Phone, Home, Camera } from "lucide-react";
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
  responses: { userId: string; name: string; type: "volunteer" | "donate"; mobile?: string; address?: string }[];
  ngoId: string;
  ngoName: string;
  createdAt: string;
}

interface RespondForm {
  type: "volunteer" | "donate";
  name: string;
  mobile: string;
  address: string;
  message: string;
  photoDataUrl: string;
}

const BLANK_FORM = (fullName: string): RespondForm => ({
  type: "volunteer",
  name: fullName,
  mobile: "",
  address: "",
  message: "",
  photoDataUrl: "",
});

export default function CitizenUrgentNeedsPage() {
  const { token, user } = useAuth();
  const { toast }       = useToast();
  const photoInputRef   = useRef<HTMLInputElement>(null);

  const [needs, setNeeds]             = useState<UrgentNeed[]>([]);
  const [loading, setLoading]         = useState(true);
  const [respondModal, setRespondModal] = useState<UrgentNeed | null>(null);
  const [form, setForm]               = useState<RespondForm>(BLANK_FORM(""));
  const [submitting, setSubmitting]   = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress">("all");
  const [step, setStep]               = useState<1 | 2>(1);

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

  function openModal(need: UrgentNeed) {
    setRespondModal(need);
    setForm(BLANK_FORM(user?.fullName || ""));
    setStep(1);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photoDataUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleRespond() {
    if (!respondModal) return;
    if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    if (!form.mobile.trim()) { toast({ title: "Mobile number is required", variant: "destructive" }); return; }
    if (!form.address.trim()) { toast({ title: "Address is required", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/urgent-needs/${respondModal.id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: form.type,
          name: form.name,
          mobile: form.mobile,
          address: form.address,
          message: form.message,
          photoDataUrl: form.photoDataUrl,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Failed");
      }
      toast({ title: "Response submitted!", description: `You offered to ${form.type === "volunteer" ? "volunteer" : "donate"}. +20 pts added!` });
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

  const openCount   = needs.filter(n => n.status === "open").length;
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
                <div style={{ fontSize: 17, fontWeight: 900 }}>NGOs Need Your Help</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>
                  Volunteer or donate to help local NGOs
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{openCount}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Open Requests</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{myResponses}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>My Help</div>
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
            <div style={{ fontSize: 12, color: "#7d8fa0", marginTop: 4 }}>Check back soon — NGOs post when they need help</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(need => {
              const deadlineDate = new Date(need.deadline);
              const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = need.status === "open" && daysLeft <= 3;
              const alreadyResponded = need.responses.some(r => r.userId === user?.id);
              const volunteers = need.responses.filter(r => r.type === "volunteer");
              const donors     = need.responses.filter(r => r.type === "donate");

              return (
                <div key={need.id} style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: `1.5px solid ${isUrgent ? "#ef9a9a" : "#e0ece0"}`,
                  boxShadow: isUrgent ? "0 4px 20px rgba(231,76,60,0.1)" : "0 4px 16px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}>
                  {isUrgent && (
                    <div style={{ background: "linear-gradient(90deg,#c62828,#e53935)", padding: "6px 18px", display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertTriangle style={{ width: 12, height: 12, color: "#fff" }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: ".08em", textTransform: "uppercase" }}>
                        HIGH PRIORITY — {daysLeft <= 0 ? "DEADLINE PASSED" : `${daysLeft} DAY${daysLeft !== 1 ? "S" : ""} LEFT`}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: "16px 18px" }}>
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

                    {alreadyResponded ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#2e7d32", padding: "8px 0" }}>
                        ✅ You've responded — thank you!
                      </div>
                    ) : (
                      <button
                        onClick={() => openModal(need)}
                        style={{
                          width: "100%", padding: "11px 16px",
                          background: isUrgent ? "linear-gradient(135deg,#c62828,#e53935)" : "linear-gradient(135deg,#1b5e20,#2e7d32)",
                          color: "#fff", border: "none", borderRadius: 12,
                          cursor: "pointer", fontSize: 13, fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          boxShadow: isUrgent ? "0 4px 16px rgba(198,40,40,0.3)" : "0 4px 16px rgba(27,94,32,0.3)",
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

        {/* ── Help Now modal — full form ── */}
        {respondModal && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setRespondModal(null)}
          >
            <div
              style={{ background: "#fff", borderRadius: 22, maxWidth: 480, width: "100%", boxShadow: "0 28px 72px rgba(0,0,0,0.35)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid #f0f0f0" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#1c2833" }}>Help Now — Confirm your details</div>
                  <div style={{ fontSize: 11, color: "#7d8fa0", marginTop: 2 }}>{respondModal.title}</div>
                </div>
                <button onClick={() => setRespondModal(null)} style={{ background: "#f5f5f5", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                  <X style={{ width: 15, height: 15, color: "#888" }} />
                </button>
              </div>

              {/* Step indicator */}
              <div style={{ display: "flex", padding: "10px 22px", gap: 6 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? "#c62828" : "#e0e0e0", transition: "background .2s" }} />
                ))}
              </div>

              <div className="dash-scroll" style={{ overflowY: "auto", padding: "0 22px 18px", flex: 1 }}>

                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "#fef9f9", borderRadius: 12, padding: "10px 14px", border: "1px solid #ef9a9a", fontSize: 12, color: "#b71c1c" }}>
                      📍 <b>{respondModal.location || "Location not specified"}</b> &nbsp;·&nbsp; Deadline: {new Date(respondModal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                    </div>

                    {/* How you'll help */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", marginBottom: 8 }}>How would you like to help?</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {(["volunteer", "donate"] as const).map(type => (
                          <button key={type}
                            onClick={() => setForm(f => ({ ...f, type }))}
                            style={{
                              flex: 1, padding: "14px 8px", borderRadius: 14,
                              border: `2px solid ${form.type === type ? "#c62828" : "#e0e0e0"}`,
                              background: form.type === type ? "#fff5f5" : "#fff",
                              cursor: "pointer", textAlign: "center",
                            }}>
                            <div style={{ fontSize: 26, marginBottom: 5 }}>{type === "volunteer" ? "🙋" : "❤️"}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: form.type === type ? "#c62828" : "#5d6d7e" }}>
                              {type === "volunteer" ? "Volunteer" : "Donate"}
                            </div>
                            <div style={{ fontSize: 10, color: "#9e9e9e", marginTop: 2 }}>
                              {type === "volunteer" ? "Give your time" : "Give resources"}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 5 }}>Your Name *</label>
                      <input
                        className="gov-input"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>

                    {/* Mobile */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone style={{ width: 11, height: 11 }} /> Mobile Number *
                      </div>
                      <input
                        className="gov-input"
                        type="tel"
                        value={form.mobile}
                        onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                        placeholder="e.g. 98765 43210"
                        maxLength={15}
                      />
                    </div>

                    <button
                      className="gov-btn gov-btn-primary"
                      onClick={() => {
                        if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
                        if (!form.mobile.trim()) { toast({ title: "Mobile number is required", variant: "destructive" }); return; }
                        setStep(2);
                      }}
                      style={{ width: "100%", padding: "12px" }}>
                      Continue →
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Address */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                        <Home style={{ width: 11, height: 11 }} /> Your Address *
                      </div>
                      <textarea
                        className="gov-input"
                        rows={3}
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="House / flat no., street, area, city"
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    {/* Photo */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                        <Camera style={{ width: 11, height: 11 }} /> Upload a Photo <span style={{ fontWeight: 400, color: "#9e9e9e", marginLeft: 2 }}>(optional)</span>
                      </div>
                      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                      {form.photoDataUrl ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img src={form.photoDataUrl} alt="preview" style={{ height: 100, borderRadius: 10, objectFit: "cover", border: "2px solid #c62828" }} />
                          <button
                            onClick={() => setForm(f => ({ ...f, photoDataUrl: "" }))}
                            style={{ position: "absolute", top: 4, right: 4, background: "#c62828", border: "none", borderRadius: "50%", padding: 3, cursor: "pointer" }}>
                            <X style={{ width: 10, height: 10, color: "#fff" }} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          style={{ width: "100%", padding: "20px", border: "2px dashed #e0e0e0", borderRadius: 12, background: "#fafafa", cursor: "pointer", fontSize: 13, color: "#9e9e9e", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <Camera style={{ width: 16, height: 16 }} /> Click to add a photo
                        </button>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 5 }}>Message to NGO <span style={{ fontWeight: 400, color: "#9e9e9e" }}>(optional)</span></label>
                      <textarea
                        className="gov-input"
                        rows={2}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Any additional info or specific skills you can offer…"
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    {/* Points reward */}
                    <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#2e7d32" }}>
                      <b>+20 points</b> will be added to your wallet for helping!
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="gov-btn gov-btn-outline" onClick={() => setStep(1)} style={{ padding: "12px 18px" }}>← Back</button>
                      <button
                        className="gov-btn gov-btn-green"
                        style={{ flex: 1, padding: "12px" }}
                        onClick={handleRespond}
                        disabled={submitting}>
                        {submitting ? "Submitting…" : "✅ Confirm — I'll Help!"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
