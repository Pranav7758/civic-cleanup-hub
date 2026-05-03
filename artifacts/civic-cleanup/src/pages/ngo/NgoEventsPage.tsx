import { useState } from "react";
import {
  useGetCommunityEvents,
  useCreateEvent,
  useRegisterForEvent,
  getGetCommunityEventsQueryKey,
} from "@workspace/api-client-react";
import {
  Calendar, MapPin, Users, Clock, Plus, CheckCircle, ChevronRight,
  X, UserCheck, Eye, Award, ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";

const TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  cleanup:    { emoji: "🧹", label: "Clean-up Drive",  color: "#1e8449", bg: "#e8f5e9" },
  awareness:  { emoji: "📢", label: "Awareness",       color: "#1a5276", bg: "#eaf2ff" },
  workshop:   { emoji: "🎓", label: "Donation Camp",   color: "#6c3483", bg: "#f5eef8" },
  plantation: { emoji: "🌱", label: "Plantation",      color: "#1e7449", bg: "#e8f8f0" },
};

function statusInfo(startsAt: string, endsAt?: string | null, localStatus?: string) {
  if (localStatus === "completed") return { label: "Completed", cls: "gov-badge gov-badge-green", emoji: "✅" };
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + 4 * 3600000;
  if (now < start)  return { label: "Upcoming",  cls: "gov-badge gov-badge-blue",   emoji: "📅" };
  if (now <= end)   return { label: "Ongoing",   cls: "gov-badge gov-badge-yellow", emoji: "🔴" };
  return              { label: "Completed",  cls: "gov-badge gov-badge-green",  emoji: "✅" };
}

const MOCK_PARTICIPANTS: Record<string, {name:string;initials:string;attended:boolean}[]> = {};

function getParticipants(eventId: string) {
  if (!MOCK_PARTICIPANTS[eventId]) {
    MOCK_PARTICIPANTS[eventId] = [
      { name: "Priya Sharma",  initials: "PS", attended: false },
      { name: "Rahul Gupta",   initials: "RG", attended: true  },
      { name: "Ananya Singh",  initials: "AS", attended: false },
    ];
  }
  return MOCK_PARTICIPANTS[eventId];
}

interface ResultForm { wasteKg: string; notes: string; totalParticipants: string; }
const BLANK_RESULT: ResultForm = { wasteKg: "", notes: "", totalParticipants: "" };

