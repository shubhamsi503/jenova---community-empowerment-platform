import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface JenovaHero3DProps {
  theme: 'light' | 'dark';
  compact?: boolean;
}

// Reusable scratch math objects (zero per-frame GC)
const _vec2 = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

/**
 * Recognisable silhouette outline of India (normalized roughly [-1.2..1.35] x [-1.65..1.75]).
 * Traces counter-clockwise from Ladakh/Kashmir crown -> Gujarat -> Kanyakumari ->
 * Eastern Coast -> West Bengal -> Sikkim -> Arunachal & Northeast -> Himalayas.
 */
const INDIA_OUTLINE_POINTS: [number, number][] = [
  [-0.22, 1.66], // Ladakh / Northern Crown
  [-0.02, 1.68],
  [0.14, 1.56],
  [0.18, 1.42],
  [0.06, 1.32],
  [0.14, 1.18], // Uttarakhand / Himachal
  [0.24, 1.06],
  [0.44, 0.94], // UP / Bihar North
  [0.64, 0.88],
  [0.72, 0.96], // Sikkim thumb
  [0.77, 0.96],
  [0.79, 0.87], // Northern WB / Bhutan border
  [0.95, 0.91], // Assam / Arunachal West
  [1.14, 1.04], // Arunachal Crown
  [1.26, 0.95], // Arunachal East
  [1.17, 0.78], // Nagaland
  [1.11, 0.62], // Manipur
  [1.04, 0.48], // Mizoram tip
  [0.98, 0.57], // Tripura
  [0.92, 0.64],
  [0.96, 0.74], // Meghalaya / Assam bend
  [0.82, 0.76],
  [0.75, 0.62], // West Bengal / Sundarbans
  [0.67, 0.44], // Odisha coast
  [0.54, 0.25], // North Andhra coast
  [0.37, 0.04], // Andhra curve
  [0.22, -0.22], // Nellore / Chennai
  [0.17, -0.58], // Tamil Nadu coast
  [0.06, -0.94], // Rameshwaram
  [-0.08, -1.24], // Kanyakumari Southern Tip
  [-0.2, -1.04], // Kerala coast
  [-0.3, -0.74],
  [-0.4, -0.4], // Karnataka / Goa
  [-0.49, -0.02], // Konkan / Mumbai
  [-0.53, 0.26], // Surat / Gulf of Khambhat
  [-0.64, 0.2], // Kathiawar Peninsula South
  [-0.84, 0.27], // Dwarka West
  [-0.78, 0.42], // Gulf of Kachchh
  [-0.95, 0.48], // Kachchh West
  [-0.86, 0.62],
  [-0.72, 0.67], // Rajasthan Southwest
  [-0.82, 0.86], // Jaisalmer West Bulge
  [-0.66, 1.06], // Bikaner / Punjab
  [-0.5, 1.24], // Punjab / Jammu
  [-0.55, 1.42], // Kashmir West
  [-0.42, 1.58], // Northern Gilgit/Ladakh arc
];

function createIndiaTricolourTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Smooth tricolour gradient bands with rich luminous depth
  // Top third: Saffron (#FF8A18)
  const saffronGrad = ctx.createLinearGradient(0, 0, 1024, 360);
  saffronGrad.addColorStop(0, '#FFB347');
  saffronGrad.addColorStop(0.5, '#FF8A18');
  saffronGrad.addColorStop(1, '#E86800');
  ctx.fillStyle = saffronGrad;
  ctx.fillRect(0, 0, 1024, 360);

  // Middle third: Pure Luminous White (#FFFFFF)
  const whiteGrad = ctx.createLinearGradient(0, 360, 1024, 675);
  whiteGrad.addColorStop(0, '#FFFFFF');
  whiteGrad.addColorStop(0.55, '#F5FAFF');
  whiteGrad.addColorStop(1, '#E8F3FF');
  ctx.fillStyle = whiteGrad;
  ctx.fillRect(0, 360, 1024, 315);

  // Bottom third: Vibrant India Green (#138A45)
  const greenGrad = ctx.createLinearGradient(0, 675, 1024, 1024);
  greenGrad.addColorStop(0, '#1DB35A');
  greenGrad.addColorStop(0.5, '#138A45');
  greenGrad.addColorStop(1, '#0A5E2F');
  ctx.fillStyle = greenGrad;
  ctx.fillRect(0, 675, 1024, 349);

  // Subtle futuristic geometric facet grid lines across the map
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 1024; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Subtle metallic highlight seams between bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(0, 358, 1024, 4);
  ctx.fillRect(0, 673, 1024, 4);

  // Crisp 24-Spoke Navy Blue Ashoka Chakra centered in the white band (Central India)
  const cx = 448;
  const cy = 516;
  const outerR = 110;
  const innerR = 22;

  ctx.save();
  ctx.strokeStyle = '#092B55';
  ctx.fillStyle = '#092B55';

  // Outer & inner rim rings
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - 10, 0, Math.PI * 2);
  ctx.stroke();

  // Central hub
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fill();

  // 24 spokes + 24 rim half-dots
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const midAngle = ((i + 0.5) / 24) * Math.PI * 2;

    // Tapered spoke
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(
      cx + Math.cos(angle - 0.032) * (outerR * 0.62),
      cy + Math.sin(angle - 0.032) * (outerR * 0.62)
    );
    ctx.lineTo(cx + Math.cos(angle) * (outerR - 6), cy + Math.sin(angle) * (outerR - 6));
    ctx.lineTo(
      cx + Math.cos(angle + 0.032) * (outerR * 0.62),
      cy + Math.sin(angle + 0.032) * (outerR * 0.62)
    );
    ctx.closePath();
    ctx.fill();

    // Inner rim bead
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(midAngle) * (outerR - 6),
      cy + Math.sin(midAngle) * (outerR - 6),
      3.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createGlobeTexture(maxAnisotropy: number, isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Translucent luminous ocean base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, isDark ? 'rgba(18, 92, 168, 0.55)' : 'rgba(92, 184, 248, 0.42)');
  oceanGrad.addColorStop(0.5, isDark ? 'rgba(9, 54, 118, 0.52)' : 'rgba(30, 128, 214, 0.48)');
  oceanGrad.addColorStop(1, isDark ? 'rgba(11, 82, 140, 0.62)' : 'rgba(54, 178, 232, 0.50)');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle holographic latitude/longitude grid lines
  ctx.strokeStyle = 'rgba(180, 244, 255, 0.28)';
  ctx.lineWidth = 1.2;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 32; y < 512; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Stylized glowing continents (equirectangular layout)
  const continents: [number, number][][] = [
    // Americas
    [[160, 88], [265, 92], [295, 160], [250, 215], [225, 250], [278, 290], [312, 355], [270, 442], [238, 415], [220, 325], [176, 230], [140, 155]],
    // Europe & Africa
    [[455, 86], [568, 84], [585, 155], [538, 184], [595, 232], [610, 310], [565, 405], [520, 408], [492, 318], [452, 260], [462, 182], [442, 134]],
    // Asia & Middle East
    [[575, 76], [825, 84], [878, 150], [835, 224], [768, 258], [728, 236], [685, 262], [648, 220], [590, 182]],
    // Southeast Asia & Australia
    [[790, 295], [888, 304], [912, 368], [860, 404], [786, 380]],
  ];

  ctx.fillStyle = 'rgba(225, 248, 255, 0.72)';
  ctx.strokeStyle = 'rgba(54, 231, 242, 0.9)';
  ctx.lineWidth = 2;
  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([x, y], idx) => {
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Highlight India in warm golden glow on the globe surface
  ctx.fillStyle = 'rgba(255, 196, 92, 0.95)';
  ctx.beginPath();
  ctx.moveTo(696, 178);
  ctx.lineTo(724, 188);
  ctx.lineTo(735, 206);
  ctx.lineTo(712, 246);
  ctx.lineTo(690, 212);
  ctx.closePath();
  ctx.fill();

  // Glowing digital community hubs
  const hubs: [number, number][] = [
    [708, 212], [724, 208], [696, 200], [520, 145], [240, 165],
    [820, 190], [848, 355], [550, 290], [630, 215], [760, 230],
  ];
  hubs.forEach(([hx, hy]) => {
    const g = ctx.createRadialGradient(hx, hy, 1, hx, hy, 12);
    g.addColorStop(0, 'rgba(255, 244, 196, 1)');
    g.addColorStop(0.4, 'rgba(255, 196, 92, 0.75)');
    g.addColorStop(1, 'rgba(54, 231, 242, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createJenovaFrontBadgeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 1024, 512);

  // Soft radiant halo behind badge
  const halo = ctx.createRadialGradient(512, 230, 30, 512, 230, 340);
  halo.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
  halo.addColorStop(0.5, 'rgba(54, 231, 242, 0.14)');
  halo.addColorStop(1, 'rgba(54, 231, 242, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 1024, 512);

  // Sculpted Community Emblem above wordmark
  ctx.save();
  ctx.translate(512, 138);

  // Rising Golden 5-point Star
  const starGrad = ctx.createLinearGradient(0, -106, 0, -40);
  starGrad.addColorStop(0, '#FFF8D6');
  starGrad.addColorStop(0.5, '#FFC45C');
  starGrad.addColorStop(1, '#FF8A18');
  ctx.fillStyle = starGrad;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 34 : 14;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const sx = Math.cos(a) * r;
    const sy = -78 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();

  // Left Saffron Sweeping Wing
  const saffronWing = ctx.createLinearGradient(-150, -30, 0, 75);
  saffronWing.addColorStop(0, '#FFC45C');
  saffronWing.addColorStop(0.6, '#FF8A18');
  saffronWing.addColorStop(1, '#D85A00');
  ctx.fillStyle = saffronWing;
  ctx.beginPath();
  ctx.moveTo(-152, 54);
  ctx.quadraticCurveTo(-92, -32, -10, 6);
  ctx.quadraticCurveTo(-56, 36, -42, 74);
  ctx.quadraticCurveTo(-110, 78, -152, 54);
  ctx.closePath();
  ctx.fill();

  // Center Deep-Green & Saffron Unity Pillar
  const greenWing = ctx.createLinearGradient(-40, -35, 145, 78);
  greenWing.addColorStop(0, '#2AC769');
  greenWing.addColorStop(0.55, '#138A45');
  greenWing.addColorStop(1, '#084725');
  ctx.fillStyle = greenWing;
  ctx.beginPath();
  ctx.moveTo(-78, 72);
  ctx.quadraticCurveTo(-48, -26, 0, -48);
  ctx.quadraticCurveTo(48, -22, 62, 74);
  ctx.quadraticCurveTo(-10, 86, -78, 72);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = saffronWing;
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.quadraticCurveTo(-18, 12, -10, 74);
  ctx.quadraticCurveTo(22, 76, 44, 70);
  ctx.quadraticCurveTo(32, 6, 0, -48);
  ctx.closePath();
  ctx.fill();

  // Right India-Green Sweeping Wing
  ctx.fillStyle = greenWing;
  ctx.beginPath();
  ctx.moveTo(152, 54);
  ctx.quadraticCurveTo(92, -32, 12, 8);
  ctx.quadraticCurveTo(56, 36, 42, 74);
  ctx.quadraticCurveTo(110, 78, 152, 54);
  ctx.closePath();
  ctx.fill();

  // Three Glowing Community Heads
  const drawHead = (hx: number, hy: number, r: number, c1: string, c2: string) => {
    const hg = ctx.createRadialGradient(hx - r * 0.3, hy - r * 0.3, 2, hx, hy, r);
    hg.addColorStop(0, '#FFFFFF');
    hg.addColorStop(0.35, c1);
    hg.addColorStop(1, c2);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  drawHead(-92, -26, 21, '#FFB347', '#E25E00');
  drawHead(-48, -44, 20, '#36D97C', '#0C6A36');
  drawHead(84, -30, 21, '#36D97C', '#0B5A2D');
  ctx.restore();

  // Metallic 3D-extruded JENOVA Wordmark
  ctx.save();
  ctx.font = '900 132px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Deep navy bevel shadow
  ctx.fillStyle = '#062044';
  ctx.fillText('JENOVA', 515, 310);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#FFC45C';
  ctx.strokeText('JENOVA', 512, 304);

  // Deep teal/navy interior metallic fill
  const wordGrad = ctx.createLinearGradient(0, 240, 0, 362);
  wordGrad.addColorStop(0, '#166075');
  wordGrad.addColorStop(0.48, '#0B3A5E');
  wordGrad.addColorStop(1, '#061D3A');
  ctx.fillStyle = wordGrad;
  ctx.fillText('JENOVA', 512, 304);
  ctx.restore();

  // Rounded Dark-Teal Tagline Plaque: "A New Way to Grow Together."
  ctx.save();
  const px = 222;
  const py = 382;
  const pw = 580;
  const ph = 72;
  const rad = 36;

  ctx.beginPath();
  ctx.moveTo(px + rad, py);
  ctx.lineTo(px + pw - rad, py);
  ctx.quadraticCurveTo(px + pw, py, px + pw, py + rad);
  ctx.quadraticCurveTo(px + pw, py + ph, px + pw - rad, py + ph);
  ctx.lineTo(px + rad, py + ph);
  ctx.quadraticCurveTo(px, py + ph, px, py + rad);
  ctx.quadraticCurveTo(px, py, px + rad, py);
  ctx.closePath();

  const pillGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
  pillGrad.addColorStop(0, '#094E43');
  pillGrad.addColorStop(0.5, '#0B3D5C');
  pillGrad.addColorStop(1, '#0A4B3D');
  ctx.fillStyle = pillGrad;
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#36E7F2';
  ctx.stroke();

  ctx.font = '700 32px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A New Way to Grow Together.', 512, py + ph / 2 + 1);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createSoftParticleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,235,175,0.85)');
  g.addColorStop(0.7, 'rgba(54,231,242,0.28)');
  g.addColorStop(1, 'rgba(54,231,242,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildHolographicPlatform(
  radius: number,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x0e385c,
    metalness: 0.85,
    roughness: 0.22,
  });
  const silverRimMat = new THREE.MeshStandardMaterial({
    color: 0xcbe8ff,
    metalness: 0.9,
    roughness: 0.16,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x36e7f2,
    emissive: 0x36e7f2,
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.1,
  });
  const goldGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffc45c,
    emissive: 0xffa62b,
    emissiveIntensity: 0.9,
    roughness: 0.22,
    metalness: 0.8,
  });

  // Base stepped disc
  const baseTier = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.15, radius * 1.24, 0.14, 48),
    metalMat
  );
  baseTier.position.y = -0.14;
  group.add(baseTier);

  // Mid glowing cyan ring
  const midGlowRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.07, 0.028, 12, 64),
    cyanGlowMat
  );
  midGlowRing.rotation.x = Math.PI / 2;
  midGlowRing.position.y = -0.05;
  group.add(midGlowRing);

  // Upper metallic stage
  const topTier = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.92, radius * 1.04, 0.12, 48),
    silverRimMat
  );
  topTier.position.y = 0.02;
  group.add(topTier);

  // Top luminous inner ring
  const innerCyan = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.72, 0.022, 10, 48),
    cyanGlowMat
  );
  innerCyan.rotation.x = Math.PI / 2;
  innerCyan.position.y = 0.09;
  group.add(innerCyan);

  // Subtle gold trim ring
  const goldTrim = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.92, 0.015, 10, 48),
    goldGlowMat
  );
  goldTrim.rotation.x = Math.PI / 2;
  goldTrim.position.y = 0.085;
  group.add(goldTrim);

  // Translucent holographic upward light cone
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x36e7f2,
    transparent: true,
    opacity: isSoftwareGl ? 0.14 : 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lightCone = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.78, radius * 0.56, 0.78, 36, 1, true),
    beamMat
  );
  lightCone.position.y = 0.46;
  group.add(lightCone);

  return group;
}

