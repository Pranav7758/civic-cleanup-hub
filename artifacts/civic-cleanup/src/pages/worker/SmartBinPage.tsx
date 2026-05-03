import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, RefreshCw, Truck, ChevronRight,
  AlertTriangle, CheckCircle, Leaf, X,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import "@/styles/dashboard.css";
import "@/styles/smartbin.css";
import "@/styles/mobile.css";

/* ══════════════════════════════════════════════
   TYPES & CONSTANTS
══════════════════════════════════════════════ */
type BinLevel = "empty" | "medium" | "full";

interface Bin {
  id: string;
  userId: string;
  name: string;
  area: string;
  address: string;
  level: BinLevel;
  updatedAt: Date;
  /* lat/lng in NCR range for map display */
  lat: number;
  lng: number;
  avatar: string;
}

/* Delhi NCR bounding box: lat 28.40–28.88 , lng 76.84–77.54 */
const INITIAL_BINS: Bin[] = [
  { id:"b1",  userId:"u1",  name:"Priya Sharma",    area:"Noida Sec 12",    address:"B-42 Green Park, Noida Sec 12",    level:"full",   updatedAt:new Date(Date.now()-3*60000),  lat:28.573, lng:77.326, avatar:"PS" },
  { id:"b2",  userId:"u2",  name:"Rahul Gupta",     area:"Rajouri Garden",  address:"Block C, Market Area, Delhi",       level:"full",   updatedAt:new Date(Date.now()-7*60000),  lat:28.647, lng:77.117, avatar:"RG" },
  { id:"b3",  userId:"u3",  name:"Ananya Singh",    area:"Lajpat Nagar",    address:"Central Market, Gate 3",            level:"medium", updatedAt:new Date(Date.now()-15*60000), lat:28.564, lng:77.243, avatar:"AS" },
  { id:"b4",  userId:"u4",  name:"Vikram Nair",     area:"Dwarka Sec 7",    address:"Housing Society, Tower D",          level:"medium", updatedAt:new Date(Date.now()-22*60000), lat:28.581, lng:77.046, avatar:"VN" },
  { id:"b5",  userId:"u5",  name:"Sneha Iyer",      area:"Rohini",          address:"Pocket 3, Block B, Rohini",         level:"empty",  updatedAt:new Date(Date.now()-40*60000), lat:28.735, lng:77.097, avatar:"SI" },
  { id:"b6",  userId:"u6",  name:"Arjun Mehta",     area:"Connaught Place", address:"Inner Circle, CP, Delhi",           level:"empty",  updatedAt:new Date(Date.now()-55*60000), lat:28.632, lng:77.220, avatar:"AM" },
  { id:"b7",  userId:"u7",  name:"Kavya Reddy",     area:"Karol Bagh",      address:"Ajmal Khan Road, Block 2",          level:"full",   updatedAt:new Date(Date.now()-2*60000),  lat:28.652, lng:77.191, avatar:"KR" },
  { id:"b8",  userId:"u8",  name:"Rohan Das",       area:"Saket",           address:"Select Citywalk Area, Saket",       level:"medium", updatedAt:new Date(Date.now()-30*60000), lat:28.524, lng:77.211, avatar:"RD" },
  { id:"b9",  userId:"u9",  name:"Meera Joshi",     area:"Vasant Kunj",     address:"Sector B, Pocket 7",                level:"empty",  updatedAt:new Date(Date.now()-70*60000), lat:28.522, lng:77.157, avatar:"MJ" },
  { id:"b10", userId:"u10", name:"Suresh Patel",    area:"Nehru Place",     address:"Core-4, Nehru Place",               level:"medium", updatedAt:new Date(Date.now()-18*60000), lat:28.547, lng:77.251, avatar:"SP" },
  { id:"b11", userId:"u11", name:"Divya Krishnan",  area:"Greater Kailash", address:"M-Block Market, GK-1",              level:"full",   updatedAt:new Date(Date.now()-5*60000),  lat:28.539, lng:77.233, avatar:"DK" },
  { id:"b12", userId:"u12", name:"Aakash Sharma",   area:"Punjabi Bagh",    address:"Ring Road Side, West Delhi",        level:"empty",  updatedAt:new Date(Date.now()-90*60000), lat:28.671, lng:77.130, avatar:"AK" },
];

