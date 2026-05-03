import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Camera, Wallet, BookOpen, Recycle, Heart,
  Calendar, Trophy, Bell, LogOut, Menu, X, Users, Package,
  Settings, Wifi, CheckCheck, Clock, ChevronDown, Leaf, QrCode,
  ClipboardList, GraduationCap,
} from "lucide-react";
import { SwachhLogoIcon } from "@/components/SwachhLogo";
import { useAuth } from "@/context/AuthContext";
import { useSignOut } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import "@/styles/dashboard.css";
import "@/styles/mobile.css";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  accentColor?: string;
}

const CITIZEN_NAV: NavItem[] = [
  { label: "Dashboard",    icon: LayoutDashboard, path: "/citizen"              },
  { label: "My Dustbin",   icon: QrCode,          path: "/citizen/dustbin",  badge: "QR" },
  { label: "Report Waste", icon: Camera,          path: "/citizen/reports"     },
  { label: "Wallet",       icon: Wallet,          path: "/citizen/wallet"      },
  { label: "Training",     icon: BookOpen,        path: "/citizen/training"    },
  { label: "Sell Scrap",   icon: Recycle,         path: "/citizen/scrap"       },
  { label: "Donate",       icon: Heart,           path: "/citizen/donate"      },
  { label: "Events",       icon: Calendar,        path: "/citizen/events"      },
  { label: "Leaderboard",  icon: Trophy,          path: "/citizen/leaderboard" },
];
const WORKER_NAV: NavItem[] = [
  { label: "Dashboard",        icon: LayoutDashboard, path: "/worker",          accentColor: "#7c3aed" },
  { label: "Assigned Reports", icon: ClipboardList,   path: "/worker/reports",  accentColor: "#ea580c" },
  { label: "Smart Bins",       icon: Wifi,            path: "/worker/bins",     accentColor: "#dc2626", badge: "Live" },
  { label: "Dustbin Scan",     icon: QrCode,          path: "/worker/dustbin",  accentColor: "#0d9488" },
  { label: "Training",         icon: GraduationCap,   path: "/worker/training", accentColor: "#2563eb" },
];
const NGO_NAV: NavItem[] = [
  { label: "Dashboard",      icon: LayoutDashboard, path: "/ngo"              },
  { label: "Donations",      icon: Heart,           path: "/ngo/donations"    },
  { label: "Community Feed", icon: Users,           path: "/ngo/feed"         },
  { label: "Events",         icon: Calendar,        path: "/ngo/events"       },
  { label: "Reports",        icon: Camera,          path: "/ngo/reports"      },
];
const SCRAP_NAV: NavItem[] = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/scrap"           },
  { label: "Active Listings", icon: Recycle,         path: "/scrap/listings"  },
  { label: "Prices",          icon: Package,         path: "/scrap/prices"    },
];
const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard",        icon: LayoutDashboard, path: "/admin"          },
  { label: "Users",            icon: Users,           path: "/admin/users"    },
  { label: "Reports",          icon: Camera,          path: "/admin/reports"  },
  { label: "Training Modules", icon: BookOpen,        path: "/admin/training" },
  { label: "Redeem Items",     icon: Trophy,          path: "/admin/redeem"   },
  { label: "Events",           icon: Calendar,        path: "/admin/events"   },
];

