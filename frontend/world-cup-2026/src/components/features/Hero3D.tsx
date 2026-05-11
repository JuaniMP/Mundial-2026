import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// HEAD MESH DICTIONARY — line 9
// Adjust these string values if the actual node names in your GLBs differ.
// Use a GLB inspector (e.g. gltf.report or Blender outliner) to find names.
// ─────────────────────────────────────────────────────────────────────────────
const headMeshes: Record<string, string> = {
  alce: 'maple_2',
  yazu: 'zayu_1',
  clutch: 'clutch_3',
};

// ─── Mascot definitions ───────────────────────────────────────────────────────
const MASCOTS = [
  { id: 'alce', label: 'MAPLE', country: 'CAN', color: '#D80027', file: '/alce.glb' },
  { id: 'yazu', label: 'ZAYU', country: 'MEX', color: '#006847', file: '/yazu.glb' },
  { id: 'clutch', label: 'CLUTCH', country: 'USA', color: '#1B2A5E', file: '/clutch.glb' },
] as const;

type MascotId = (typeof MASCOTS)[number]['id'];

// ─── Vinyl toy material ───────────────────────────────────────────────────────
function makeVinyl(mat: THREE.Material): THREE.MeshPhysicalMaterial {
  const src = mat as THREE.MeshStandardMaterial;
  const vinyl = new THREE.MeshPhysicalMaterial({
    color: src.color ?? new THREE.Color(1, 1, 1),
    map: src.map ?? null,
    normalMap: src.normalMap ?? null,
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.3,
  });
  return vinyl;
}

// ─── 🐱 Cat easter egg — geometric silhouette, gold, ~13% opacity ─────────────
function CatSilhouette() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = -1.55 + Math.sin(clock.elapsedTime * 0.38) * 0.045;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.22) * 0.04;
  });

  const color = '#E5B449';
  const op = 0.14;
  const side = THREE.DoubleSide;

  return (
    <group ref={ref} position={[-1.95, -1.55, -0.9]} scale={[0.9, 0.9, 0.9]}>
      {/* head */}
      <mesh>
        <circleGeometry args={[0.28, 48]} />
        <meshBasicMaterial color={color} transparent opacity={op} side={side} />
      </mesh>
      {/* left ear */}
      <mesh position={[-0.15, 0.31, 0]} rotation={[0, 0, 0.32]}>
        <coneGeometry args={[0.1, 0.22, 3]} />
        <meshBasicMaterial color={color} transparent opacity={op} side={side} />
      </mesh>
      {/* right ear */}
      <mesh position={[0.15, 0.31, 0]} rotation={[0, 0, -0.32]}>
        <coneGeometry args={[0.1, 0.22, 3]} />
        <meshBasicMaterial color={color} transparent opacity={op} side={side} />
      </mesh>
      {/* body */}
      <mesh position={[0, -0.44, 0]}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshBasicMaterial color={color} transparent opacity={op} side={side} />
      </mesh>
      {/* tail */}
      <mesh position={[0.3, -0.56, 0]} rotation={[0, 0, -0.85]}>
        <torusGeometry args={[0.22, 0.03, 6, 24, Math.PI * 0.85]} />
        <meshBasicMaterial color={color} transparent opacity={op} />
      </mesh>
    </group>
  );
}

// ─── Loading ring (shown inside canvas while GLB is fetching) ─────────────────
function LoadingRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * 2.5;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.38, 0.04, 8, 40]} />
      <meshBasicMaterial color="#E5B449" />
    </mesh>
  );
}

// ─── Mascot model ─────────────────────────────────────────────────────────────
interface MascotModelProps {
  src: string;
  mascotId: MascotId;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

function MascotModel({ src, mascotId, mouse }: MascotModelProps) {
  const { scene } = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene and override materials with vinyl finish
  const vinylScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (Array.isArray(mesh.material)) {
          mesh.material = (mesh.material as THREE.Material[]).map(makeVinyl);
        } else {
          mesh.material = makeVinyl(mesh.material as THREE.Material);
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Idle bobbing
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.15) * 0.07;

    // Head LookAt — follow mouse
    const headName = headMeshes[mascotId];
    const head = vinylScene.getObjectByName(headName);
    if (head) {
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, mouse.current.x * 0.38, 0.07);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -mouse.current.y * 0.26, 0.07);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={vinylScene} />
    </group>
  );
}

// ─── Hero 3D (exported) ───────────────────────────────────────────────────────
export function Hero3D() {
  const [active, setActive] = useState<MascotId>('alce');
  const mouse = useRef({ x: 0, y: 0 });

  // Track mouse for head LookAt
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const activeMascot = MASCOTS.find((m) => m.id === active)!;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* ── 3D Canvas ── */}
      <div style={{ flex: 1, width: '100%', minHeight: 460 }}>
        <Canvas
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0.6, 3.6], fov: 38 }}
          shadows
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.45} />
          <directionalLight position={[3, 6, 4]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#E5B449" />

          {/* IBL — city HDRI for reflections */}
          <Environment preset="city" />

          {/* 🐱 Easter egg */}
          <CatSilhouette />

          {/* Contact shadow on floor */}
          <ContactShadows
            position={[0, -1.3, 0]}
            opacity={0.5}
            scale={4}
            blur={2.8}
            far={3}
            color="#0E1A2B"
          />

          {/* Active mascot (one at a time, Suspense lazy-loads) */}
          <Suspense fallback={<LoadingRing />}>
            {active === 'alce' && <MascotModel src="/alce.glb" mascotId="alce" mouse={mouse} />}
            {active === 'yazu' && <MascotModel src="/yazu.glb" mascotId="yazu" mouse={mouse} />}
            {active === 'clutch' && (
              <MascotModel src="/clutch.glb" mascotId="clutch" mouse={mouse} />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* ── Mascot selector ── */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          paddingBottom: 12,
          flexShrink: 0,
        }}
      >
        {MASCOTS.map((m) => {
          const on = active === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              style={{
                background: on ? m.color : 'transparent',
                color: 'var(--color-bg-base)',
                border: `1.5px solid ${on ? m.color : 'rgba(246,239,226,.3)'}`,
                fontFamily: 'Anton, sans-serif',
                fontSize: 11,
                letterSpacing: '0.18em',
                padding: '7px 18px',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textTransform: 'uppercase',
              }}
            >
              {m.label} · {m.country}
            </button>
          );
        })}
      </div>

      {/* ── Active mascot label ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'DM Serif Display, serif',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'rgba(246,239,226,.45)',
          letterSpacing: '0.06em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        ⬢ {activeMascot.label.toLowerCase()} · {activeMascot.country}
      </div>
    </div>
  );
}

// Preload first mascot immediately; others stream in on demand
useGLTF.preload('/alce.glb');
