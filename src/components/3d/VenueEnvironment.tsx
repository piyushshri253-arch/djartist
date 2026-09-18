"use client";

import { useRef } from "react";
import * as THREE from "three";

export function VenueEnvironment() {
  const floorRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* 1. Master Cinematic Ambient & Stage Lighting */}
      <ambientLight intensity={0.55} color="#0c0c12" />
      
      {/* Warm Amber Key Directional Light */}
      <directionalLight
        position={[15, 30, 40]}
        intensity={1.2}
        color="#FFA030"
        castShadow
      />

      {/* Subtle Deep Purple Secondary Lighting */}
      <directionalLight
        position={[-15, 25, -120]}
        intensity={0.75}
        color="#7A4CFF"
      />

      {/* Stadium Climax Accent Fill Light */}
      <directionalLight
        position={[0, 28, -210]}
        intensity={1.4}
        color="#00B4D8"
      />

      {/* 2. Concrete Reflective Floor Plane spanning entire tour depth (+170 to -350) */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, -90]}
        receiveShadow
      >
        <planeGeometry args={[80, 520]} />
        <meshStandardMaterial
          color="#0B0C10"
          roughness={0.24}
          metalness={0.75}
        />
      </mesh>

      {/* 3. High Arena Ceiling Grid Trusses */}
      <group position={[0, 18, -90]}>
        {Array.from({ length: 26 }).map((_, i) => (
          <mesh key={i} position={[0, 0, i * 20 - 250]}>
            <boxGeometry args={[65, 0.7, 0.7]} />
            <meshStandardMaterial color="#16161e" metalness={0.92} roughness={0.3} />
          </mesh>
        ))}
        {/* Longitudinal steel truss cords */}
        <mesh position={[-20, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 520]} />
          <meshStandardMaterial color="#16161e" metalness={0.92} roughness={0.3} />
        </mesh>
        <mesh position={[20, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 520]} />
          <meshStandardMaterial color="#16161e" metalness={0.92} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. Concrete Perimeter Walls */}
      <mesh position={[-32, 9, -90]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[520, 22]} />
        <meshStandardMaterial color="#0B0C10" roughness={0.9} metalness={0.15} />
      </mesh>
      <mesh position={[32, 9, -90]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[520, 22]} />
        <meshStandardMaterial color="#0B0C10" roughness={0.9} metalness={0.15} />
      </mesh>
    </group>
  );
}