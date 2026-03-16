import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.2;
    // subtle follow cursor
    meshRef.current.rotation.x += (pointer.y * 0.3 - meshRef.current.rotation.x) * 0.02;
    meshRef.current.rotation.z += (pointer.x * 0.3 - meshRef.current.rotation.z) * 0.02;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#4f46e5"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          distort={0.35}
          speed={2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 800;

  const [particleData, setParticleData] = useState<{ positions: Float32Array; speeds: Float32Array } | null>(null);

  useEffect(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      spd[i] = 0.2 + Math.random() * 0.8;
    }
    requestAnimationFrame(() => setParticleData({ positions: pos, speeds: spd }));
  }, []);

  const positions = particleData?.positions ?? null;
  const speeds = particleData?.speeds ?? null;

  useFrame((_, delta) => {
    if (!ref.current || !speeds) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + delta * speeds[i] * 0.3);
      if (y > 6) pos.setY(i, -6);
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.02;
  });

  if (!positions) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#a5b4fc"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroScene() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="absolute inset-0"
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
        <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#c084fc" />
        <AnimatedSphere />
        <FloatingParticles />
        <Stars radius={80} depth={60} count={2000} factor={4} saturation={0.2} fade speed={0.5} />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-4"
            style={{ textShadow: "0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)" }}>
          Playground
        </h1>
        <p className="text-lg md:text-xl text-indigo-200/70 font-light tracking-wide">
          Interactive experiments & visual effects
        </p>
        <div className="mt-12 animate-bounce text-indigo-300/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>

      {/* gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950" />
    </section>
  );
}
