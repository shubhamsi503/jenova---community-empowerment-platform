import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface JenovaHeroScene3DProps {
  theme: 'light' | 'dark';
}

/**
 * Authentic Survey of India geographic boundary coordinates [longitude°E, latitude°N]
 * Clockwise from Northern Jammu & Kashmir / Ladakh crown around the full subcontinent.
 * Projected with cos(22.5°) longitude correction for exact natural proportions.
 */
const INDIA_LON_LAT: [number, number][] = [
  // Jammu & Kashmir + Ladakh Crown (North)
  [73.75, 34.45],
  [73.95, 35.25],
  [74.55, 36.15],
  [75.15, 36.95],
  [76.10, 36.85],
  [77.20, 36.25],
  [78.05, 35.65],
  [79.10, 35.55],
  [79.95, 34.80],
  [79.65, 33.85],
  [78.95, 33.25],
  [79.15, 32.55],
  // Himachal Pradesh & Uttarakhand
  [78.60, 31.85],
  [79.10, 31.20],
  [80.25, 30.45],
  [80.95, 29.85],
  [80.25, 29.10],
  // Uttar Pradesh & Bihar border along Nepal
  [81.15, 28.45],
  [82.40, 27.75],
  [83.85, 27.45],
  [85.20, 26.85],
  [86.75, 26.55],
  [88.05, 26.65],
  // Sikkim Crown
  [88.12, 27.35],
  [88.25, 27.95],
  [88.85, 28.00],
  [88.95, 27.35],
  // Siliguri Corridor & Bhutan South Border
  [89.05, 26.75],
  [90.25, 26.80],
  [91.55, 26.85],
  // Arunachal Pradesh (Northeast Arch)
  [91.75, 27.65],
  [92.85, 27.95],
  [94.15, 28.65],
  [95.40, 29.30],
  [96.55, 29.10],
  [97.35, 28.25],
  [96.95, 27.40],
  [96.10, 27.05],
  // Nagaland, Manipur & Mizoram
  [95.30, 26.40],
  [94.95, 25.60],
  [94.60, 24.75],
  [94.25, 23.85],
  [93.35, 23.25],
  [93.15, 22.15],
  [92.65, 21.95],
  [92.35, 22.85],
  [92.25, 23.85],
  // Tripura Tongue
  [91.85, 23.80],
  [91.45, 22.95],
  [91.15, 23.45],
  [91.35, 24.25],
  [92.20, 24.85],
  // Meghalaya Plateau & Assam-Bangladesh Border
  [91.65, 25.15],
  [90.20, 25.25],
  [89.85, 25.75],
  [89.10, 26.35],
  [88.35, 26.25],
  // West Bengal Eastern Border down to Sundarbans
  [88.85, 25.35],
  [88.55, 24.65],
  [88.95, 23.85],
  [88.90, 22.85],
  [89.05, 21.85],
  [88.15, 21.60],
  // Odisha Coast (Balasore, Paradip, Chilika)
  [87.10, 21.55],
  [86.95, 20.65],
  [86.10, 19.90],
  [85.20, 19.35],
  [84.45, 18.75],
  // Andhra Pradesh Coast (Visakhapatnam, Kakinada, Nellore)
  [83.35, 17.70],
  [82.30, 16.95],
  [81.15, 15.95],
  [80.25, 15.10],
  [80.15, 14.00],
  // Tamil Nadu Coast (Chennai, Pondicherry, Rameswaram, Kanyakumari)
  [80.30, 13.05],
  [79.85, 11.75],
  [79.85, 10.35],
  [79.35, 9.25],
  [78.25, 8.75],
  [77.55, 8.08], // Kanyakumari Southern Tip
  // Kerala Malabar Coast (West)
  [76.85, 8.55],
  [76.25, 9.85],
  [75.75, 11.25],
  [74.95, 12.65],
  // Karnataka & Goa Coast
  [74.45, 14.15],
  [73.85, 15.45],
  // Maharashtra Konkan Coast & Mumbai
  [73.35, 16.95],
  [72.90, 18.65],
  [72.80, 19.85],
  // Gulf of Khambhat
  [72.65, 21.15],
  [72.45, 22.15],
  [72.10, 21.70],
  // Gujarat Saurashtra / Kathiawar Peninsula
  [71.65, 21.00],
  [70.80, 20.72],
  [69.65, 21.60],
  [68.98, 22.28],
  [69.65, 22.50],
  [70.35, 22.90],
  // Gulf of Kutch & Rann of Kutch
  [69.55, 22.95],
  [68.45, 23.45],
  [68.85, 24.05],
  [70.35, 24.25],
  [71.15, 24.65],
  // Rajasthan Western Bulge (Thar Desert)
  [70.65, 25.75],
  [69.65, 26.85],
  [70.15, 27.65],
  [71.25, 28.05],
  [72.45, 28.85],
  [73.35, 29.75],
  // Punjab & Jammu Western Border
  [74.05, 30.45],
  [74.65, 31.45],
  [75.15, 32.35],
  [74.35, 32.95],
  [73.95, 33.75],
];

const LON_CENTER = 82.6;
const LAT_CENTER = 22.2;
const COS_LAT = Math.cos((22.5 * Math.PI) / 180);
const MAP_SCALE = 0.112;

function projectLonLat(lon: number, lat: number): [number, number] {
  return [(lon - LON_CENTER) * COS_LAT * MAP_SCALE, (lat - LAT_CENTER) * MAP_SCALE];
}

const INDIA_PROJECTED: [number, number][] = INDIA_LON_LAT.map(([lon, lat]) =>
  projectLonLat(lon, lat)
);

/**
 * High-resolution luminous Indian Tricolour texture + subtle topographic shading.
 * Ashoka Chakra is also rendered as a true raised 3D medallion on the front face
 * AND painted cleanly on the texture so the back face looks sharp when rotated 180°.
 */
