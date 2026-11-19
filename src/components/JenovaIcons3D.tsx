import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** 1. 3D Security Shield Icon (JENOVA Protect / Stay Safe) */
export function Shield3DIcon({ size = 56, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="shOuter" x1="14" y1="8" x2="66" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6FBFF" />
          <stop offset="45%" stopColor="#8EC5EE" />
          <stop offset="100%" stopColor="#092B55" />
        </linearGradient>
        <linearGradient id="shInner" x1="20" y1="14" x2="60" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#32D778" />
          <stop offset="55%" stopColor="#138A45" />
          <stop offset="100%" stopColor="#074F27" />
        </linearGradient>
        <linearGradient id="shGloss" x1="24" y1="14" x2="48" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id="shShadow" x="4" y="4" width="72" height="74" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#092B55" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#shShadow)">
        <path
          d="M40 8L64 18V38C64 54.5 53.5 67 40 72C26.5 67 16 54.5 16 38V18L40 8Z"
          fill="url(#shOuter)"
        />
        <path
          d="M40 13L59 21V37.5C59 51 50.5 61.5 40 66C29.5 61.5 21 51 21 37.5V21L40 13Z"
          fill="url(#shInner)"
        />
        <path
          d="M40 13L59 21V33C48 37 32 39 21 33V21L40 13Z"
          fill="url(#shGloss)"
        />
        <path
          d="M30 39.5L37 46.5L51 31.5"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** 2. 3D Government Building Icon (JENOVA Schemes / Get Schemes) */
export function Schemes3DIcon({ size = 56, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="govGold" x1="16" y1="12" x2="64" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE19E" />
          <stop offset="45%" stopColor="#FF9E2C" />
          <stop offset="100%" stopColor="#B85300" />
        </linearGradient>
        <linearGradient id="govPillar" x1="20" y1="34" x2="60" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7E6" />
          <stop offset="60%" stopColor="#FFC45C" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id="govShadow" x="4" y="6" width="72" height="70" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#092B55" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#govShadow)">
        {/* Dome & Spire */}
        <path d="M40 10L42 17H38L40 10Z" fill="#FFF3C4" />
        <path d="M24 27C24 19 31 15 40 15C49 15 56 19 56 27H24Z" fill="url(#govGold)" />
        {/* Roof Pediment */}
        <path d="M14 32L40 21L66 32H14Z" fill="url(#govGold)" />
        <rect x="16" y="32" width="48" height="5" rx="2" fill="#FFF4D6" />
        {/* Columns */}
        {[21, 32, 43, 54].map((x) => (
          <rect key={x} x={x} y="37" width="6" height="22" rx="2" fill="url(#govPillar)" />
        ))}
        {/* Base Steps */}
        <rect x="14" y="59" width="52" height="5.5" rx="2.5" fill="url(#govGold)" />
        <rect x="10" y="65" width="60" height="5.5" rx="2.5" fill="#092B55" />
      </g>
    </svg>
  );
}

/** 3. 3D Document Clipboard Icon (JENOVA Checklist / Prepare) */
export function Checklist3DIcon({ size = 56, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="clipBoard" x1="16" y1="12" x2="64" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="55%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#092B55" />
        </linearGradient>
        <linearGradient id="clipPaper" x1="22" y1="20" x2="58" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DCEEFF" />
        </linearGradient>
        <linearGradient id="clipTop" x1="28" y1="8" x2="52" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE19E" />
          <stop offset="100%" stopColor="#FF8A18" />
        </linearGradient>
        <filter id="clipShadow" x="8" y="6" width="64" height="70" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#092B55" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#clipShadow)">
        <rect x="16" y="14" width="48" height="58" rx="9" fill="url(#clipBoard)" />
        <rect x="22" y="21" width="36" height="45" rx="5" fill="url(#clipPaper)" />
        <rect x="29" y="9" width="22" height="11" rx="4.5" fill="url(#clipTop)" />
        <circle cx="40" cy="14.5" r="2.3" fill="#092B55" />
        {/* Check rows */}
        {[31, 43, 55].map((y, idx) => (
          <g key={y}>
            <path
              d={`M26 ${y}L29.5 ${y + 3.2}L35 ${y - 2.5}`}
              stroke={idx === 2 ? '#FF8A18' : '#138A45'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="39" y={y - 1.8} width={idx === 1 ? 13 : 15} height="3.6" rx="1.8" fill="#1E40AF" fillOpacity="0.72" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** 4. 3D Studio Microphone Icon (JENOVA Voice) */
export function Voice3DIcon({ size = 56, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="micBody" x1="26" y1="10" x2="54" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93E5FF" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#092B55" />
        </linearGradient>
        <linearGradient id="micMetal" x1="22" y1="36" x2="58" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <filter id="micShadow" x="10" y="6" width="60" height="70" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#092B55" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#micShadow)">
        <rect x="28" y="11" width="24" height="36" rx="12" fill="url(#micBody)" />
        {/* Grille highlights */}
        <path d="M33 20H47M33 26H47M33 32H47" stroke="#E0F7FF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
        {/* Stand arc */}
        <path
          d="M21 36C21 46.5 29.5 55 40 55C50.5 55 59 46.5 59 36"
          stroke="url(#micMetal)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="37.5" y="54" width="5" height="12" rx="2.5" fill="url(#micMetal)" />
        <ellipse cx="40" cy="67" rx="15" ry="4" fill="#36E7F2" fillOpacity="0.85" />
        <ellipse cx="40" cy="66" rx="12" ry="3" fill="url(#micMetal)" />
      </g>
    </svg>
  );
}

/** 5. 3D Location Pin Icon (JENOVA Local / Local Help) */
export function LocalPin3DIcon({ size = 56, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pinSaffron" x1="18" y1="10" x2="62" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD26E" />
          <stop offset="48%" stopColor="#FF8A18" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="pinRing" x1="20" y1="60" x2="60" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#36E7F2" />
          <stop offset="100%" stopColor="#138A45" />
        </linearGradient>
        <filter id="pinShadow" x="10" y="6" width="60" height="70" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#092B55" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#pinShadow)">
        <ellipse cx="40" cy="67" rx="18" ry="5" fill="url(#pinRing)" fillOpacity="0.65" />
        <path
          d="M40 10C26.7 10 16 20.5 16 33.5C16 49.5 34.5 63.5 38.6 66.4C39.4 67 40.6 67 41.4 66.4C45.5 63.5 64 49.5 64 33.5C64 20.5 53.3 10 40 10Z"
          fill="url(#pinSaffron)"
        />
        <circle cx="40" cy="33" r="10.5" fill="#FFFFFF" />
        <circle cx="40" cy="33" r="5.5" fill="#138A45" />
      </g>
    </svg>
  );
}

/** 6. 3D Briefcase Icon (Find Jobs floating panel) */
export function Briefcase3DIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="caseGrad" x1="14" y1="22" x2="66" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="45%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <path d="M29 24V18C29 15.2 31.2 13 34 13H46C48.8 13 51 15.2 51 18V24" stroke="#092B55" strokeWidth="5" strokeLinecap="round" />
      <rect x="12" y="24" width="56" height="42" rx="10" fill="url(#caseGrad)" />
      <path d="M12 36C28 42 52 42 68 36V32C68 27.6 64.4 24 60 24H20C15.6 24 12 27.6 12 32V36Z" fill="#FFFFFF" fillOpacity="0.45" />
      <rect x="34" y="37" width="12" height="8" rx="3" fill="#FFC45C" />
    </svg>
  );
}

/** Journey Step Orbs: 1. Magnifying Glass, 2. Open Book, 3. Clipboard, 4. Rocket, 5. Handshake */
export function JourneyOrbIcon({
  step,
  size = 76,
}: {
  step: 'discover' | 'understand' | 'prepare' | 'act' | 'followup';
  size?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full select-none"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.98) 0%, rgba(214,244,255,0.88) 46%, rgba(112,184,242,0.58) 78%, rgba(54,231,242,0.42) 100%)',
        boxShadow:
          'inset 0 2px 6px rgba(255,255,255,0.95), inset 0 -6px 12px rgba(9,43,85,0.16), 0 10px 24px -6px rgba(9,43,85,0.25), 0 0 16px rgba(54,231,242,0.35)',
        border: '1.5px solid rgba(255,255,255,0.85)',
      }}
    >
      {step === 'discover' && (
        <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="magRing" x1="12" y1="10" x2="44" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#092B55" />
            </linearGradient>
          </defs>
          <path d="M40 40L54 54" stroke="#092B55" strokeWidth="7" strokeLinecap="round" />
          <path d="M40 40L52 52" stroke="#36E7F2" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="28" cy="28" r="16" fill="#E0F7FF" stroke="url(#magRing)" strokeWidth="5.5" />
          <path d="M21 22C23.5 19.5 27 18.5 30.5 19.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {step === 'understand' && (
        <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M8 18C16 16 25 18 32 23V50C25 46 16 44 8 46V18Z" fill="#2563EB" />
          <path d="M56 18C48 16 39 18 32 23V50C39 46 48 44 56 46V18Z" fill="#092B55" />
          <path d="M12 16C19 14.5 26 16.5 32 21V46C26 42.5 19 41 12 42.5V16Z" fill="#FFFFFF" />
          <path d="M52 16C45 14.5 38 16.5 32 21V46C38 42.5 45 41 52 42.5V16Z" fill="#EBF6FF" />
          <path d="M17 24H27M17 30H27M37 24H47M37 30H47" stroke="#60A5FA" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )}
      {step === 'prepare' && <Checklist3DIcon size={Math.round(size * 0.68)} />}
      {step === 'act' && (
        <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="rktBody" x1="18" y1="10" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#092B55" />
            </linearGradient>
          </defs>
          {/* Exhaust flame */}
          <path d="M14 50C12 44 16 38 22 38C22 44 18 49 14 50Z" fill="#FF8A18" />
          <path d="M17 47C16 43 18 40 21 40C21 43 19 46 17 47Z" fill="#FFE19E" />
          {/* Fins */}
          <path d="M22 30L12 34L20 42L28 36L22 30Z" fill="#FF8A18" />
          <path d="M34 42L30 52L22 44L28 36L34 42Z" fill="#138A45" />
          {/* Rocket body */}
          <path
            d="M52 12C40 13 28 21 20 34L30 44C43 36 51 24 52 12Z"
            fill="url(#rktBody)"
            stroke="#092B55"
            strokeWidth="2"
          />
          <circle cx="38" cy="26" r="5" fill="#36E7F2" stroke="#092B55" strokeWidth="2.2" />
        </svg>
      )}
      {step === 'followup' && (
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          {/* Left sleeve (Navy) & Right sleeve (Green) */}
          <path d="M6 26L18 20L24 34L12 42L6 26Z" fill="#092B55" />
          <path d="M58 26L46 20L40 34L52 42L58 26Z" fill="#138A45" />
          {/* Clasped warm golden hands */}
          <path
            d="M17 24L27 21C30 20 34 21 37 24L45 31C47 33 47 36 44 38L34 45C31 47 27 46 24 44L16 37L17 24Z"
            fill="#FFB86C"
          />
          <path
            d="M47 24L36 22C33 21.5 30 23 28 25L24 29C22 31 23 34 26 34L32 32L41 39L47 34V24Z"
            fill="#FF9838"
          />
          <path d="M27 38L32 42M31 35L36 39M35 32L40 36" stroke="#C86100" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}
