import { useState } from "react";
import { useLocation } from "wouter";
import {
  Recycle, Camera, ShoppingBag, Gift, Truck, Shield,
  BarChart3, Users, Award, CheckCircle, Menu, X, ArrowRight,
  MapPin, Phone, Mail,
} from "lucide-react";
import { SwachhLogoIcon } from "@/components/SwachhLogo";

const NAV_LINKS = [
  { label: "Home",        id: "home"        },
  { label: "Features",    id: "features"    },
  { label: "Dashboard",   id: "dashboard"   },
  { label: "Marketplace", id: "marketplace" },
  { label: "Rewards",     id: "rewards"     },
  { label: "About",       id: "about"       },
];

const FEATURES = [
  { icon: Camera,      label: "Waste Reporting",    desc: "Upload a photo and report waste locations. AI classifies waste type for faster pickup scheduling.",    color: "#c0392b" },
  { icon: BarChart3,   label: "Smart Dashboard",    desc: "Live bin status, analytics, pickup scheduling, and city reports in one structured view.",              color: "#1a5276" },
  { icon: ShoppingBag, label: "Scrap Marketplace",  desc: "List and sell scrap at live market rates. Get pickup scheduled and payment directly.",                 color: "#6c3483" },
  { icon: Gift,        label: "Rewards Wallet",     desc: "Every green action earns points. Redeem for vouchers, mobile recharge, or government benefits.",       color: "#b7950b" },
  { icon: Truck,       label: "Pickup Scheduling",  desc: "Schedule doorstep waste pickups. Workers are assigned automatically based on zone and availability.",  color: "#1e8449" },
  { icon: Shield,      label: "Peer Verification",  desc: "Citizens verify each other's reports for accuracy. Earn 10 points per verification.",                  color: "#ca6f1e" },
];

const STATS = [
  { value: "24L+",   label: "Tonnes Recycled"      },
  { value: "1.8L+",  label: "Active Citizens"      },
  { value: "₹320Cr+",label: "Points Rewarded"      },
  { value: "840+",   label: "Cities Covered"       },
];

const SCRAP = [
  { name: "Aluminium",   price: "₹142/kg", trend: "+3.2%", icon: "🥫", up: true  },
  { name: "Copper Wire", price: "₹580/kg", trend: "+1.8%", icon: "🔧", up: true  },
  { name: "Cardboard",   price: "₹18/kg",  trend: "-0.5%", icon: "📦", up: false },
  { name: "Plastic PET", price: "₹22/kg",  trend: "+2.1%", icon: "♻️", up: true  },
  { name: "Iron/Steel",  price: "₹38/kg",  trend: "+0.9%", icon: "⚙️", up: true  },
  { name: "E-Waste",     price: "₹95/kg",  trend: "+5.3%", icon: "💻", up: true  },
];

const REWARDS = [
  { icon: "☕", title: "Café Voucher",    pts: 200  },
  { icon: "📱", title: "Mobile Recharge", pts: 500  },
  { icon: "🌳", title: "Plant a Tree",    pts: 150  },
  { icon: "💳", title: "UPI Cashback",    pts: 1000 },
  { icon: "🛒", title: "Shopping Credit", pts: 750  },
  { icon: "🎓", title: "Course Unlock",   pts: 300  },
];

const DEMO_REPORTS = [
  { addr: "Connaught Place, Delhi",    type: "Plastic", status: "Pending",   statusClass: "gov-badge gov-badge-yellow" },
  { addr: "Bandra West, Mumbai",       type: "Metal",   status: "Assigned",  statusClass: "gov-badge gov-badge-blue"   },
  { addr: "Koramangala, Bangalore",    type: "E-Waste", status: "Completed", statusClass: "gov-badge gov-badge-green"  },
];

const DEMO_BINS = [
  { loc: "Block A", pct: 85, status: "Full",   pillClass: "bin-pill-full"   },
  { loc: "Block B", pct: 42, status: "Good",   pillClass: "bin-pill-empty"  },
  { loc: "Block C", pct: 67, status: "Medium", pillClass: "bin-pill-medium" },
  { loc: "Block D", pct: 15, status: "Good",   pillClass: "bin-pill-empty"  },
];

