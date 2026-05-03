import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  User, Bell, Shield, Palette, Globe, Lock,
  Phone, Mail, MapPin, Building, CheckCircle, Save,
} from "lucide-react";

/* ── Preference store (localStorage) ── */
const PREF_KEY = "swachh_prefs";
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); } catch { return {}; }
}
function savePrefs(p: Record<string, any>) {
  localStorage.setItem(PREF_KEY, JSON.stringify(p));
}

/* ── Shared styles ── */
const card3d: React.CSSProperties = {
  background: "linear-gradient(145deg,#fff,#f5fbf5)",
  borderRadius: 18,
  border: "1.5px solid #e0ece0",
  boxShadow: "6px 6px 16px #c8dcc8,-4px -4px 10px #ffffff",
  fontFamily: "'Inter',sans-serif",
  overflow: "hidden",
};

const sectionHeader = (icon: string, label: string, sub: string) => (
  <div style={{ padding:"16px 22px 14px", borderBottom:"1.5px solid #e8f0e8",
    display:"flex", alignItems:"center", gap:10 }}>
    <div style={{ width:34, height:34, borderRadius:10,
      background:"linear-gradient(135deg,#2e7d32,#4caf50)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:16, boxShadow:"2px 3px 8px rgba(46,125,50,.3)", flexShrink:0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize:14, fontWeight:800, color:"#1a2e1a" }}>{label}</div>
      <div style={{ fontSize:11, color:"#8fa98f", marginTop:1 }}>{sub}</div>
    </div>
  </div>
);

function InputField({ label, icon: Icon, value, onChange, type = "text", placeholder, readOnly }:
  { label:string; icon:any; value:string; onChange?:(v:string)=>void; type?:string; placeholder?:string; readOnly?:boolean }) {
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:800, color:"#5d7a5e",
        textTransform:"uppercase", letterSpacing:".06em",
        marginBottom:5, fontFamily:"'Inter',sans-serif" }}>{label}</div>
      <div style={{ position:"relative" }}>
        <Icon style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
          width:14, height:14, color:"#81c784" }} />
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            width:"100%", padding:"10px 12px 10px 36px",
            border:"1.5px solid #d1dfd1", borderRadius:11,
            fontSize:13, color: readOnly ? "#8fa98f" : "#1a2e1a",
            fontFamily:"'Inter',sans-serif", fontWeight:500,
            background: readOnly
              ? "linear-gradient(145deg,#f5fbf5,#edf7ed)"
              : "linear-gradient(145deg,#fff,#f9fdf9)",
            boxShadow:"inset 2px 2px 5px rgba(0,0,0,.04)",
            outline:"none", boxSizing:"border-box",
            cursor: readOnly ? "not-allowed" : "text",
          }}
        />
      </div>
    </div>
  );
}

