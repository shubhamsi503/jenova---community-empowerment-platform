import React, { useId } from 'react';

interface Icon3DProps {
  size?: number;
  className?: string;
}

/** 3D Sculpted Security Shield (JENOVA Protect & Stay Safe) */
export function Shield3DIcon({ size = 56, className = '' }: Icon3DProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`sh-rim-${id}`} x1="12" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#70B8F2" />
          <stop offset="100%" stopColor="#092B55" />
        </linearGradient>
        <linearGradient id={`sh-body-${id}`} x1="16" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#35D07F" />
          <stop offset="55%" stopColor="#138A45" />
          <stop offset="100%" stopColor="#084225" />
        </linearGradient>
        <linearGradient id={`sh-gloss-${id}`} x1="16" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="59" rx="16" ry="3.5" fill="#092B55" fillOpacity="0.28" />
      <path
        d="M32 5L53 13.5V29.5C53 43.8 43.9 53.7 32 58.5C20.1 53.7 11 43.8 11 29.5V13.5L32 5Z"
        fill={`url(#sh-rim-${id})`}
      />
      <path
        d="M32 9.2L49 16.2V29.3C49 41.3 41.5 49.7 32 53.8C22.5 49.7 15 41.3 15 29.3V16.2L32 9.2Z"
        fill={`url(#sh-body-${id})`}
      />
      <path
        d="M32 9.2L49 16.2V27C41 25 25 27 15 33V16.2L32 9.2Z"
        fill={`url(#sh-gloss-${id})`}
      />
      <path
        d="M23.5 31.5L29.5 37.5L41.5 24.5"
        stroke="#FFFFFF"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 3D Sculpted Government Building (JENOVA Schemes & Get Schemes) */
export function Building3DIcon({ size = 56, className = '' }: Icon3DProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`bg-gold-${id}`} x1="12" y1="8" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE199" />
          <stop offset="50%" stopColor="#FF9E2C" />
          <stop offset="100%" stopColor="#C45E04" />
        </linearGradient>
        <linearGradient id={`bg-col-${id}`} x1="16" y1="24" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7E6" />
          <stop offset="60%" stopColor="#FFC45C" />
          <stop offset="100%" stopColor="#D67610" />
        </linearGradient>
        <linearGradient id={`bg-base-${id}`} x1="10" y1="48" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B5A96" />
          <stop offset="100%" stopColor="#092B55" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="59" rx="22" ry="3.2" fill="#092B55" fillOpacity="0.28" />
      {/* Dome */}
      <path d="M23 18C23 12.8 27 9 32 9C37 9 41 12.8 41 18H23Z" fill={`url(#bg-gold-${id})`} />
      <rect x="31" y="5" width="2" height="5" rx="1" fill="#FFC45C" />
      {/* Pediment */}
      <path d="M10 25L32 14L54 25H10Z" fill={`url(#bg-gold-${id})`} />
      <rect x="12" y="25" width="40" height="3.5" rx="1.5" fill="#FFF3D1" />
      {/* 4 Columns */}
      {[16, 25, 34, 43].map((x) => (
        <rect key={x} x={x} y="29" width="5" height="19" rx="1.5" fill={`url(#bg-col-${id})`} />
      ))}
      {/* Steps */}
      <rect x="11" y="48" width="42" height="4" rx="1.5" fill={`url(#bg-base-${id})`} />
      <rect x="8" y="52" width="48" height="4.5" rx="2" fill="#092B55" />
      <rect x="11" y="48" width="42" height="1.2" fill="#36E7F2" fillOpacity="0.65" />
    </svg>
  );
}

/** 3D Sculpted Document Clipboard (JENOVA Checklist & Prepare) */
export function Clipboard3DIcon({ size = 56, className = '' }: Icon3DProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`cb-board-${id}`} x1="12" y1="10" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="55%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#092B55" />
        </linearGradient>
        <linearGradient id={`cb-paper-${id}`} x1="18" y1="14" x2="46" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E1F0FF" />
        </linearGradient>
        <linearGradient id={`cb-clip-${id}`} x1="24" y1="6" x2="40" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE199" />
          <stop offset="100%" stopColor="#FF8A18" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="59.5" rx="18" ry="3" fill="#092B55" fillOpacity="0.26" />
      <rect x="12" y="10" width="40" height="47" rx="8" fill={`url(#cb-board-${id})`} />
      <rect x="16.5" y="14.5" width="31" height="38" rx="4.5" fill={`url(#cb-paper-${id})`} />
      <rect x="23" y="6.5" width="18" height="8" rx="4" fill={`url(#cb-clip-${id})`} />
      <circle cx="32" cy="10.5" r="1.8" fill="#092B55" />
      {[24, 34, 44].map((y) => (
        <g key={y}>
          <path
            d={`M20.5 ${y}L22.6 ${y + 2.2}L26.5 ${y - 2}`}
            stroke="#138A45"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="29.5" y={y - 1.5} width="14" height="3" rx="1.5" fill="#70B8F2" />
        </g>
      ))}
    </svg>
  );
}

