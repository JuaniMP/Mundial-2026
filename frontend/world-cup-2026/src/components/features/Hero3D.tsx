import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// HEAD MESH DICTIONARY — line 12 — update when GLBs are reassembled in Blender
// Current GLB files have 7 unassembled STL meshes; sprites used as fallback.
// ─────────────────────────────────────────────────────────────────────────────
// const headMeshes: Record<string, string> = {
//   alce: 'maple_2',
//   yazu: 'zayu_1',
//   clutch: 'clutch_3',
// };

// ─── Mascot definitions ───────────────────────────────────────────────────────
const MASCOTS = [
  {
    id: 'alce',
    label: 'MAPLE',
    country: 'CAN',
    color: '#C8102E',
    sprite: '/assets/maple_action.png',
  },
  {
    id: 'yazu',
    label: 'ZAYU',
    country: 'MEX',
    color: '#006847',
    sprite: '/assets/zayu_action.png',
  },
  {
    id: 'clutch',
    label: 'CLUTCH',
    country: 'USA',
    color: '#1B2A5E',
    sprite: '/assets/clutch_action.png',
  },
] as const;

type MascotId = (typeof MASCOTS)[number]['id'];

// ─── 🐱 Cat easter egg — geometric gold silhouette, ~13% opacity ──────────────
function CatSilhouette() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = -1.1 + Math.sin(clock.elapsedTime * 0.38) * 0.045;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.22) * 0.04;
  });

  const col = '#E5B449';
  const op = 0.14;
  const side = THREE.DoubleSide;

  return (
    <group ref={ref} position={[-2.2, -1.1, -0.8]} scale={[0.7, 0.7, 0.7]}>
      <mesh>
        <circleGeometry args={[0.28, 48]} />
        <meshBasicMaterial color={col} transparent opacity={op} side={side} />
      </mesh>
      <mesh position={[-0.15, 0.31, 0]} rotation={[0, 0, 0.32]}>
        <coneGeometry args={[0.1, 0.22, 3]} />
        <meshBasicMaterial color={col} transparent opacity={op} side={side} />
      </mesh>
      <mesh position={[0.15, 0.31, 0]} rotation={[0, 0, -0.32]}>
        <coneGeometry args={[0.1, 0.22, 3]} />
        <meshBasicMaterial color={col} transparent opacity={op} side={side} />
      </mesh>
      <mesh position={[0, -0.44, 0]}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshBasicMaterial color={col} transparent opacity={op} side={side} />
      </mesh>
      <mesh position={[0.3, -0.56, 0]} rotation={[0, 0, -0.85]}>
        <torusGeometry args={[0.22, 0.03, 6, 24, Math.PI * 0.85]} />
        <meshBasicMaterial color={col} transparent opacity={op} />
      </mesh>
    </group>
  );
}

// ─── Loading ring ─────────────────────────────────────────────────────────────
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

// ─── Mascot sprite — PNG rendered as a 3D textured plane ─────────────────────
interface MascotSpriteProps {
  spritePath: string;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

function MascotSprite({ spritePath, mouse }: MascotSpriteProps) {
  const texture = useTexture(spritePath);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Compute aspect ratio from image dimensions (fallback to portrait ~0.72)
  const img = texture.image as { width?: number; height?: number } | null;
  const aspect = img?.width && img?.height ? img.width / img.height : 0.72;

  const height = 2.6;
  const width = height * aspect;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Idle floating
    groupRef.current.position.y = -1.0 + Math.sin(clock.elapsedTime * 1.1) * 0.07;

    // Mouse-driven tilt (parallax feel)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.current.x * 0.16,
      0.05,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mouse.current.y * 0.08,
      0.05,
    );
  });

  return (
    <group ref={groupRef} position={[0, -1.0, 0]}>
      {/* Main mascot sprite */}
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          roughness={0.3}
          metalness={0.0}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Ground shadow ellipse */}
      <mesh
        position={[0, -height / 2 - 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[width * 0.4, width * 0.12, 1]}
      >
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#0E1A2B" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ─── Hero 3D (exported) ───────────────────────────────────────────────────────
export function Hero3D() {
  const [active, setActive] = useState<MascotId>('alce');
  const mouse = useRef({ x: 0, y: 0 });

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
      <div style={{ width: '100%', height: 480, background: 'transparent' }}>
        <Canvas
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 5.5], fov: 48 }}
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
          <directionalLight position={[-2, 2, -1]} intensity={0.35} color="#E5B449" />
          {/* Subtle accent fill — tints the scene with the mascot country color */}
          <pointLight position={[0, 1, 3]} intensity={0.2} color={activeMascot.color} />

          {/* IBL */}
          <Environment preset="city" background={false} />

          {/* Orbit controls — user can drag to tilt/spin */}
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={14}
            enableDamping
            dampingFactor={0.08}
          />

          {/* 🐱 Easter egg */}
          <CatSilhouette />

          {/* Contact shadow */}
          <ContactShadows
            position={[0, -1.95, 0]}
            opacity={0.5}
            scale={4}
            blur={2.5}
            far={3}
            color="#0E1A2B"
          />

          {/* Active mascot sprite */}
          <Suspense fallback={<LoadingRing />}>
            {active === 'alce' && (
              <MascotSprite spritePath="/assets/maple_action.png" mouse={mouse} />
            )}
            {active === 'yazu' && (
              <MascotSprite spritePath="/assets/zayu_action.png" mouse={mouse} />
            )}
            {active === 'clutch' && (
              <MascotSprite spritePath="/assets/clutch_action.png" mouse={mouse} />
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
          paddingBottom: 14,
          paddingTop: 6,
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
                color: on ? '#fff' : 'rgba(246,239,226,.7)',
                border: `1.5px solid ${on ? m.color : 'rgba(246,239,226,.25)'}`,
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
          bottom: 48,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'DM Serif Display, serif',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'rgba(246,239,226,.4)',
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
