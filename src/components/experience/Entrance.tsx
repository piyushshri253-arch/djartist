"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function Entrance() {
  const entranceTexture = useTexture("/images/venue_entrance.png");

  return (
    <group position={[0, 0, 25]}>
      {/* 1. Sloped Concrete Entrance Ramp */}
      <mesh position={[0, 0.45, 0]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[14, 0.9, 32]} />
        <meshStandardMaterial color="#08080a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 2. Steel Crowd Barricades (Bicycle Racks / Mojo Barriers) */}
      {[-5.8, 5.8].map((x, i) => (
        <group key={i} position={[x, 0.9, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 1.1, 28]} />
            <meshStandardMaterial color="#1f1f26" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Top rail */}
          <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 28, 12]} />
            <meshStandardMaterial color="#444450" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* 3. Hanging L-Acoustics K1 Line Array Towers (Left & Right) */}
      {[-6.5, 6.5].map((x, side) => (
        <group key={side} position={[x, 6.2, 2]}>
          {/* Curved stack of 7 line-array speaker enclosures */}
          {[0, 1, 2, 3, 4, 5, 6].map((box) => (
            <mesh
              key={box}
              position={[0, -box * 0.48, box * 0.08]}
              rotation={[box * 0.06, 0, 0]}
            >
              <boxGeometry args={[1.6, 0.42, 1.1]} />
              <meshStandardMaterial color="#0c0c10" roughness={0.35} metalness={0.8} />
            </mesh>
          ))}
          {/* Suspension Rigging Cable */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 3.6, 8]} />
            <meshStandardMaterial color="#33333a" metalness={0.95} />
          </mesh>
        </group>
      ))}

      {/* 4. Architectural Glowing Neon "SPARK" Archway Portal */}
      <group position={[0, 4.0, -4]}>
        {/* Arch crossbeam structure */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[13.5, 0.5, 0.6]} />
          <meshStandardMaterial color="#101015" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Left upright leg */}
        <mesh position={[-6.5, 0, 0]}>
          <boxGeometry args={[0.6, 6.8, 0.6]} />
          <meshStandardMaterial color="#101015" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Right upright leg */}
        <mesh position={[6.5, 0, 0]}>
          <boxGeometry args={[0.6, 6.8, 0.6]} />
          <meshStandardMaterial color="#101015" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Neon Amber Glowing Inset Border */}
        <mesh position={[0, 3.2, 0.32]}>
          <boxGeometry args={[12.6, 0.1, 0.04]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        <mesh position={[-6.2, 0, 0.32]}>
          <boxGeometry args={[0.1, 6.4, 0.04]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        <mesh position={[6.2, 0, 0.32]}>
          <boxGeometry args={[0.1, 6.4, 0.04]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>

        {/* Powerful Arch Floodlight illuminating the ramp */}
        <pointLight color="#00B4D8" intensity={4.5} distance={16} position={[0, 2.8, 0]} />
      </group>

      {/* 5. Entrance Vista Backdrop (Reference Image 2) */}
      <mesh position={[0, 4.2, -18]}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial map={entranceTexture} />
      </mesh>
    </group>
  );
}