/** 3D Sculpted Microphone (JENOVA Voice) */
export function Microphone3DIcon({ size = 56, className = '' }: Icon3DProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`mc-head-${id}`} x1="22" y1="7" x2="42" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#99F6FF" />
          <stop offset="45%" stopColor="#2E86DE" />
          <stop offset="100%" stopColor="#092B55" />
        </linearGradient>
        <linearGradient id={`mc-stand-${id}`} x1="18" y1="30" x2="46" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="55%" stopColor="#70B8F2" />
          <stop offset="100%" stopColor="#0E4A8A" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="59" rx="15" ry="3" fill="#092B55" fillOpacity="0.28" />
      <rect x="22" y="7" width="20" height="30" rx="10" fill={`url(#mc-head-${id})`} />
      {/* Grille highlights */}
      {[14, 19, 24, 29].map((y) => (
        <line key={y} x1="25" y1={y} x2="39" y2={y} stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      ))}
      {/* Cradle */}
      <path
        d="M17 28V31C17 39.3 23.7 46 32 46C40.3 46 47 39.3 47 31V28"
        stroke={`url(#mc-stand-${id})`}
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <rect x="29.8" y="45" width="4.4" height="9" rx="2" fill={`url(#mc-stand-${id})`} />
      <rect x="21" y="53" width="22" height="4.5" rx="2.25" fill="#092B55" />
      <rect x="23" y="53" width="18" height="1.3" rx="0.65" fill="#36E7F2" />
    </svg>
  );
}

/** 3D Sculpted Location Pin (JENOVA Local & Local Help) */
export function LocationPin3DIcon({ size = 56, className = '' }: Icon3DProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`lp-pin-${id}`} x1="16" y1="6" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD36E" />
          <stop offset="50%" stopColor="#FF8A18" />
          <stop offset="100%" stopColor="#C74B00" />
        </linearGradient>
        <radialGradient id={`lp-inner-${id}`} cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#36E7F2" />
          <stop offset="100%" stopColor="#0B6B5A" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="58" rx="15" ry="3.2" fill="#092B55" fillOpacity="0.28" />
      <ellipse cx="32" cy="56" rx="12" ry="2.2" stroke="#36E7F2" strokeWidth="1.6" strokeOpacity="0.7" />
      <path
        d="M32 6C20.4 6 11 15.3 11 26.8C11 40.5 28 53.8 30.8 55.9C31.5 56.4 32.5 56.4 33.2 55.9C36 53.8 53 40.5 53 26.8C53 15.3 43.6 6 32 6Z"
        fill={`url(#lp-pin-${id})`}
      />
      <circle cx="32" cy="26" r="9.5" fill={`url(#lp-inner-${id})`} />
      <circle cx="29" cy="23" r="2.8" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
  );
}

/** 3D Sculpted Briefcase (Find Jobs Floating Panel) */
export function Briefcase3DIcon({ size = 44, className = '' }: Icon3DProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`br-body-${id}`} x1="10" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#9ED2FA" />
          <stop offset="100%" stopColor="#1D63B8" />
        </linearGradient>
        <linearGradient id={`br-flap-${id}`} x1="10" y1="18" x2="54" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#69B4F2" />
        </linearGradient>
      </defs>
      <path d="M23 19V14C23 11.8 24.8 10 27 10H37C39.2 10 41 11.8 41 14V19" stroke="#092B55" strokeWidth="4" strokeLinecap="round" />
      <rect x="8" y="18" width="48" height="36" rx="8" fill={`url(#br-body-${id})`} />
      <path d="M8 26C8 21.6 11.6 18 16 18H48C52.4 18 56 21.6 56 26V31C56 33.8 53.8 36 51 36H13C10.2 36 8 33.8 8 31V26Z" fill={`url(#br-flap-${id})`} />
      <rect x="27" y="31" width="10" height="8" rx="2.5" fill="#FF8A18" />
    </svg>
  );
}