const LEVEL_COLOR: Record<BinLevel, string> = { full: "#f44336", medium: "#ffc107", empty: "#4caf50" };
const LEVEL_BG:    Record<BinLevel, string> = {
  full:   "linear-gradient(145deg,#ffebee,#ffcdd2)",
  medium: "linear-gradient(145deg,#fff8e1,#fff3cd)",
  empty:  "linear-gradient(145deg,#e8f5e9,#dcedc8)",
};
const FILL_PCT: Record<BinLevel, number> = { full: 85, medium: 48, empty: 10 };
const LEVEL_EMOJI: Record<BinLevel, string> = { full: "🔴", medium: "🟡", empty: "🟢" };

/* Delhi NCR map viewport */
const MAP_LAT_MIN = 28.40;
const MAP_LAT_MAX = 28.88;
const MAP_LNG_MIN = 76.84;
const MAP_LNG_MAX = 77.54;

function latToY(lat: number, h: number) {
  return h - ((lat - MAP_LAT_MIN) / (MAP_LAT_MAX - MAP_LAT_MIN)) * h;
}
function lngToX(lng: number, w: number) {
  return ((lng - MAP_LNG_MIN) / (MAP_LNG_MAX - MAP_LNG_MIN)) * w;
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

/* ── 3D SVG Dustbin ── */
function BinIcon({ level, size = 56 }: { level: BinLevel; size?: number }) {
  const c = LEVEL_COLOR[level];
  const body = level === "full" ? "#ef9a9a" : level === "medium" ? "#ffe082" : "#a5d6a7";
  const lid  = level === "full" ? "#f44336" : level === "medium" ? "#ffc107" : "#4caf50";
  const fill = level === "full" ? "#ef5350" : level === "medium" ? "#ffb300" : "#66bb6a";
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="32" r="20" fill={c} opacity="0.12" />
      <rect x="13" y="20" width="30" height="28" rx="4" fill={body} stroke={lid} strokeWidth="1.5" />
      <rect
        x="15" y={20 + 28 * (1 - FILL_PCT[level] / 100)}
        width="26" height={28 * (FILL_PCT[level] / 100) - 2}
        rx="2" fill={fill} opacity="0.7"
      />
      <rect x="10" y="16" width="36" height="6" rx="3" fill={lid} />
      <rect x="12" y="17" width="32" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
      <rect x="22" y="12" width="12" height="6" rx="3" stroke={lid} strokeWidth="1.5" fill="none" />
      <line x1="21" y1="23" x2="21" y2="44" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <line x1="28" y1="23" x2="28" y2="44" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <line x1="35" y1="23" x2="35" y2="44" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <ellipse cx="28" cy="50" rx="12" ry="3" fill="rgba(0,0,0,0.12)" />
    </svg>
  );
}

