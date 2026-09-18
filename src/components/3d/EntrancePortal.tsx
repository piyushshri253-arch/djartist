"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, useTexture } from "@react-three/drei";

export function EntrancePortal() {
  const entranceRefTexture = useTexture("/images/venue_entrance.png");
  const glowLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (glowLightRef.current) {
      glowLightRef.current.intensity = 3.2 + Math.sin(time * 3.0) * 0.5;
    }
  });

  return (
    <group position={[0, 0, 18]}>
      {/* 0. Photorealistic Reference Texture Backdrop at Arena Entry */}
      <mesh position={[0, 5, -18]}>
        <planeGeometry args={[26, 12]} />
        <meshStandardMaterial
          map={entranceRefTexture}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* 1. Sloped Concrete Entry Ramp */}
      <mesh position={[0, 0.4, 6]} rotation={[-0.04, 0, 0]}>
        <boxGeometry args={[11, 0.8, 22]} />
        <meshStandardMaterial color="#1a1a20" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Yellow/Black Safety Chevron Stripes along ramp edges */}
      <mesh position={[-5.4, 0.82, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 22]} />
        <meshBasicMaterial color="#FF6A00" />
      </mesh>
      <mesh position={[5.4, 0.82, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 22]} />
        <meshBasicMaterial color="#FF6A00" />
      </mesh>

      {/* 2. Concrete Architectural Side Pylons */}
      <group position={[-7.5, 4.5, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 9, 20]} />
          <meshStandardMaterial color="#141418" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Angled ramp wing wall */}
        <mesh position={[1.5, -2.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.4, 4, 18]} />
          <meshStandardMaterial color="#111114" roughness={0.85} />
        </mesh>
      </group>

      <group position={[7.5, 4.5, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 9, 20]} />
          <meshStandardMaterial color="#141418" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Angled ramp wing wall */}
        <mesh position={[-1.5, -2.5, 0]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.4, 4, 18]} />
          <meshStandardMaterial color="#111114" roughness={0.85} />
        </mesh>
      </group>

      {/* 3. Black Steel Heavy Crowd Barricades */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 5.2, 1.2, 5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 1.2, 18]} />
            <meshStandardMaterial color="#303038" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Vertical safety slats */}
          {Array.from({ length: 18 }).map((_, i) => (
            <mesh key={i} position={[0, 0, i * 1.0 - 8.5]}>
              <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
              <meshStandardMaterial color="#404048" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 4. Hanging Curved Line Array Speaker Stacks (L-Acoustics K1 Style) */}
      <group position={[-5.8, 7.5, -3]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, -i * 0.72, i * 0.08]} rotation={[0.07 * i, 0, 0]}>
            <boxGeometry args={[1.8, 0.65, 1.1]} />
            <meshStandardMaterial color="#0c0c10" roughness={0.5} metalness={0.65} />
          </mesh>
        ))}
      </group>

      <group position={[5.8, 7.5, -3]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, -i * 0.72, i * 0.08]} rotation={[0.07 * i, 0, 0]}>
            <boxGeometry args={[1.8, 0.65, 1.1]} />
            <meshStandardMaterial color="#0c0c10" roughness={0.5} metalness={0.65} />
          </mesh>
        ))}
      </group>

      {/* 5. Overhead Structural Cross-Truss Beam */}
      <mesh position={[0, 8.8, 0]}>
        <boxGeometry args={[17, 1.1, 2.2]} />
        <meshStandardMaterial color="#16161c" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* 6. Monumental Architectural "SPARK" Glowing Archway Portal (Camera glides right under this) */}
      <group position={[0, 5.8, -2]}>
        {/* Backing metal box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10.5, 2.6, 0.5]} />
          <meshStandardMaterial color="#0a0a0d" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 3D Architectural SPARK Letters with Amber Neon Glow */}
        <Text
          position={[0, 0, 0.3]}
          fontSize={2.2}
          color="#FFA030"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.16}
        >
          SPARK
          <meshBasicMaterial color="#FFA030" toneMapped={false} />
        </Text>

        {/* High-intensity ambient point light illuminating passing camera */}
        <pointLight
          ref={glowLightRef}
          position={[0, -0.4, 1.0]}
          color="#FF8400"
          intensity={3.8}
          distance={18}
          decay={2}
        />
      </group>
    </group>
  );
}