function Toggle({ label, sub, value, onChange }:
  { label:string; sub?:string; value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 0", borderBottom:"1px solid #f0f7f0" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:"#1a2e1a" }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:"#8fa98f", marginTop:2 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)}
        style={{ width:44, height:24, borderRadius:999, cursor:"pointer",
          background: value
            ? "linear-gradient(135deg,#4caf50,#2e7d32)"
            : "linear-gradient(145deg,#d5e0d5,#c8d8c8)",
          boxShadow: value ? "2px 2px 6px rgba(76,175,80,.35)" : "inset 2px 2px 4px rgba(0,0,0,.1)",
          position:"relative", transition:"background .25s", flexShrink:0 }}>
        <div style={{ position:"absolute",
          left: value ? 22 : 2, top: 2,
          width:20, height:20, borderRadius:"50%",
          background:"#fff",
          boxShadow:"1px 1px 4px rgba(0,0,0,.2)",
          transition:"left .25s" }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN SETTINGS PAGE
════════════════════════════════════════ */
type Tab = "profile" | "notifications" | "preferences" | "security";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key:"profile",       label:"Profile",       emoji:"👤" },
  { key:"notifications", label:"Notifications",  emoji:"🔔" },
  { key:"preferences",   label:"Preferences",    emoji:"🎨" },
  { key:"security",      label:"Security",       emoji:"🔒" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  /* Profile state */
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone,    setPhone]    = useState("");
  const [address,  setAddress]  = useState("");
  const [city,     setCity]     = useState("");
  const [ward,     setWard]     = useState("");

  /* Load profile from API */
  useEffect(() => {
    const token = localStorage.getItem("civic_token");
    if (!token) return;
    fetch("/api/profiles/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        const p = res.data;
        if (p) {
          setFullName(p.fullName || user?.fullName || "");
          setPhone(p.phone || "");
          setAddress(p.address || "");
          setCity(p.city || "");
          setWard(p.ward || "");
        }
      })
      .catch(() => {});
  }, [user]);

  /* Prefs state */
  const [prefs, setPrefs] = useState(() => ({
    /* Notifications */
    notifReports:    true,
    notifPoints:     true,
    notifEvents:     true,
    notifLeaderboard:false,
    notifNewsletter: false,
    notifSMS:        false,
    /* Preferences */
    language:        "en",
    darkMode:        false,
    compactView:     false,
    highContrast:    false,
    animations:      true,
    autoSave:        true,
    ...loadPrefs(),
  }));

  const setPref = (key: string, val: any) => {
    setPrefs((p: typeof prefs) => {
      const next = { ...p, [key]: val };
      savePrefs(next);
      return next;
    });
  };

  /* Save profile */
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("civic_token");
      const res = await fetch("/api/profiles/me", {
        method:"PATCH",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ fullName, phone, address, city, ward }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast({ title:"Profile saved ✓", description:"Your profile has been updated successfully." });
    } catch {
      toast({ title:"Save failed", description:"Could not update profile. Please try again.", variant:"destructive" });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Settings">
      <div style={{ display:"flex", flexDirection:"column", gap:20,
        fontFamily:"'Inter',sans-serif", maxWidth:760, margin:"0 auto" }}>

        {/* ── Tab bar ── */}
        <div style={{ ...card3d, padding:0 }}>
          <div style={{ display:"flex", borderBottom:"1.5px solid #e8f0e8",
            background:"linear-gradient(145deg,#f8fbf8,#f2f9f2)" }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ flex:1, padding:"13px 6px",
                  border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:700,
                  fontFamily:"'Inter',sans-serif",
                  background:"none",
                  color: tab === t.key ? "#2e7d32" : "#8fa98f",
                  borderBottom: tab === t.key
                    ? "2.5px solid #4caf50"
                    : "2.5px solid transparent",
                  display:"flex", flexDirection:"column",
                  alignItems:"center", gap:4,
                  transition:"color .15s" }}>
                <span style={{ fontSize:18 }}>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ════ PROFILE TAB ════ */}
        {tab === "profile" && (
          <div style={{ ...card3d }}>
            {sectionHeader("👤", "Edit Profile", "Update your personal information")}
            <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>

              {/* Avatar chip */}
              <div style={{ display:"flex", alignItems:"center", gap:14,
                padding:"14px 16px",
                background:"linear-gradient(145deg,#e8f5e9,#dcedc8)",
                borderRadius:14, border:"1.5px solid #a5d6a7",
                boxShadow:"2px 2px 6px rgba(76,175,80,.1)" }}>
                <div style={{ width:52, height:52, borderRadius:16,
                  background:"linear-gradient(135deg,#2e7d32,#4caf50)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, fontWeight:900, color:"#fff",
                  boxShadow:"3px 3px 10px rgba(46,125,50,.4)" }}>
                  {(fullName || user?.fullName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:900, color:"#1a2e1a" }}>{fullName || user?.fullName}</div>
                  <div style={{ fontSize:11, color:"#2e7d32", marginTop:2, fontWeight:700 }}>
                    🌿 Citizen · SwachhSaathi Member
                  </div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <InputField label="Full Name"  icon={User}     value={fullName} onChange={setFullName} placeholder="Rahul Sharma" />
                <InputField label="Phone"      icon={Phone}    value={phone}    onChange={setPhone}    placeholder="+91 98765 43210" type="tel" />
                <InputField label="Email"      icon={Mail}     value={user?.email || ""} readOnly />
                <InputField label="City"       icon={Building} value={city}     onChange={setCity}     placeholder="New Delhi" />
                <InputField label="Ward / Area" icon={MapPin}  value={ward}     onChange={setWard}     placeholder="Ward 12, Sector 5" />
                <InputField label="Full Address" icon={MapPin} value={address}  onChange={setAddress}  placeholder="123, Green Lane..." />
              </div>

              <button onClick={handleSaveProfile} disabled={saving}
                style={{ alignSelf:"flex-start",
                  padding:"11px 26px",
                  background:"linear-gradient(145deg,#4caf50,#2e7d32)",
                  color:"#fff", border:"none", borderRadius:12,
                  fontSize:13, fontWeight:800, cursor:saving ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", gap:8,
                  boxShadow:"3px 4px 10px rgba(27,94,32,.35)",
                  opacity: saving ? .7 : 1,
                  transition:"opacity .15s,transform .15s",
                }}
                onMouseEnter={e => !saving && ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = "")}>
                {saved
                  ? <><CheckCircle style={{ width:15,height:15 }} /> Saved!</>
                  : saving
                    ? "Saving…"
                    : <><Save style={{ width:15,height:15 }} /> Save Changes</>}
              </button>
            </div>
          </div>
        )}

        {/* ════ NOTIFICATIONS TAB ════ */}
        {tab === "notifications" && (
          <div style={{ ...card3d }}>
            {sectionHeader("🔔", "Notification Preferences", "Control what alerts you receive")}
            <div style={{ padding:"8px 22px 20px" }}>

              <div style={{ fontSize:11, fontWeight:800, color:"#81c784",
                textTransform:"uppercase", letterSpacing:".08em",
                padding:"14px 0 8px" }}>In-App Notifications</div>

              <Toggle label="Report Status Updates"
                sub="Get notified when your waste reports are assigned or completed"
                value={prefs.notifReports} onChange={v => setPref("notifReports", v)} />
              <Toggle label="Points & Rewards"
                sub="Alerts when you earn or redeem green points"
                value={prefs.notifPoints} onChange={v => setPref("notifPoints", v)} />
              <Toggle label="Community Events"
                sub="Upcoming drives, clean-ups and events near you"
                value={prefs.notifEvents} onChange={v => setPref("notifEvents", v)} />
              <Toggle label="Leaderboard Updates"
                sub="When your rank changes in the city leaderboard"
                value={prefs.notifLeaderboard} onChange={v => setPref("notifLeaderboard", v)} />

              <div style={{ fontSize:11, fontWeight:800, color:"#81c784",
                textTransform:"uppercase", letterSpacing:".08em",
                padding:"18px 0 8px" }}>External Alerts</div>

              <Toggle label="SMS Alerts"
                sub="Receive important updates via text message"
                value={prefs.notifSMS} onChange={v => setPref("notifSMS", v)} />
              <Toggle label="SwachhSaathi Newsletter"
                sub="Monthly digest of platform news and tips"
                value={prefs.notifNewsletter} onChange={v => setPref("notifNewsletter", v)} />

              <div style={{ marginTop:14, padding:"12px 14px",
                background:"linear-gradient(145deg,#e8f5e9,#dcedc8)",
                borderRadius:12, border:"1.5px solid #a5d6a7",
                fontSize:12, color:"#2e7d32", fontWeight:700,
                display:"flex", gap:8, alignItems:"center" }}>
                ✅ Preferences are saved automatically
              </div>
            </div>
          </div>
        )}

        {/* ════ PREFERENCES TAB ════ */}
        {tab === "preferences" && (
          <div style={{ ...card3d }}>
            {sectionHeader("🎨", "Display & App Preferences", "Customise how the app looks and behaves")}
            <div style={{ padding:"8px 22px 20px" }}>

              <div style={{ fontSize:11, fontWeight:800, color:"#81c784",
                textTransform:"uppercase", letterSpacing:".08em",
                padding:"14px 0 8px" }}>Display</div>

              <Toggle label="Compact View"
                sub="Show more information on screen with smaller cards"
                value={prefs.compactView} onChange={v => setPref("compactView", v)} />
              <Toggle label="High Contrast"
                sub="Increase text contrast for better readability"
                value={prefs.highContrast} onChange={v => setPref("highContrast", v)} />
              <Toggle label="Card Animations"
                sub="Hover and entrance animations on dashboard cards"
                value={prefs.animations} onChange={v => setPref("animations", v)} />

              <div style={{ fontSize:11, fontWeight:800, color:"#81c784",
                textTransform:"uppercase", letterSpacing:".08em",
                padding:"18px 0 8px" }}>App Behaviour</div>

              <Toggle label="Auto-Save Forms"
                sub="Automatically save draft reports and forms"
                value={prefs.autoSave} onChange={v => setPref("autoSave", v)} />

              {/* Language */}
              <div style={{ paddingTop:12 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#5d7a5e",
                  textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                  Language
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[
                    { key:"en", label:"English" },
                    { key:"hi", label:"हिन्दी" },
                    { key:"mr", label:"मराठी" },
                    { key:"bn", label:"বাংলা" },
                    { key:"ta", label:"தமிழ்" },
                    { key:"te", label:"తెలుగు" },
                  ].map(l => (
                    <button key={l.key}
                      onClick={() => setPref("language", l.key)}
                      style={{ padding:"7px 14px",
                        borderRadius:999, fontSize:12, fontWeight:700,
                        border:"1.5px solid",
                        cursor:"pointer", transition:"all .15s",
                        borderColor: prefs.language === l.key ? "#4caf50" : "#d1dfd1",
                        background: prefs.language === l.key
                          ? "linear-gradient(145deg,#4caf50,#2e7d32)"
                          : "linear-gradient(145deg,#fff,#f5fbf5)",
                        color: prefs.language === l.key ? "#fff" : "#5d7a5e",
                        boxShadow: prefs.language === l.key
                          ? "2px 2px 6px rgba(76,175,80,.35)"
                          : "2px 2px 5px rgba(200,220,200,.7)",
                      }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop:18, padding:"12px 14px",
                background:"linear-gradient(145deg,#e8f5e9,#dcedc8)",
                borderRadius:12, border:"1.5px solid #a5d6a7",
                fontSize:12, color:"#2e7d32", fontWeight:700,
                display:"flex", gap:8, alignItems:"center" }}>
                ✅ Preferences are saved automatically to your device
              </div>
            </div>
          </div>
        )}

        {/* ════ SECURITY TAB ════ */}
        {tab === "security" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Account info */}
            <div style={{ ...card3d }}>
              {sectionHeader("🔒", "Account Security", "Manage your account access")}
              <div style={{ padding:"16px 22px" }}>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
                  {[
                    { icon:"✉️", label:"Email (Login ID)", value: user?.email || "—", tag:"Verified" },
                    { icon:"🕐", label:"Member Since", value: "May 2025", tag:"Active" },
                    { icon:"🌿", label:"Role", value: "Citizen", tag:"Eco Champion" },
                    { icon:"🔐", label:"2FA Status", value: "Not enabled", tag:"Optional" },
                  ].map(item => (
                    <div key={item.label} style={{ padding:"14px 16px",
                      background:"linear-gradient(145deg,#f8fbf8,#f2f9f2)",
                      borderRadius:14, border:"1.5px solid #e0ece0",
                      boxShadow:"2px 2px 6px rgba(200,230,201,.5)" }}>
                      <div style={{ fontSize:18, marginBottom:6 }}>{item.icon}</div>
                      <div style={{ fontSize:10, fontWeight:800, color:"#8fa98f",
                        textTransform:"uppercase", letterSpacing:".06em" }}>{item.label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1a2e1a",
                        marginTop:3 }}>{item.value}</div>
                      <div style={{ display:"inline-block", marginTop:5,
                        fontSize:10, fontWeight:800,
                        background:"linear-gradient(145deg,#e8f5e9,#dcedc8)",
                        color:"#2e7d32", borderRadius:999,
                        padding:"2px 8px", border:"1px solid #a5d6a7" }}>
                        {item.tag}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Change password hint */}
                <div style={{ padding:"14px 16px",
                  borderRadius:14, border:"1.5px dashed #ffcc80",
                  background:"linear-gradient(145deg,#fff8f0,#fff3e0)" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#e65100",
                    marginBottom:4, display:"flex", alignItems:"center", gap:7 }}>
                    <Lock style={{ width:14, height:14 }} /> Change Password
                  </div>
                  <div style={{ fontSize:12, color:"#bf360c", lineHeight:1.5 }}>
                    To change your password, sign out and use "Forgot Password" on the sign-in screen.
                    For security, password changes require email verification.
                  </div>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ ...card3d, border:"1.5px solid #ffcdd2" }}>
              {sectionHeader("⚠️", "Danger Zone", "Irreversible account actions")}
              <div style={{ padding:"16px 22px", display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { label:"Export My Data", sub:"Download all your reports, points, and activity as CSV", btnLabel:"Export", color:"#1565c0", bg:"#e3f2fd" },
                  { label:"Delete Account", sub:"Permanently delete your account and all associated data. This cannot be undone.", btnLabel:"Delete", color:"#c62828", bg:"#ffebee" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", alignItems:"center",
                    justifyContent:"space-between", padding:"12px 14px",
                    background:item.bg, borderRadius:12,
                    border:`1.5px solid ${item.color}22` }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:item.color }}>{item.label}</div>
                      <div style={{ fontSize:11, color:item.color + "aa", marginTop:2 }}>{item.sub}</div>
                    </div>
                    <button
                      onClick={() => toast({ title:"Contact support", description:"Please email support@swachhsaathi.in for this request." })}
                      style={{ padding:"7px 14px", borderRadius:999, border:`1.5px solid ${item.color}`,
                        background:"#fff", color:item.color, fontSize:11, fontWeight:800,
                        cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, marginLeft:12 }}>
                      {item.btnLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
