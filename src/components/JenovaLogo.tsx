import React, { useEffect, useId, useRef } from 'react';
import gsap from 'gsap';

interface JenovaLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  tagline?: string;
  animated?: boolean;
  className?: string;
}

/**
 * Exact sculpted 3D-shaded JENOVA community emblem matching the centerpiece globe mark:
 * - Far-left glossy orange orb + sweeping orange arc
 * - Mid-left & right glossy deep-emerald orbs + winged emerald figures
 * - Center triumphant saffron-gold crown figure raising two arms to a radiant 5-point golden star
 * - Signature glossy teal-emerald 3D orbital swoosh ribbon wrapping the right foreground
 */
export function JenovaMark({
  size = 44,
  className = '',
}: {
  size?: number;
  variant?: 'light' | 'dark';
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const width = Math.round(size * 1.24);

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 104 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* 3D Glossy Golden Star */}
        <linearGradient id={`starMain-${uid}`} x1="47" y1="3" x2="52" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF8B8" />
          <stop offset="38%" stopColor="#FFC72C" />
          <stop offset="78%" stopColor="#FF8800" />
          <stop offset="100%" stopColor="#D65200" />
        </linearGradient>

        {/* Center Saffron-Gold Triumphant Figure */}
        <linearGradient id={`centerGold-${uid}`} x1="40" y1="22" x2="54" y2="77" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE169" />
          <stop offset="32%" stopColor="#FFA812" />
          <stop offset="75%" stopColor="#F26B00" />
          <stop offset="100%" stopColor="#BA3F00" />
        </linearGradient>

        {/* Far-left Glossy Orange Sphere */}
        <radialGradient id={`orangeOrb-${uid}`} cx="34%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFF2A8" />
          <stop offset="35%" stopColor="#FFA71A" />
          <stop offset="78%" stopColor="#E66200" />
          <stop offset="100%" stopColor="#993400" />
        </radialGradient>

        {/* Far-left Sweeping Orange Arc */}
        <linearGradient id={`leftOrange-${uid}`} x1="8" y1="49" x2="36" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFC740" />
          <stop offset="48%" stopColor="#FF8000" />
          <stop offset="100%" stopColor="#C94700" />
        </linearGradient>

        {/* 3D Glossy Emerald-Teal Spheres */}
        <radialGradient id={`greenOrb-${uid}`} cx="34%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#8BFFCB" />
          <stop offset="28%" stopColor="#1DB574" />
          <stop offset="68%" stopColor="#08643E" />
          <stop offset="100%" stopColor="#022C1B" />
        </radialGradient>

        {/* Sculpted Deep-Emerald Winged Figures */}
        <linearGradient id={`greenLeft-${uid}`} x1="18" y1="39" x2="43" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#26C485" />
          <stop offset="40%" stopColor="#0B754B" />
          <stop offset="82%" stopColor="#04472E" />
          <stop offset="100%" stopColor="#02291A" />
        </linearGradient>
        <linearGradient id={`greenRight-${uid}`} x1="78" y1="39" x2="50" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#26C485" />
          <stop offset="42%" stopColor="#0B754B" />
          <stop offset="84%" stopColor="#04472E" />
          <stop offset="100%" stopColor="#02291A" />
        </linearGradient>

        {/* Signature 3D Glossy Teal-Emerald Foreground Swoosh Ribbon */}
        <linearGradient id={`swoosh-${uid}`} x1="94" y1="45" x2="46" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#72F7D6" />
          <stop offset="28%" stopColor="#19AE7D" />
          <stop offset="68%" stopColor="#076A49" />
          <stop offset="100%" stopColor="#033926" />
        </linearGradient>

        {/* Subtle warm star glow */}
        <radialGradient id={`starHalo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE680" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FF9800" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft Radiant Halo behind Top Star */}
      <circle cx="47.5" cy="14.5" r="14" fill={`url(#starHalo-${uid})`} />

      {/* 1. Far-Left Small Glossy Orange Figure (Orb + Sweeping Wing Arc) */}
      <circle className="jenova-node" cx="15.5" cy="44" r="6.2" fill={`url(#orangeOrb-${uid})`} />
      <path
        className="jenova-path"
        d="M4.5 58.2C13.8 48.2 26.8 48.8 36.2 58.8C36.8 64.5 36.4 71.2 33.4 76.2C27.2 66.2 17.5 60.2 4.5 58.2Z"
        fill={`url(#leftOrange-${uid})`}
      />
      {/* Crisp top specular rim on orange arc */}
      <path
        d="M7.2 57.2C15.5 49.8 26.2 50.6 34.4 58.5"
        stroke="#FFE89E"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* 2. Mid-Left Tall Glossy Emerald-Green Figure */}
      <circle className="jenova-node" cx="29.8" cy="33.5" r="7.4" fill={`url(#greenOrb-${uid})`} />
      <path
        className="jenova-path"
        d="M15.8 45.8C24.2 45.6 32.8 43.2 38.8 39.2C43.2 47.4 45.5 60.5 42.6 76.6C40.2 77.2 37.8 77.2 35.8 76.4C37.6 61.8 32.5 52.8 15.8 45.8Z"
        fill={`url(#greenLeft-${uid})`}
      />
      <path
        d="M19 46.2C26 45.8 33 43.8 38.2 40.4"
        stroke="#7FFFD4"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* 3. Right Tall Glossy Emerald-Green Figure */}
      <circle className="jenova-node" cx="65.8" cy="33.5" r="7.4" fill={`url(#greenOrb-${uid})`} />
      <path
        className="jenova-path"
        d="M81.5 45.2C72.2 45.2 63.4 43.2 56.6 39.4C52.4 48.2 50.2 61 52.2 76.4C54.8 76.8 57.6 76.2 60 75.2C59.4 61.2 66.2 51.8 81.5 45.2Z"
        fill={`url(#greenRight-${uid})`}
      />
      <path
        d="M78.5 45.8C71 45.6 63.6 43.8 57.4 40.6"
        stroke="#7FFFD4"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />

      {/* 4. Center Triumphant Saffron-Gold Star-Bearer Figure (Crown Peak + Raised V-Arms) */}
      <path
        className="jenova-arc"
        d="M47.5 21.8L51.4 33.8L58.4 27.6L55.2 41.2C52.2 52.2 51.4 64.2 50.2 76.8C47.8 77.8 45.6 77.8 43.4 76.8C44.4 63.8 43.2 51.8 39.8 40.8L36.6 27.6L43.6 33.8L47.5 21.8Z"
        fill={`url(#centerGold-${uid})`}
      />
      {/* Sculpted golden highlight down center crest */}
      <path
        d="M47.5 23.6L49.4 36.2C47.8 47.5 47.4 60 46.8 74.5"
        stroke="#FFF4B8"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeOpacity="0.72"
      />

      {/* 5. Radiant Sculpted 5-Point Golden Star Crowning the Peak */}
      <path
        className="jenova-star"
        d="M47.5 3.5L50.8 11.2L59.1 11.9L52.8 17.4L54.7 25.5L47.5 21.2L40.3 25.5L42.2 17.4L35.9 11.9L44.2 11.2L47.5 3.5Z"
        fill={`url(#starMain-${uid})`}
        stroke="#FFF6B8"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />

      {/* 6. Signature Glossy 3D Teal-Emerald Orbital Swoosh Ribbon Wrapping Right Foreground */}
      <path
        d="M80.5 45.2C92.5 45.4 98.8 50.8 94.8 58.6C90.2 67.5 72.5 74.5 45.2 77.8C65.2 70.6 80.2 63.6 85.4 55.8C88.5 51.2 86.2 47.2 80.5 45.2Z"
        fill={`url(#swoosh-${uid})`}
      />
      <path
        d="M84.5 46.8C93.2 48.2 95.8 52.8 91.6 58.8C86.4 66.2 71.5 72.2 51.8 75.8"
        stroke="#9BFFE8"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeOpacity="0.82"
      />
    </svg>
  );
}

