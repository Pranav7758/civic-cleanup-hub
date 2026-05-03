interface SwachhLogoProps {
  size?: number;
  className?: string;
}

export function SwachhLogoIcon({ size = 36, className = "" }: SwachhLogoProps) {
  const id = `sl_${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id={`${id}_bg`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0c3318"/>
          <stop offset="60%"  stopColor="#1b5e20"/>
          <stop offset="100%" stopColor="#082010"/>
        </linearGradient>

        {/* Top-left highlight */}
        <radialGradient id={`${id}_hl`} cx="25%" cy="20%" r="55%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>

        {/* Bin body gradient (3D left-lit) */}
        <linearGradient id={`${id}_bin`} x1="18" y1="28" x2="46" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#66bb6a"/>
          <stop offset="55%"  stopColor="#43a047"/>
          <stop offset="100%" stopColor="#2e7d32"/>
        </linearGradient>

        {/* Bin lid gradient */}
        <linearGradient id={`${id}_lid`} x1="16" y1="22" x2="48" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#a5d6a7"/>
          <stop offset="100%" stopColor="#66bb6a"/>
        </linearGradient>

        {/* Left leaf gradient */}
        <linearGradient id={`${id}_lleaf`} x1="16" y1="12" x2="30" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#b9f6ca"/>
          <stop offset="100%" stopColor="#69f0ae"/>
        </linearGradient>

        {/* Right leaf gradient */}
        <linearGradient id={`${id}_rleaf`} x1="34" y1="8" x2="48" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#a5d6a7"/>
          <stop offset="100%" stopColor="#4caf50"/>
        </linearGradient>

        {/* Recycle arc gradient */}
        <linearGradient id={`${id}_arc`} x1="14" y1="56" x2="50" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(165,214,167,0)"/>
          <stop offset="50%"  stopColor="rgba(165,214,167,0.55)"/>
          <stop offset="100%" stopColor="rgba(165,214,167,0)"/>
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id={`${id}_shad`} x="-20%" y="-15%" width="150%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>

      {/* Outer shadow */}
      <rect x="3" y="6" width="60" height="60" rx="15" fill="rgba(0,0,0,0.35)" filter={`url(#${id}_shad)`}/>

      {/* Background squircle */}
      <rect width="64" height="64" rx="16" fill={`url(#${id}_bg)`}/>

      {/* Top-left convex highlight */}
      <rect width="64" height="64" rx="16" fill={`url(#${id}_hl)`}/>

      {/* Border rim */}
      <rect x="0.8" y="0.8" width="62.4" height="62.4" rx="15.2"
        fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2"/>

      {/* ══ RECYCLING BIN ══ */}

      {/* Bin shadow on background */}
      <polygon points="20.5,29 43.5,29 41.2,51.5 22.8,51.5"
        fill="rgba(0,0,0,0.2)" transform="translate(1.5,3)"/>

      {/* Bin body (trapezoid, wider top) */}
      <polygon points="20,27.5 44,27.5 41.5,51 22.5,51"
        fill={`url(#${id}_bin)`}/>

      {/* Bin body left bevel (light edge) */}
      <line x1="20" y1="27.5" x2="22.5" y2="51"
        stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      {/* Bin body right shadow edge */}
      <line x1="44" y1="27.5" x2="41.5" y2="51"
        stroke="rgba(0,0,0,0.18)" strokeWidth="0.8"/>

      {/* Bin vertical ridges */}
      <line x1="27.5" y1="28.5" x2="26.2" y2="50"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="37.5" y1="28.5" x2="38.8" y2="50"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ♻ recycling symbol on bin — 3 tiny curved arrows */}
      <g opacity="0.55">
        {/* top arrow */}
        <path d="M32,34 L30,31 L34,31 Z" fill="rgba(255,255,255,0.7)"/>
        {/* bottom-left arrow */}
        <path d="M26.5,42 L24.5,39.5 L27.5,40.5 Z" fill="rgba(255,255,255,0.7)"/>
        {/* bottom-right arrow */}
        <path d="M37.5,42 L36.5,39.5 L39.5,41 Z" fill="rgba(255,255,255,0.7)"/>
        {/* triangle arc paths */}
        <path d="M32,31.5 C35.5,31.5 38,33.5 39,36.5"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M39,36.5 C39.5,39.5 38,41.5 35.5,42"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M35.5,42 C33,43 29,42.5 28,41 C27,39.5 26.5,37 27.5,35"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M27.5,35 C28.5,33 30,31.5 32,31.5"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      </g>

      {/* Bin lid (slightly wider than bin body top) */}
      <rect x="17" y="22.5" width="30" height="5.5" rx="2.5"
        fill={`url(#${id}_lid)`}/>
      {/* Lid top highlight */}
      <rect x="17" y="22.5" width="30" height="2" rx="2"
        fill="rgba(255,255,255,0.3)"/>
      {/* Lid bottom shadow */}
      <rect x="17" y="26" width="30" height="2" rx="0"
        fill="rgba(0,0,0,0.08)"/>

      {/* Bin handle (small rectangle on top of lid) */}
      <rect x="26.5" y="18.5" width="11" height="4.5" rx="2.2"
        fill="rgba(255,255,255,0.82)"/>
      {/* Handle shine */}
      <rect x="27.5" y="19.2" width="9" height="1.5" rx="0.75"
        fill="rgba(255,255,255,0.5)"/>

      {/* ══ SPROUTING PLANT ══ */}

      {/* Stem growing from handle */}
      <line x1="32" y1="18.5" x2="32" y2="7"
        stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round"/>

      {/* Left leaf */}
      <path d="M32,15 C28,11 21,12 23,17 C24.5,20 30,18 32,15 Z"
        fill={`url(#${id}_lleaf)`} opacity="0.95"/>
      {/* Left leaf vein */}
      <path d="M31,14.5 C27.5,15.5 25,17 24,18.5"
        stroke="rgba(6,78,59,0.3)" strokeWidth="0.7" strokeLinecap="round" fill="none"/>

      {/* Right leaf */}
      <path d="M32,11.5 C36,7.5 43,8.5 41,13.5 C39.5,17 34,15 32,11.5 Z"
        fill={`url(#${id}_rleaf)`} opacity="0.92"/>
      {/* Right leaf vein */}
      <path d="M32.5,11.5 C36,12.5 38.5,13.5 40,15"
        stroke="rgba(6,78,59,0.28)" strokeWidth="0.7" strokeLinecap="round" fill="none"/>

      {/* Tip bud (tiny circle at top of stem) */}
      <circle cx="32" cy="6.5" r="2"
        fill="#b9f6ca" opacity="0.9"/>
      <circle cx="32" cy="6.5" r="1"
        fill="rgba(255,255,255,0.6)"/>

      {/* ══ RECYCLING ARC at bottom (renewal motif) ══ */}
      <path d="M16,57.5 Q32,53.5 48,57.5"
        stroke={`url(#${id}_arc)`} strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* ══ SPARKLE top-left ══ */}
      <g opacity="0.65">
        <path d="M10,13 L11,10 L12,13 L15,14 L12,15 L11,18 L10,15 L7,14 Z"
          fill="rgba(255,255,255,0.52)"/>
      </g>
      {/* Small dot accents */}
      <circle cx="49" cy="17" r="1.3" fill="rgba(165,214,167,0.45)"/>
      <circle cx="14" cy="48" r="1.0" fill="rgba(255,255,255,0.2)"/>
    </svg>
  );
}

interface SwachhLogoBadgeProps {
  size?: number;
  glowColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function SwachhLogoBadge({
  size = 40,
  glowColor = "rgba(16,185,129,0.55)",
  style,
  className = "",
}: SwachhLogoBadgeProps) {
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        borderRadius: size * 0.25,
        boxShadow: `0 0 ${size * 0.55}px ${glowColor}, 0 ${size * 0.1}px ${size * 0.22}px rgba(0,0,0,0.3)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <SwachhLogoIcon size={size} />
    </div>
  );
}