function createIndiaTricolourTextures(
  maxAnisotropy: number,
  chakraUV: { u: number; v: number }
): { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Calibrated Tricolour bands aligned to India's visual center of mass
  // Note: Canvas Y=0 is top (UV v=1, North); Y=size is bottom (UV v=0, South)
  const chakraY = (1 - chakraUV.v) * size;
  const chakraX = chakraUV.u * size;
  const bandHalfWhite = size * 0.145;
  const saffronEnd = Math.round(chakraY - bandHalfWhite);
  const whiteEnd = Math.round(chakraY + bandHalfWhite);

  // 1. Rich Luminous Saffron Band (North India / Himalayas)
  const safGrad = ctx.createLinearGradient(0, 0, size, saffronEnd);
  safGrad.addColorStop(0, '#FFB545');
  safGrad.addColorStop(0.45, '#FF8A18');
  safGrad.addColorStop(1, '#E65C00');
  ctx.fillStyle = safGrad;
  ctx.fillRect(0, 0, size, saffronEnd + 10);

  // 2. Pure Silk-Pearl White Band (Central Heartland)
  const whiteGrad = ctx.createLinearGradient(0, saffronEnd, size, whiteEnd);
  whiteGrad.addColorStop(0, '#F7FBFF');
  whiteGrad.addColorStop(0.5, '#FFFFFF');
  whiteGrad.addColorStop(1, '#EEF6FD');
  ctx.fillStyle = whiteGrad;
  ctx.fillRect(0, saffronEnd, size, whiteEnd - saffronEnd);

  // 3. Vibrant India Green Band (Deccan & Peninsula)
  const greenGrad = ctx.createLinearGradient(0, whiteEnd, size, size);
  greenGrad.addColorStop(0, '#22B85E');
  greenGrad.addColorStop(0.5, '#138A45');
  greenGrad.addColorStop(1, '#095D2B');
  ctx.fillStyle = greenGrad;
  ctx.fillRect(0, whiteEnd - 8, size, size - whiteEnd + 8);

  // Soft silk-feathered transitions between tricolour bands
  const blendTop = ctx.createLinearGradient(0, saffronEnd - 14, 0, saffronEnd + 14);
  blendTop.addColorStop(0, 'rgba(255, 138, 24, 0.92)');
  blendTop.addColorStop(0.5, 'rgba(255, 224, 185, 0.55)');
  blendTop.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
  ctx.fillStyle = blendTop;
  ctx.fillRect(0, saffronEnd - 14, size, 28);

  const blendBot = ctx.createLinearGradient(0, whiteEnd - 14, 0, whiteEnd + 14);
  blendBot.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
  blendBot.addColorStop(0.5, 'rgba(182, 238, 205, 0.55)');
  blendBot.addColorStop(1, 'rgba(19, 138, 69, 0.92)');
  ctx.fillStyle = blendBot;
  ctx.fillRect(0, whiteEnd - 14, size, 28);

  // Subtle ambient sunlit depth vignette (gives natural sculptural sheen without harsh grid lines)
  const gloss = ctx.createRadialGradient(
    size * 0.36,
    size * 0.28,
    size * 0.05,
    size * 0.48,
    size * 0.5,
    size * 0.65
  );
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  gloss.addColorStop(0.6, 'rgba(255, 255, 255, 0.02)');
  gloss.addColorStop(1, 'rgba(5, 25, 55, 0.14)');
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, size, size);

  // 4. Precision 24-Spoke Navy Blue Ashoka Chakra centered on Central India
  const outerR = size * 0.095;
  const innerR = outerR * 0.84;
  const hubR = outerR * 0.19;

  ctx.save();
  ctx.translate(chakraX, chakraY);

  // Soft navy halo for depth
  const chakraGlow = ctx.createRadialGradient(0, 0, hubR, 0, 0, outerR * 1.3);
  chakraGlow.addColorStop(0, 'rgba(6, 33, 94, 0.10)');
  chakraGlow.addColorStop(1, 'rgba(6, 33, 94, 0)');
  ctx.fillStyle = chakraGlow;
  ctx.beginPath();
  ctx.arc(0, 0, outerR * 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#06215E';
  ctx.lineWidth = outerR * 0.135;
  ctx.beginPath();
  ctx.arc(0, 0, outerR * 0.93, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#06215E';
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -hubR * 0.9);
    ctx.lineTo(outerR * 0.035, -innerR * 0.54);
    ctx.lineTo(0, -innerR * 0.98);
    ctx.lineTo(-outerR * 0.035, -innerR * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const midAngle = angle + Math.PI / 24;
    ctx.beginPath();
    ctx.arc(
      Math.cos(midAngle) * innerR,
      Math.sin(midAngle) * innerR,
      outerR * 0.032,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, hubR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = maxAnisotropy;
  colorMap.needsUpdate = true;

  // Procedural subtle topographic relief bump map (Himalayan north + Western Ghats + Deccan contour)
  const bCanvas = document.createElement('canvas');
  bCanvas.width = 512;
  bCanvas.height = 512;
  const bCtx = bCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  // Soft Himalayan ridge elevation in North
  const himalaya = bCtx.createRadialGradient(220, 75, 10, 230, 95, 130);
  himalaya.addColorStop(0, '#DCDCDC');
  himalaya.addColorStop(0.55, '#A8A8A8');
  himalaya.addColorStop(1, '#808080');
  bCtx.fillStyle = himalaya;
  bCtx.fillRect(0, 0, 512, 230);

  // Subtle Deccan Plateau & Western Ghats elevation in South-West
  const deccan = bCtx.createRadialGradient(210, 345, 15, 225, 345, 115);
  deccan.addColorStop(0, '#B8B8B8');
  deccan.addColorStop(0.65, '#969696');
  deccan.addColorStop(1, '#808080');
  bCtx.fillStyle = deccan;
  bCtx.fillRect(80, 220, 320, 260);

  // Subtle concentric contour rings around Central India
  bCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  bCtx.lineWidth = 2;
  for (let r = 65; r <= 230; r += 34) {
    bCtx.beginPath();
    bCtx.arc(chakraX * 0.5, chakraY * 0.5, r, 0, Math.PI * 2);
    bCtx.stroke();
  }

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.anisotropy = maxAnisotropy;
  bumpMap.needsUpdate = true;

  return { colorMap, bumpMap };
}

/**
 * True sculpted 3D Navy-Blue Ashoka Chakra medallion sitting proudly on India's heartland.
 */
function build3DAshokaChakra(radius: number): THREE.Group {
  const group = new THREE.Group();

  const navyMat = new THREE.MeshPhysicalMaterial({
    color: 0x062364,
    emissive: 0x041338,
    emissiveIntensity: 0.35,
    metalness: 0.65,
    roughness: 0.22,
    clearcoat: 1.0,
  });

  // Outer precision rim
  const outerRim = new THREE.Mesh(
    new THREE.TorusGeometry(radius, radius * 0.088, 14, 64),
    navyMat
  );
  group.add(outerRim);

  // Center raised hub
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.17, radius * 0.19, radius * 0.14, 24),
    navyMat
  );
  hub.rotation.x = Math.PI / 2;
  group.add(hub);

  // 24 radial 3D spokes + inner beads
  const spokeGeo = new THREE.BoxGeometry(radius * 0.042, radius * 0.78, radius * 0.055);
  const beadGeo = new THREE.SphereGeometry(radius * 0.036, 10, 10);

  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    const spoke = new THREE.Mesh(spokeGeo, navyMat);
    spoke.rotation.z = angle;
    spoke.position.set(
      Math.cos(angle + Math.PI / 2) * (radius * 0.51),
      Math.sin(angle + Math.PI / 2) * (radius * 0.51),
      0
    );
    group.add(spoke);

    const mid = angle + Math.PI / 24;
    const bead = new THREE.Mesh(beadGeo, navyMat);
    bead.position.set(Math.cos(mid) * (radius * 0.88), Math.sin(mid) * (radius * 0.88), 0);
    group.add(bead);
  }

  return group;
}

function createGlobeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0C4A85');
  bg.addColorStop(0.5, '#1976C5');
  bg.addColorStop(1, '#083261');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle glowing latitude & longitude grid
  ctx.strokeStyle = 'rgba(54, 231, 242, 0.25)';
  ctx.lineWidth = 1.2;
  for (let lon = 0; lon <= 18; lon++) {
    const x = (lon / 18) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let lat = 1; lat < 9; lat++) {
    const y = (lat / 9) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const drawContinent = (pts: [number, number][], fill: string, stroke: string) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px * w, py * h);
      else ctx.lineTo(px * w, py * h);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  };

  const landFill = 'rgba(195, 244, 255, 0.70)';
  const landStroke = 'rgba(255, 255, 255, 0.82)';

  drawContinent(
    [
      [0.48, 0.22], [0.58, 0.16], [0.74, 0.18], [0.88, 0.22],
      [0.91, 0.34], [0.82, 0.44], [0.76, 0.48], [0.71, 0.56],
      [0.66, 0.48], [0.58, 0.42], [0.50, 0.36],
    ],
    landFill,
    landStroke
  );
  // Highlight India / South Asia golden beacon
  drawContinent(
    [
      [0.68, 0.36], [0.74, 0.38], [0.73, 0.48], [0.70, 0.55], [0.67, 0.45],
    ],
    'rgba(255, 196, 92, 0.92)',
    '#FFFFFF'
  );
  drawContinent(
    [
      [0.47, 0.40], [0.57, 0.41], [0.62, 0.52], [0.57, 0.72],
      [0.51, 0.76], [0.46, 0.58],
    ],
    landFill,
    landStroke
  );
  drawContinent(
    [
      [0.10, 0.18], [0.28, 0.17], [0.32, 0.32], [0.24, 0.46],
      [0.17, 0.42], [0.12, 0.30],
    ],
    landFill,
    landStroke
  );
  drawContinent(
    [
      [0.24, 0.50], [0.33, 0.55], [0.31, 0.74], [0.25, 0.84], [0.22, 0.64],
    ],
    landFill,
    landStroke
  );
  drawContinent(
    [
      [0.78, 0.64], [0.89, 0.64], [0.90, 0.76], [0.81, 0.78],
    ],
    landFill,
    landStroke
  );

  const hubs: [number, number][] = [
    [0.70, 0.44], [0.72, 0.46], [0.68, 0.40], [0.54, 0.30],
    [0.82, 0.35], [0.22, 0.32], [0.28, 0.62], [0.84, 0.70],
    [0.54, 0.56], [0.62, 0.38],
  ];
  hubs.forEach(([hx, hy]) => {
    const grad = ctx.createRadialGradient(hx * w, hy * h, 1, hx * w, hy * h, 14);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, '#FFC45C');
    grad.addColorStop(1, 'rgba(255, 196, 92, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hx * w, hy * h, 14, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createJenovaPlaqueTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const w = 1024;
  const h = 340;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, w, h);

  const halo = ctx.createRadialGradient(w / 2, h * 0.44, 30, w / 2, h * 0.44, w * 0.45);
  halo.addColorStop(0, 'rgba(5, 24, 52, 0.58)');
  halo.addColorStop(0.7, 'rgba(5, 24, 52, 0.22)');
  halo.addColorStop(1, 'rgba(5, 24, 52, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 138px "Plus Jakarta Sans", system-ui, sans-serif';

  // Crisp gold-white outer bevel
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(255, 232, 168, 0.96)';
  ctx.lineJoin = 'round';
  ctx.strokeText('JENOVA', w / 2, 124);

  const txtGrad = ctx.createLinearGradient(0, 52, 0, 194);
  txtGrad.addColorStop(0, '#134A7A');
  txtGrad.addColorStop(0.5, '#092B55');
  txtGrad.addColorStop(1, '#0A4F38');
  ctx.fillStyle = txtGrad;
  ctx.fillText('JENOVA', w / 2, 124);

  // Subtle Saffron highlight on the initial 'J'
  const fullW = ctx.measureText('JENOVA').width;
  const jW = ctx.measureText('J').width;
  ctx.save();
  ctx.beginPath();
  ctx.rect(w / 2 - fullW / 2 - 12, 30, jW + 8, 190);
  ctx.clip();
  const jGrad = ctx.createLinearGradient(0, 52, 0, 194);
  jGrad.addColorStop(0, '#FFD166');
  jGrad.addColorStop(0.55, '#FF8A18');
  jGrad.addColorStop(1, '#D95400');
  ctx.fillStyle = jGrad;
  ctx.fillText('JENOVA', w / 2, 124);
  ctx.restore();

  // Tagline pill beneath JENOVA
  const pillW = 680;
  const pillH = 74;
  const px = (w - pillW) / 2;
  const py = 222;
  const r = 37;

  ctx.beginPath();
  ctx.moveTo(px + r, py);
  ctx.lineTo(px + pillW - r, py);
  ctx.quadraticCurveTo(px + pillW, py, px + pillW, py + r);
  ctx.quadraticCurveTo(px + pillW, py + pillH, px + pillW - r, py + pillH);
  ctx.lineTo(px + r, py + pillH);
  ctx.quadraticCurveTo(px, py + pillH, px, py + r);
  ctx.quadraticCurveTo(px, py, px + r, py);
  ctx.closePath();

  const pillGrad = ctx.createLinearGradient(px, py, px + pillW, py + pillH);
  pillGrad.addColorStop(0, 'rgba(7, 34, 72, 0.94)');
  pillGrad.addColorStop(0.5, 'rgba(11, 82, 68, 0.95)');
  pillGrad.addColorStop(1, 'rgba(7, 34, 72, 0.94)');
  ctx.fillStyle = pillGrad;
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#36E7F2';
  ctx.stroke();

  ctx.font = '700 34px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('A New Way to Grow Together.', w / 2, py + pillH / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createGlowParticleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(255, 230, 160, 0.85)');
  grad.addColorStop(0.7, 'rgba(54, 231, 242, 0.3)');
  grad.addColorStop(1, 'rgba(54, 231, 242, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildSteppedPlatform(radius: number, heightScale = 1): THREE.Group {
  const group = new THREE.Group();

  const metallicMat = new THREE.MeshStandardMaterial({
    color: 0xdcebf7,
    metalness: 0.78,
    roughness: 0.22,
  });
  const navyMetalMat = new THREE.MeshStandardMaterial({
    color: 0x0b305e,
    metalness: 0.65,
    roughness: 0.32,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x36e7f2,
    emissive: 0x36e7f2,
    emissiveIntensity: 1.45,
    roughness: 0.15,
    metalness: 0.2,
  });
  const goldGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffc45c,
    emissive: 0xffb338,
    emissiveIntensity: 0.72,
    roughness: 0.2,
    metalness: 0.85,
  });

  const baseTier = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.06, radius * 1.15, 0.22 * heightScale, 48),
    navyMetalMat
  );
  baseTier.position.y = -0.26 * heightScale;
  group.add(baseTier);

  const midTier = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.92, radius * 1.0, 0.18 * heightScale, 48),
    metallicMat
  );
  midTier.position.y = -0.08 * heightScale;
  group.add(midTier);

  const topDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.78, radius * 0.84, 0.1 * heightScale, 48),
    navyMetalMat
  );
  topDisc.position.y = 0.05 * heightScale;
  group.add(topDisc);

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.07, 0.026, 12, 64),
    cyanGlowMat
  );
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = -0.16 * heightScale;
  group.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.82, 0.024, 12, 64),
    cyanGlowMat
  );
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = 0.11 * heightScale;
  group.add(ring2);

  const goldRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.94, 0.02, 12, 64),
    goldGlowMat
  );
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 0.01 * heightScale;
  group.add(goldRing);

  return group;
}

