import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetNgoDashboard, useUpdateDonation, useCreateFeedPost,
  getGetNgoDashboardQueryKey, getGetCommunityFeedQueryKey,
} from "@workspace/api-client-react";
import {
  Heart, Users, Calendar, AlertTriangle, MapPin, CheckCircle,
  Plus, Camera, Upload, ChevronRight, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/ngo.css";

/* ─── Mock photo gallery (donation impact) ─── */
const IMPACT_PHOTOS = [
  { id: 1, emoji: "🍱", bg: "linear-gradient(135deg,#e65100,#ff8f00)", caption: "50 meals distributed to flood victims", loc: "Yamuna Ghat, Delhi", date: "Apr 28" },
  { id: 2, emoji: "👗", bg: "linear-gradient(135deg,#6a1b9a,#ab47bc)", caption: "Clothing donated to 30 families", loc: "Rohini Sec 11, Delhi", date: "Apr 22" },
  { id: 3, emoji: "📚", bg: "linear-gradient(135deg,#1565c0,#42a5f5)", caption: "Books & stationery to school kids", loc: "DPS RK Puram, Delhi", date: "Apr 15" },
  { id: 4, emoji: "🧴", bg: "linear-gradient(135deg,#2e7d32,#66bb6a)", caption: "Hygiene kits for 80 people", loc: "Lajpat Nagar", date: "Apr 10" },
  { id: 5, emoji: "🫙", bg: "linear-gradient(135deg,#b71c1c,#ef5350)", caption: "Dry ration for 25 families", loc: "Okhla Phase 2", date: "Apr 5" },
  { id: 6, emoji: "💊", bg: "linear-gradient(135deg,#004d40,#26a69a)", caption: "Medical supplies to health camp", loc: "Dwarka Sec 7", date: "Mar 30" },
];

/* ─── Mock camps ─── */
const CAMPS = [
  { id: 1, title: "Community Health Camp",   date: "May 10, 2026", loc: "Yamuna Ghat",     volunteers: 42,  icon: "🏥", bg: "#e3f2fd" },
  { id: 2, title: "Clothes Donation Drive",  date: "May 15, 2026", loc: "RWA Sector 22",   volunteers: 28,  icon: "👕", bg: "#f3e5f5" },
  { id: 3, title: "Food Relief Camp",        date: "May 22, 2026", loc: "DPS R.K. Puram",  volunteers: 65,  icon: "🍱", bg: "#fff3e0" },
];

/* ─── Category emoji map ─── */
const CAT_EMOJI: Record<string, string> = {
  clothes: "👗", food: "🍱", electronics: "📱", furniture: "🪑",
  books: "📚", other: "📦",
};

export default function NgoDashboard() {
  const [, navigate]   = useLocation();
  const { toast }      = useToast();
  const qc             = useQueryClient();
  const [photoModal, setPhotoModal] = useState<typeof IMPACT_PHOTOS[0] | null>(null);
  const [postContent, setPostContent] = useState("");
  const [showPost, setShowPost] = useState(false);

  const { data, isLoading } = useGetNgoDashboard();
  const updateDonation      = useUpdateDonation();
  const createPost          = useCreateFeedPost();

  const pendingDonations: any[] = (data as any)?.pendingDonations  || [];
  const completedDonations      = (data as any)?.completedDonations ?? 0;

  const handleAccept = (id: string) => {
    updateDonation.mutate({ id, data: { status: "scheduled", rewardPoints: 60 } }, {
      onSuccess: () => { toast({ title: "Pickup scheduled!" }); qc.invalidateQueries({ queryKey: getGetNgoDashboardQueryKey() }); },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleComplete = (id: string) => {
    updateDonation.mutate({ id, data: { status: "completed", rewardPoints: 60 } }, {
      onSuccess: () => { toast({ title: "Donation collected! Donor rewarded 60 pts." }); qc.invalidateQueries({ queryKey: getGetNgoDashboardQueryKey() }); },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handlePost = () => {
    if (!postContent.trim()) return;
    createPost.mutate({ data: { content: postContent } }, {
      onSuccess: () => {
        toast({ title: "Update posted!" });
        setPostContent(""); setShowPost(false);
        qc.invalidateQueries({ queryKey: getGetNgoDashboardQueryKey() });
        qc.invalidateQueries({ queryKey: getGetCommunityFeedQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const S: React.CSSProperties = { fontFamily: "'Inter', Arial, sans-serif" };

  return (
    <DashboardLayout title="NGO Dashboard">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Hero Banner ── */}
        <div className="ngo-hero">
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
                  🤝
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-.3px" }}>Swachh Bharat NGO Network</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a5d6a7", display: "inline-block", boxShadow: "0 0 6px #a5d6a7" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>Verified Partner</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", maxWidth: 380 }}>
                Accept donations, run camps, and post urgent needs — all in one place.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="gov-btn"
                style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
                onClick={() => setShowPost(v => !v)}>
                <Plus style={{ width: 13, height: 13 }} /> Post Update
              </button>
              <button
                className="gov-btn"
                style={{ background: "rgba(255,255,255,0.95)", color: "#1b5e20", border: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
                onClick={() => navigate("/ngo/urgent")}>
                <AlertTriangle style={{ width: 13, height: 13 }} /> Urgent Need
              </button>
            </div>
          </div>
        </div>

        {/* ── Post Update inline form ── */}
        {showPost && (
          <div className="ngo-section" style={{ padding: 0 }}>
            <div className="ngo-section-header">
              <span className="ngo-section-title">Post an Update</span>
              <button onClick={() => setShowPost(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>✕</button>
            </div>
            <div style={{ padding: "14px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                className="gov-input"
                style={{ minHeight: 90, resize: "vertical" }}
                placeholder="Share news, a success story, or an update…"
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={3}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gov-btn gov-btn-green" onClick={handlePost}
                  disabled={createPost.isPending || !postContent.trim()}>
                  {createPost.isPending ? "Publishing…" : "Publish Post"}
                </button>
                <button className="gov-btn gov-btn-outline" onClick={() => setShowPost(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── NGO Stats (4 cards) ── */}
        <div className="cd-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            { label: "Donations Received", value: completedDonations + 48, icon: "❤️", trend: "+12%", bg: "linear-gradient(135deg,#fce4ec,#f8bbd0)", iconBg: "linear-gradient(135deg,#e91e63,#ad1457)" },
            { label: "Camps Organised",    value: 18,                        icon: "⛺", trend: "+3",   bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", iconBg: "linear-gradient(135deg,#1565c0,#0d47a1)" },
            { label: "Volunteers Active",  value: 284,                       icon: "👥", trend: "+17%", bg: "linear-gradient(135deg,#e8f5e9,#c8e6c9)", iconBg: "linear-gradient(135deg,#2e7d32,#1b5e20)" },
            { label: "Urgent Needs Open",  value: 3,                         icon: "🚨", trend: "Open", bg: "linear-gradient(135deg,#fff3e0,#ffe0b2)", iconBg: "linear-gradient(135deg,#e65100,#bf360c)" },
          ].map(s => (
            <div key={s.label} className="ngo-stat" style={{ background: s.bg }}>
              <div className="ngo-stat-icon" style={{ background: s.iconBg }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
              </div>
              <div className="ngo-stat-value">{isLoading ? "—" : s.value.toLocaleString("en-IN")}</div>
              <div className="ngo-stat-label">{s.label}</div>
              <div className="ngo-stat-trend">{s.trend}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Action Cards (3D) ── */}
        <div className="cd-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            {
              title: "Collect Donation",
              sub: "Accept & schedule pickups",
              icon: "🎁",
              bg: "linear-gradient(135deg,#6a1b9a,#8e24aa)",
              shadow: "0 8px 28px rgba(106,27,154,0.38)",
              path: "/ngo/donations",
            },
            {
              title: "Organise a Camp",
              sub: "Create relief & health camps",
              icon: "⛺",
              bg: "linear-gradient(135deg,#1565c0,#1976d2)",
              shadow: "0 8px 28px rgba(21,101,192,0.38)",
              path: "/ngo/manage-events",
            },
            {
              title: "Post Urgent Need",
              sub: "Alert volunteers & donors now",
              icon: "🚨",
              bg: "linear-gradient(135deg,#c62828,#e53935)",
              shadow: "0 8px 28px rgba(198,40,40,0.38)",
              path: "/ngo/urgent",
            },
          ].map(a => (
            <button key={a.title} className="ngo-action"
              style={{ background: a.bg, boxShadow: a.shadow }}
              onClick={() => navigate(a.path)}>
              <div className="ngo-action-icon">{a.icon}</div>
              <div>
                <div className="ngo-action-title">{a.title}</div>
                <div className="ngo-action-sub">{a.sub}</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.6)", marginTop: 2 }} />
            </button>
          ))}
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="cd-2col-big" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>

          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Pending Donations */}
            <div className="ngo-section">
              <div className="ngo-section-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Heart style={{ width: 15, height: 15, color: "#e91e63" }} />
                  <span className="ngo-section-title">Donations Waiting for Pickup</span>
                </div>
                <span className="gov-badge gov-badge-yellow">{pendingDonations.length} pending</span>
              </div>

              {isLoading ? (
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 54, background: "#f4f6f9", borderRadius: 12 }} />)}
                </div>
              ) : pendingDonations.length === 0 ? (
                <div style={{ padding: "36px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 38, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2833" }}>All caught up!</div>
                  <div style={{ fontSize: 12, color: "#7d8fa0", marginTop: 4 }}>No pending donation pickups</div>
                </div>
              ) : (
                pendingDonations.map((d: any) => (
                  <div key={d.id} className="ngo-item-row">
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#f3e5f5,#e1bee7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
                      {CAT_EMOJI[d.category] || "📦"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2833", textTransform: "capitalize" }}>{d.category}</div>
                      {d.description && <div style={{ fontSize: 11, color: "#7d8fa0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.description}</div>}
                      {d.address && (
                        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7d8fa0" }}>
                          <MapPin style={{ width: 10, height: 10 }} />{d.address}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span className={d.status === "pending" ? "gov-badge gov-badge-yellow" : "gov-badge gov-badge-blue"} style={{ fontSize: 10 }}>
                        {d.status}
                      </span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {d.status === "pending" && (
                          <button className="gov-btn gov-btn-xs gov-btn-primary"
                            onClick={() => handleAccept(d.id)} disabled={updateDonation.isPending}>
                            Schedule
                          </button>
                        )}
                        <button className="gov-btn gov-btn-xs gov-btn-green"
                          onClick={() => handleComplete(d.id)} disabled={updateDonation.isPending}
                          style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <CheckCircle style={{ width: 10, height: 10 }} /> Done
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Impact Photo Gallery */}
            <div className="ngo-section">
              <div className="ngo-section-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Camera style={{ width: 15, height: 15, color: "#1565c0" }} />
                  <span className="ngo-section-title">What Your Donations Did</span>
                </div>
                <span style={{ fontSize: 11, color: "#7d8fa0" }}>See the difference you made</span>
              </div>

              {/* Upload zone */}
              <div className="ngo-upload-zone">
                <Upload style={{ width: 22, height: 22, color: "#4caf50", margin: "0 auto 6px" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32" }}>Add a Photo</div>
                <div style={{ fontSize: 11, color: "#7d8fa0", marginTop: 2 }}>Upload photos of your donation work</div>
              </div>

              {/* Photo grid */}
              <div className="ngo-gallery-grid">
                {IMPACT_PHOTOS.map(p => (
                  <div key={p.id} className="ngo-gallery-item"
                    onClick={() => setPhotoModal(p)}>
                    {/* Gradient background as photo placeholder */}
                    <div style={{ width: "100%", height: "100%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                      {p.emoji}
                    </div>
                    <div className="ngo-gallery-overlay">
                      <div className="ngo-gallery-caption">{p.caption}</div>
                      <div className="ngo-gallery-loc">
                        <MapPin style={{ width: 9, height: 9 }} />
                        {p.loc} · {p.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Upcoming Camps */}
            <div className="ngo-section">
              <div className="ngo-section-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar style={{ width: 15, height: 15, color: "#1565c0" }} />
                  <span className="ngo-section-title">Upcoming Camps</span>
                </div>
                <button className="gov-btn gov-btn-xs gov-btn-primary"
                  onClick={() => navigate("/ngo/manage-events")}>
                  + New Camp
                </button>
              </div>
              {CAMPS.map(c => (
                <div key={c.id} className="ngo-camp-row">
                  <div className="ngo-camp-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2833", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7d8fa0" }}>
                        <Clock style={{ width: 10, height: 10 }} />{c.date}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7d8fa0" }}>
                      <MapPin style={{ width: 10, height: 10 }} />{c.loc}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "#1565c0" }}>
                      <Users style={{ width: 11, height: 11 }} />{c.volunteers}
                    </span>
                    <span className="gov-badge gov-badge-blue" style={{ fontSize: 10 }}>Upcoming</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 20px 14px" }}>
                <button className="gov-btn gov-btn-outline" style={{ width: "100%", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => navigate("/ngo/manage-events")}>
                  View All Camps <ChevronRight style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>

            {/* Urgent Needs snapshot */}
            <div className="ngo-section" style={{ border: "1.5px solid #ffcdd2" }}>
              <div className="ngo-section-header" style={{ background: "#fff5f5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle style={{ width: 15, height: 15, color: "#c62828" }} />
                  <span className="ngo-section-title" style={{ color: "#c62828" }}>Urgent Needs</span>
                </div>
                <span className="gov-badge gov-badge-red">3 open</span>
              </div>
              {[
                { title: "30 volunteers for Yamuna cleanup",   deadline: "May 8",  resp: 0 },
                { title: "Food packets for workers",           deadline: "May 6",  resp: 2 },
                { title: "First-aid volunteers needed",        deadline: "May 12", resp: 1 },
              ].map((u, i) => (
                <div key={i} className="ngo-urgent-row">
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#ffcdd2,#ef9a9a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    🚨
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1c2833", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.title}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "#c62828", fontWeight: 600 }}>Deadline: {u.deadline}</span>
                      <span style={{ fontSize: 11, color: "#7d8fa0" }}>{u.resp} response{u.resp !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 20px 14px" }}>
                <button className="gov-btn gov-btn-red" style={{ width: "100%", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => navigate("/ngo/urgent")}>
                  See All Urgent Needs <ChevronRight style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>

            {/* Active Volunteers */}
            <div className="ngo-section">
              <div className="ngo-section-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Users style={{ width: 15, height: 15, color: "#2e7d32" }} />
                  <span className="ngo-section-title">Active Volunteers</span>
                </div>
                <span style={{ fontSize: 11, color: "#7d8fa0" }}>Most active</span>
              </div>
              {[
                { name: "Priya Sharma",  tasks: 28, rating: "4.9", initials: "PS", badge: "⭐ Top",    bg: "linear-gradient(135deg,#1b5e20,#43a047)" },
                { name: "Rahul Gupta",   tasks: 21, rating: "4.7", initials: "RG", badge: "Active",   bg: "linear-gradient(135deg,#1565c0,#42a5f5)" },
                { name: "Ananya Singh",  tasks: 17, rating: "4.8", initials: "AS", badge: "Rising",   bg: "linear-gradient(135deg,#6a1b9a,#ba68c8)" },
                { name: "Vikram Nair",   tasks: 14, rating: "4.6", initials: "VN", badge: "",          bg: "linear-gradient(135deg,#e65100,#ff8f00)" },
              ].map((v, i) => (
                <div key={i} className="ngo-vol-row">
                  <div className="ngo-avatar" style={{ background: v.bg }}>{v.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2833" }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: "#7d8fa0" }}>{v.tasks} tasks · ⭐ {v.rating}</div>
                  </div>
                  {v.badge && <span className="gov-badge gov-badge-green" style={{ fontSize: 10 }}>{v.badge}</span>}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Photo detail modal ── */}
        {photoModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setPhotoModal(null)}>
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", maxWidth: 440, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: "100%", height: 220, background: photoModal.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>
                {photoModal.emoji}
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1c2833", marginBottom: 6 }}>{photoModal.caption}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7d8fa0", marginBottom: 14 }}>
                  <MapPin style={{ width: 12, height: 12 }} />{photoModal.loc} · {photoModal.date}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="gov-btn gov-btn-green" style={{ flex: 1 }} onClick={() => setPhotoModal(null)}>Close</button>
                  <button className="gov-btn gov-btn-outline" onClick={() => setPhotoModal(null)}>Share</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