function buildIndia3DModel(maxAnisotropy: number, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  const shape = new THREE.Shape();
  INDIA_OUTLINE_POINTS.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.032,
    bevelSegments: isSoftwareGl ? 2 : 4,
    curveSegments: 8,
  });

  // Compute normalized planar UVs across the India bounding box so the Tricolour & Chakra sit accurately
  extrudeGeo.computeBoundingBox();
  const bb = extrudeGeo.boundingBox!;
  const posAttr = extrudeGeo.attributes.position;
  const uvArr = new Float32Array(posAttr.count * 2);
  const w = bb.max.x - bb.min.x || 1;
  const h = bb.max.y - bb.min.y || 1;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    uvArr[i * 2] = (vx - bb.min.x) / w;
    uvArr[i * 2 + 1] = (vy - bb.min.y) / h;
  }
  extrudeGeo.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
  extrudeGeo.center();

  const tricolourTex = createIndiaTricolourTexture(maxAnisotropy);

  const frontMat = new THREE.MeshPhysicalMaterial({
    map: tricolourTex,
    roughness: 0.26,
    metalness: 0.08,
    clearcoat: 0.75,
    clearcoatRoughness: 0.18,
  });

  const sideMat = new THREE.MeshStandardMaterial({
    color: 0xffc45c,
    emissive: 0x36e7f2,
    emissiveIntensity: 0.22,
    metalness: 0.72,
    roughness: 0.24,
  });

  const indiaMesh = new THREE.Mesh(extrudeGeo, [frontMat, sideMat]);
  indiaMesh.scale.setScalar(0.76);
  indiaMesh.name = 'india-map-mesh';
  group.add(indiaMesh);

  // Raised subtle 3D Navy metallic ring accentuating the Ashoka Chakra on the front face
  const chakraRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.012, 10, 36),
    new THREE.MeshStandardMaterial({
      color: 0x092b55,
      metalness: 0.65,
      roughness: 0.25,
    })
  );
  chakraRing.position.set(-0.07, 0.02, 0.135);
  group.add(chakraRing);

  // Subtle outer holographic glowing contour rings orbiting India
  const orbitMat1 = new THREE.MeshStandardMaterial({
    color: 0xffc45c,
    emissive: 0xffa62b,
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.85,
  });
  const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.016, 10, 72), orbitMat1);
  orbit1.rotation.set(Math.PI * 0.43, 0.18, 0.12);
  orbit1.position.y = -0.32;
  orbit1.name = 'india-orbit-1';
  group.add(orbit1);

  const orbitMat2 = new THREE.MeshStandardMaterial({
    color: 0x36e7f2,
    emissive: 0x36e7f2,
    emissiveIntensity: 1.25,
    roughness: 0.2,
  });
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.011, 10, 64), orbitMat2);
  orbit2.rotation.set(Math.PI * 0.46, -0.22, -0.15);
  orbit2.position.y = -0.46;
  orbit2.name = 'india-orbit-2';
  group.add(orbit2);

  return group;
}