export function JenovaLogo({
  variant = 'light',
  size = 'md',
  showTagline = false,
  tagline,
  animated = false,
  className = '',
}: JenovaLogoProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!animated || !rootRef.current) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        '.jenova-mark-wrap',
        { scale: 0.88, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.42 }
      )
        .fromTo(
          '.jenova-star',
          { scale: 0.45, opacity: 0, transformOrigin: 'center center' },
          { scale: 1, opacity: 1, duration: 0.38, ease: 'back.out(2)' },
          '-=0.2'
        )
        .fromTo(
          '.jenova-letter',
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.035, duration: 0.3 },
          '-=0.25'
        );
    }, rootRef);

    return () => ctx.revert();
  }, [animated]);

  const isDark = variant === 'dark';
  const markSize = size === 'sm' ? 40 : size === 'lg' ? 56 : 46;
  const textSize =
    size === 'sm'
      ? 'text-[19px] sm:text-[22px] tracking-[0.06em]'
      : size === 'lg'
        ? 'text-2xl sm:text-3xl tracking-[0.08em]'
        : 'text-xl sm:text-2xl tracking-[0.07em]';

  const letters = ['J', 'E', 'N', 'O', 'V', 'A'];

  return (
    <div ref={rootRef} className={`inline-flex items-center gap-2 select-none min-w-0 ${className}`}>
      <span className="jenova-mark-wrap inline-flex shrink-0 drop-shadow-[0_3px_8px_rgba(4,44,27,0.22)]">
        <JenovaMark size={markSize} variant={variant} />
      </span>
      <div className="flex flex-col leading-none text-left min-w-0">
        <span
          className={`inline-flex items-baseline font-black uppercase ${textSize} ${
            isDark
              ? 'text-[#FFF5E8]'
              : 'text-[#26364B] dark:text-[#FFF5E8]'
          }`}
          style={{ fontFamily: '"Plus Jakarta Sans", "Public Sans", sans-serif' }}
        >
          {letters.map((ch, i) => (
            <span key={`${ch}-${i}`} className="jenova-letter inline-block">
              {ch}
            </span>
          ))}
        </span>
        {showTagline && tagline && (
          <span
            className={`jenova-tagline hidden min-[380px]:block text-[9.5px] sm:text-[10.5px] font-bold tracking-tight mt-0.5 truncate max-w-[165px] sm:max-w-none ${
              isDark ? 'text-[#DDD2C5]' : 'text-[#454545] dark:text-[#DDD2C5]'
            }`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
