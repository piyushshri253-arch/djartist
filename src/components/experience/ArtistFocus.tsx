"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function ArtistFocus() {
  const djTexture = useTexture("/images/dj_walker_character.png");
  const djMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (djMeshRef.current) {
      // Dynamic camera-facing billboard rotation around Y axis
      const dx = state.camera.position.x;
      const dz = state.camera.position.z - (-24.4);
      djMeshRef.current.rotation.y = Math.atan2(dx, dz);
    }
  });

  return (
    <group position={[0, 0.9, -25]}>
      {/* 1. DJ G SPARK Performer 3D Character at Decks */}
      <mesh ref={djMeshRef} position={[0, 1.45, 0.6]} castShadow receiveShadow>
        <planeGeometry args={[2.2, 2.75]} />
        <meshStandardMaterial
          map={djTexture}
          transparent={true}
          roughness={0.35}
          metalness={0.1}
          alphaTest={0.05}
          emissive="#FFFFFF"
          emissiveMap={djTexture}
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Warm Amber Back Rim Light (creates silhouette rim definition) */}
      <pointLight position={[0, 1.5, -1.0]} color="#FFA030" intensity={4.2} distance={8} />

      {/* 3. Front Fill Spotting Light */}
      <spotLight
        position={[0, 5, 4]}
        target-position={[0, 1.4, 0.6]}
        color="#FFE0B0"
        intensity={2.2}
        angle={0.5}
        penumbra={0.8}
        distance={10}
      />
    </group>
  );
}
