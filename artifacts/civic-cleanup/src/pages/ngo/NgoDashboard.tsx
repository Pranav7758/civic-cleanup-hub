import { useState } from "react";
import { Link } from "wouter";
import {
  useGetNgoDashboard, useUpdateDonation, useCreateFeedPost,
  getGetNgoDashboardQueryKey, getGetCommunityFeedQueryKey,
} from "@workspace/api-client-react";
import { Heart, Users, CheckCircle, Plus, MapPin, Calendar, AlertTriangle, Clock, BarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/ngo.css";

const MOCK_EVENTS = [
  { id:1, title:"Yamuna Cleanup Drive",  date:"May 10, 2026", location:"Yamuna Ghat, Delhi",    participants:142, status:"upcoming", icon:"🌊" },
  { id:2, title:"Plastic-Free Colony",   date:"May 15, 2026", location:"RWA Sector 22, Noida",  participants:87,  status:"upcoming", icon:"♻️" },
  { id:3, title:"Green School Project",  date:"May 22, 2026", location:"DPS R.K. Puram, Delhi", participants:210, status:"planning", icon:"🌱" },
];

const MOCK_VOLUNTEERS = [
  { id:1, name:"Priya Sharma",  tasks:28, rating:4.9, badge:"Top",    initials:"PS" },
  { id:2, name:"Rahul Gupta",   tasks:21, rating:4.7, badge:"Active", initials:"RG" },
  { id:3, name:"Ananya Singh",  tasks:17, rating:4.8, badge:"Rising", initials:"AS" },
  { id:4, name:"Vikram Nair",   tasks:14, rating:4.6, badge:"",       initials:"VN" },
];

const MOCK_REPORTS = [
  { id:1, title:"Overflowing bins near Market Gate 3",    location:"Lajpat Nagar",  priority:"high",   time:"10 min ago" },
  { id:2, title:"Illegal dumping spotted at river bank",  location:"Okhla Phase 2", priority:"high",   time:"45 min ago" },
  { id:3, title:"Construction debris blocking lane",      location:"Dwarka Sec 7",  priority:"medium", time:"2 hr ago"   },
  { id:4, title:"Plastic waste near school gate",         location:"Rohini Sec 11", priority:"low",    time:"4 hr ago"   },
];

const WASTE_CHART = [
  { label:"Plastic", pct:38, color:"#1a5276" },
  { label:"Organic", pct:29, color:"#1e8449" },
  { label:"E-Waste", pct:14, color:"#6c3483" },
  { label:"Metal",   pct:11, color:"#b7950b" },
  { label:"Other",   pct:8,  color:"#5d6d7e" },
];

const priorityBadge = (p: string) => {
  if (p === "high")   return "gov-badge gov-badge-red";
  if (p === "medium") return "gov-badge gov-badge-yellow";
  return "gov-badge gov-badge-green";
};

export default function NgoDashboard() {
  const [postContent, setPostContent] = useState("");
  const [postOpen, setPostOpen]       = useState(false);
  const [activeTab, setActiveTab]     = useState<"overview" | "analytics">("overview");
  const { toast }  = useToast();
  const qc         = useQueryClient();

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
      onSuccess: () => { toast({ title: "Donation completed! Citizen awarded 60 points." }); qc.invalidateQueries({ queryKey: getGetNgoDashboardQueryKey() }); },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handlePost = () => {
    if (!postContent.trim()) return;
    createPost.mutate({ data: { content: postContent } }, {
      onSuccess: () => {
        toast({ title: "Post published!" });
        setPostContent(""); setPostOpen(false);
        qc.invalidateQueries({ queryKey: getGetNgoDashboardQueryKey() });
        qc.invalidateQueries({ queryKey: getGetCommunityFeedQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const impactStats = [
    { label:"Waste Collected",   value:12480, suffix:" kg", icon:"🗑️", color:"#1e8449" },
    { label:"CO₂ Saved",         value:3740,  suffix:" kg", icon:"🌿", color:"#1a5276" },
    { label:"Total Donations",   value:completedDonations+48, suffix:"", icon:"❤️", color:"#6c3483" },
    { label:"Active Volunteers", value:284,   suffix:"",    icon:"👥", color:"#1a5276" },
  ];

  const S: React.CSSProperties = { fontFamily: "'Roboto', Arial, sans-serif" };

  return (
    <DashboardLayout title="NGO Dashboard">
      <div style={{ ...S, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1c2833", margin: 0 }}>Swachh Bharat NGO Network</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1e8449", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#5d6d7e" }}>Verified Partner Organisation</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {(["overview","analytics"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`gov-btn gov-btn-sm ${activeTab === t ? "gov-btn-primary" : "gov-btn-outline"}`}
                style={{ textTransform: "capitalize" }}>{t}</button>
            ))}
            <Dialog open={postOpen} onOpenChange={setPostOpen}>
              <DialogTrigger asChild>
                <button className="gov-btn gov-btn-green" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Plus style={{ width: 13, height: 13 }} /> Post Update
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post to Community Feed</DialogTitle>
                </DialogHeader>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                  <textarea
                    className="gov-input"
                    style={{ minHeight: 100, resize: "vertical" }}
                    placeholder="Share an update with the community…"
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    rows={4}
                    data-testid="textarea-post"
                  />
                  <button
                    className="gov-btn gov-btn-green"
                    onClick={handlePost}
                    disabled={createPost.isPending || !postContent.trim()}
                    style={{ width: "100%" }}
                    data-testid="button-submit-post"
                  >
                    {createPost.isPending ? "Publishing…" : "Publish Post"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Impact Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {impactStats.map((s) => (
            <div key={s.label} className="gov-stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div className="gov-stat-value" style={{ color: s.color }}>{isLoading ? "—" : s.value.toLocaleString("en-IN")}{s.suffix}</div>
              <div className="gov-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>

            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Pending Donations */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Heart style={{ width: 14, height: 14, color: "#6c3483" }} />
                    <span className="gov-section-title">Pending Donation Pickups</span>
                  </div>
                  <span className="gov-badge gov-badge-yellow">{pendingDonations.length} Pending</span>
                </div>
                {isLoading ? (
                  <div style={{ padding: 18 }}>
                    {[1,2,3].map(i => <div key={i} style={{ height: 48, background: "#f4f6f9", borderRadius: 3, marginBottom: 6 }} />)}
                  </div>
                ) : pendingDonations.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 18px", color: "#5d6d7e" }}>
                    <div style={{ fontSize: 28 }}>❤️</div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>No pending donations</div>
                  </div>
                ) : (
                  <table className="gov-table">
                    <thead><tr><th>Category</th><th>Donor</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {pendingDonations.map((d: any) => (
                        <tr key={d.id} data-testid={`ngo-donation-${d.id}`}>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2833", textTransform: "capitalize" }}>{d.category}</div>
                            {d.description && <div style={{ fontSize: 11, color: "#5d6d7e" }}>{d.description}</div>}
                          </td>
                          <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                            <div>{d.citizenName || "Anonymous"}</div>
                            {d.address && <div style={{ display: "flex", alignItems: "center", gap: 2 }}><MapPin style={{ width: 10, height: 10 }} />{d.address}</div>}
                          </td>
                          <td>
                            <span className={d.status === "pending" ? "gov-badge gov-badge-yellow" : "gov-badge gov-badge-green"}>
                              {d.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 5 }}>
                              {d.status === "pending" && (
                                <button className="gov-btn gov-btn-primary gov-btn-xs" onClick={() => handleAccept(d.id)} disabled={updateDonation.isPending} data-testid={`button-accept-${d.id}`}>
                                  Schedule
                                </button>
                              )}
                              <button className="gov-btn gov-btn-green gov-btn-xs" onClick={() => handleComplete(d.id)} disabled={updateDonation.isPending} data-testid={`button-complete-${d.id}`}
                                style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <CheckCircle style={{ width: 10, height: 10 }} /> Done
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Waste Reports */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle style={{ width: 14, height: 14, color: "#c0392b" }} />
                    <span className="gov-section-title">Waste Reports & Requests</span>
                  </div>
                  <button className="gov-btn gov-btn-outline gov-btn-xs">Assign All</button>
                </div>
                <table className="gov-table">
                  <thead><tr><th>Report</th><th>Location</th><th>Priority</th><th>Time</th><th>Action</th></tr></thead>
                  <tbody>
                    {MOCK_REPORTS.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontSize: 12, fontWeight: 600, color: "#1c2833" }}>{r.title}</td>
                        <td style={{ fontSize: 12, color: "#5d6d7e" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin style={{ width: 10, height: 10 }} />{r.location}</div>
                        </td>
                        <td><span className={priorityBadge(r.priority)}>{r.priority}</span></td>
                        <td style={{ fontSize: 11, color: "#909caa", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock style={{ width: 10, height: 10 }} />{r.time}</div>
                        </td>
                        <td><button className="gov-btn gov-btn-primary gov-btn-xs">Assign</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Upcoming Events */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar style={{ width: 14, height: 14, color: "#ca6f1e" }} />
                    <span className="gov-section-title">Upcoming Events</span>
                  </div>
                  <button className="gov-btn gov-btn-primary gov-btn-xs">+ New</button>
                </div>
                <table className="gov-table">
                  <thead><tr><th>Event</th><th>Date</th><th>Vol.</th></tr></thead>
                  <tbody>
                    {MOCK_EVENTS.map(e => (
                      <tr key={e.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{e.icon}</span>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1c2833" }}>{e.title}</div>
                              <div style={{ fontSize: 11, color: "#5d6d7e" }}>{e.location}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 11, color: "#5d6d7e", whiteSpace: "nowrap" }}>{e.date}</td>
                        <td style={{ fontSize: 12, fontWeight: 600, color: "#1a5276" }}>{e.participants}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Volunteers */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Users style={{ width: 14, height: 14, color: "#1a5276" }} />
                    <span className="gov-section-title">Top Volunteers</span>
                  </div>
                  <button className="gov-btn gov-btn-outline gov-btn-xs">View All</button>
                </div>
                <table className="gov-table">
                  <thead><tr><th>Name</th><th>Tasks</th><th>Rating</th><th>Badge</th></tr></thead>
                  <tbody>
                    {MOCK_VOLUNTEERS.map(v => (
                      <tr key={v.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 3, background: "#1a5276", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{v.initials}</div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1c2833" }}>{v.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: "#5d6d7e" }}>{v.tasks}</td>
                        <td style={{ fontSize: 12, color: "#b7950b", fontWeight: 600 }}>⭐ {v.rating}</td>
                        <td>{v.badge && <span className="gov-badge gov-badge-blue" style={{ fontSize: 10 }}>{v.badge}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Waste breakdown */}
            <div className="gov-card">
              <div className="gov-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChart2 style={{ width: 14, height: 14, color: "#1a5276" }} />
                  <span className="gov-section-title">Waste Composition</span>
                </div>
              </div>
              <div className="gov-card-body">
                {WASTE_CHART.map(w => (
                  <div key={w.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: "#1c2833", fontWeight: 600 }}>{w.label}</span>
                      <span style={{ color: w.color, fontWeight: 700 }}>{w.pct}%</span>
                    </div>
                    <div className="gov-progress-track">
                      <div style={{ height: "100%", width: `${w.pct}%`, background: w.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly impact summary */}
            <div className="gov-card">
              <div className="gov-card-header"><span className="gov-section-title">Monthly Impact</span></div>
              <div className="gov-card-body">
                <table className="gov-table">
                  <thead><tr><th>Metric</th><th>This Month</th><th>Last Month</th><th>Change</th></tr></thead>
                  <tbody>
                    {[
                      { metric:"Waste Collected", now:"4.2T",    prev:"3.6T",  change:"+16.7%", up:true  },
                      { metric:"Donations",        now:"127",     prev:"108",   change:"+17.6%", up:true  },
                      { metric:"Volunteers",       now:"284",     prev:"241",   change:"+17.8%", up:true  },
                      { metric:"CO₂ Offset",       now:"1,240 kg",prev:"980 kg",change:"+26.5%",up:true  },
                    ].map(m => (
                      <tr key={m.metric}>
                        <td style={{ fontSize: 12, fontWeight: 600 }}>{m.metric}</td>
                        <td style={{ fontSize: 12, fontWeight: 700, color: "#1c2833" }}>{m.now}</td>
                        <td style={{ fontSize: 12, color: "#5d6d7e" }}>{m.prev}</td>
                        <td><span className={m.up ? "gov-badge gov-badge-green" : "gov-badge gov-badge-red"}>{m.change}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