function buildGlobeAssembly(
  maxAnisotropy: number,
  isDark: boolean,
  isSoftwareGl: boolean
): {
  root: THREE.Group;
  spinGroup: THREE.Group;
  ringGroup: THREE.Group;
} {
  const root = new THREE.Group();
  const spinGroup = new THREE.Group();
  root.add(spinGroup);

  const globeRadius = 1.48;

  // 1. Inner illuminated core haze
  const coreSphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius * 0.86, 32, 32),
    new THREE.MeshBasicMaterial({
      color: isDark ? 0x0c4a8a : 0x38a3f1,
      transparent: true,
      opacity: isDark ? 0.34 : 0.24,
      depthWrite: false,
    })
  );
  spinGroup.add(coreSphere);

  // 2. Continent & Digital Hub Sphere
  const globeTex = createGlobeTexture(maxAnisotropy, isDark);
  const earthSphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius * 0.965, isSoftwareGl ? 32 : 48, isSoftwareGl ? 24 : 36),
    new THREE.MeshStandardMaterial({
      map: globeTex,
      transparent: true,
      opacity: 0.92,
      roughness: 0.28,
      metalness: 0.15,
      emissive: new THREE.Color(0x1b74b8),
      emissiveIntensity: isDark ? 0.42 : 0.25,
      depthWrite: false,
    })
  );
  earthSphere.renderOrder = 2;
  earthSphere.name = 'jenova-globe-mesh';
  spinGroup.add(earthSphere);

  // 3. Outer Glass Shell with Specular Clearcoat
  const glassShell = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius, isSoftwareGl ? 32 : 48, isSoftwareGl ? 24 : 36),
    new THREE.MeshPhysicalMaterial({
      color: 0xb8ecff,
      transparent: true,
      opacity: 0.24,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      depthWrite: false,
    })
  );
  glassShell.renderOrder = 3;
  spinGroup.add(glassShell);

  // 4. Holographic Latitude/Longitude Wireframe Lattice
  const wireSphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(globeRadius * 1.01, 2),
    new THREE.MeshBasicMaterial({
      color: 0x36e7f2,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    })
  );
  spinGroup.add(wireSphere);

  // 5. Glowing Network Connection Arcs across the Globe
  const arcMat = new THREE.MeshBasicMaterial({
    color: 0xffc45c,
    transparent: true,
    opacity: 0.78,
  });
  const arcPairs: [number, number, number, number][] = [
    [0.35, 0.3, 0.9, 1.5],
    [-0.25, 0.6, 0.4, 2.2],
    [0.5, 2.4, -0.35, 3.8],
    [-0.1, 4.1, 0.6, 5.5],
  ];
  arcPairs.forEach(([lat1, lon1, lat2, lon2]) => {
    const p1 = new THREE.Vector3().setFromSphericalCoords(globeRadius * 0.98, Math.PI / 2 - lat1, lon1);
    const p2 = new THREE.Vector3().setFromSphericalCoords(globeRadius * 0.98, Math.PI / 2 - lat2, lon2);
    const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(globeRadius * 1.24);
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.011, 6, false), arcMat);
    spinGroup.add(tube);
  });

  // 6. Animated Golden Orbital Rings + Orbiting Spark Nodes
  const ringGroup = new THREE.Group();
  root.add(ringGroup);

  const goldRingMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0xff9f1c,
    emissiveIntensity: 0.95,
    metalness: 0.92,
    roughness: 0.16,
  });
  const cyanRingMat = new THREE.MeshStandardMaterial({
    color: 0x36e7f2,
    emissive: 0x36e7f2,
    emissiveIntensity: 1.15,
    metalness: 0.5,
    roughness: 0.2,
  });

  const ringSpecs = [
    { r: globeRadius * 1.18, tube: 0.022, rot: [1.32, 0.26, 0.12], mat: goldRingMat },
    { r: globeRadius * 1.32, tube: 0.016, rot: [1.18, -0.36, -0.22], mat: goldRingMat },
    { r: globeRadius * 1.24, tube: 0.012, rot: [1.46, 0.05, 0.45], mat: cyanRingMat },
  ];

  ringSpecs.forEach((spec, idx) => {
    const holder = new THREE.Group();
    holder.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
    const torus = new THREE.Mesh(new THREE.TorusGeometry(spec.r, spec.tube, 12, 96), spec.mat);
    holder.add(torus);

    // Orbiting spark sphere riding each ring
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      new THREE.MeshBasicMaterial({ color: idx === 2 ? 0x99f6ff : 0xfff5cc })
    );
    spark.position.set(spec.r, 0, 0);
    holder.add(spark);
    holder.name = `orbital-ring-${idx}`;
    ringGroup.add(holder);
  });

  // 7. Prominent JENOVA Brand Identity Plaque in front of the Globe
  const badgeTex = createJenovaFrontBadgeTexture(maxAnisotropy);
  const badgePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.75, 1.38),
    new THREE.MeshBasicMaterial({
      map: badgeTex,
      transparent: true,
      depthWrite: false,
    })
  );
  badgePlane.position.set(0, -0.02, globeRadius + 0.18);
  badgePlane.renderOrder = 6;
  root.add(badgePlane);

  return { root, spinGroup, ringGroup };
}