/**
 * Redesigned 3D Sculpted JENOVA Brand Emblem matching the new sleek squircle + kinetic "J"
 * + Saffron/White/India Green ribbons + 4-point guiding star.
 */
function build3DJenovaEmblem(): THREE.Group {
  const group = new THREE.Group();

  const navyCrestMat = new THREE.MeshPhysicalMaterial({
    color: 0x07234a,
    emissive: 0x04142b,
    emissiveIntensity: 0.35,
    metalness: 0.72,
    roughness: 0.22,
    clearcoat: 1.0,
  });
  const saffronMat = new THREE.MeshPhysicalMaterial({
    color: 0xff8a18,
    emissive: 0x6b2c00,
    emissiveIntensity: 0.38,
    metalness: 0.42,
    roughness: 0.18,
    clearcoat: 1.0,
  });
  const pearlCyanMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6fbff,
    emissive: 0x22c8e0,
    emissiveIntensity: 0.45,
    metalness: 0.35,
    roughness: 0.14,
    clearcoat: 1.0,
  });
  const greenMat = new THREE.MeshPhysicalMaterial({
    color: 0x169c4f,
    emissive: 0x063d1e,
    emissiveIntensity: 0.38,
    metalness: 0.42,
    roughness: 0.18,
    clearcoat: 1.0,
  });
  const goldStarMat = new THREE.MeshPhysicalMaterial({
    color: 0xffe082,
    emissive: 0xffb32c,
    emissiveIntensity: 0.95,
    metalness: 0.85,
    roughness: 0.14,
    clearcoat: 1.0,
  });
  const cyanRimMat = new THREE.MeshStandardMaterial({
    color: 0x36e7f2,
    emissive: 0x36e7f2,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.4,
  });

  // 1. Sleek Rounded-Square (Squircle) Deep-Navy Crest Medallion
  const sq = new THREE.Shape();
  const s = 0.68;
  const r = 0.2;
  sq.moveTo(-s + r, -s);
  sq.lineTo(s - r, -s);
  sq.quadraticCurveTo(s, -s, s, -s + r);
  sq.lineTo(s, s - r);
  sq.quadraticCurveTo(s, s, s - r, s);
  sq.lineTo(-s + r, s);
  sq.quadraticCurveTo(-s, s, -s, s - r);
  sq.lineTo(-s, -s + r);
  sq.quadraticCurveTo(-s, -s, -s + r, -s);

  const crestMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(sq, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.03,
      bevelSegments: 4,
    }),
    navyCrestMat
  );
  crestMesh.position.z = -0.08;
  group.add(crestMesh);

  // Glowing perimeter frame ring around squircle
  const rimPts = sq.getSpacedPoints(72).map((p) => new THREE.Vector3(p.x * 1.03, p.y * 1.03, 0.04));
  const rimCurve = new THREE.CatmullRomCurve3(rimPts, true);
  const rimMesh = new THREE.Mesh(new THREE.TubeGeometry(rimCurve, 80, 0.018, 8, true), cyanRimMat);
  group.add(rimMesh);

  const ribbonExtrude: THREE.ExtrudeGeometryOptions = {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.018,
    bevelSegments: 3,
  };

  // 2. Upper Ascending Saffron Ribbon
  const safShape = new THREE.Shape();
  safShape.moveTo(-0.44, 0.16);
  safShape.quadraticCurveTo(-0.18, 0.50, 0.36, 0.45);
  safShape.quadraticCurveTo(0.18, 0.28, -0.02, 0.18);
  safShape.quadraticCurveTo(-0.24, 0.08, -0.44, 0.16);
  const safMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(safShape, ribbonExtrude), saffronMat);
  safMesh.position.z = 0.05;
  group.add(safMesh);

  // 3. Center Luminous Pearl-Cyan Kinetic "J" Spine
  const jShape = new THREE.Shape();
  jShape.moveTo(0.24, 0.32);
  jShape.lineTo(0.24, -0.14);
  jShape.quadraticCurveTo(0.24, -0.46, -0.14, -0.46);
  jShape.quadraticCurveTo(-0.34, -0.46, -0.44, -0.26);
  jShape.quadraticCurveTo(-0.22, -0.32, -0.06, -0.26);
  jShape.quadraticCurveTo(0.08, -0.20, 0.08, -0.04);
  jShape.lineTo(0.08, 0.22);
  jShape.closePath();
  const jMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(jShape, ribbonExtrude), pearlCyanMat);
  jMesh.position.z = 0.09;
  group.add(jMesh);

  // 4. Lower Grounding India Green Uplift Curve
  const greenShape = new THREE.Shape();
  greenShape.moveTo(-0.45, -0.26);
  greenShape.quadraticCurveTo(-0.18, -0.58, 0.18, -0.52);
  greenShape.quadraticCurveTo(0.46, -0.46, 0.48, -0.06);
  greenShape.quadraticCurveTo(0.32, -0.30, 0.04, -0.36);
  greenShape.quadraticCurveTo(-0.22, -0.40, -0.45, -0.26);
  const greenMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(greenShape, ribbonExtrude), greenMat);
  greenMesh.position.z = 0.06;
  group.add(greenMesh);

  // 5. Sleek 4-Point Guiding North Star Beacon (top-right apex)
  const starShape = new THREE.Shape();
  const spikes = 4;
  const outerR = 0.24;
  const innerR = 0.065;
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes + Math.PI / 2;
    const sx = Math.cos(angle) * rad;
    const sy = Math.sin(angle) * rad;
    if (i === 0) starShape.moveTo(sx, sy);
    else starShape.lineTo(sx, sy);
  }
  starShape.closePath();
  const starMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(starShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 2,
    }),
    goldStarMat
  );
  starMesh.position.set(0.42, 0.42, 0.14);
  starMesh.name = 'emblemStar';
  group.add(starMesh);

  return group;
}

