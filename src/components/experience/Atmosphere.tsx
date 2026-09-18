"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Atmosphere() {
  const count = 2500;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const amberColor = new THREE.Color("#FF7700");
    const whiteColor = new THREE.Color("#FFFFFF");
    const goldColor = new THREE.Color("#FFB030");

    for (let i = 0; i < count; i++) {
      // Spread across 30m width, 18m height, and 500m length (-280 to +110)
      pos[i * 3 + 0] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = 0.5 + Math.random() * 16;
      pos[i * 3 + 2] = 110 - Math.random() * 390;

      const rand = Math.random();
      const c = rand < 0.65 ? amberColor : rand < 0.85 ? goldColor : whiteColor;
      col[i * 3 + 0] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle floating drift
      pos[i * 3 + 1] += Math.sin(time * 0.8 + i) * 0.005;
      pos[i * 3 + 0] += Math.cos(time * 0.5 + i) * 0.003;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Dense Floating Concert Fog & Sparks */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent={true}
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
