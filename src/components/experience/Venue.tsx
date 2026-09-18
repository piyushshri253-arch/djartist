"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function Venue() {
  // Generate structural column positions every 14 meters
  const columnPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let z = 100; z >= -270; z -= 14) {
      arr.push([-8.5, 4.5, z]);
      arr.push([8.5, 4.5, z]);
    }
    return arr;
  }, []);

  // Generate overhead cross-truss beams every 20 meters
  const trussPositions = useMemo(() => {
    const arr: number[] = [];
    for (let z = 95; z >= -265; z -= 20) {
      arr.push(z);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* 1. Continuous 520m Concrete Floor Slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -85]} receiveShadow>
        <planeGeometry args={[44, 520]} />
        <meshStandardMaterial
          color="#0B0C10"
          roughness={0.32}
          metalness={0.4}
        />
      </mesh>

      {/* 2. Perimeter Amber Guide LED Strip (Floor Left & Right) */}
      <mesh position={[-7.9, 0.02, -85]}>
        <boxGeometry args={[0.08, 0.03, 510]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} />
      </mesh>
      <mesh position={[7.9, 0.02, -85]}>
        <boxGeometry args={[0.08, 0.03, 510]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} />
      </mesh>

      {/* 3. Structural Heavy Steel I-Beam Columns */}
      {columnPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Main vertical column */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.45, 9.0, 0.45]} />
            <meshStandardMaterial color="#1F2833" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Base mounting plate */}
          <mesh position={[0, -4.4, 0]}>
            <boxGeometry args={[0.85, 0.2, 0.85]} />
            <meshStandardMaterial color="#1F2833" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* 4. Overhead Longitudinal & Cross Truss Gantries */}
      <mesh position={[-8.2, 9.0, -85]}>
        <boxGeometry args={[0.3, 0.3, 510]} />
        <meshStandardMaterial color="#141418" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[8.2, 9.0, -85]}>
        <boxGeometry args={[0.3, 0.3, 510]} />
        <meshStandardMaterial color="#141418" metalness={0.85} roughness={0.3} />
      </mesh>

      {trussPositions.map((z, idx) => (
        <group key={idx} position={[0, 9.0, z]}>
          <mesh>
            <boxGeometry args={[16.8, 0.25, 0.25]} />
            <meshStandardMaterial color="#121217" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Faint amber overhead cable tray light */}
          <pointLight color="#FFA030" intensity={0.4} distance={9} position={[0, -0.4, 0]} />
        </group>
      ))}

      {/* 5. Ambient Concert Venue Lighting (Subtle warm amber & cool purple) */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 20, 20]} intensity={0.5} color="#FFAA55" />
    </group>
  );
}