export function JenovaHeroScene3D({ theme }: JenovaHeroScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL2/WebGL availability & Software GL
    let isSoftwareGl = false;
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!gl) {
        setWebglFailed(true);
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) || '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      setWebglFailed(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const initNarrow = window.innerWidth < 768;

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
    renderer.toneMappingExposure = 1.14;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, initNarrow ? 1.5 : 2)
    );
    renderer.setClearColor(0x000000, 0);

    const initW = Math.max(container.clientWidth, 300);
    const initH = Math.max(container.clientHeight, 320);
    renderer.setSize(initW, initH);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio Reflection Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, initW / initH, 0.1, 100);
    let baseCamZ = 9.5;
    let baseCamY = 0.42;

    // 3-Point Warm/Cool Cinematic Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xd6efff, 0x092b55, 1.42);
    scene.add(hemiLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff4df, 2.35);
    sunKeyLight.position.set(-5.5, 6.5, 8.5);
    scene.add(sunKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x36e7f2, 1.55);
    cyanRimLight.position.set(7.5, 3.5, -5.0);
    scene.add(cyanRimLight);

    const goldenFillLight = new THREE.PointLight(0xffc45c, 2.0, 20);
    goldenFillLight.position.set(0.8, -1.0, 5.2);
    scene.add(goldenFillLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // =========================================================================
    // 1. LARGE TRANSPARENT GLOWING 3D JENOVA GLOBE + ORBITAL RINGS + PLATFORM
    // =========================================================================
    const globeAssembly = new THREE.Group();
    stageGroup.add(globeAssembly);

    const globeRadius = 1.82;
    const globeSpinGroup = new THREE.Group();
    globeSpinGroup.position.y = 0.52;
    globeAssembly.add(globeSpinGroup);

    const globeTexture = createGlobeTexture(maxAniso);
    const innerGlobeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 0.94, 48, 36),
      new THREE.MeshPhysicalMaterial({
        map: globeTexture,
        transparent: true,
        opacity: 0.82,
        roughness: 0.24,
        metalness: 0.1,
        emissive: 0x1677c5,
        emissiveIntensity: 0.34,
        clearcoat: 0.85,
      })
    );
    globeSpinGroup.add(innerGlobeMesh);

    globeSpinGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(globeRadius * 0.965, 24, 16),
        new THREE.MeshBasicMaterial({
          color: 0x36e7f2,
          wireframe: true,
          transparent: true,
          opacity: 0.15,
        })
      )
    );

    const outerGlassMesh = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 48, 36),
      new THREE.MeshPhysicalMaterial({
        color: 0xbce9ff,
        roughness: 0.06,
        metalness: 0.05,
        transmission: isSoftwareGl ? 0 : 0.55,
        transparent: true,
        opacity: isSoftwareGl ? 0.26 : 0.4,
        ior: 1.45,
        thickness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        depthWrite: false,
      })
    );
    outerGlassMesh.renderOrder = 3;
    globeSpinGroup.add(outerGlassMesh);

    const arcPackets: {
      mesh: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      speed: number;
      offset: number;
    }[] = [];
    const arcPairs: [THREE.Vector3, THREE.Vector3][] = [
      [new THREE.Vector3(-1.4, 0.9, 0.8), new THREE.Vector3(1.2, 0.5, 1.1)],
      [new THREE.Vector3(1.3, -0.5, 1.0), new THREE.Vector3(-0.7, 1.2, 1.1)],
      [new THREE.Vector3(-1.1, -0.8, 1.1), new THREE.Vector3(1.1, 1.0, 0.8)],
      [new THREE.Vector3(0.2, 1.5, 0.9), new THREE.Vector3(-1.2, -0.3, -1.1)],
    ];
    const arcTubeMat = new THREE.MeshBasicMaterial({
      color: 0x7ef5ff,
      transparent: true,
      opacity: 0.52,
    });
    const packetGeo = new THREE.SphereGeometry(0.052, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffd773 });

    arcPairs.forEach(([start, end], idx) => {
      const p0 = start.clone().normalize().multiplyScalar(globeRadius * 0.97);
      const p2 = end.clone().normalize().multiplyScalar(globeRadius * 0.97);
      const mid = p0
        .clone()
        .add(p2)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(globeRadius * 1.24);
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
      globeSpinGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.013, 8, false), arcTubeMat));

      const pkt = new THREE.Mesh(packetGeo, packetMat);
      globeSpinGroup.add(pkt);
      arcPackets.push({ mesh: pkt, curve, speed: 0.28 + idx * 0.07, offset: idx * 0.25 });
    });

    const goldenRingMat = new THREE.MeshPhysicalMaterial({
      color: 0xffc45c,
      emissive: 0xff9f1c,
      emissiveIntensity: 0.55,
      metalness: 0.9,
      roughness: 0.16,
      clearcoat: 1.0,
    });
    const cyanOrbitMat = new THREE.MeshStandardMaterial({
      color: 0x36e7f2,
      emissive: 0x36e7f2,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.4,
    });

    const orbitalRings: THREE.Group[] = [];
    const ringConfigs = [
      { r: globeRadius * 1.22, tube: 0.024, rx: 1.25, ry: 0.22, rz: 0.15, mat: goldenRingMat },
      { r: globeRadius * 1.35, tube: 0.018, rx: 1.48, ry: -0.35, rz: -0.22, mat: goldenRingMat },
      { r: globeRadius * 1.14, tube: 0.015, rx: 1.05, ry: 0.45, rz: 0.35, mat: cyanOrbitMat },
    ];
    const orbBeaconGeo = new THREE.SphereGeometry(0.068, 14, 14);
    ringConfigs.forEach((cfg) => {
      const rGroup = new THREE.Group();
      rGroup.position.y = 0.52;
      rGroup.rotation.set(cfg.rx, cfg.ry, cfg.rz);
      rGroup.add(new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.tube, 14, 96), cfg.mat));
      const beacon = new THREE.Mesh(orbBeaconGeo, packetMat);
      beacon.position.set(cfg.r, 0, 0);
      rGroup.add(beacon);
      globeAssembly.add(rGroup);
      orbitalRings.push(rGroup);
    });

    const globePlatform = buildSteppedPlatform(globeRadius * 1.02, 1.1);
    globePlatform.position.y = -1.62;
    globeAssembly.add(globePlatform);

    // Upgraded 3D JENOVA Emblem + Metallic Nameplate in front of the Globe
    const frontIdentityGroup = new THREE.Group();
    frontIdentityGroup.position.set(0, 0.34, globeRadius + 0.34);
    globeAssembly.add(frontIdentityGroup);

    const emblem3D = build3DJenovaEmblem();
    emblem3D.scale.setScalar(0.95);
    emblem3D.position.y = 0.56;
    frontIdentityGroup.add(emblem3D);

    const plaqueTex = createJenovaPlaqueTexture(maxAniso);
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.96, 0.98),
      new THREE.MeshBasicMaterial({
        map: plaqueTex,
        transparent: true,
        depthWrite: false,
      })
    );
    plaqueMesh.position.set(0, -0.46, 0.16);
    plaqueMesh.renderOrder = 6;
    frontIdentityGroup.add(plaqueMesh);

    // =========================================================================
    // 2. GEOGRAPHICALLY ACCURATE 3D INDIA TRICOLOUR MONUMENT + 3D ASHOKA CHAKRA
    // =========================================================================
    const indiaAssembly = new THREE.Group();
    stageGroup.add(indiaAssembly);

    const indiaShape = new THREE.Shape();
    INDIA_PROJECTED.forEach(([ix, iy], idx) => {
      if (idx === 0) indiaShape.moveTo(ix, iy);
      else indiaShape.lineTo(ix, iy);
    });
    indiaShape.closePath();

    const indiaDepth = 0.22;
    const indiaBevelThickness = 0.052;
    const indiaGeo = new THREE.ExtrudeGeometry(indiaShape, {
      depth: indiaDepth,
      bevelEnabled: true,
      bevelThickness: indiaBevelThickness,
      bevelSize: 0.032,
      bevelSegments: 5,
      curveSegments: 12,
    });

    indiaGeo.computeBoundingBox();
    const bb = indiaGeo.boundingBox!;
    const minX = bb.min.x;
    const maxX = bb.max.x;
    const minY = bb.min.y;
    const maxY = bb.max.y;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const centerX = (minX + maxX) * 0.5;
    const centerY = (minY + maxY) * 0.5;
    const centerZ = (bb.min.z + bb.max.z) * 0.5;

    // Exact geographic center of India (Madhya Pradesh heartland ~78.9°E, 22.7°N)
    const [rawChakraX, rawChakraY] = projectLonLat(78.9, 22.7);
    const chakraUV = {
      u: (rawChakraX - minX) / spanX,
      v: (rawChakraY - minY) / spanY,
    };

    // Normalize UVs [0..1] across India's bounding box for crisp tricolour alignment
    const posAttr = indiaGeo.attributes.position;
    const uvAttr = indiaGeo.attributes.uv;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      uvAttr.setXY(i, (vx - minX) / spanX, (vy - minY) / spanY);
    }
    uvAttr.needsUpdate = true;

    // Translate geometry to centered origin while tracking exact Chakra offset
    indiaGeo.translate(-centerX, -centerY, -centerZ);
    const chakraLocalX = rawChakraX - centerX;
    const chakraLocalY = rawChakraY - centerY;
    const frontFaceZ = bb.max.z - centerZ;

    const { colorMap: indiaTricolourTex, bumpMap: indiaBumpTex } = createIndiaTricolourTextures(
      maxAniso,
      chakraUV
    );

    const indiaFaceMat = new THREE.MeshPhysicalMaterial({
      map: indiaTricolourTex,
      bumpMap: indiaBumpTex,
      bumpScale: 0.03,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
    });
    const indiaSideMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6f9ff,
      emissive: 0x1fb8d6,
      emissiveIntensity: 0.42,
      metalness: 0.82,
      roughness: 0.18,
      clearcoat: 1.0,
    });

    const indiaFloatGroup = new THREE.Group();
    indiaFloatGroup.position.y = 0.36;
    indiaAssembly.add(indiaFloatGroup);

    const indiaScale = 0.94;
    const indiaModelHolder = new THREE.Group();
    indiaModelHolder.scale.setScalar(indiaScale);
    indiaFloatGroup.add(indiaModelHolder);

    const indiaMesh = new THREE.Mesh(indiaGeo, [indiaFaceMat, indiaSideMat]);
    indiaModelHolder.add(indiaMesh);

    // Clean continuous glowing holographic outline ribbon along India's border (zero mesh wireframe artifacts!)
    const borderPts = INDIA_PROJECTED.map(
      ([ix, iy]) => new THREE.Vector3(ix - centerX, iy - centerY, frontFaceZ * 0.72)
    );
    const borderCurve = new THREE.CatmullRomCurve3(borderPts, true, 'centripetal', 0.25);
    const borderGlowMat = new THREE.MeshStandardMaterial({
      color: 0x9cf7ff,
      emissive: 0x36e7f2,
      emissiveIntensity: 1.35,
      roughness: 0.15,
      metalness: 0.3,
    });
    const borderRibbon = new THREE.Mesh(
      new THREE.TubeGeometry(borderCurve, 220, 0.017, 6, true),
      borderGlowMat
    );
    indiaModelHolder.add(borderRibbon);

    // True Raised 3D Metallic Navy-Blue Ashoka Chakra sitting proudly in Central India
    const chakra3D = build3DAshokaChakra(0.285);
    chakra3D.position.set(chakraLocalX, chakraLocalY, frontFaceZ + 0.025);
    indiaModelHolder.add(chakra3D);

    // Authentic Island Chains: Andaman & Nicobar (SE) + Lakshadweep (SW)
    const islandMat = new THREE.MeshPhysicalMaterial({
      color: 0x18a354,
      emissive: 0x0c6b35,
      emissiveIntensity: 0.4,
      metalness: 0.2,
      roughness: 0.25,
      clearcoat: 0.9,
    });
    const islandPoints: [number, number, number][] = [
      // Andaman & Nicobar
      [92.85, 13.0, 0.05],
      [92.75, 11.7, 0.052],
      [92.80, 10.6, 0.036],
      [93.75, 7.2, 0.044],
      // Lakshadweep
      [72.65, 11.1, 0.036],
      [72.85, 10.2, 0.032],
    ];
    islandPoints.forEach(([lon, lat, rad]) => {
      const [px, py] = projectLonLat(lon, lat);
      const isl = new THREE.Mesh(new THREE.SphereGeometry(rad, 12, 12), islandMat);
      isl.scale.set(0.75, 1.35, 0.7);
      isl.position.set(px - centerX, py - centerY, 0.02);
      indiaModelHolder.add(isl);
    });

    // Swirling golden & cyan orbital rings around India
    const indiaRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.52, 0.02, 12, 80),
      goldenRingMat
    );
    indiaRing1.rotation.set(1.22, -0.24, 0.1);
    indiaRing1.position.y = 0.06;
    indiaAssembly.add(indiaRing1);

    const indiaRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.34, 0.015, 12, 80),
      cyanOrbitMat
    );
    indiaRing2.rotation.set(1.38, 0.3, -0.18);
    indiaRing2.position.y = -0.14;
    indiaAssembly.add(indiaRing2);

    // Stepped Holographic Platform beneath India
    const indiaPlatform = buildSteppedPlatform(1.26, 0.95);
    indiaPlatform.position.y = -1.56;
    indiaAssembly.add(indiaPlatform);

    // Subtle rising cyan holographic cone
    const holoBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 1.12, 1.65, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x36e7f2,
        transparent: true,
        opacity: 0.13,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    holoBeam.position.y = -0.74;
    indiaAssembly.add(holoBeam);

    // =========================================================================
    // 3. FLOATING AMBIENT PARTICLES (GOLDEN & CYAN)
    // =========================================================================
    const particleCount = initNarrow ? 60 : 135;
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const cGold = new THREE.Color(0xffc45c);
    const cCyan = new THREE.Color(0x36e7f2);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 11;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 6.4;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 5.8;
      const pick = i % 3 === 0 ? cGold : i % 3 === 1 ? cCyan : cWhite;
      pColors[i * 3] = pick.r;
      pColors[i * 3 + 1] = pick.g;
      pColors[i * 3 + 2] = pick.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const particleTex = createGlowParticleTexture();
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: initNarrow ? 0.17 : 0.21,
        map: particleTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(particles);

    // =========================================================================
    // FLUID CONTAINER-RESPONSIVE CAMERA & STAGE FRAMING (ALL BREAKPOINTS)
    // =========================================================================
    const applyResponsiveFraming = (width: number, height: number) => {
      const aspect = Math.max(width / Math.max(height, 1), 0.55);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      if (aspect < 0.92) {
        // Portrait / narrow mobile: tighter horizontal spread + slightly pulled-back camera so nothing clips
        baseCamZ = 12.2;
        baseCamY = 0.5;
        stageGroup.scale.setScalar(0.82);
        indiaAssembly.position.set(-1.68, -0.05, 0.55);
        globeAssembly.position.set(1.22, 0.12, -0.35);
      } else if (aspect < 1.28) {
        // Tablet / compact laptop
        baseCamZ = 10.6;
        baseCamY = 0.46;
        stageGroup.scale.setScalar(0.92);
        indiaAssembly.position.set(-1.95, -0.04, 0.68);
        globeAssembly.position.set(1.48, 0.14, -0.35);
      } else {
        // Full desktop & wide viewport: spacious showcase framing
        baseCamZ = 9.35;
        baseCamY = 0.42;
        stageGroup.scale.setScalar(1.0);
        indiaAssembly.position.set(-2.12, -0.02, 0.78);
        globeAssembly.position.set(1.62, 0.16, -0.35);
      }
      camera.position.z = baseCamZ;
    };

    applyResponsiveFraming(initW, initH);
    camera.position.set(0, baseCamY, baseCamZ);
    camera.lookAt(0, 0.12, 0);

    // =========================================================================
    // INTERACTIVE MOUSE PARALLAX & DRAG ROTATION (DESKTOP + TOUCH)
    // =========================================================================
    let pointerX = 0;
    let pointerY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let targetDragRotY = 0;
    let targetDragRotX = 0;
    let currentDragRotY = 0;
    let currentDragRotX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointerY = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);

      if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        targetDragRotY = THREE.MathUtils.clamp(targetDragRotY + dx * 0.0085, -1.5, 1.5);
        targetDragRotX = THREE.MathUtils.clamp(targetDragRotX + dy * 0.005, -0.35, 0.35);
      }
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 10 && height > 10) {
          applyResponsiveFraming(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // ZERO-GC ANIMATION LOOP WITH SOFTWARE-WEBGL FENCE PACING
    // =========================================================================
    const clock = new THREE.Clock();
    const _pktPos = new THREE.Vector3();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 6);
    };

    const renderFrame = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        targetDragRotY = THREE.MathUtils.damp(targetDragRotY, 0, 0.7, delta);
        targetDragRotX = THREE.MathUtils.damp(targetDragRotX, 0, 0.7, delta);
      }
      currentDragRotY = THREE.MathUtils.damp(currentDragRotY, targetDragRotY, 6, delta);
      currentDragRotX = THREE.MathUtils.damp(currentDragRotX, targetDragRotX, 6, delta);

      const camTargetX = prefersReducedMotion ? 0 : pointerX * 0.42;
      const camTargetY = baseCamY + (prefersReducedMotion ? 0 : pointerY * 0.22);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, camTargetX, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camTargetY, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, baseCamZ, 4, delta);
      camera.lookAt(0, 0.12, 0);

      stageGroup.rotation.y = currentDragRotY;
      stageGroup.rotation.x = currentDragRotX;

      if (!prefersReducedMotion) {
        globeSpinGroup.rotation.y += delta * 0.24;

        orbitalRings[0].rotation.z += delta * 0.42;
        orbitalRings[1].rotation.z -= delta * 0.34;
        orbitalRings[2].rotation.z += delta * 0.55;

        for (let i = 0; i < arcPackets.length; i++) {
          const ap = arcPackets[i];
          const t = (elapsed * ap.speed + ap.offset) % 1;
          ap.curve.getPoint(t, _pktPos);
          ap.mesh.position.copy(_pktPos);
        }

        // Proud, gentle float & slow heroic oscillation for India 3D Monument
        indiaFloatGroup.position.y = 0.36 + Math.sin(elapsed * 1.4) * 0.13;
        indiaFloatGroup.rotation.y = 0.12 + Math.sin(elapsed * 0.65) * 0.22 + currentDragRotY * 0.75;
        indiaRing1.rotation.z -= delta * 0.55;
        indiaRing2.rotation.z += delta * 0.45;

        // Subtle hover on front JENOVA emblem & guiding star sparkle
        emblem3D.position.y = 0.56 + Math.sin(elapsed * 1.8) * 0.04;
        const star = emblem3D.getObjectByName('emblemStar');
        if (star) {
          star.rotation.z = Math.sin(elapsed * 1.2) * 0.14;
        }

        particles.rotation.y = elapsed * 0.04;
        particles.position.y = Math.sin(elapsed * 0.6) * 0.12;
      }

      hemiLight.intensity = themeRef.current === 'dark' ? 1.0 : 1.42;
      sunKeyLight.intensity = themeRef.current === 'dark' ? 1.9 : 2.38;

      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(renderFrame);
      } else {
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      scene.traverse((obj) => {
        if (
          (obj as THREE.Mesh).isMesh ||
          (obj as THREE.LineSegments).isLineSegments ||
          (obj as THREE.Points).isPoints
        ) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      globeTexture.dispose();
      indiaTricolourTex.dispose();
      indiaBumpTex.dispose();
      plaqueTex.dispose();
      particleTex.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-[#70B8F2]/30 via-white/70 to-[#36E7F2]/20 dark:from-[#092B55] dark:to-[#0C3D5E] border border-[#36E7F2]/40 p-6 text-center">
        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#092B55] via-[#2693E6] to-[#36E7F2] shadow-2xl flex flex-col items-center justify-center text-white border-4 border-[#FFC45C]">
          <span className="text-xl font-extrabold tracking-widest">JENOVA</span>
          <span className="text-[10px] text-[#E0F7FF] mt-1">India · Community 3D</span>
        </div>
        <p className="mt-4 text-xs font-semibold text-[#092B55] dark:text-[#CBE6FF] max-w-xs">
          Interactive 3D Globe &amp; Tricolour India Preview (WebGL fallback active on this device)
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      aria-label="Interactive 3D JENOVA Globe and Geographically Accurate Floating Tricolour India Map — drag to rotate"
      className="w-full h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[500px] xl:min-h-[540px] cursor-grab active:cursor-grabbing select-none"
    />
  );
}