/** Graceful interactive SVG fallback for devices without WebGL */
function Hero3DFallback({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6 select-none">
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl">
        {/* Stylized Tricolour India Badge */}
        <div className="w-36 h-44 rounded-3xl bg-gradient-to-b from-[#FF8A18]/25 via-white/80 to-[#138A45]/25 dark:from-[#FF8A18]/30 dark:via-[#0D2B54]/80 dark:to-[#138A45]/30 border border-[#36E7F2]/60 shadow-xl flex flex-col items-center justify-center p-4 animate-jenova-float">
          <div className="w-14 h-14 rounded-full border-4 border-[#092B55] dark:border-[#70B8F2] flex items-center justify-center bg-white/90">
            <div className="w-3 h-3 rounded-full bg-[#092B55]" />
          </div>
          <p className="mt-3 text-xs font-bold text-[#092B55] dark:text-white text-center">
            India Community Network
          </p>
        </div>

        {/* Stylized JENOVA Globe */}
        <div
          className={`w-60 h-60 rounded-full border-2 border-[#36E7F2]/70 flex flex-col items-center justify-center p-6 text-center shadow-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#0F4C8A] via-[#092B55] to-[#083B35]'
              : 'bg-gradient-to-br from-[#70B8F2]/80 via-[#1B7FD4]/70 to-[#0E5E47]/80'
          }`}
        >
          <span className="text-3xl font-black tracking-wider text-white drop-shadow">JENOVA</span>
          <span className="mt-2 px-3 py-1 rounded-full bg-[#092B55]/85 border border-[#36E7F2]/70 text-[11px] font-semibold text-white">
            A New Way to Grow Together.
          </span>
        </div>
      </div>
    </div>
  );
}