interface Notif {
  id: number; icon: string; title: string; body: string; time: string; unread: boolean;
}
const NOTIFS: Record<string, Notif[]> = {
  citizen: [
    { id:1, icon:"🏆", title:"Points Earned",       body:"You earned 50 pts for reporting waste in Sector 12",  time:"5 min ago",  unread:true  },
    { id:2, icon:"✅", title:"Report Resolved",      body:"Your waste report at Green Park has been completed",  time:"1 hr ago",   unread:true  },
    { id:3, icon:"🎉", title:"Event This Weekend",   body:"Community Clean Drive on Saturday, 7am at City Park", time:"3 hr ago",   unread:false },
    { id:4, icon:"💰", title:"Wallet Credited",      body:"₹120 credited for your last scrap sale",              time:"Yesterday",  unread:false },
    { id:5, icon:"📚", title:"New Training Module",  body:"Waste Segregation Level 2 is now available",          time:"2 days ago", unread:false },
  ],
  worker: [
    { id:1, icon:"🚨", title:"Urgent Pickup",      body:"High-priority report at Rajouri Garden — Assign now", time:"2 min ago",  unread:true  },
    { id:2, icon:"📍", title:"New Task Assigned",  body:"Plastic waste collection at Lajpat Nagar Market",     time:"18 min ago", unread:true  },
    { id:3, icon:"🗑️", title:"Bin Alert",          body:"3 red-level dustbins detected in Sector 12",          time:"35 min ago", unread:true  },
    { id:4, icon:"💵", title:"Earnings Updated",   body:"₹850 credited to your wallet for today's tasks",      time:"2 hr ago",   unread:false },
    { id:5, icon:"🔧", title:"Route Optimised",    body:"Your pickup route has been updated for efficiency",   time:"Yesterday",  unread:false },
  ],
  ngo: [
    { id:1, icon:"❤️", title:"New Donation",          body:"Anonymous donated ₹5,000 to Clean Delhi Campaign", time:"10 min ago", unread:true  },
    { id:2, icon:"🤝", title:"Volunteer Joined",      body:"Riya Sharma signed up for Saturday's drive",        time:"1 hr ago",   unread:true  },
    { id:3, icon:"📊", title:"Monthly Report Ready",  body:"July impact report is ready to download",           time:"4 hr ago",   unread:false },
    { id:4, icon:"📅", title:"Event Approved",        body:"Your event 'River Cleanup' has been approved",      time:"Yesterday",  unread:false },
    { id:5, icon:"🌿", title:"Milestone Reached",     body:"Your NGO has collected 10 tonnes of waste this year",time:"2 days ago",unread:false },
  ],
  scrap_dealer: [
    { id:1, icon:"💹", title:"Price Alert",        body:"E-Waste prices up 12% today — great time to sell",  time:"8 min ago",  unread:true  },
    { id:2, icon:"🤝", title:"New Deal Request",   body:"Priya Sharma wants to sell 15kg plastic scrap",    time:"30 min ago", unread:true  },
    { id:3, icon:"✅", title:"Deal Completed",     body:"Order #SCR-2041 marked as delivered successfully",  time:"2 hr ago",   unread:false },
    { id:4, icon:"📦", title:"Inventory Low",      body:"Paper stock below threshold — consider restocking", time:"Yesterday",  unread:false },
    { id:5, icon:"💰", title:"Earnings Summary",   body:"This week's earnings: ₹8,450 from 6 transactions",  time:"2 days ago", unread:false },
  ],
  admin: [
    { id:1, icon:"🚨", title:"Critical Alert",   body:"3 urgent reports unassigned in Sector 12 for >1hr", time:"5 min ago",  unread:true  },
    { id:2, icon:"⚠️",  title:"Price Anomaly",   body:"E-Waste prices spiked 38% — possible fraud",        time:"22 min ago", unread:true  },
    { id:3, icon:"🤝", title:"NGO Registration", body:"New NGO 'Green Future Foundation' pending approval", time:"1 hr ago",   unread:true  },
    { id:4, icon:"👤", title:"New Users",         body:"48 new users registered in the last 24 hours",      time:"3 hr ago",   unread:false },
    { id:5, icon:"📊", title:"Weekly Digest",    body:"Platform report for this week is ready to review",  time:"Yesterday",  unread:false },
  ],
};