export default function NgoEventsPage() {
  const { user }  = useAuth();
  const { toast } = useToast();
  const qc        = useQueryClient();

  const [tab, setTab]                 = useState<"events"|"create">("events");
  const [filter, setFilter]           = useState<"all"|"upcoming"|"ongoing"|"completed">("all");
  const [selectedEvent, setSelected]  = useState<any>(null);
  const [localStatus, setLocalStatus] = useState<Record<string,string>>({});
  const [participants, setParticipants] = useState<Record<string, {name:string;initials:string;attended:boolean}[]>>({});
  const [showResult, setShowResult]   = useState(false);
  const [result, setResult]           = useState<ResultForm>(BLANK_RESULT);
  const [resultsSaved, setResultsSaved] = useState<Record<string,ResultForm>>({});

  const [form, setForm] = useState({
    title: "", eventType: "cleanup", location: "", startsAt: "", endsAt: "",
    description: "", maxParticipants: "", rewardPoints: "100",
  });

  const { data: eventsData, isLoading } = useGetCommunityEvents();
  const createEvent  = useCreateEvent();
  const registerEvent = useRegisterForEvent();

  const allEvents: any[] = (eventsData as any)?.data || [];
  const myEvents = allEvents.filter(e => e.organizerId === user?.id || true); // show all for demo

  const getStatus = (e: any) => statusInfo(e.startsAt, e.endsAt, localStatus[e.id]);

  const filtered = myEvents.filter(e => {
    if (filter === "all") return true;
    const s = getStatus(e).label.toLowerCase();
    return s === filter;
  });

  function getParticipantList(eventId: string) {
    if (!participants[eventId]) {
      setParticipants(p => ({ ...p, [eventId]: getParticipants(eventId) }));
    }
    return participants[eventId] || getParticipants(eventId);
  }

  function toggleAttendance(eventId: string, idx: number) {
    setParticipants(p => {
      const list = [...(p[eventId] || getParticipants(eventId))];
      list[idx] = { ...list[idx], attended: !list[idx].attended };
      return { ...p, [eventId]: list };
    });
  }

  function removeParticipant(eventId: string, idx: number) {
    setParticipants(p => {
      const list = [...(p[eventId] || getParticipants(eventId))];
      list.splice(idx, 1);
      return { ...p, [eventId]: list };
    });
    toast({ title: "Participant removed" });
  }

  function handleMarkComplete(e: any) {
    setLocalStatus(s => ({ ...s, [e.id]: "completed" }));
    setShowResult(true);
    setResult(BLANK_RESULT);
    toast({ title: "Event marked as completed!" });
  }

  function handleSaveResult() {
    if (!selectedEvent) return;
    setResultsSaved(r => ({ ...r, [selectedEvent.id]: result }));
    setShowResult(false);
    toast({ title: "Results saved!", description: `${result.wasteKg} kg waste recorded.` });
  }

  function handleCreate() {
    if (!form.title || !form.startsAt) {
      toast({ title: "Title and start date are required", variant: "destructive" }); return;
    }
    createEvent.mutate({
      data: {
        title: form.title,
        eventType: form.eventType,
        location: form.location || undefined,
        startsAt: form.startsAt,
        endsAt: form.endsAt || undefined,
        description: form.description || undefined,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        rewardPoints: Number(form.rewardPoints) || 100,
      },
    }, {
      onSuccess: () => {
        toast({ title: "Event created!", description: form.title });
        qc.invalidateQueries({ queryKey: getGetCommunityEventsQueryKey() });
        setForm({ title: "", eventType: "cleanup", location: "", startsAt: "", endsAt: "", description: "", maxParticipants: "", rewardPoints: "100" });
        setTab("events");
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  }

  function handleJoin(e: any) {
    registerEvent.mutate({ id: e.id }, {
      onSuccess: () => {
        toast({ title: "Joined!", description: `You joined "${e.title}"` });
        qc.invalidateQueries({ queryKey: getGetCommunityEventsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  }

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  /* ── EVENT DETAIL VIEW ── */
  if (selectedEvent) {
    const pList = getParticipantList(selectedEvent.id);
    const sInfo = getStatus(selectedEvent);
    const cfg   = TYPE_CONFIG[selectedEvent.eventType] || TYPE_CONFIG.cleanup;
    const saved = resultsSaved[selectedEvent.id];
    const attendedCount = pList.filter(p => p.attended).length;

    return (
      <DashboardLayout title="Event Details">
        <div style={{ ...S, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Back */}
          <button className="gov-btn gov-btn-outline" style={{ width: "fit-content", display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => { setSelected(null); setShowResult(false); }}>
            <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Events
          </button>

          {/* Event header card */}
          <div className="gov-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                  {cfg.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1c2833" }}>{selectedEvent.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span className={sInfo.cls}>{sInfo.emoji} {sInfo.label}</span>
                    <span style={{ fontSize: 11, color: "#5d6d7e" }}>{cfg.label}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sInfo.label !== "Completed" && (
                  <button className="gov-btn gov-btn-green" onClick={() => handleMarkComplete(selectedEvent)}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <CheckCircle style={{ width: 13, height: 13 }} /> Mark Completed
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 18 }} className="cd-3col">
              {[
                { icon: <Calendar style={{ width: 13, height: 13 }} />, label: "Starts", value: new Date(selectedEvent.startsAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) },
                { icon: <MapPin style={{ width: 13, height: 13 }} />, label: "Location", value: selectedEvent.location || "Not set" },
                { icon: <Users style={{ width: 13, height: 13 }} />, label: "Participants", value: `${pList.length}${selectedEvent.maxParticipants ? ` / ${selectedEvent.maxParticipants}` : ""}` },
              ].map(i => (
                <div key={i.label} style={{ background: "#f8faf8", borderRadius: 10, padding: "12px 16px", border: "1px solid #e0ece0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#5d6d7e", marginBottom: 4, fontSize: 11, fontWeight: 600 }}>
                    {i.icon}{i.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2833" }}>{i.value}</div>
                </div>
              ))}
            </div>

            {selectedEvent.description && (
              <div style={{ marginTop: 14, padding: "12px 16px", background: "#f8faf8", borderRadius: 10, border: "1px solid #e0ece0", fontSize: 13, color: "#374151" }}>
                {selectedEvent.description}
              </div>
            )}
          </div>

          {/* Event Results (if completed) */}
          {sInfo.label === "Completed" && (
            <div className="gov-card">
              <div className="gov-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Award style={{ width: 14, height: 14, color: "#1e8449" }} />
                  <span className="gov-section-title">Event Results</span>
                </div>
                {!showResult && <button className="gov-btn gov-btn-sm gov-btn-outline" onClick={() => setShowResult(true)}>
                  {saved ? "Edit Results" : "Post Results"}
                </button>}
              </div>

              {saved && !showResult ? (
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }} className="cd-3col">
                    <div className="gov-stat-card" style={{ borderLeft: "3px solid #1e8449" }}>
                      <span style={{ fontSize: 22 }}>🗑️</span>
                      <div className="gov-stat-value" style={{ color: "#1e8449" }}>{saved.wasteKg} kg</div>
                      <div className="gov-stat-label">Waste Collected</div>
                    </div>
                    <div className="gov-stat-card" style={{ borderLeft: "3px solid #1a5276" }}>
                      <span style={{ fontSize: 22 }}>👥</span>
                      <div className="gov-stat-value" style={{ color: "#1a5276" }}>{saved.totalParticipants || attendedCount}</div>
                      <div className="gov-stat-label">Total Participants</div>
                    </div>
                    <div className="gov-stat-card" style={{ borderLeft: "3px solid #b7950b" }}>
                      <span style={{ fontSize: 22 }}>✅</span>
                      <div className="gov-stat-value" style={{ color: "#b7950b" }}>{attendedCount}</div>
                      <div className="gov-stat-label">Marked Attended</div>
                    </div>
                  </div>
                  {saved.notes && <div style={{ marginTop: 12, fontSize: 13, color: "#5d6d7e" }}><b>Notes:</b> {saved.notes}</div>}
                </div>
              ) : showResult ? (
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="cd-2col">
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Waste Collected (kg)</label>
                      <input className="gov-input" type="number" placeholder="e.g. 120" value={result.wasteKg}
                        onChange={e => setResult(r => ({ ...r, wasteKg: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Total Participants</label>
                      <input className="gov-input" type="number" placeholder="e.g. 45" value={result.totalParticipants}
                        onChange={e => setResult(r => ({ ...r, totalParticipants: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Notes / Summary</label>
                    <textarea className="gov-input" rows={3} placeholder="Brief summary of the event…" value={result.notes}
                      onChange={e => setResult(r => ({ ...r, notes: e.target.value }))} style={{ resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="gov-btn gov-btn-green" onClick={handleSaveResult}>Save Results</button>
                    <button className="gov-btn gov-btn-outline" onClick={() => setShowResult(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "24px 20px", textAlign: "center", color: "#8fa98f", fontSize: 13 }}>
                  No results posted yet. Click "Post Results" to add waste collected data.
                </div>
              )}
            </div>
          )}

          {/* Participants */}
          <div className="gov-card">
            <div className="gov-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users style={{ width: 14, height: 14, color: "#1a5276" }} />
                <span className="gov-section-title">Participants ({pList.length})</span>
              </div>
              <span style={{ fontSize: 12, color: "#5d6d7e" }}>{attendedCount} attended</span>
            </div>

            {pList.length === 0 ? (
              <div style={{ padding: "28px 20px", textAlign: "center", color: "#8fa98f", fontSize: 13 }}>
                No participants yet.
              </div>
            ) : (
              <table className="gov-table">
                <thead><tr><th>Participant</th><th>Status</th><th>Attendance</th><th>Actions</th></tr></thead>
                <tbody>
                  {pList.map((p, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#1b5e20,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {p.initials}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2833" }}>{p.name}</span>
                        </div>
                      </td>
                      <td><span className="gov-badge gov-badge-green">Registered</span></td>
                      <td>
                        <button
                          onClick={() => toggleAttendance(selectedEvent.id, idx)}
                          className={p.attended ? "gov-btn gov-btn-green gov-btn-sm" : "gov-btn gov-btn-outline gov-btn-sm"}
                          style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {p.attended ? <><UserCheck style={{ width: 11, height: 11 }} /> Attended</> : "Mark Present"}
                        </button>
                      </td>
                      <td>
                        <button className="gov-btn gov-btn-sm" style={{ background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a" }}
                          onClick={() => removeParticipant(selectedEvent.id, idx)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ── MAIN LIST VIEW ── */
  return (
    <DashboardLayout title="Manage Events">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Events & Campaigns</h2>
            <div style={{ fontSize: 12, color: "#5d6d7e", marginTop: 2 }}>Create and manage your NGO's events</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["events","create"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`gov-btn gov-btn-sm ${tab === t ? "gov-btn-primary" : "gov-btn-outline"}`}>
                {t === "events" ? "📅 All Events" : "➕ Create Event"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="cd-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Total Events",   value: myEvents.length,                                             icon: "📅", color: "#1a5276" },
            { label: "Upcoming",       value: myEvents.filter(e => getStatus(e).label === "Upcoming").length,  icon: "🗓️",  color: "#ca6f1e" },
            { label: "Ongoing",        value: myEvents.filter(e => getStatus(e).label === "Ongoing").length,   icon: "🔴", color: "#c0392b" },
            { label: "Completed",      value: myEvents.filter(e => getStatus(e).label === "Completed").length, icon: "✅", color: "#1e8449" },
          ].map(s => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CREATE FORM */}
        {tab === "create" && (
          <div className="gov-card">
            <div className="gov-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Plus style={{ width: 14, height: 14, color: "#1e8449" }} />
                <span className="gov-section-title">Create New Event</span>
              </div>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="cd-2col">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Event Name *</label>
                  <input className="gov-input" placeholder="e.g. Yamuna Cleanup Drive" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Type *</label>
                  <select className="gov-input" value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}>
                    <option value="cleanup">🧹 Clean-up Drive</option>
                    <option value="awareness">📢 Awareness</option>
                    <option value="workshop">🎓 Donation Camp</option>
                    <option value="plantation">🌱 Plantation</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Location</label>
                <input className="gov-input" placeholder="e.g. Yamuna Ghat, New Delhi" value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="cd-3col">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Date & Time *</label>
                  <input className="gov-input" type="datetime-local" value={form.startsAt}
                    onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>End Date & Time</label>
                  <input className="gov-input" type="datetime-local" value={form.endsAt}
                    onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Max Participants</label>
                  <input className="gov-input" type="number" placeholder="e.g. 50" value={form.maxParticipants}
                    onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Description</label>
                <textarea className="gov-input" rows={3} placeholder="Describe the event, goals, what to bring…" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5d6d7e", display: "block", marginBottom: 4 }}>Reward Points</label>
                <input className="gov-input" type="number" placeholder="100" value={form.rewardPoints}
                  onChange={e => setForm(f => ({ ...f, rewardPoints: e.target.value }))} style={{ maxWidth: 160 }} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="gov-btn gov-btn-green" onClick={handleCreate} disabled={createEvent.isPending}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus style={{ width: 13, height: 13 }} />
                  {createEvent.isPending ? "Creating…" : "Create Event"}
                </button>
                <button className="gov-btn gov-btn-outline" onClick={() => setTab("events")}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* EVENTS LIST */}
        {tab === "events" && (
          <>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["all","upcoming","ongoing","completed"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`gov-btn gov-btn-sm ${filter === f ? "gov-btn-primary" : "gov-btn-outline"}`}
                  style={{ textTransform: "capitalize" }}>
                  {f === "all" ? "All Events" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Event cards */}
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 80, background: "#f4f6f9", borderRadius: 12, border: "1px solid #e0e6f0" }} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="gov-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1c2833", marginBottom: 6 }}>No events found</div>
                <div style={{ fontSize: 12, color: "#5d6d7e", marginBottom: 16 }}>Create your first event to get started</div>
                <button className="gov-btn gov-btn-green" onClick={() => setTab("create")}>
                  <Plus style={{ width: 13, height: 13 }} /> Create Event
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((e: any) => {
                  const sInfo = getStatus(e);
                  const cfg   = TYPE_CONFIG[e.eventType] || TYPE_CONFIG.cleanup;
                  const start = new Date(e.startsAt);
                  const pCount = (participants[e.id] || getParticipants(e.id)).length;
                  return (
                    <div key={e.id} style={{
                      background: "#fff", borderRadius: 14, border: "1.5px solid #e0ece0",
                      padding: "14px 18px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                    }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {cfg.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#1c2833" }}>{e.title}</span>
                          <span className={sInfo.cls}>{sInfo.emoji} {sInfo.label}</span>
                        </div>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#5d6d7e" }}>
                            <Clock style={{ width: 10, height: 10 }} />
                            {start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {e.location && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#5d6d7e" }}>
                              <MapPin style={{ width: 10, height: 10 }} />{e.location}
                            </span>
                          )}
                          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#5d6d7e" }}>
                            <Users style={{ width: 10, height: 10 }} />{pCount} participants
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                        {!e.isRegistered && sInfo.label === "Upcoming" && (
                          <button className="gov-btn gov-btn-sm gov-btn-outline" onClick={() => handleJoin(e)}>
                            Join
                          </button>
                        )}
                        {e.isRegistered && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1e8449" }}>
                            <CheckCircle style={{ width: 12, height: 12 }} /> Joined
                          </span>
                        )}
                        <button className="gov-btn gov-btn-sm gov-btn-primary"
                          style={{ display: "flex", alignItems: "center", gap: 4 }}
                          onClick={() => setSelected(e)}>
                          <Eye style={{ width: 11, height: 11 }} /> Manage
                          <ChevronRight style={{ width: 10, height: 10 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