export function JenovaHero3D({ theme, compact = false }: JenovaHero3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [dragHint, setDragHint] = useState<'idle' | 'dragging'>('idle');
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL2 availability and software WebGL renderer (per Three.js skill directives)
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!probeGl) {
        setWebglFailed(true);
        return;
      }
      const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
      const gpu = String(probeGl.getParameter(param) || '');
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setWebglFailed(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)
    );
    renderer.setClearColor(0x000000, 0);

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 360);
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Procedural Studio Environment Map for metallic rings & crystal glass
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const baseCamZ = compact || isMobile ? 9.6 : 7.8;
    const baseCamY = 0.28;
    camera.position.set(0, baseCamY, baseCamZ);
    camera.lookAt(0, -0.1, 0);

    // 3-Point Warm/Cool Cinematic Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xcbe8ff, 0x103c66, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 2.1);
    keyLight.position.set(5, 6.5, 6.5);
    scene.add(keyLight);

    const rimCyan = new THREE.DirectionalLight(0x36e7f2, 1.55);
    rimCyan.position.set(-6, 3, -4);
    scene.add(rimCyan);

    const goldAccentLight = new THREE.PointLight(0xffc45c, 2.2, 14);
    goldAccentLight.position.set(1.4, -0.4, 3.6);
    scene.add(goldAccentLight);

    const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    // Master stage group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // ── OBJECT 1: FLOATING 3D INDIA TRICOLOUR MODEL + HOLOGRAPHIC PEDESTAL ──
    const indiaContainer = new THREE.Group();
    indiaContainer.position.set(isMobile ? -1.1 : -1.78, 0.05, 0.35);
    stageGroup.add(indiaContainer);

    const indiaModel = buildIndia3DModel(maxAniso, isSoftwareGl);
    indiaModel.position.y = 0.25;
    indiaContainer.add(indiaModel);

    const indiaPlatform = buildHolographicPlatform(0.88, isSoftwareGl);
    indiaPlatform.position.y = -1.24;
    indiaContainer.add(indiaPlatform);

    // ── OBJECT 2: LARGE TRANSPARENT GLOWING 3D JENOVA GLOBE + PEDESTAL ──
    const globeContainer = new THREE.Group();
    globeContainer.position.set(isMobile ? 0.95 : 1.18, 0.18, -0.15);
    stageGroup.add(globeContainer);

    const globeAssembly = buildGlobeAssembly(maxAniso, theme === 'dark', isSoftwareGl);
    globeAssembly.root.position.y = 0.14;
    globeContainer.add(globeAssembly.root);

    const globePlatform = buildHolographicPlatform(1.52, isSoftwareGl);
    globePlatform.position.y = -1.52;
    globeContainer.add(globePlatform);

    // ── OBJECT 3: LUMINOUS FLOATING PARTICLE SYSTEM ──
    const particleCount = isMobile ? 55 : isSoftwareGl ? 65 : 135;
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 8.4;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 4.8;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.2;
      pSpeeds[i] = 0.14 + Math.random() * 0.26;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pTex = createSoftParticleTexture();
    const pMat = new THREE.PointsMaterial({
      size: isMobile ? 0.16 : 0.14,
      map: pTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    stageGroup.add(particles);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ── INTERACTIVE MOUSE PARALLAX & DRAG ROTATION ──
    let targetCamX = 0;
    let targetCamY = baseCamY;
    let isDragging = false;
    let activeDragTarget: 'globe' | 'india' = 'globe';
    let lastPointerX = 0;
    let lastPointerY = 0;
    let globeDragVelY = 0;
    let indiaDragVelY = 0;
    let indiaExtraYaw = 0;

    const updatePointerNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _vec2.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _vec2.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      setDragHint('dragging');

      // Raycast to check whether user grabbed India model or Globe
      updatePointerNdc(e.clientX, e.clientY);
      _raycaster.setFromCamera(_vec2, camera);
      const indiaHits = _raycaster.intersectObject(indiaModel, true);
      activeDragTarget = indiaHits.length > 0 ? 'india' : 'globe';
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = -((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
      targetCamX = nx * 0.42;
      targetCamY = baseCamY + ny * 0.22;

      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        if (activeDragTarget === 'india') {
          indiaDragVelY = dx * 0.011;
          indiaModel.rotation.x = THREE.MathUtils.clamp(indiaModel.rotation.x + dy * 0.004, -0.32, 0.32);
        } else {
          globeDragVelY = dx * 0.01;
          globeAssembly.spinGroup.rotation.x = THREE.MathUtils.clamp(
            globeAssembly.spinGroup.rotation.x + dy * 0.004,
            -0.38,
            0.38
          );
        }
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        setDragHint('idle');
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    // Context lost/restored guard
    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      setWebglFailed(true);
    };
    domEl.addEventListener('webglcontextlost', onContextLost);

    // ResizeObserver for crisp responsive framing
    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 300);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      const narrow = w < 640;
      indiaContainer.position.x = narrow ? -1.08 : -1.78;
      globeContainer.position.x = narrow ? 0.96 : 1.18;
      camera.position.z = narrow ? 9.6 : compact ? 8.6 : 7.8;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // ── ANIMATION LOOP (software-WebGL safe pacing via afterDraw) ──
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 90);
      }
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (!prefersReducedMotion) {
        // Continuous smooth globe rotation + drag momentum
        globeAssembly.spinGroup.rotation.y += dt * 0.22 + globeDragVelY;
        globeDragVelY *= Math.exp(-5 * dt);

        // Animated golden & cyan orbital rings
        globeAssembly.ringGroup.children.forEach((ring, i) => {
          ring.rotation.z += dt * (i === 0 ? 0.42 : i === 1 ? -0.32 : 0.24);
        });

        // Floating India 3D model independent motion + drag yaw
        indiaExtraYaw += indiaDragVelY;
        indiaDragVelY *= Math.exp(-5 * dt);
        indiaModel.position.y = 0.25 + Math.sin(elapsed * 1.45) * 0.1;
        indiaModel.rotation.y = Math.sin(elapsed * 0.6) * 0.28 + indiaExtraYaw;

        const indOrbit1 = indiaModel.getObjectByName('india-orbit-1');
        const indOrbit2 = indiaModel.getObjectByName('india-orbit-2');
        if (indOrbit1) indOrbit1.rotation.z += dt * 0.55;
        if (indOrbit2) indOrbit2.rotation.z -= dt * 0.42;

        // Subtle platform shimmer
        indiaPlatform.rotation.y += dt * 0.14;
        globePlatform.rotation.y -= dt * 0.1;

        // Rising glowing particle drift
        const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          let py = posAttr.getY(i) + pSpeeds[i] * dt;
          if (py > 2.4) py = -2.2;
          posAttr.setY(i, py);
        }
        posAttr.needsUpdate = true;
      }

      // Smooth damped camera mouse-parallax
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3.8, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3.8, dt);
      camera.lookAt(0, -0.08, 0);

      renderer.render(scene, camera);

      if (prefersReducedMotion) {
        // Render one static crisp frame on reduced motion unless user drags
        return;
      }
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('webglcontextlost', onContextLost);

      // Thorough GPU resource disposal
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh || (obj as THREE.Points).isPoints) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => {
            if (!mat) return;
            const std = mat as THREE.MeshStandardMaterial;
            std.map?.dispose();
            mat.dispose();
          });
        }
      });
      envTex.dispose();
      pTex.dispose();
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, [theme, compact]);

  if (webglFailed) {
    return <Hero3DFallback theme={theme} />;
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={`w-full h-full ${dragHint === 'dragging' ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label="Interactive 3D JENOVA Globe and Tricolour India Model. Drag to rotate."
      />
      <p className="pointer-events-none absolute bottom-2 right-3 text-[11px] font-medium text-[#092B55]/75 dark:text-[#BFE8FF]/80 bg-white/75 dark:bg-[#092B55]/75 px-2.5 py-1 rounded-full border border-[#70B8F2]/40">
        Drag to spin 3D Globe &amp; India Map
      </p>
    </div>
  );
}
