"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function Backstage() {
  const corridorTexture = useTexture("/images/backstage_corridor.png");

  return (
    <group position={[0, 0, 60]}>
      {/* 1. Backdrop Vista Portal (Reference Image 1) */}
      <mesh position={[0, 4.2, -18]}>
        <planeGeometry args={[14, 8.4]} />
        <meshBasicMaterial map={corridorTexture} />
      </mesh>

      {/* 2. Heavy Touring Flight Cases Left Side (Stenciled Road Cases) */}
      <group position={[-3.8, 0, 5]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[1.4, 1.3, 1.0]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Aluminum Corner Extrusions */}
        <mesh position={[0.7, 0.65, 0.5]}>
          <boxGeometry args={[0.06, 1.3, 0.06]} />
          <meshStandardMaterial color="#33333d" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[-0.7, 0.65, 0.5]}>
          <boxGeometry args={[0.06, 1.3, 0.06]} />
          <meshStandardMaterial color="#33333d" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Stacked smaller case */}
        <mesh position={[0.1, 1.7, 0]} castShadow>
          <boxGeometry args={[1.1, 0.8, 0.9]} />
          <meshStandardMaterial color="#1F2833" roughness={0.35} metalness={0.75} />
        </mesh>

        {/* Stencil Label Plate */}
        <mesh position={[0.71, 0.7, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 0.3]} />
          <meshBasicMaterial color="#00E5FF" />
        </mesh>
      </group>

      {/* 3. Flight Cases Right Side */}
      <group position={[3.8, 0, -2]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[1.5, 1.5, 1.1]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-0.1, 1.85, 0]} castShadow>
          <boxGeometry args={[1.2, 0.7, 0.9]} />
          <meshStandardMaterial color="#1F2833" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[-0.76, 0.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 0.3]} />
          <meshBasicMaterial color="#00B4D8" />
        </mesh>
      </group>

      {/* 4. Thick Coiled Multicore Snake Cables */}
      <mesh position={[-2.4, 0.04, 3]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.6, 0.07, 12, 32]} />
        <meshStandardMaterial color="#08080a" roughness={0.6} />
      </mesh>
      <mesh position={[2.6, 0.04, -4]} rotation={[-Math.PI / 2, 0, -0.4]}>
        <torusGeometry args={[0.75, 0.08, 12, 32]} />
        <meshStandardMaterial color="#08080a" roughness={0.6} />
      </mesh>

      {/* 5. Vertical Warm Amber Tube Conduits (Lighting the walls) */}
      <group position={[-5.2, 3.2, 2]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 4.5, 16]} />
          <meshBasicMaterial color="#00B4D8" toneMapped={false} />
        </mesh>
        <pointLight color="#FFA030" intensity={2.8} distance={7} />
      </group>

      <group position={[5.2, 3.2, -6]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 4.5, 16]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        <pointLight color="#00E5FF" intensity={2.8} distance={7} />
      </group>
    </group>
  );
}