const TEAM = [
  { name: "Rahul Sharma", role: "Founder & CEO",    emoji: "👨‍💼", city: "New Delhi"  },
  { name: "Priya Patel",  role: "CTO & AI Lead",    emoji: "👩‍💻", city: "Bangalore"  },
  { name: "Amit Verma",   role: "Head of Ops",      emoji: "👨‍🔧", city: "Mumbai"     },
  { name: "Sneha Reddy",  role: "Product Designer", emoji: "👩‍🎨", city: "Hyderabad"  },
];

const TESTIMONIALS = [
  { text: "SwachhSaathi changed how our colony handles waste. We've earned ₹4,200 in just 3 months!", name: "Kavita S.", city: "Pune"      },
  { text: "The waste reporting is very easy. Photo + location — done. Workers come within 24 hours.", name: "Arjun K.",  city: "Bangalore" },
  { text: "Selling scrap has never been easier. Instant payment, reliable pickup, great prices.",     name: "Meera T.",  city: "Chennai"   },
];

/* ── Inline CSS ── */
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Roboto', Arial, sans-serif; }
  .lp-root { background: #f0f2f5; color: #1c2833; font-family: 'Roboto', Arial, sans-serif; min-height: 100vh; }
  
  /* Navbar */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: #1a5276; border-bottom: 2px solid #154360;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px;
  }
  .lp-nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .lp-nav-logo-text { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
  .lp-nav-logo-sub  { font-size: 10px; color: rgba(255,255,255,0.55); margin-top: 1px; }
  .lp-nav-links { display: flex; gap: 0; }
  .lp-nav-link {
    padding: 0 14px; height: 56px; display: flex; align-items: center;
    font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75);
    border: none; background: none; cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: color .15s, border-color .15s;
  }
  .lp-nav-link:hover { color: #fff; border-bottom-color: #1a6b3c; }
  .lp-nav-actions { display: flex; align-items: center; gap: 10px; }
  .lp-btn-outline { padding: 7px 18px; border: 1px solid rgba(255,255,255,0.4); borderRadius: 3px; font-size: 13px; font-weight: 600; color: #fff; background: transparent; cursor: pointer; border-radius: 3px; }
  .lp-btn-outline:hover { background: rgba(255,255,255,0.1); }
  .lp-btn-primary { padding: 7px 20px; border: none; border-radius: 3px; font-size: 13px; font-weight: 700; color: #fff; background: #1a6b3c; cursor: pointer; }
  .lp-btn-primary:hover { background: #145a32; }
  .lp-mobile-toggle { display: none; border: none; background: none; color: #fff; cursor: pointer; }

  /* Sections */
  .lp-section { max-width: 1100px; margin: 0 auto; padding: 60px 24px; }
  .lp-section-title {
    font-size: 22px; font-weight: 800; color: #1c2833; margin-bottom: 6px;
    padding-bottom: 10px; border-bottom: 2px solid #1a5276; display: inline-block;
  }
  .lp-section-sub { font-size: 14px; color: #5d6d7e; margin-bottom: 32px; margin-top: 6px; }

  /* Hero */
  .lp-hero {
    background: #1a5276; color: #fff; padding: 80px 24px 60px;
    margin-top: 56px; border-bottom: 3px solid #154360;
  }
  .lp-hero-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
  .lp-hero-eyebrow { display: inline-block; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 2px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .lp-hero-title { font-size: 42px; font-weight: 900; line-height: 1.1; margin-bottom: 16px; }
  .lp-hero-title span { color: #82e0aa; }
  .lp-hero-desc { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 24px; }
  .lp-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .lp-hero-btn-primary { padding: 12px 28px; border: none; border-radius: 3px; font-size: 14px; font-weight: 800; color: #fff; background: #1a6b3c; cursor: pointer; display: flex; align-items: center; gap: 6px; }
  .lp-hero-btn-primary:hover { background: #145a32; }
  .lp-hero-btn-outline { padding: 12px 24px; border: 1px solid rgba(255,255,255,0.4); border-radius: 3px; font-size: 14px; font-weight: 700; color: #fff; background: transparent; cursor: pointer; }
  .lp-hero-btn-outline:hover { background: rgba(255,255,255,0.08); }
  .lp-hero-badges { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
  .lp-hero-badge { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.55); }

  /* Stats banner */
  .lp-stats { background: #154360; padding: 28px 24px; }
  .lp-stats-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 0; }
  .lp-stat-item { text-align: center; padding: 12px; border-right: 1px solid rgba(255,255,255,0.12); }
  .lp-stat-item:last-child { border-right: none; }
  .lp-stat-val { font-size: 28px; font-weight: 900; color: #fff; }
  .lp-stat-lbl { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 3px; }

  /* Feature grid */
  .lp-feature-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .lp-feature-card { background: #fff; border: 1px solid #d5dae1; border-radius: 3px; padding: 20px; }
  .lp-feature-icon { width: 40px; height: 40px; border-radius: 3px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .lp-feature-title { font-size: 14px; font-weight: 800; color: #1c2833; margin-bottom: 6px; }
  .lp-feature-desc { font-size: 13px; color: #5d6d7e; line-height: 1.55; }

  /* Dashboard preview */
  .lp-dash-preview { background: #fff; border: 1px solid #d5dae1; border-radius: 3px; overflow: hidden; }
  .lp-dash-tabs { display: flex; background: #f4f6f9; border-bottom: 1px solid #d5dae1; }
  .lp-dash-tab { padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: none; color: #5d6d7e; border-bottom: 3px solid transparent; }
  .lp-dash-tab.active { color: #1a5276; border-bottom-color: #1a5276; background: #fff; }
  .lp-dash-body { padding: 20px; }

  /* Bar chart */
  .lp-bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 100px; margin-bottom: 8px; }
  .lp-bar { flex: 1; border-radius: 2px 2px 0 0; border: 1px solid #d5dae1; min-height: 4px; }
  .lp-bar.active { background: #1a6b3c !important; border-color: #1a6b3c; }
  .lp-bar-labels { display: flex; gap: 8px; }
  .lp-bar-label { flex: 1; text-align: center; font-size: 10px; color: #909caa; }

  /* Marketplace table */
  .lp-gov-section { background: #f0f2f5; }
  
  /* Reward cards */
  .lp-reward-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .lp-reward-card { background: #fff; border: 1px solid #d5dae1; border-radius: 3px; padding: 18px; text-align: center; }
  .lp-reward-emoji { font-size: 28px; margin-bottom: 10px; }
  .lp-reward-title { font-size: 13px; font-weight: 700; color: #1c2833; margin-bottom: 4px; }
  .lp-reward-pts { font-size: 12px; color: #1a6b3c; font-weight: 700; }
  .lp-reward-btn { margin-top: 10px; padding: 6px 14px; border: 1px solid #1a5276; border-radius: 3px; font-size: 12px; font-weight: 600; color: #1a5276; background: #fff; cursor: pointer; }
  .lp-reward-btn:hover { background: #eaf2f8; }

  /* Team */
  .lp-team-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .lp-team-card { background: #fff; border: 1px solid #d5dae1; border-radius: 3px; padding: 20px; text-align: center; }
  .lp-team-emoji { font-size: 36px; margin-bottom: 8px; }
  .lp-team-name { font-size: 14px; font-weight: 800; color: #1c2833; }
  .lp-team-role { font-size: 12px; color: #5d6d7e; margin-top: 3px; }
  .lp-team-city { font-size: 11px; color: #909caa; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 3px; }

  /* Testimonials */
  .lp-test-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .lp-test-card { background: #fff; border: 1px solid #d5dae1; border-left: 3px solid #1a5276; border-radius: 3px; padding: 18px; }
  .lp-test-text { font-size: 13px; color: #1c2833; line-height: 1.6; margin-bottom: 12px; font-style: italic; }
  .lp-test-name { font-size: 13px; font-weight: 700; color: #1c2833; }
  .lp-test-city { font-size: 12px; color: #5d6d7e; }

  /* Footer */
  .lp-footer { background: #1a5276; color: rgba(255,255,255,0.6); }
  .lp-footer-inner { max-width: 1100px; margin: 0 auto; padding: 40px 24px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px; }
  .lp-footer-brand { font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 8px; }
  .lp-footer-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; }
  .lp-footer-heading { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .lp-footer-link { display: block; font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 7px; cursor: pointer; text-decoration: none; }
  .lp-footer-link:hover { color: rgba(255,255,255,0.8); }
  .lp-footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 16px 24px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.3); max-width: 1100px; margin: 0 auto; }
  .lp-footer-contact { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 8px; }

  /* Responsive */
  @media (max-width: 768px) {
    .lp-hero-inner { grid-template-columns: 1fr; }
    .lp-feature-grid { grid-template-columns: 1fr; }
    .lp-stats-inner { grid-template-columns: repeat(2,1fr); }
    .lp-reward-grid { grid-template-columns: repeat(2,1fr); }
    .lp-team-grid { grid-template-columns: repeat(2,1fr); }
    .lp-test-grid { grid-template-columns: 1fr; }
    .lp-footer-inner { grid-template-columns: 1fr; }
    .lp-nav-links { display: none; }
    .lp-nav-actions { display: none; }
    .lp-mobile-toggle { display: block; }
    .lp-mobile-menu { position: fixed; top: 56px; left: 0; right: 0; background: #1a5276; border-top: 1px solid rgba(255,255,255,0.1); padding: 12px 0; z-index: 99; }
    .lp-mobile-menu-link { display: block; padding: 12px 24px; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.8); border: none; background: none; cursor: pointer; width: 100%; text-align: left; }
    .lp-hero-title { font-size: 30px; }
  }

  .lp-cta-section { background: #1a6b3c; padding: 60px 24px; text-align: center; color: #fff; }
  .lp-cta-title { font-size: 28px; font-weight: 900; margin-bottom: 10px; }
  .lp-cta-sub { font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
  .lp-cta-btn { padding: 14px 36px; border: none; border-radius: 3px; font-size: 15px; font-weight: 800; color: #1a6b3c; background: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
  .lp-cta-btn:hover { background: #f0f2f5; }
`;

export default function LandingPage() {
  const [, setLocation]  = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dashTab,    setDashTab]    = useState<"reports"|"bins"|"analytics">("reports");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  const BAR_DATA = [30, 55, 40, 80, 65, 90, 72];
  const BAR_LBLS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div className="lp-root">
      <style>{css}</style>

      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo" onClick={() => scrollTo("home")}>
          <SwachhLogoIcon size={30} />
          <div>
            <div className="lp-nav-logo-text">SwachhSaathi</div>
            <div className="lp-nav-logo-sub">Clean & Green</div>
          </div>
        </div>

        <div className="lp-nav-links">
          {NAV_LINKS.map(n => (
            <button key={n.id} className="lp-nav-link" onClick={() => scrollTo(n.id)}>{n.label}</button>
          ))}
        </div>

        <div className="lp-nav-actions">
          <button className="lp-btn-outline" onClick={() => setLocation("/auth")}>Sign In</button>
          <button className="lp-btn-primary" onClick={() => setLocation("/auth")}>Get Started →</button>
        </div>

        <button className="lp-mobile-toggle" onClick={() => setMobileMenu(v => !v)}>
          {mobileMenu ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="lp-mobile-menu">
          {NAV_LINKS.map(n => (
            <button key={n.id} className="lp-mobile-menu-link" onClick={() => scrollTo(n.id)}>{n.label}</button>
          ))}
          <div style={{ padding: "12px 24px", display: "flex", gap: 10 }}>
            <button className="lp-btn-outline" style={{ flex: 1 }} onClick={() => setLocation("/auth")}>Sign In</button>
            <button className="lp-btn-primary" style={{ flex: 1 }} onClick={() => setLocation("/auth")}>Get Started</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="home" className="lp-hero">
        <div className="lp-hero-inner">
          <div>
            <div className="lp-hero-eyebrow">🇮🇳 India's Civic Waste Platform</div>
            <h1 className="lp-hero-title">
              Clean &amp; <span>Green Future</span><br />
              <span style={{ fontSize: "0.55em", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>— for every Indian</span>
            </h1>
            <p className="lp-hero-desc">
              Report waste, sell scrap, earn rewards and track your eco-impact in real time.
              Join 1.8 lakh+ citizens building a cleaner India.
            </p>
            <div className="lp-hero-btns">
              <button className="lp-hero-btn-primary" onClick={() => setLocation("/auth")}>
                Get Started <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
              <button className="lp-hero-btn-outline" onClick={() => scrollTo("features")}>
                View Features
              </button>
            </div>
            <div className="lp-hero-badges">
              {[{e:"✅",l:"Eco Verified"},{e:"🏆",l:"#1 in India"},{e:"🔒",l:"Secure & Trusted"},{e:"🌿",l:"100% Free"}].map(b => (
                <div key={b.l} className="lp-hero-badge"><span>{b.e}</span><span>{b.l}</span></div>
              ))}
            </div>
          </div>

          {/* Preview panel */}
          <div className="lp-dash-preview">
            <div style={{ background: "#154360", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a6b3c" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>SwachhSaathi Dashboard</div>
            </div>
            <div className="lp-dash-tabs">
              {(["reports","bins","analytics"] as const).map(t => (
                <button key={t} className={`lp-dash-tab${dashTab === t ? " active" : ""}`} onClick={() => setDashTab(t)}
                  style={{ textTransform: "capitalize" }}>{t}</button>
              ))}
            </div>
            <div className="lp-dash-body">
              {dashTab === "reports" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f4f6f9" }}>
                      <th style={{ padding: "7px 10px", textAlign: "left", color: "#5d6d7e", fontWeight: 700, fontSize: 11 }}>Location</th>
                      <th style={{ padding: "7px 10px", textAlign: "left", color: "#5d6d7e", fontWeight: 700, fontSize: 11 }}>Type</th>
                      <th style={{ padding: "7px 10px", textAlign: "left", color: "#5d6d7e", fontWeight: 700, fontSize: 11 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_REPORTS.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f2f5" }}>
                        <td style={{ padding: "8px 10px", color: "#1c2833", fontWeight: 600 }}>{r.addr}</td>
                        <td style={{ padding: "8px 10px", color: "#5d6d7e" }}>{r.type}</td>
                        <td style={{ padding: "8px 10px" }}><span className={r.statusClass}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {dashTab === "bins" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f4f6f9" }}>
                      <th style={{ padding: "7px 10px", textAlign: "left", color: "#5d6d7e", fontWeight: 700, fontSize: 11 }}>Zone</th>
                      <th style={{ padding: "7px 10px", textAlign: "left", color: "#5d6d7e", fontWeight: 700, fontSize: 11 }}>Fill %</th>
                      <th style={{ padding: "7px 10px", textAlign: "left", color: "#5d6d7e", fontWeight: 700, fontSize: 11 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_BINS.map((b, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f2f5" }}>
                        <td style={{ padding: "8px 10px", color: "#1c2833", fontWeight: 600 }}>{b.loc}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "#f0f2f5", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", width: `${b.pct}%`,
                                background: b.pct >= 80 ? "#c0392b" : b.pct >= 50 ? "#b7950b" : "#1e8449",
                              }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#1c2833", minWidth: 28 }}>{b.pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "8px 10px" }}><span className={b.pillClass}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {dashTab === "analytics" && (
                <div>
                  <div className="lp-bar-chart">
                    {BAR_DATA.map((h, i) => (
                      <div key={i} className={`lp-bar${i === 5 ? " active" : ""}`} style={{ height: `${h}%`, background: i === 5 ? undefined : "#d5f5e3" }} />
                    ))}
                  </div>
                  <div className="lp-bar-labels">
                    {BAR_LBLS.map((d, i) => <div key={i} className="lp-bar-label">{d}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
                    {[{l:"Plastic",v:"38%",c:"#1a5276"},{l:"Metal",v:"25%",c:"#b7950b"},{l:"Organic",v:"37%",c:"#1e8449"}].map(x => (
                      <div key={x.l} style={{ textAlign: "center", padding: "8px", border: "1px solid #d5dae1", borderRadius: 3, background: "#f9fafb" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: x.c }}>{x.v}</div>
                        <div style={{ fontSize: 11, color: "#5d6d7e" }}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <div className="lp-stats">
        <div className="lp-stats-inner">
          {STATS.map(s => (
            <div key={s.label} className="lp-stat-item">
              <div className="lp-stat-val">{s.value}</div>
              <div className="lp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features">
        <div className="lp-section">
          <div className="lp-section-title">Platform Features</div>
          <p className="lp-section-sub">Everything you need to report, manage, and reward civic cleanliness.</p>
          <div className="lp-feature-grid">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="lp-feature-card">
                  <div className="lp-feature-icon" style={{ background: `${f.color}18`, border: `1px solid ${f.color}40` }}>
                    <Icon style={{ width: 18, height: 18, color: f.color }} />
                  </div>
                  <div className="lp-feature-title">{f.label}</div>
                  <div className="lp-feature-desc">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section id="dashboard" style={{ background: "#e8ecf0", padding: "60px 0", borderTop: "1px solid #d5dae1", borderBottom: "1px solid #d5dae1" }}>
        <div className="lp-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="lp-section-title">How It Works</div>
          <p className="lp-section-sub">A role-based platform for citizens, workers, NGOs, scrap dealers and administrators.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
            {[
              { role: "Citizen",       emoji: "🌿", desc: "Report waste, earn rewards, donate, join events",         color: "#1e8449" },
              { role: "Worker",        emoji: "🚛", desc: "Accept pickup tasks, scan dustbins, update status",        color: "#1a5276" },
              { role: "NGO",           emoji: "🤝", desc: "Collect donations, organise events, manage volunteers",    color: "#ca6f1e" },
              { role: "Scrap Dealer",  emoji: "♻️", desc: "Browse scrap listings, schedule pickup, pay citizens",     color: "#6c3483" },
              { role: "Admin",         emoji: "🛡️", desc: "Manage users, approve reports, configure the platform",    color: "#c0392b" },
            ].map(r => (
              <div key={r.role} style={{ background: "#fff", border: "1px solid #d5dae1", borderTop: `3px solid ${r.color}`, borderRadius: 3, padding: "18px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{r.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1c2833", marginBottom: 6 }}>{r.role}</div>
                <div style={{ fontSize: 12, color: "#5d6d7e", lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE ── */}
      <section id="marketplace">
        <div className="lp-section">
          <div className="lp-section-title">Scrap Marketplace</div>
          <p className="lp-section-sub">Live market rates updated daily. List your scrap and get the best price.</p>
          <div style={{ background: "#fff", border: "1px solid #d5dae1", borderRadius: 3, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f4f6f9", borderBottom: "1px solid #d5dae1" }}>
                  {["Material","Today's Price","Trend","Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#5d6d7e", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCRAP.map((s, i) => (
                  <tr key={s.name} style={{ borderBottom: i < SCRAP.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#1c2833" }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 15, color: "#1e8449" }}>{s.price}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.up ? "#1e8449" : "#c0392b" }}>
                        {s.trend}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => setLocation("/auth")}
                        style={{ padding: "6px 16px", border: "1px solid #1a5276", borderRadius: 3, fontSize: 12, fontWeight: 600, color: "#1a5276", background: "#fff", cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#eaf2f8"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
                      >Sell Now</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── REWARDS ── */}
      <section id="rewards" style={{ background: "#e8ecf0", borderTop: "1px solid #d5dae1", borderBottom: "1px solid #d5dae1" }}>
        <div className="lp-section">
          <div className="lp-section-title">Rewards Catalog</div>
          <p className="lp-section-sub">Earn points through eco-actions. Redeem for real rewards.</p>
          <div className="lp-reward-grid">
            {REWARDS.map(r => (
              <div key={r.title} className="lp-reward-card">
                <div className="lp-reward-emoji">{r.icon}</div>
                <div className="lp-reward-title">{r.title}</div>
                <div className="lp-reward-pts">{r.pts} points</div>
                <button className="lp-reward-btn" onClick={() => setLocation("/auth")}>Redeem →</button>
              </div>
            ))}
          </div>

          {/* Points earn table */}
          <div style={{ marginTop: 32, background: "#fff", border: "1px solid #d5dae1", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#f4f6f9", borderBottom: "1px solid #d5dae1" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1c2833" }}>How to Earn Points</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  { action: "Submit a waste report",           pts: "+50 pts" },
                  { action: "Verify a peer's report",          pts: "+10 pts" },
                  { action: "Donate items to NGO",             pts: "+50 pts" },
                  { action: "Complete a training module",      pts: "+75 pts" },
                  { action: "Participate in community event",  pts: "+100 pts"},
                  { action: "Sell scrap via marketplace",      pts: "+30 pts" },
                ].map((row, i, arr) => (
                  <tr key={row.action} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#1c2833", display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle style={{ width: 13, height: 13, color: "#1e8449", flexShrink: 0 }} />{row.action}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 800, color: "#1e8449", textAlign: "right" }}>{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about">
        <div className="lp-section">
          <div className="lp-section-title">About SwachhSaathi</div>
          <p className="lp-section-sub">A civic-tech initiative to make India cleaner through community participation and technology.</p>

          {/* Team */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2833", marginBottom: 14 }}>Our Team</div>
            <div className="lp-team-grid">
              {TEAM.map(m => (
                <div key={m.name} className="lp-team-card">
                  <div className="lp-team-emoji">{m.emoji}</div>
                  <div className="lp-team-name">{m.name}</div>
                  <div className="lp-team-role">{m.role}</div>
                  <div className="lp-team-city">
                    <MapPin style={{ width: 10, height: 10, color: "#909caa" }} />{m.city}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2833", marginBottom: 14 }}>What Citizens Say</div>
            <div className="lp-test-grid">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="lp-test-card">
                  <div style={{ fontSize: 18, marginBottom: 8 }}>⭐⭐⭐⭐⭐</div>
                  <p className="lp-test-text">"{t.text}"</p>
                  <div className="lp-test-name">{t.name}</div>
                  <div className="lp-test-city">{t.city}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="lp-cta-section">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div className="lp-cta-title">Join the SwachhSaathi Movement</div>
          <div className="lp-cta-sub">Register as a Citizen, Worker, NGO or Scrap Dealer and start making a difference today.</div>
          <button className="lp-cta-btn" onClick={() => setLocation("/auth")}>
            Create Free Account <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <SwachhLogoIcon size={28} />
              <div className="lp-footer-brand">SwachhSaathi</div>
            </div>
            <div className="lp-footer-desc">India's civic waste management platform. Empowering citizens, NGOs and municipalities to build a cleaner nation.</div>
            <div style={{ marginTop: 20 }}>
              <div className="lp-footer-contact"><Mail style={{ width: 13, height: 13 }} /> support@swachhsaathi.gov.in</div>
              <div className="lp-footer-contact"><Phone style={{ width: 13, height: 13 }} /> 1800-XXX-XXXX (Toll Free)</div>
              <div className="lp-footer-contact"><MapPin style={{ width: 13, height: 13 }} /> New Delhi, India</div>
            </div>
          </div>
          <div>
            <div className="lp-footer-heading">Platform</div>
            {["Dashboard","Reports","Smart Bins","Marketplace","Rewards","Training"].map(l => (
              <a key={l} className="lp-footer-link" onClick={() => setLocation("/auth")}>{l}</a>
            ))}
          </div>
          <div>
            <div className="lp-footer-heading">Roles</div>
            {["Citizen","Sanitation Worker","NGO / Organisation","Scrap Dealer","Administrator"].map(l => (
              <a key={l} className="lp-footer-link">{l}</a>
            ))}
          </div>
          <div>
            <div className="lp-footer-heading">Legal</div>
            {["Privacy Policy","Terms of Use","Data Policy","Grievance Officer","RTI"].map(l => (
              <a key={l} className="lp-footer-link">{l}</a>
            ))}
          </div>
        </div>
        <div className="lp-footer-bottom">
          © 2025 SwachhSaathi Technologies Pvt. Ltd. · Built for a cleaner India 🌿 · All rights reserved.
        </div>
      </footer>
    </div>
  );
}