/* ── Large 3D bin for modal ── */
function LargeBinIcon({ level }: { level: BinLevel }) {
  const pct  = FILL_PCT[level];
  const fill = level === "full" ? "#ef5350" : level === "medium" ? "#ffb300" : "#66bb6a";
  const body = level === "full" ? "#ffcdd2" : level === "medium" ? "#fff8e1" : "#e8f5e9";
  const lid  = level === "full" ? "#f44336" : level === "medium" ? "#ffc107" : "#4caf50";
  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <svg width="100" height="130" viewBox="0 0 100 130" fill="none">
        <ellipse cx="50" cy="122" rx="28" ry="6" fill="rgba(0,0,0,0.12)" />
        <rect x="18" y="32" width="64" height="80" rx="10" fill={body} stroke={lid} strokeWidth="2.5" />
        <rect
          x="21" y={32 + 80 * (1 - pct / 100)}
          width="58" height={80 * pct / 100 - 4}
          rx="6" fill={fill} opacity="0.75"
          style={{ transition:"y .9s, height .9s" }}
        />
        <rect x="22" y="36" width="14" height="60" rx="6" fill="rgba(255,255,255,0.2)" />
        <rect x="12" y="20" width="76" height="16" rx="8" fill={lid} />
        <rect x="16" y="22" width="68" height="6" rx="3" fill="rgba(255,255,255,0.35)" />
        <rect x="36" y="8" width="28" height="14" rx="7" stroke={lid} strokeWidth="2.5" fill="none" />
        {[36, 50, 64].map(x => (
          <line key={x} x1={x} y1="36" x2={x} y2="106" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
        ))}
      </svg>
      <div style={{
        position:"absolute", bottom:24, left:0, right:0, textAlign:"center",
        fontSize:13, fontWeight:900, color:"rgba(255,255,255,0.9)",
        fontFamily:"'Inter',sans-serif", textShadow:"0 1px 4px rgba(0,0,0,.3)"
      }}>{pct}%</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DELHI NCR SVG MAP BACKGROUND
══════════════════════════════════════════════ */
function DelhiNcrMapBg({ w, h }: { w: number; h: number }) {
  /* Convert real coords to pixel */
  function x(lng: number) { return lngToX(lng, w); }
  function y(lat: number) { return latToY(lat, h); }

  return (
    <svg
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mapBg" x1="0" y1="0" x2={w} y2={h} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0f7f0"/>
          <stop offset="100%" stopColor="#e8f4e8"/>
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={w} height={h} fill="url(#mapBg)" />

      {/* ── Yamuna River ── curving S from north to south-east */}
      <path
        d={`M ${x(77.27)} ${y(28.88)} C ${x(77.28)} ${y(28.76)}, ${x(77.23)} ${y(28.70)}, ${x(77.22)} ${y(28.65)} C ${x(77.21)} ${y(28.60)}, ${x(77.26)} ${y(28.56)}, ${x(77.28)} ${y(28.50)} C ${x(77.30)} ${y(28.44)}, ${x(77.28)} ${y(28.40)}, ${x(77.28)} ${y(28.40)}`}
        fill="none" stroke="#90caf9" strokeWidth="8" strokeLinecap="round" opacity="0.65"
      />
      <path
        d={`M ${x(77.27)} ${y(28.88)} C ${x(77.28)} ${y(28.76)}, ${x(77.23)} ${y(28.70)}, ${x(77.22)} ${y(28.65)} C ${x(77.21)} ${y(28.60)}, ${x(77.26)} ${y(28.56)}, ${x(77.28)} ${y(28.50)} C ${x(77.30)} ${y(28.44)}, ${x(77.28)} ${y(28.40)}, ${x(77.28)} ${y(28.40)}`}
        fill="none" stroke="#64b5f6" strokeWidth="3" strokeLinecap="round" opacity="0.4"
      />
      {/* Yamuna label */}
      <text x={x(77.305)} y={y(28.59)} fontSize="9" fill="#1565c0" fontWeight="700" opacity="0.7" fontFamily="Inter,sans-serif">Yamuna</text>

      {/* ── Ring Road (approximate ellipse around old Delhi) ── */}
      <ellipse
        cx={x(77.19)} cy={y(28.63)} rx={x(77.25)-x(77.13)} ry={y(28.57)-y(28.69)}
        fill="none" stroke="#ffcc02" strokeWidth="3.5" strokeDasharray="10,5" opacity="0.55"
      />
      <text x={x(77.10)} y={y(28.72)} fontSize="8" fill="#8a6900" fontWeight="700" opacity="0.8" fontFamily="Inter,sans-serif">Ring Road</text>

      {/* ── NH-48 (Delhi-Gurugram) ── */}
      <line x1={x(77.22)} y1={y(28.63)} x2={x(77.07)} y2={y(28.45)} stroke="#d84315" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.45"/>
      <text x={x(77.10)} y={y(28.50)} fontSize="8" fill="#bf360c" fontWeight="700" opacity="0.8" fontFamily="Inter,sans-serif" transform={`rotate(-25,${x(77.10)},${y(28.50)})`}>NH-48</text>

      {/* ── NH-9 (Delhi-Noida) ── */}
      <line x1={x(77.24)} y1={y(28.63)} x2={x(77.40)} y2={y(28.57)} stroke="#d84315" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.45"/>
      <text x={x(77.32)} y={y(28.62)} fontSize="8" fill="#bf360c" fontWeight="700" opacity="0.8" fontFamily="Inter,sans-serif">NH-9</text>

      {/* ── NH-44 (GT Road, north) ── */}
      <line x1={x(77.20)} y1={y(28.64)} x2={x(77.18)} y2={y(28.88)} stroke="#d84315" strokeWidth="2" strokeDasharray="6,4" opacity="0.35"/>
      <text x={x(77.15)} y={y(28.80)} fontSize="8" fill="#bf360c" fontWeight="700" opacity="0.7" fontFamily="Inter,sans-serif">NH-44</text>

      {/* ── Metro Blue Line (rough) ── */}
      <line x1={x(77.05)} y1={y(28.64)} x2={x(77.40)} y2={y(28.61)} stroke="#1565c0" strokeWidth="2.5" strokeDasharray="4,3" opacity="0.35"/>
      <text x={x(77.08)} y={y(28.655)} fontSize="7.5" fill="#1565c0" fontWeight="700" opacity="0.65" fontFamily="Inter,sans-serif">Metro Blue</text>

      {/* ── Metro Yellow Line (rough) ── */}
      <line x1={x(77.21)} y1={y(28.88)} x2={x(77.19)} y2={y(28.50)} stroke="#fdd835" strokeWidth="2.5" strokeDasharray="4,3" opacity="0.5"/>

      {/* ── Key locality labels ── */}
      {[
        { label:"Old Delhi",      lat:28.656, lng:77.230 },
        { label:"CP",             lat:28.634, lng:77.220 },
        { label:"Noida",          lat:28.535, lng:77.391 },
        { label:"Gurgaon",        lat:28.459, lng:77.027 },
        { label:"Rohini",         lat:28.745, lng:77.097 },
        { label:"Dwarka",         lat:28.590, lng:77.050 },
        { label:"Saket",          lat:28.522, lng:77.210 },
        { label:"Lajpat Nagar",   lat:28.564, lng:77.244 },
        { label:"Karol Bagh",     lat:28.655, lng:77.190 },
        { label:"Punjabi Bagh",   lat:28.672, lng:77.130 },
        { label:"Vasant Kunj",    lat:28.520, lng:77.156 },
        { label:"Greater Kailash",lat:28.537, lng:77.233 },
      ].map(loc => (
        <text key={loc.label}
          x={x(loc.lng)} y={y(loc.lat) + 3}
          fontSize="8" fill="#2e4a2e" fontWeight="600" fontFamily="Inter,sans-serif"
          opacity="0.65" textAnchor="middle"
        >
          {loc.label}
        </text>
      ))}

      {/* ── NDMC boundary (dashed polygon around central Delhi) ── */}
      <polygon
        points={`${x(77.19)},${y(28.70)} ${x(77.24)},${y(28.67)} ${x(77.25)},${y(28.62)} ${x(77.23)},${y(28.59)} ${x(77.18)},${y(28.59)} ${x(77.16)},${y(28.63)} ${x(77.17)},${y(28.68)}`}
        fill="rgba(200,230,201,0.18)" stroke="#66bb6a" strokeWidth="1" strokeDasharray="5,3"
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function SmartBinPage() {
  const [bins,      setBins]     = useState<Bin[]>(INITIAL_BINS);
  const [filter,    setFilter]   = useState<BinLevel | "all">("all");
  const [selected,  setSelected] = useState<Bin | null>(null);
  const [assigned,  setAssigned] = useState<Set<string>>(new Set());
  const [lastPing,  setLastPing] = useState(new Date());
  const [mapHover,  setMapHover] = useState<string|null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  /* Map container dimensions */
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapDims, setMapDims] = useState({ w: 600, h: 320 });

  useEffect(() => {
    const observe = () => {
      if (mapRef.current) {
        setMapDims({ w: mapRef.current.offsetWidth, h: mapRef.current.offsetHeight });
      }
    };
    observe();
    const ro = new ResizeObserver(observe);
    if (mapRef.current) ro.observe(mapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    tickRef.current = setInterval(() => setLastPing(new Date()), 30_000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const handleAssign = useCallback((binId: string) => {
    setAssigned(prev => new Set(prev).add(binId));
    setBins(prev => prev.map(b => b.id === binId ? { ...b, level: "empty", updatedAt: new Date() } : b));
    setSelected(null);
  }, []);

  const sorted = [...bins].sort((a, b) => {
    const o: Record<BinLevel, number> = { full: 0, medium: 1, empty: 2 };
    return o[a.level] - o[b.level];
  });

  const filtered = sorted.filter(b => filter === "all" || b.level === filter);

  const counts = {
    all:    bins.length,
    full:   bins.filter(b => b.level === "full").length,
    medium: bins.filter(b => b.level === "medium").length,
    empty:  bins.filter(b => b.level === "empty").length,
  };

  const STATS = [
    { key:"all",    icon:"🗑️", label:"Total Bins",    value:counts.all,    color:"#2e7d32", bg:"linear-gradient(145deg,#e8f5e9,#dcedc8)", border:"#a5d6a7" },
    { key:"full",   icon:"🔴", label:"Full — Urgent",  value:counts.full,   color:"#c62828", bg:"linear-gradient(145deg,#ffebee,#ffcdd2)", border:"#ef9a9a" },
    { key:"medium", icon:"🟡", label:"Medium",         value:counts.medium, color:"#e65100", bg:"linear-gradient(145deg,#fff8e1,#fff3cd)", border:"#ffe082" },
    { key:"empty",  icon:"🟢", label:"Empty — Clear",  value:counts.empty,  color:"#2e7d32", bg:"linear-gradient(145deg,#e8f5e9,#dcedc8)", border:"#a5d6a7" },
  ];

  return (
    <DashboardLayout title="Smart Bin Monitor">
      <div style={{ display:"flex", flexDirection:"column", gap:20, fontFamily:"'Inter','Poppins','Roboto',Arial,sans-serif" }}>

        {/* ══ HEADER ══ */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:900, color:"#1a2e1a", margin:0, fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:22 }}>🗑️</span> Smart Dustbin Monitor
            </h2>
            <div style={{ fontSize:12, color:"#5d7a5e", marginTop:3, display:"flex", alignItems:"center", gap:8 }}>
              <span className="sb-live"><span className="sb-live-dot" />Live · Delhi NCR</span>
              <span>·</span>
              <span>{counts.full} bins need immediate pickup</span>
            </div>
          </div>
          <button
            onClick={() => setLastPing(new Date())}
            style={{
              display:"flex", alignItems:"center", gap:7,
              background:"linear-gradient(145deg,#fff,#f5fbf5)",
              border:"1px solid #c8e6c9", borderRadius:12,
              padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:700, color:"#2e7d32",
              fontFamily:"'Inter',sans-serif",
              boxShadow:"3px 3px 8px #c5d8c5,-2px -2px 6px #fff",
              transition:"transform .15s, box-shadow .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "")}
          >
            <RefreshCw style={{ width:14, height:14 }} />
            Refresh · {timeAgo(lastPing)}
          </button>
        </div>

        {/* ══ STAT CARDS ══ */}
        <div className="sb-stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {STATS.map((s, i) => (
            <div
              key={s.key}
              onClick={() => setFilter(s.key as any)}
              style={{
                background: filter === s.key ? s.bg : "linear-gradient(145deg,#fff,#f5fbf5)",
                border: `1.5px solid ${filter === s.key ? s.border : "rgba(200,230,201,0.7)"}`,
                borderRadius:16, padding:"16px 18px",
                boxShadow: filter === s.key
                  ? `inset 2px 2px 8px rgba(0,0,0,0.06), 3px 3px 10px ${s.border}`
                  : "5px 5px 14px #c5d8c5,-3px -3px 8px #fff",
                cursor:"pointer", textAlign:"center",
                transition:"all .22s ease",
                animationDelay:`${i * 0.06}s`,
              }}
            >
              <div style={{ fontSize:26 }}>{s.icon}</div>
              <div style={{ fontSize:26, fontWeight:900, color:s.color, fontFamily:"'Inter',sans-serif", lineHeight:1.1, margin:"4px 0 2px" }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#5d7a5e", fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══ FILTER PILLS ══ */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#5d7a5e" }}>Filter:</span>
          {(["all","empty","medium","full"] as const).map(f => {
            const isActive = filter === f;
            const labels = { all:"Show All", empty:"🟢 Clear", medium:"🟡 Medium", full:"🔴 Full Priority" };
            const cls = isActive ? `sb-pill p-${f}` : "sb-pill";
            return (
              <button key={f} className={cls} onClick={() => setFilter(f)}>
                {labels[f]}
                <span style={{ background: isActive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)", borderRadius:999, padding:"0 6px", fontSize:11, fontWeight:800 }}>
                  {counts[f]}
                </span>
              </button>
            );
          })}
          <span style={{ marginLeft:"auto", fontSize:12, color:"#8fa98f" }}>
            Showing {filtered.length} / {bins.length} bins
          </span>
        </div>

        {/* ══ BIN CARDS GRID ══ */}
        <div className="sb-bin-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14 }}>
          {filtered.map((bin, i) => {
            const isFull        = bin.level === "full";
            const isAssignedBin = assigned.has(bin.id);
            const cls = `sb-bin-card${isFull && !isAssignedBin ? " sb-card-full" : ""}`;
            return (
              <div
                key={bin.id}
                className={cls}
                onClick={() => setSelected(bin)}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {isFull && !isAssignedBin && (
                  <div className="sb-priority-tag">⚡ HIGH PRIORITY</div>
                )}

                <div className="sb-ring-wrap" style={{ width:72, height:72 }}>
                  <div className={`sb-ring ${isAssignedBin ? "green" : bin.level}`} />
                  {isFull && !isAssignedBin && <div className="sb-ring-pulse" />}
                  <div style={{ animation: isFull && !isAssignedBin ? "sb-float 2.4s ease-in-out infinite" : undefined }}>
                    <BinIcon level={isAssignedBin ? "empty" : bin.level} size={56} />
                  </div>
                </div>

                <div style={{ width:"100%" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1a2e1a", fontFamily:"'Inter',sans-serif", textAlign:"center" }}>
                    {bin.name}
                  </div>
                  <div style={{ fontSize:11, color:"#5d7a5e", textAlign:"center", marginTop:2, display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
                    <MapPin style={{ width:9, height:9 }} /> {bin.area}
                  </div>
                </div>

                {/* Fill level gauge */}
                {(() => {
                  const effectiveLevel = isAssignedBin ? "empty" : bin.level;
                  const pct = FILL_PCT[effectiveLevel];
                  const fillColor = isAssignedBin ? "#4caf50" : LEVEL_COLOR[bin.level];
                  return (
                    <div style={{ width:"100%", padding:"0 4px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:"#8fa98f", textTransform:"uppercase", letterSpacing:".05em" }}>Fill Level</span>
                        <span style={{ fontSize:11, fontWeight:900, color: fillColor, fontFamily:"'Inter',sans-serif" }}>{pct}%</span>
                      </div>
                      <div style={{ width:"100%", height:8, background:"#e8f5e9", borderRadius:999, overflow:"hidden", boxShadow:"inset 1px 1px 3px rgba(0,0,0,0.08)" }}>
                        <div style={{
                          width:`${pct}%`, height:"100%", borderRadius:999,
                          background: isAssignedBin
                            ? "linear-gradient(90deg,#66bb6a,#2e7d32)"
                            : bin.level === "full"   ? "linear-gradient(90deg,#ef9a9a,#f44336)"
                            : bin.level === "medium" ? "linear-gradient(90deg,#ffe082,#ffc107)"
                            : "linear-gradient(90deg,#a5d6a7,#4caf50)",
                          transition:"width 0.5s ease",
                          boxShadow:`0 0 5px ${fillColor}60`,
                        }} />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontSize:8, color:"#aaa", fontFamily:"'Inter',sans-serif" }}>
                        <span>Low</span><span>Mid</span><span>Full</span>
                      </div>
                    </div>
                  );
                })()}

                <div style={{
                  padding:"3px 12px", borderRadius:999, fontSize:10, fontWeight:800,
                  fontFamily:"'Inter',sans-serif",
                  background: isAssignedBin ? "linear-gradient(135deg,#e8f5e9,#dcedc8)" : LEVEL_BG[bin.level],
                  color: isAssignedBin ? "#2e7d32" : LEVEL_COLOR[bin.level],
                  border: `1px solid ${isAssignedBin ? "#a5d6a7" : LEVEL_COLOR[bin.level]}40`,
                  boxShadow: `inset 1px 1px 3px rgba(255,255,255,0.5)`,
                  letterSpacing:".04em",
                }}>
                  {isAssignedBin ? "✓ Collected" : `${LEVEL_EMOJI[bin.level]} ${bin.level.charAt(0).toUpperCase() + bin.level.slice(1)}`}
                </div>

                <div style={{ fontSize:10, color:"#8fa98f" }}>{timeAgo(bin.updatedAt)}</div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"50px 20px", color:"#5d7a5e" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:14, fontWeight:700 }}>No bins match this filter</div>
          </div>
        )}

        {/* ══ DELHI NCR MAP ══ */}
        <div className="sb-map-wrap">
          {/* Header */}
          <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(200,230,201,0.5)", background:"linear-gradient(145deg,#fafffe,#f4faf4)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:10, background:"linear-gradient(145deg,#e8f5e9,#c8e6c9)", boxShadow:"2px 2px 6px #b0ccb2,-1px -1px 3px #fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <MapPin style={{ width:14, height:14, color:"#2e7d32" }} />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:"#1a2e1a", fontFamily:"'Inter',sans-serif" }}>Delhi NCR — Bin Map</div>
                <div style={{ fontSize:11, color:"#5d7a5e" }}>Live positions · {counts.full} urgent pickups · Yamuna & Ring Road shown</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              {[
                { c:"#64b5f6", l:"Yamuna River",   border:"1px solid #1565c0" },
                { c:"#ffcc02", l:"Ring Road",       border:"none" },
                { c:"#4caf50", l:"Empty",           border:"none" },
                { c:"#ffc107", l:"Medium",          border:"none" },
                { c:"#f44336", l:"Full",            border:"none" },
              ].map(item => (
                <div key={item.l} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"#5d7a5e" }}>
                  <div style={{ width:item.l === "Yamuna River" ? 18 : 10, height:item.l === "Yamuna River" ? 6 : 10, borderRadius: item.l === "Yamuna River" ? 3 : "50%", background:item.c, boxShadow:`0 0 5px ${item.c}80`, border: item.border }} />
                  {item.l}
                </div>
              ))}
            </div>
          </div>

          {/* Map canvas */}
          <div
            ref={mapRef}
            style={{ position:"relative", height:320, overflow:"hidden", background:"#f0f7f0", cursor:"crosshair" }}
          >
            {/* Delhi NCR SVG background map */}
            <DelhiNcrMapBg w={mapDims.w} h={mapDims.h} />

            {/* Bin pins positioned by lat/lng */}
            {bins.map(bin => {
              const c = assigned.has(bin.id) ? "#4caf50" : LEVEL_COLOR[bin.level];
              const isFull = bin.level === "full" && !assigned.has(bin.id);
              const px = lngToX(bin.lng, mapDims.w);
              const py = latToY(bin.lat, mapDims.h);
              return (
                <div
                  key={bin.id}
                  className="sb-map-pin"
                  style={{ left:px, top:py, color: c, position:"absolute", transform:"translate(-50%,-100%)" }}
                  onClick={() => setSelected(bin)}
                  onMouseEnter={() => setMapHover(bin.id)}
                  onMouseLeave={() => setMapHover(null)}
                  title={`${bin.name} — ${bin.area} (${bin.level})`}
                >
                  <div
                    className="sb-pin-head"
                    style={{
                      background: c,
                      boxShadow: isFull ? `0 3px 12px rgba(244,67,54,0.7)` : `0 3px 8px rgba(0,0,0,0.25)`,
                    }}
                  >
                    <span className="sb-pin-icon" style={{ fontSize: 9 }}>🗑</span>
                  </div>
                  {isFull && <div className="sb-pin-pulse" style={{ borderColor: c, color: c }} />}

                  {/* Hover tooltip */}
                  {mapHover === bin.id && (
                    <div style={{
                      position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
                      background:"rgba(255,255,255,0.97)", border:"1px solid #c8e6c9", borderRadius:10,
                      padding:"6px 10px", whiteSpace:"nowrap", boxShadow:"4px 4px 12px rgba(27,94,32,0.2)",
                      fontSize:11, fontWeight:700, color:"#1a2e1a", fontFamily:"'Inter',sans-serif",
                      pointerEvents:"none", zIndex:10,
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block", flexShrink:0 }} />
                        {bin.name}
                      </div>
                      <div style={{ fontSize:10, color:"#5d7a5e", marginTop:1 }}>{bin.area}</div>
                      <div style={{ fontSize:10, color:c, fontWeight:800, marginTop:1 }}>{bin.level.toUpperCase()} · {FILL_PCT[assigned.has(bin.id) ? "empty" : bin.level]}%</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Compass rose */}
            <div style={{
              position:"absolute", bottom:12, right:14,
              width:42, height:42,
              background:"rgba(255,255,255,0.88)",
              borderRadius:"50%",
              border:"1.5px solid #c8e6c9",
              boxShadow:"2px 2px 8px rgba(27,94,32,0.15)",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexDirection:"column", fontSize:8, fontWeight:800, color:"#1a2e1a",
              fontFamily:"Inter,sans-serif",
            }}>
              <div style={{ color:"#c62828", fontSize:11, lineHeight:1 }}>▲</div>
              <div style={{ fontSize:9, lineHeight:1, marginTop:1 }}>N</div>
            </div>

            {/* Scale bar */}
            <div style={{
              position:"absolute", bottom:14, left:14,
              background:"rgba(255,255,255,0.88)",
              borderRadius:6, border:"1px solid #c8e6c9",
              padding:"3px 8px", fontSize:9, fontWeight:700, color:"#2e4a2e",
              display:"flex", alignItems:"center", gap:6,
            }}>
              <div style={{ width:32, height:2, background:"#2e7d32" }} />
              ~20 km
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════
          BIN DETAIL MODAL
      ══════════════════════════════════════════════ */}
      {selected && (() => {
        const bin = bins.find(b => b.id === selected.id) || selected;
        const isAssignedBin = assigned.has(bin.id);
        const level = isAssignedBin ? "empty" : bin.level;
        const c = LEVEL_COLOR[level];
        return (
          <div className="sb-overlay" onClick={() => setSelected(null)}>
            <div className="sb-modal" onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div style={{
                background: level === "full" ? "linear-gradient(145deg,#ffcdd2,#ffebee)" : level === "medium" ? "linear-gradient(145deg,#fff3cd,#fff8e1)" : "linear-gradient(145deg,#dcedc8,#e8f5e9)",
                padding:"20px 22px",
                display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                borderBottom:"1px solid rgba(200,230,201,0.4)",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{
                    width:46, height:46, borderRadius:14,
                    background:"linear-gradient(145deg,#2e7d32,#1b5e20)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"3px 3px 8px rgba(27,94,32,0.4),-1px -1px 4px rgba(165,214,167,0.3)",
                    fontWeight:900, fontSize:15, color:"#fff",
                    fontFamily:"'Inter',sans-serif",
                  }}>{bin.avatar}</div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:900, color:"#1a2e1a", fontFamily:"'Inter',sans-serif" }}>{bin.name}</div>
                    <div style={{ fontSize:12, color:"#5d7a5e", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                      <MapPin style={{ width:11, height:11 }} /> {bin.address}
                    </div>
                    <div style={{ marginTop:6 }}>
                      <span style={{
                        padding:"2px 10px", borderRadius:999, fontSize:10, fontWeight:800,
                        background: isAssignedBin ? "#e8f5e9" : level === "full" ? "#ffebee" : level === "medium" ? "#fff8e1" : "#e8f5e9",
                        color: c, border:`1px solid ${c}50`, fontFamily:"'Inter',sans-serif",
                      }}>
                        {LEVEL_EMOJI[level]} {isAssignedBin ? "Assigned ✓" : level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background:"rgba(0,0,0,0.08)", border:"none", borderRadius:10, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#5d7a5e", flexShrink:0 }}
                >
                  <X style={{ width:15, height:15 }} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding:"22px", display:"flex", flexDirection:"column", gap:20 }}>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:32 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#5d7a5e", marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Fill Level</div>
                    <div style={{
                      position:"relative", display:"inline-block",
                      filter: level === "full" ? "drop-shadow(0 0 16px rgba(244,67,54,0.6))"
                             : level === "medium" ? "drop-shadow(0 0 12px rgba(255,193,7,0.5))"
                             : "drop-shadow(0 0 10px rgba(76,175,80,0.5))",
                      animation: level === "full" ? "sb-float 2.2s ease-in-out infinite" : undefined,
                    }}>
                      <LargeBinIcon level={level} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color:c, marginTop:4, fontFamily:"'Inter',sans-serif" }}>
                      {FILL_PCT[level]}% Full
                    </div>
                  </div>

                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                    {[
                      { label:"Citizen ID",   value:bin.userId },
                      { label:"Zone / Area",  value:bin.area },
                      { label:"Last Updated", value:timeAgo(bin.updatedAt) },
                      { label:"Coordinates",  value:`${bin.lat.toFixed(4)}°N, ${bin.lng.toFixed(4)}°E` },
                      { label:"Fill %",       value:`${FILL_PCT[level]}%` },
                    ].map(row => (
                      <div key={row.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", borderRadius:10, background:"linear-gradient(145deg,rgba(232,245,233,0.5),rgba(241,248,233,0.5))", border:"1px solid rgba(200,230,201,0.4)" }}>
                        <span style={{ fontSize:11, color:"#5d7a5e", fontWeight:600 }}>{row.label}</span>
                        <span style={{ fontSize:12, fontWeight:800, color:"#1a2e1a", fontFamily:"'Inter',sans-serif" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {level === "full" && !isAssignedBin && (
                  <div style={{ padding:"12px 16px", borderRadius:14, background:"linear-gradient(135deg,#ffebee,#ffcdd2)", border:"1px solid #ef9a9a", display:"flex", alignItems:"center", gap:10 }}>
                    <AlertTriangle style={{ width:16, height:16, color:"#c62828", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:"#c62828", fontFamily:"'Inter',sans-serif" }}>⚡ Immediate Pickup Required</div>
                      <div style={{ fontSize:11, color:"#e57373", marginTop:1 }}>This bin is full and causing hygiene concern in {bin.area}</div>
                    </div>
                  </div>
                )}

                {isAssignedBin ? (
                  <div style={{ padding:"12px 16px", borderRadius:14, background:"linear-gradient(135deg,#e8f5e9,#dcedc8)", border:"1px solid #a5d6a7", display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
                    <CheckCircle style={{ width:16, height:16, color:"#2e7d32" }} />
                    <span style={{ fontSize:13, fontWeight:800, color:"#2e7d32", fontFamily:"'Inter',sans-serif" }}>Pickup Assigned — Bin cleared!</span>
                  </div>
                ) : level === "empty" ? (
                  <div style={{ padding:"12px 16px", borderRadius:14, background:"linear-gradient(135deg,#e8f5e9,#dcedc8)", border:"1px solid #a5d6a7", textAlign:"center" }}>
                    <span style={{ fontSize:13, color:"#2e7d32", fontWeight:700 }}>🟢 Bin is clear — no action needed</span>
                  </div>
                ) : (
                  <button
                    className="sb-assign"
                    onClick={() => handleAssign(bin.id)}
                  >
                    <Truck style={{ width:16, height:16 }} />
                    Assign Pickup — {bin.area}
                    <Leaf style={{ width:14, height:14, opacity:.7 }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </DashboardLayout>
  );
}