/** Journey Step Orbs (1. Discover, 2. Understand, 3. Prepare, 4. Act, 5. Follow Up) */
function GlassOrbFrame({
  children,
  size = 80,
  ringColor = '#36E7F2',
  className = '',
}: {
  children: React.ReactNode;
  size?: number;
  ringColor?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="none" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`orb-bg-${id}`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="52%" stopColor="#D7F3FF" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#8FD8F8" stopOpacity="0.58" />
        </radialGradient>
        <linearGradient id={`orb-ring-${id}`} x1="10" y1="8" x2="78" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor={ringColor} />
          <stop offset="100%" stopColor="#FFC45C" />
        </linearGradient>
      </defs>
      <ellipse cx="44" cy="83" rx="22" ry="3.5" fill="#092B55" fillOpacity="0.18" />
      <circle cx="44" cy="42" r="36" fill={`url(#orb-bg-${id})`} stroke={`url(#orb-ring-${id})`} strokeWidth="2.5" />
      <ellipse cx="34" cy="24" rx="15" ry="7" fill="#FFFFFF" fillOpacity="0.65" transform="rotate(-18 34 24)" />
      {children}
    </svg>
  );
}

export function DiscoverOrb3D({ size = 82 }: Icon3DProps) {
  return (
    <GlassOrbFrame size={size} ringColor="#36E7F2">
      <circle cx="40" cy="38" r="13.5" fill="#D8F6FF" stroke="#1565C0" strokeWidth="4.5" />
      <circle cx="36" cy="34" r="4" fill="#FFFFFF" fillOpacity="0.85" />
      <path d="M50 48L60 58" stroke="#092B55" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 48L59 57" stroke="#36E7F2" strokeWidth="2" strokeLinecap="round" />
    </GlassOrbFrame>
  );
}

export function UnderstandOrb3D({ size = 82 }: Icon3DProps) {
  return (
    <GlassOrbFrame size={size} ringColor="#70B8F2">
      <path d="M22 30C29 27 37 28 44 33V56C37 51 29 50 22 53V30Z" fill="#FFFFFF" stroke="#1D63B8" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M66 30C59 27 51 28 44 33V56C51 51 59 50 66 53V30Z" fill="#E8F5FF" stroke="#092B55" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M27 37H38M27 43H38M50 37H60M50 43H60" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" />
    </GlassOrbFrame>
  );
}

export function PrepareOrb3D({ size = 82 }: Icon3DProps) {
  return (
    <GlassOrbFrame size={size} ringColor="#138A45">
      <rect x="29" y="23" width="30" height="37" rx="5" fill="#1D4ED8" />
      <rect x="33" y="27" width="22" height="29" rx="3" fill="#FFFFFF" />
      <rect x="37" y="20" width="14" height="6" rx="3" fill="#FF8A18" />
      <path d="M36 35L38 37L41.5 33.5M36 42L38 44L41.5 40.5M36 49L38 51L41.5 47.5" stroke="#138A45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 35H52M44 42H52M44 49H52" stroke="#70B8F2" strokeWidth="2.4" strokeLinecap="round" />
    </GlassOrbFrame>
  );
}

export function ActOrb3D({ size = 82 }: Icon3DProps) {
  return (
    <GlassOrbFrame size={size} ringColor="#FF8A18">
      {/* Flame */}
      <path d="M28 56C28 50 32 47 35 49C37 52 34 57 28 56Z" fill="#FFC45C" />
      {/* Fins */}
      <path d="M32 43L24 46L30 51L35 48Z" fill="#E65100" />
      <path d="M44 54L41 62L47 56L48 51Z" fill="#E65100" />
      {/* Rocket hull */}
      <path
        d="M57 25C50 26 42 31 35 39L32 45L41 53L47 50C55 43 59 35 57 25Z"
        fill="#FFFFFF"
        stroke="#092B55"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M57 25C52 26 49 28 47 30L54 37C56 34 57.5 30 57 25Z" fill="#FF8A18" />
      <circle cx="45" cy="40" r="4.2" fill="#36E7F2" stroke="#092B55" strokeWidth="2" />
    </GlassOrbFrame>
  );
}

export function FollowUpOrb3D({ size = 82 }: Icon3DProps) {
  return (
    <GlassOrbFrame size={size} ringColor="#FFC45C">
      {/* Left sleeve */}
      <path d="M20 38L28 31L36 40L28 48L20 38Z" fill="#138A45" />
      {/* Right sleeve */}
      <path d="M68 38L60 31L52 40L60 48L68 38Z" fill="#092B55" />
      {/* Clasped hands */}
      <path
        d="M29 37L38 33C41 32 44 33 47 35L57 42C59 44 58 47 55 48L46 53C42 55 38 54 35 51L28 45C26 43 27 39 29 37Z"
        fill="#FFB259"
        stroke="#B55B0A"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M40 43L48 48M37 46L44 51" stroke="#B55B0A" strokeWidth="1.8" strokeLinecap="round" />
    </GlassOrbFrame>
  );
}
