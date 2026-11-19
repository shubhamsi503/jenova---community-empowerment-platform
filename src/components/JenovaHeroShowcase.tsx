import React, { useRef, useState } from 'react';
import type { Language } from '../types/platform';

interface JenovaHeroShowcaseProps {
  language: Language;
  onNavigate: (path: string) => void;
}

/**
 * Exact high-fidelity interactive 3D Tricolour India Map + Crystal JENOVA Globe + Howrah Bridge showcase.
 * Cleanly crops ONLY the center-right 3D visual zone (x: 37.8%..99.6%, y: 9.8%..57.6%) of the
 * studio-rendered artwork so zero baked-in left text or bottom cards ever appear, while overlaying
 * pixel-aligned interactive clickable hotspots for Stay Safe, Find Jobs, Local Help, India Schemes, and Globe.
 */
export function JenovaHeroShowcase({ language, onNavigate }: JenovaHeroShowcaseProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 4.5, ry: px * 5.5 });
  };

  // Interactive clickable hotspots aligned precisely to the 3D elements inside the cropped showcase
  const hotspots = [
    {
      id: 'stay-safe',
      path: '/scam-check',
      label:
        language === 'bn'
          ? 'নিরাপদ থাকুন — JENOVA Protect খুলুন'
          : language === 'hi'
            ? 'सुरक्षित रहें — JENOVA Protect खोलें'
            : 'Stay Safe — Open JENOVA Protect',
      style: { left: '19.1%', top: '4.2%', width: '10.1%', height: '23.6%' },
      ring: true,
    },
    {
      id: 'find-jobs',
      path: '/jobs',
      label:
        language === 'bn'
          ? 'কাজ খুঁজুন — চাকরি ও সুযোগ'
          : language === 'hi'
            ? 'नौकरी खोजें — स्थानीय अवसर देखें'
            : 'Find Jobs — Explore Local Opportunities',
      style: { left: '79.8%', top: '4.8%', width: '10.9%', height: '25.8%' },
      ring: true,
    },
    {
      id: 'local-help',
      path: '/local-help',
      label:
        language === 'bn'
          ? 'স্থানীয় সহায়তা — BSK ও অফিস'
          : language === 'hi'
            ? 'स्थानीय सहायता — BSK और कार्यालय'
            : 'Local Help — Verified Support Centres',
      style: { left: '85.3%', top: '33.2%', width: '11.4%', height: '26.8%' },
      ring: true,
    },
    {
      id: 'india-map',
      path: '/schemes',
      label:
        language === 'bn'
          ? 'সরকারি প্রকল্প — যোগ্যতা যাচাই করুন'
          : language === 'hi'
            ? 'सरकारी योजनाएं — पात्रता जांचें'
            : 'India Schemes — Check Government Eligibility',
      style: { left: '2.5%', top: '18%', width: '26%', height: '74%' },
      ring: false,
    },
    {
      id: 'jenova-globe',
      path: '/assistant',
      label:
        language === 'bn'
          ? 'JENOVA AI সহায়ক — বাংলায় জিজ্ঞাসা করুন'
          : language === 'hi'
            ? 'JENOVA AI सहायक — हिंदी में पूछें'
            : 'JENOVA Global AI Guide — Ask Anything',
      style: { left: '34%', top: '5%', width: '44%', height: '86%' },
      ring: false,
    },
  ];

  return (
    <div
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setTilt({ rx: 0, ry: 0 });
        setHovered(null);
      }}
      className="relative w-full select-none"
      style={{ perspective: '1200px' }}
    >
      {/* Fixed aspect-ratio stage matching exact clean 3D India + Globe visual bounds (2.297:1) */}
      <div
        className="relative w-full aspect-[2.26/1] sm:aspect-[2.29/1] overflow-hidden rounded-2xl lg:rounded-3xl transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 5%, black 98%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 5%, black 98%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
          maskComposite: 'intersect',
        }}
      >
        {/* Clean cropped 3D Tricolour India + Crystal JENOVA Globe + Howrah Bridge */}
        <img
          src="/assets/aistudio/JENOVA_India__Future_in_Tricolor_81b3ce20.png"
          alt="3D Tricolour India Map with Ashoka Chakra and glowing crystal JENOVA Globe over Indian riverfront"
          draggable={false}
          className="absolute max-w-none pointer-events-none select-none"
          style={{
            width: '161.81%',
            height: '209.21%',
            left: '-61.16%',
            top: '-20.50%',
          }}
        />

        {/* Interactive Clickable Hotspots with luminous cyan/gold hover highlight */}
        {hotspots.map((hs) => {
          const isHot = hovered === hs.id;
          return (
            <button
              key={hs.id}
              type="button"
              onClick={() => onNavigate(hs.path)}
              onMouseEnter={() => setHovered(hs.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={hs.label}
              title={hs.label}
              style={hs.style}
              className={`absolute z-20 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC45C] ${
                hs.ring
                  ? `rounded-2xl ${
                      isHot
                        ? 'ring-2 ring-[#FFC45C] bg-white/10 shadow-[0_0_24px_rgba(255,196,92,0.75)] scale-[1.04]'
                        : 'hover:ring-2 hover:ring-[#36E7F2]/80'
                    }`
                  : `rounded-full ${
                      isHot ? 'bg-white/[0.04] shadow-[0_0_32px_rgba(54,231,242,0.22)]' : ''
                    }`
              }`}
            />
          );
        })}

        {/* Subtle hover caption pill at bottom-right when inspecting interactive 3D landmarks */}
        {hovered && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-[#072042]/90 border border-[#36E7F2]/70 text-[11px] font-bold text-white shadow-lg whitespace-nowrap">
            {hotspots.find((h) => h.id === hovered)?.label}
          </div>
        )}
      </div>
    </div>
  );
}