function getNavForRole(roles: string[]): NavItem[] {
  if (roles.includes("admin"))        return ADMIN_NAV;
  if (roles.includes("worker"))       return WORKER_NAV;
  if (roles.includes("ngo"))          return NGO_NAV;
  if (roles.includes("scrap_dealer")) return SCRAP_NAV;
  return CITIZEN_NAV;
}
function getRoleLabel(roles: string[]): string {
  if (roles.includes("admin"))        return "Admin";
  if (roles.includes("worker"))       return "Worker";
  if (roles.includes("ngo"))          return "NGO Partner";
  if (roles.includes("scrap_dealer")) return "Scrap Dealer";
  return "Citizen";
}
function getRoleKey(roles: string[]): string {
  if (roles.includes("admin"))        return "admin";
  if (roles.includes("worker"))       return "worker";
  if (roles.includes("ngo"))          return "ngo";
  if (roles.includes("scrap_dealer")) return "scrap_dealer";
  return "citizen";
}
function getRoleEmoji(roles: string[]): string {
  if (roles.includes("admin"))        return "🛡️";
  if (roles.includes("worker"))       return "🚛";
  if (roles.includes("ngo"))          return "🤝";
  if (roles.includes("scrap_dealer")) return "♻️";
  return "🌿";
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

/* ── Inline CSS for sidebar 3D + eco effects ── */
const LAYOUT_CSS = `
  .dl-sidebar-logo-ring {
    width: 42px; height: 42px; border-radius: 12px;
    background: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 2px 2px 5px rgba(255,255,255,0.2), inset -2px -2px 5px rgba(0,0,0,0.15),
                3px 3px 8px rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
  .dl-avatar {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12));
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 15px; color: #fff;
    box-shadow: inset 2px 2px 5px rgba(255,255,255,0.2), inset -2px -2px 5px rgba(0,0,0,0.15),
                3px 3px 8px rgba(0,0,0,0.2);
    flex-shrink: 0; font-family: 'Inter', sans-serif;
    border: 1px solid rgba(255,255,255,0.25);
  }
  .dl-header-avatar {
    width: 32px; height: 32px; border-radius: 10px;
    background: linear-gradient(145deg, #2e7d32, #1b5e20);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 13px; color: #fff;
    box-shadow: 3px 3px 8px rgba(27,94,32,0.4), -1px -1px 4px rgba(165,214,167,0.3);
    flex-shrink: 0; font-family: 'Inter', sans-serif;
  }
  .dl-nav-section {
    font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35);
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 8px 18px 5px;
  }
  .dl-notif-btn {
    position: relative;
    background: linear-gradient(145deg, #ffffff, #f5fbf5);
    border: 1px solid #c8e6c9;
    border-radius: 10px;
    padding: 7px 11px;
    cursor: pointer;
    display: flex; align-items: center;
    box-shadow: 3px 3px 8px #c5d8c5, -2px -2px 6px #ffffff;
    transition: transform .15s, box-shadow .15s;
  }
  .dl-notif-btn:hover {
    transform: translateY(-1px);
    box-shadow: 4px 5px 12px #bad0ba, -2px -2px 8px #ffffff;
  }
  .dl-notif-badge {
    position: absolute; top: -5px; right: -5px;
    min-width: 18px; height: 18px;
    background: linear-gradient(135deg, #ef5350, #c62828);
    color: #fff; border-radius: 999px;
    font-size: 9px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px;
    box-shadow: 0 2px 6px rgba(198,40,40,0.5);
    font-family: 'Inter', sans-serif;
  }
  .dl-profile-btn {
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(145deg, #ffffff, #f5fbf5);
    border: 1px solid #c8e6c9;
    border-radius: 12px;
    padding: 5px 12px 5px 6px;
    cursor: pointer;
    box-shadow: 3px 3px 8px #c5d8c5, -2px -2px 6px #ffffff;
    transition: transform .15s, box-shadow .15s;
  }
  .dl-profile-btn:hover {
    transform: translateY(-1px);
    box-shadow: 4px 5px 12px #bad0ba, -2px -2px 8px #ffffff;
  }
  .dl-sidebar-bottom-btn {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 18px; width: 100%; border: none;
    background: transparent; cursor: pointer;
    font-size: 13px; font-weight: 500;
    font-family: 'Inter', 'Roboto', Arial, sans-serif;
    transition: background .15s, color .15s;
    border-radius: 0;
  }
  .dl-sidebar-bottom-btn:hover {
    background: rgba(255,255,255,0.1);
  }
  .dl-live-badge {
    background: linear-gradient(135deg, #ef5350, #c62828);
    color: #fff; font-size: 9px; font-weight: 800;
    padding: 2px 7px; border-radius: 999px;
    box-shadow: 0 1px 5px rgba(239,83,80,0.5);
    animation: dl-pulse 2s infinite;
  }
  @keyframes dl-pulse {
    0%,100% { box-shadow: 0 1px 5px rgba(239,83,80,0.5); }
    50% { box-shadow: 0 1px 10px rgba(239,83,80,0.8); }
  }
  .dl-page-bg {
    background: linear-gradient(145deg, #e8f5e9 0%, #f1f8e9 50%, #e0f2f1 100%);
  }
  .dl-main-content {
    flex: 1; overflow-y: auto; padding: 22px 26px;
    background: linear-gradient(145deg, #e8f5e9 0%, #f1f8e9 50%, #e0f2f1 100%);
  }
  .dl-header-title {
    font-size: 15px; font-weight: 800;
    color: #1a2e1a; margin: 0;
    font-family: 'Inter', sans-serif;
    display: flex; align-items: center; gap: 8px;
  }
`;

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readIds,     setReadIds]     = useState<Set<number>>(new Set());

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef,   () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const [location, setLocation] = useLocation();
  const { user, roles, signOut } = useAuth();
  const { toast } = useToast();
  const signOutMutation = useSignOut();

  const navItems  = getNavForRole(roles);
  const roleLabel = getRoleLabel(roles);
  const roleKey   = getRoleKey(roles);
  const roleEmoji = getRoleEmoji(roles);
  const initial   = (user?.fullName || "U")[0].toUpperCase();

  const notifs      = NOTIFS[roleKey] || NOTIFS.citizen;
  const unreadCount = notifs.filter(n => n.unread && !readIds.has(n.id)).length;

  const handleSignOut = () => {
    setProfileOpen(false);
    signOutMutation.mutate(undefined as any, {
      onSettled: () => {
        signOut();
        toast({ title: "Signed out", description: "You have been signed out successfully." });
        setLocation("/auth");
      },
    });
  };

  const markAllRead = () => setReadIds(new Set(notifs.map(n => n.id)));

  const isActive = (item: NavItem) =>
    location === item.path ||
    (item.path.split("/").length > 2 && location.startsWith(item.path));

  /* ── Sidebar content ── */
  const SidebarContent = () => (
    <div className="dash-sidebar flex flex-col h-full" style={{ fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>

      {/* ── Logo bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.08)",
      }}>
        <div className="dl-sidebar-logo-ring">
          <SwachhLogoIcon size={26} />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "#fff", letterSpacing: "-0.01em", fontFamily: "'Inter', sans-serif" }}>
            SwachhSaathi
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}>
            <Leaf style={{ width: 9, height: 9 }} /> Clean &amp; Green India
          </div>
        </div>
      </div>

      {/* ── User card ── */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="dl-avatar">{initial}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
              {user?.fullName || "User"}
            </div>
            <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>{roleEmoji}</span>
              <span className="gov-role-badge" style={{ fontSize: 9 }}>{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto dash-scroll" style={{ padding: "6px 0" }}>
        <div className="dl-nav-section">Navigation</div>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`dash-nav-item${active ? " active" : ""}`}
              onClick={() => setSidebarOpen(false)}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item.accentColor ? (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: active ? item.accentColor : `${item.accentColor}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s, box-shadow 0.2s",
                  boxShadow: active ? `0 2px 8px ${item.accentColor}66` : "none",
                }}>
                  <item.icon style={{ width: 14, height: 14, color: active ? "#fff" : item.accentColor }} />
                </div>
              ) : (
                <item.icon className="dash-nav-icon" style={{ width: 15, height: 15 }} />
              )}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className={item.accentColor ? "dl-live-badge" : "dl-live-badge"}
                  style={item.accentColor ? { background: `linear-gradient(135deg, ${item.accentColor}, ${item.accentColor}cc)` } : undefined}
                >{item.badge}</span>
              )}
              {active && (
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.accentColor ?? "#a5d6a7", boxShadow: `0 0 5px ${item.accentColor ?? "#a5d6a7"}` }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom buttons ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "4px 0" }}>
        <button
          className="dl-sidebar-bottom-btn"
          style={{ color: "rgba(255,255,255,0.55)" }}
          onClick={() => {
            setSidebarOpen(false);
            const base = roles.includes("admin") ? "/admin"
              : roles.includes("worker") ? "/worker"
              : roles.includes("ngo") ? "/ngo"
              : roles.includes("scrap_dealer") ? "/scrap"
              : "/citizen";
            setLocation(`${base}/settings`);
          }}
        >
          <Settings style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>Settings</span>
        </button>
        <button
          onClick={handleSignOut}
          className="dl-sidebar-bottom-btn"
          style={{ color: "rgba(255,120,120,0.85)" }}
          data-testid="button-signout"
        >
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="dl-page-bg" style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>
      <style>{LAYOUT_CSS}</style>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col" style={{ width: 224, flexShrink: 0 }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }} className="lg:hidden">
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ position: "relative", width: 224, height: "100%", zIndex: 10, display: "flex", flexDirection: "column" }}>
            <button
              style={{
                position: "absolute", top: 12, right: 12, zIndex: 20,
                background: "rgba(255,255,255,0.18)", border: "none",
                borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff",
                boxShadow: "2px 2px 6px rgba(0,0,0,0.3)",
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* ── Header ── */}
        <header
          className="dash-header"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "0 24px", height: 56, flexShrink: 0,
            position: "relative", zIndex: 30, overflow: "visible",
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            style={{
              background: "linear-gradient(145deg,#fff,#f5fbf5)",
              border: "1px solid #c8e6c9", borderRadius: 10,
              padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center",
              boxShadow: "2px 2px 6px #c5d8c5,-1px -1px 4px #fff",
              flexShrink: 0,
            }}
            onClick={() => setSidebarOpen(true)}
            data-testid="button-menu"
          >
            <Menu style={{ width: 16, height: 16, color: "#2e7d32" }} />
          </button>

          {/* Mobile brand logo — shown only on mobile when no title */}
          {!title && (
            <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SwachhLogoIcon size={30} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#1a2e1a", letterSpacing: "-0.01em", fontFamily: "'Inter',sans-serif", lineHeight: 1 }}>
                  SwachhSaathi
                </div>
                <div style={{ fontSize: 9, color: "#5d7a5e", fontWeight: 600, marginTop: 1 }}>Clean &amp; Green India</div>
              </div>
            </div>
          )}

          {/* Page title */}
          {title && (
            <h1 className="dl-header-title">
              <Leaf style={{ width: 15, height: 15, color: "#4caf50", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
            </h1>
          )}

          <div style={{ flex: 1 }} />

          {/* ── Eco tagline chip (desktop only) ── */}
          <div style={{
            display: "none",
            alignItems: "center", gap: 5, padding: "4px 12px",
            background: "linear-gradient(135deg,#e8f5e9,#dcedc8)",
            borderRadius: 999, fontSize: 11, fontWeight: 700, color: "#2e7d32",
            border: "1px solid #a5d6a7",
            boxShadow: "inset 1px 1px 3px #b0ccb2",
          }} className="lg:flex">
            🌿 SwachhSaathi
          </div>

          {/* ── Notification bell ── */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              className="dl-notif-btn"
              onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
              data-testid="button-notifications"
              style={{
                background: notifOpen ? "linear-gradient(145deg,#e8f5e9,#dcedc8)" : undefined,
                borderColor: notifOpen ? "#81c784" : undefined,
              }}
            >
              <Bell style={{ width: 17, height: 17, color: "#2e7d32" }} />
              {unreadCount > 0 && (
                <span className="dl-notif-badge">{unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div
                className="gov-dropdown notif-dropdown-panel"
                style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 330, zIndex: 100 }}
              >
                {/* Dropdown header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid #c8e6c9",
                  background: "linear-gradient(145deg,#fafffe,#f4faf4)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(145deg,#e8f5e9,#c8e6c9)", boxShadow: "2px 2px 5px #b0ccb2,-1px -1px 3px #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bell style={{ width: 13, height: 13, color: "#2e7d32" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#1a2e1a", fontFamily: "'Inter', sans-serif" }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ background: "linear-gradient(135deg,#ef5350,#c62828)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#2e7d32", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                  >
                    <CheckCheck style={{ width: 12, height: 12 }} /> Mark all read
                  </button>
                </div>

                {/* Notification list */}
                <div className="dash-scroll" style={{ maxHeight: 290, overflowY: "auto" }}>
                  {notifs.map((n) => {
                    const isUnread = n.unread && !readIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => setReadIds(prev => new Set(prev).add(n.id))}
                        className="gov-dropdown-item"
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                          background: isUnread ? "linear-gradient(145deg,#e8f5e9,#f1f8e9)" : "transparent",
                          borderBottom: "1px solid #e8f5e9",
                        }}
                      >
                        <span style={{ fontSize: 16, flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}>{n.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e1a", fontFamily: "'Inter', sans-serif" }}>{n.title}</span>
                            {isUnread && <span className="eco-notif-dot" />}
                          </div>
                          <p style={{ fontSize: 11, color: "#5d7a5e", margin: "2px 0 0", lineHeight: 1.4 }}>{n.body}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3, color: "#8fa98f" }}>
                            <Clock style={{ width: 10, height: 10 }} />
                            <span style={{ fontSize: 10 }}>{n.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: "8px 14px", borderTop: "1px solid #c8e6c9", textAlign: "center" }}>
                  <button
                    onClick={() => setNotifOpen(false)}
                    style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Profile dropdown ── */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              className="dl-profile-btn"
              onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
              style={{
                background: profileOpen ? "linear-gradient(145deg,#e8f5e9,#dcedc8)" : undefined,
                borderColor: profileOpen ? "#81c784" : undefined,
              }}
            >
              <div className="dl-header-avatar">{initial}</div>
              <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", fontFamily: "'Inter', sans-serif" }}>
                {user?.fullName?.split(" ")[0] || "User"}
              </span>
              <ChevronDown className="hidden sm:inline" style={{ width: 13, height: 13, color: "#5d7a5e" }} />
            </button>

            {profileOpen && (
              <div className="gov-dropdown profile-dropdown-panel" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 210, zIndex: 100 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #c8e6c9", background: "linear-gradient(145deg,#fafffe,#f4faf4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div className="dl-header-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{initial}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#1a2e1a", fontFamily: "'Inter', sans-serif" }}>{user?.fullName || "User"}</div>
                      <div style={{ fontSize: 11, color: "#5d7a5e", marginTop: 1 }}>{user?.email || ""}</div>
                    </div>
                  </div>
                  <span className="gov-role-badge">{roleEmoji} {roleLabel}</span>
                </div>
                <button className="gov-dropdown-item">
                  <Settings style={{ width: 13, height: 13, color: "#5d7a5e" }} />
                  <span>Settings</span>
                </button>
                <div className="gov-dropdown-divider" />
                <button
                  className="gov-dropdown-item"
                  onClick={handleSignOut}
                  style={{ color: "#c62828" }}
                  data-testid="button-signout-profile"
                >
                  <LogOut style={{ width: 13, height: 13 }} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="dl-main-content dash-scroll">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation bar ── */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`mobile-nav-item${active ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.badge && <span className="mobile-nav-badge">{item.badge}</span>}
                <div className="mobile-nav-icon-wrap">
                  {item.accentColor ? (
                    <item.icon style={{ width: 18, height: 18, color: active ? "#fff" : "rgba(255,255,255,0.55)" }} />
                  ) : (
                    <item.icon style={{ width: 18, height: 18, color: active ? "#fff" : "rgba(255,255,255,0.55)" }} />
                  )}
                </div>
                <span style={{ fontSize: 9, lineHeight: 1.2 }}>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
