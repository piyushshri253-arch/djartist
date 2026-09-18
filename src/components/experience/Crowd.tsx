"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Crowd() {
  const count = 900;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowMeshRef = useRef<THREE.InstancedMesh>(null);
  const crowdLightRef = useRef<THREE.SpotLight>(null);

  // Generate randomized crowd positions spread across the venue floor
  const [dummy, dummyGlow, transforms] = useMemo(() => {
    const d = new THREE.Object3D();
    const dg = new THREE.Object3D();
    const t = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 28;
      const z = -96 - Math.random() * 40;
      const y = 0.85 + Math.random() * 0.15;
      const height = 1.6 + Math.random() * 0.3;
      const scale = 0.75 + Math.random() * 0.4;
      t.push({ x, y, z, height, scale, phase: Math.random() * Math.PI * 2 });
    }
    return [d, dg, t];
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Sweeping concert stage beam scanning over the crowd
    if (crowdLightRef.current) {
      crowdLightRef.current.position.x = Math.sin(time * 0.6) * 10;
      crowdLightRef.current.target.position.x = Math.cos(time * 0.6) * 12;
      crowdLightRef.current.target.position.z = -115 + Math.sin(time * 0.4) * 8;
      crowdLightRef.current.target.updateMatrixWorld();
    }

    if (!meshRef.current || !glowMeshRef.current) return;

    // Animate crowd bouncing to the music rhythm
    for (let i = 0; i < count; i++) {
      const p = transforms[i];
      const bounce = Math.sin(time * 6 + p.phase) * 0.08;

      dummy.position.set(p.x, p.y + bounce, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Amber glow sticks / phones in hand
      dummyGlow.position.set(p.x + 0.15, p.y + bounce + 0.9, p.z + 0.1);
      dummyGlow.updateMatrix();
      glowMeshRef.current.setMatrixAt(i, dummyGlow.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    glowMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. Instanced Crowd Silhouettes (Dark clothing, realistic human proportions) */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <capsuleGeometry args={[0.24, 1.2, 4, 8]} />
        <meshStandardMaterial color="#050508" roughness={0.7} metalness={0.1} />
      </instancedMesh>

      {/* 2. Instanced Glowing Amber Concert Wristbands / Glow Sticks */}
      <instancedMesh ref={glowMeshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#FF8400" toneMapped={false} />
      </instancedMesh>

      {/* 3. Sweeping Stage Spotlight Cutting Through the Crowd Haze */}
      <spotLight
        ref={crowdLightRef}
        position={[0, 14, -85]}
        color="#FFA040"
        intensity={12.0}
        angle={0.6}
        penumbra={0.7}
        distance={45}
        castShadow
      />
      <pointLight color="#7A4CFF" intensity={2.0} distance={20} position={[0, 4, -115]} />
    </group>
  );
}
