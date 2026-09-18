"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EmberParticlesProps {
  count?: number;
}

export function EmberParticles({ count = 800 }: EmberParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, scales, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sca = new Float32Array(count);
    const spd = new Float32Array(count);

    // Color gradient between flame orange (#00E5FF), golden amber (#00B4D8), and gold (#FFB020)
    const colorA = new THREE.Color("#00E5FF");
    const colorB = new THREE.Color("#00B4D8");
    const colorC = new THREE.Color("#FFC837");

    for (let i = 0; i < count; i++) {
      // Spread across the entire tour depth Z from +130 to -190
      pos[i * 3 + 0] = (Math.random() - 0.5) * 45; // X: -22.5 to 22.5
      pos[i * 3 + 1] = Math.random() * 19 - 1;     // Y: -1 to 18
      pos[i * 3 + 2] = Math.random() * 360 - 255;  // Z: -255 to +105

      const mixedColor = i % 3 === 0 ? colorA : (i % 3 === 1 ? colorB : colorC);
      col[i * 3 + 0] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;

      sca[i] = Math.random() * 1.5 + 0.4;
      spd[i] = Math.random() * 0.02 + 0.005;
    }

    return {
      positions: pos,
      colors: col,
      scales: sca,
      speeds: spd,
    };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Float upward gently
      array[i * 3 + 1] += speeds[i];
      // Subtle horizontal curl
      array[i * 3 + 0] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.005;

      // Loop back if reached top
      if (array[i * 3 + 1] > 18) {
        array[i * 3 + 1] = -1;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
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
        size={0.12}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}