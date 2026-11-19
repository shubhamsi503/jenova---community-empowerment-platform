import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface HeroSculpture3DProps {
  activePillar?: number;
  onSelectPillar?: (index: number) => void;
  labels: string[];
}

export function HeroSculpture3D({
  activePillar = 0,
  onSelectPillar,
  labels,
}: HeroSculpture3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const activePillarRef = useRef(activePillar);

  useEffect(() => {
    activePillarRef.current = activePillar;
  }, [activePillar]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isNarrowMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    if (prefersReduced || isNarrowMobile) {
      setUseStaticFallback(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL via renderer string
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setUseStaticFallback(true);
      return;
    }

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 380;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Procedural RoomEnvironment for crisp PBR metallic & stone reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 2.35, 6.2);
    camera.lookAt(0, 0.85, 0);

    // Warm key + cool hemisphere fill + rim light
    const hemiLight = new THREE.HemisphereLight(0xf6fbf8, 0xd8cdb8, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4df, 1.85);
    keyLight.position.set(4.5, 6.5, 5.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x176b4d, 0.9);
    rimLight.position.set(-4.5, 3.0, -3.5);
    scene.add(rimLight);

    // Composite multi-part architectural growth monument (grounded at y = 0)
    const monument = new THREE.Group();
    scene.add(monument);

    // Soft radial contact shadow plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 18, 128, 128, 122);
      grad.addColorStop(0, 'rgba(23, 52, 40, 0.32)');
      grad.addColorStop(0.55, 'rgba(23, 52, 40, 0.12)');
      grad.addColorStop(1, 'rgba(23, 52, 40, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 4.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    monument.add(shadowPlane);

    // Materials with contrasting roughness/metalness
    const plinthStoneMat = new THREE.MeshStandardMaterial({
      color: 0xece8dd,
      roughness: 0.78,
      metalness: 0.04,
    });
    const deepGreenMat = new THREE.MeshStandardMaterial({
      color: 0x176b4d,
      roughness: 0.34,
      metalness: 0.16,
    });
    const activeGreenMat = new THREE.MeshStandardMaterial({
      color: 0x1f8a64,
      roughness: 0.25,
      metalness: 0.24,
    });
    const warmBrassMat = new THREE.MeshStandardMaterial({
      color: 0xf4a340,
      roughness: 0.22,
      metalness: 0.82,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xd9d3c3,
      roughness: 0.55,
      metalness: 0.12,
    });

    // Stepped circular community foundation (2 tiers)
    const baseLower = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.28, 0.16, 48), plinthStoneMat);
    baseLower.position.y = 0.08;
    baseLower.receiveShadow = true;
    monument.add(baseLower);

    const baseUpper = new THREE.Mesh(new THREE.CylinderGeometry(1.78, 1.88, 0.14, 48), trimMat);
    baseUpper.position.y = 0.23;
    baseUpper.receiveShadow = true;
    monument.add(baseUpper);

    const brassInlayRing = new THREE.Mesh(new THREE.TorusGeometry(1.79, 0.025, 16, 64), warmBrassMat);
    brassInlayRing.rotation.x = Math.PI / 2;
    brassInlayRing.position.y = 0.305;
    monument.add(brassInlayRing);

    // 5 rising beveled architectural columns representing the 5 Empowerment Pillars
    const pillarConfigs = [
      { x: -1.15, z: 0.28, h: 0.78 },
      { x: -0.58, z: -0.18, h: 1.08 },
      { x: 0.0, z: 0.08, h: 1.44 },
      { x: 0.58, z: -0.18, h: 1.76 },
      { x: 1.15, z: 0.28, h: 2.08 },
    ];

    const pillarMeshes: THREE.Group[] = [];
    const pillarShape = new THREE.Shape();
    const w = 0.22;
    pillarShape.moveTo(-w, -w);
    pillarShape.lineTo(w, -w);
    pillarShape.lineTo(w, w);
    pillarShape.lineTo(-w, w);
    pillarShape.closePath();

    pillarConfigs.forEach((cfg, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.x, 0.3, cfg.z);

      const colGeo = new THREE.ExtrudeGeometry(pillarShape, {
        depth: cfg.h,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.03,
        bevelThickness: 0.03,
      });
      colGeo.rotateX(-Math.PI / 2);

      const colMesh = new THREE.Mesh(colGeo, idx === activePillarRef.current ? activeGreenMat : deepGreenMat);
      colMesh.castShadow = !isSoftwareGl;
      colMesh.receiveShadow = true;
      pGroup.add(colMesh);

      // Brass cap accent sitting flush atop each column
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.46), warmBrassMat);
      cap.position.y = cfg.h + 0.055;
      cap.castShadow = !isSoftwareGl;
      pGroup.add(cap);

      monument.add(pGroup);
      pillarMeshes.push(pGroup);
    });

    // Interconnected rising growth curve (TubeGeometry) bridging all 5 pillars
    const curvePoints = pillarConfigs.map((c) => new THREE.Vector3(c.x, c.h + 0.52, c.z));
    const growthCurve = new THREE.CatmullRomCurve3(curvePoints);
    const arcTube = new THREE.Mesh(
      new THREE.TubeGeometry(growthCurve, 44, 0.036, 12, false),
      warmBrassMat
    );
    arcTube.castShadow = !isSoftwareGl;
    monument.add(arcTube);

    // Orbiting delicate community ring around upper apex
    const haloRing = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.02, 16, 72), deepGreenMat);
    haloRing.position.set(0, 1.45, 0);
    haloRing.rotation.x = Math.PI * 0.38;
    haloRing.rotation.y = -0.25;
    monument.add(haloRing);

    // Rising JENOVA star beacon crowning the ascending growth arc
    const starBeacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf4a340,
        emissive: 0xd9821f,
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.78,
      })
    );
    starBeacon.position.set(1.15, 2.86, 0.28);
    starBeacon.castShadow = !isSoftwareGl;
    monument.add(starBeacon);

    // Interactive pointer parallax
    let targetRotY = -0.22;
    let targetRotX = 0.04;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = -0.22 + nx * 0.36;
      targetRotX = 0.04 + ny * 0.1;
    };

    const onPointerLeave = () => {
      targetRotY = -0.22;
      targetRotX = 0.04;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 480;
      const nh = container.clientHeight || 380;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      monument.rotation.y = THREE.MathUtils.damp(
        monument.rotation.y,
        targetRotY + Math.sin(elapsed * 0.35) * 0.08,
        3.2,
        delta
      );
      monument.rotation.x = THREE.MathUtils.damp(monument.rotation.x, targetRotX, 3.2, delta);
      haloRing.rotation.z = elapsed * 0.18;
      starBeacon.rotation.y = elapsed * 0.9;
      starBeacon.position.y = 2.86 + Math.sin(elapsed * 1.8) * 0.06;

      pillarMeshes.forEach((grp, idx) => {
        const isActive = idx === activePillarRef.current;
        const targetY = isActive ? 0.38 : 0.3;
        grp.position.y = THREE.MathUtils.damp(grp.position.y, targetY, 5, delta);
        const col = grp.children[0] as THREE.Mesh;
        if (col) {
          col.material = isActive ? activeGreenMat : deepGreenMat;
        }
      });

      renderer.render(scene, camera);
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
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material.dispose();
          }
        }
      });
      shadowTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex flex-col justify-between h-full min-h-[320px] sm:min-h-[390px] rounded-xl bg-[#F2F0E8] border border-[#E5E3DC] overflow-hidden">
      {useStaticFallback ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <svg
            viewBox="0 0 360 220"
            className="w-full max-w-[320px] h-auto"
            role="img"
            aria-label="Five rising pillars representing employment, skills, financial literacy, welfare schemes, and small business growth"
          >
            <ellipse cx="180" cy="196" rx="140" ry="14" fill="#176B4D" fillOpacity="0.12" />
            {[
              { x: 52, h: 52 },
              { x: 108, h: 76 },
              { x: 164, h: 102 },
              { x: 220, h: 128 },
              { x: 276, h: 152 },
            ].map((bar, i) => (
              <g key={bar.x}>
                <rect
                  x={bar.x}
                  y={186 - bar.h}
                  width="32"
                  height={bar.h}
                  rx="4"
                  fill={i === activePillar ? '#1F8A64' : '#176B4D'}
                />
                <rect x={bar.x} y={180 - bar.h} width="32" height="6" rx="2" fill="#F4A340" />
              </g>
            ))}
            <path
              d="M68 120 Q 150 96, 292 22"
              fill="none"
              stroke="#F4A340"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : (
        <div ref={mountRef} className="w-full h-[330px] sm:h-[360px] cursor-grab active:cursor-grabbing" />
      )}

      {/* Clean interactive pillar selector strip pinned at bottom */}
      <div className="border-t border-[#E5E3DC] bg-white px-4 py-3 flex items-center justify-between gap-2 overflow-x-auto">
        {labels.map((label, idx) => {
          const active = idx === activePillar;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelectPillar?.(idx)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#176B4D] text-white'
                  : 'text-[#5C5C58] hover:text-[#252525] hover:bg-[#F2F0E8]'
              }`}
            >
              0{idx + 1}. {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
