interface SwachhLogoProps {
  size?: number;
  className?: string;
}

export function SwachhLogoIcon({ size = 36, className = "" }: SwachhLogoProps) {
  const id = `ss_${size}`;
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
        {/* ── Background: 3D depth gradient (bright top-left → dark bottom-right) ── */}
        <linearGradient id={`${id}_bg`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1b6b3a"/>
          <stop offset="55%"  stopColor="#0d4a28"/>
          <stop offset="100%" stopColor="#021a0e"/>
        </linearGradient>

        {/* ── Convex top-left light highlight ── */}
        <radialGradient id={`${id}_hl`} cx="28%" cy="22%" r="55%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.26)"/>
          <stop offset="60%"  stopColor="rgba(255,255,255,0.06)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>

        {/* ── Bottom-right emerald glow ── */}
        <radialGradient id={`${id}_glow`} cx="75%" cy="80%" r="50%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(16,185,129,0.22)"/>
          <stop offset="100%" stopColor="rgba(16,185,129,0)"/>
        </radialGradient>

        {/* ── Isometric cube: top face ── */}
        <linearGradient id={`${id}_top`} x1="18" y1="26" x2="46" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6ee7b7"/>
          <stop offset="100%" stopColor="#34d399"/>
        </linearGradient>

        {/* ── Isometric cube: left face ── */}
        <linearGradient id={`${id}_left`} x1="18" y1="26" x2="18" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>

        {/* ── Isometric cube: right face ── */}
        <linearGradient id={`${id}_right`} x1="46" y1="26" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#059669"/>
          <stop offset="100%" stopColor="#047857"/>
        </linearGradient>

        {/* ── Leaf gradient ── */}
        <linearGradient id={`${id}_leaf`} x1="40" y1="8" x2="54" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#a7f3d0"/>
          <stop offset="100%" stopColor="#34d399"/>
        </linearGradient>

        {/* ── Sweep arc gradient ── */}
        <linearGradient id={`${id}_sweep`} x1="10" y1="56" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.85)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.4)"/>
        </linearGradient>

        {/* ── Drop shadow filter ── */}
        <filter id={`${id}_shadow`} x="-20%" y="-15%" width="150%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="rgba(0,0,0,0.55)"/>
        </filter>
      </defs>

      {/* ── Outer drop shadow ── */}
      <rect width="62" height="62" rx="15" fill="rgba(0,0,0,0.4)" transform="translate(3,5)" filter={`url(#${id}_shadow)`}/>

      {/* ── Background squircle ── */}
      <rect width="64" height="64" rx="16" fill={`url(#${id}_bg)`}/>

      {/* ── Top-left convex 3D highlight ── */}
      <rect width="64" height="64" rx="16" fill={`url(#${id}_hl)`}/>

      {/* ── Bottom-right emerald glow ── */}
      <rect width="64" height="64" rx="16" fill={`url(#${id}_glow)`}/>

      {/* ── Border highlight (top + left rim) ── */}
      <rect x="0.8" y="0.8" width="62.4" height="62.4" rx="15.2" fill="none"
        stroke="rgba(255,255,255,0.16)" strokeWidth="1.2"/>

      {/* ══ 3D ISOMETRIC CUBE ══
          Top face:   (32,18) (18,26) (32,34) (46,26) — rhombus
          Left face:  (18,26) (18,42) (32,50) (32,34) — parallelogram
          Right face: (46,26) (46,42) (32,50) (32,34) — parallelogram
      */}

      {/* Cube drop shadow on background */}
      <polygon points="32,21 18,29 32,37 46,29"
        fill="rgba(0,0,0,0.18)" transform="translate(2,4)"/>

      {/* Left face */}
      <polygon points="18,26 18,42 32,50 32,34"
        fill={`url(#${id}_left)`}/>
      {/* Left face inner bevel (edge highlight) */}
      <line x1="18" y1="26" x2="18" y2="42"
        stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>

      {/* Right face */}
      <polygon points="46,26 46,42 32,50 32,34"
        fill={`url(#${id}_right)`}/>
      {/* Right face edge */}
      <line x1="46" y1="26" x2="46" y2="42"
        stroke="rgba(0,0,0,0.2)" strokeWidth="0.6"/>

      {/* Top face */}
      <polygon points="32,18 18,26 32,34 46,26"
        fill={`url(#${id}_top)`}/>
      {/* Top face specular highlight — tiny bright spot top-left */}
      <ellipse cx="26" cy="23" rx="4" ry="2.5"
        fill="rgba(255,255,255,0.35)"
        transform="rotate(-15,26,23)"/>

      {/* Edge lines for crisp 3D look */}
      <polyline points="18,26 32,18 46,26 32,34 18,26"
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7"/>
      <line x1="32" y1="34" x2="32" y2="50"
        stroke="rgba(0,0,0,0.15)" strokeWidth="0.6"/>

      {/* ══ ECO LEAF — sprouting from top-right of cube ── */}
      <path
        d="M45 10 C41 7 36 9 35 14 C34 19 38 23 42 20
           C40 24 37 26 35 26
           C38 27 44 24 46 18
           C47 14 47 11 45 10 Z"
        fill={`url(#${id}_leaf)`}
        opacity="0.95"
      />
      {/* Leaf vein */}
      <path d="M39 11 C38 16 37 21 36 26"
        stroke="rgba(6,78,59,0.35)" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      {/* Leaf stem connecting to cube */}
      <path d="M36 26 Q38 29 41 28"
        stroke="rgba(110,231,183,0.6)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      {/* ══ SWEEP ARC — represents Swachh broom sweep ── */}
      <path d="M10 57 Q21 50 32 49 Q43 50 54 57"
        stroke={`url(#${id}_sweep)`}
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"/>
      {/* Sweep end dots */}
      <circle cx="10" cy="57" r="1.8" fill="rgba(255,255,255,0.55)"/>
      <circle cx="54" cy="57" r="1.8" fill="rgba(255,255,255,0.55)"/>
      <circle cx="32" cy="49" r="1.2" fill="rgba(110,231,183,0.7)"/>

      {/* ══ SPARKLE — top left (3D premium feel) ── */}
      <g opacity="0.7">
        <path d="M11 15 L12 12 L13 15 L16 16 L13 17 L12 20 L11 17 L8 16 Z"
          fill="rgba(255,255,255,0.55)"/>
      </g>
      {/* Tiny sparkle bottom-right of cube */}
      <circle cx="47" cy="43" r="1.2" fill="rgba(255,255,255,0.25)"/>
      <circle cx="17" cy="43" r="1.0" fill="rgba(255,255,255,0.18)"/>
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
