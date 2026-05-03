interface SwachhLogoProps {
  size?: number;
  className?: string;
}

export function SwachhLogoIcon({ size = 36, className = "" }: SwachhLogoProps) {
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
        <linearGradient id="ssBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#064e3b"/>
          <stop offset="55%"  stopColor="#059669"/>
          <stop offset="100%" stopColor="#0d9488"/>
        </linearGradient>
        <linearGradient id="ssLeaf" x1="20" y1="8" x2="46" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#a7f3d0"/>
        </linearGradient>
        <filter id="ssGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Squircle bg */}
      <rect width="64" height="64" rx="15" fill="url(#ssBg)"/>
      <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.2"/>
      <ellipse cx="20" cy="14" rx="18" ry="10" fill="rgba(255,255,255,0.07)"/>

      {/* Leaf */}
      <path
        d="M32 9 C23 9 14 17 14 29 C14 38.5 20 46 29 48.5
           C29 48.5 27.5 41 31 36 C34 31.5 42 29.5 42 29.5
           C42 29.5 39.5 40 33 44.5
           C37 46.5 43.5 44 47.5 39.5
           C51.5 35 51 26 47 20
           C43 14 37.5 9 32 9 Z"
        fill="url(#ssLeaf)"
        filter="url(#ssGlow)"
      />

      {/* Vein */}
      <path
        d="M32 11 C31.5 24 29.5 36 28 46"
        stroke="rgba(6,78,59,0.28)" strokeWidth="1.1" strokeLinecap="round" fill="none"
      />

      {/* Sweep arc */}
      <path
        d="M17 54 Q32 47.5 47 54"
        stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" fill="none"
      />
      <circle cx="23" cy="57.5" r="1.3" fill="rgba(255,255,255,0.5)"/>
      <circle cx="32" cy="58.5" r="1.3" fill="rgba(255,255,255,0.5)"/>
      <circle cx="41" cy="57.5" r="1.3" fill="rgba(255,255,255,0.5)"/>

      {/* Recycle arc */}
      <path d="M47 10 A5 5 0 0 1 55 18" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M55 22 A5 5 0 0 1 47 28" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <polygon points="45,28 45,24 49,26" fill="rgba(255,255,255,0.45)"/>
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
        borderRadius: size * 0.24,
        boxShadow: `0 0 ${size * 0.6}px ${glowColor}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <SwachhLogoIcon size={size} />
    </div>
  );
}
