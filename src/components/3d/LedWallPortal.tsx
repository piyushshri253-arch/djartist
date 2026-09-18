"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, useTexture } from "@react-three/drei";

export function LedWallPortal() {
  const ledTexture = useTexture("/images/concert_led.jpg");
  const kineticRing1 = useRef<THREE.Mesh>(null);
  const kineticRing2 = useRef<THREE.Mesh>(null);
  const portalGlow = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (kineticRing1.current) kineticRing1.current.rotation.z = t * 0.25;
    if (kineticRing2.current) kineticRing2.current.rotation.z = -t * 0.35;
    if (portalGlow.current) {
      portalGlow.current.intensity = 4.0 + Math.sin(t * 5.0) * 1.0;
    }
  });

  return (
    <group position={[0, 4.0, -48]}>
      {/* 1. Giant Curved 80-Meter Monolithic LED Wall Surface */}
      <group position={[0, 0, 0]}>
        {/* Left wing curved screen */}
        <mesh position={[-9.5, 0, 0]} rotation={[0, 0.2, 0]}>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial
            map={ledTexture}
            emissive="#00E5FF"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Right wing curved screen */}
        <mesh position={[9.5, 0, 0]} rotation={[0, -0.2, 0]}>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial
            map={ledTexture}
            emissive="#00E5FF"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Top Header screen spanning over the portal */}
        <mesh position={[0, 4.2, 0]}>
          <planeGeometry args={[10, 3.2]} />
          <meshStandardMaterial
            map={ledTexture}
            emissive="#00B4D8"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 2. Monumental Glowing Typography on LED Wall */}
      <group position={[0, 4.2, 0.15]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={1.1}
          color="#F5F6FA"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.28}
        >
          MUSIC • ENERGY • SPARK
          <meshBasicMaterial color="#FFA030" toneMapped={false} />
        </Text>
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.8}
          color="#929292"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.35}
        >
          ENTER THE HYPERDIMENSION
          <meshBasicMaterial color="#F5F6FA" toneMapped={false} />
        </Text>
      </group>

      {/* 3. Physical Central Fly-Through Archway (Camera glides right through [0, 2.6, -44 -> -55]) */}
      <group position={[0, -0.8, 0]}>
        {/* Kinetic Rotating Outer Neon Ring */}
        <mesh ref={kineticRing1} position={[0, 0, -0.1]}>
          <torusGeometry args={[4.2, 0.08, 16, 64]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>

        {/* Kinetic Rotating Inner Secondary Purple Ring */}
        <mesh ref={kineticRing2} position={[0, 0, -0.6]}>
          <torusGeometry args={[3.8, 0.06, 16, 64]} />
          <meshBasicMaterial color="#7A4CFF" toneMapped={false} />
        </mesh>

        {/* High-intensity Tunnel Light illuminating the pass-through */}
        <pointLight
          ref={portalGlow}
          position={[0, 0, -1]}
          color="#00B4D8"
          intensity={4.5}
          distance={16}
          decay={2}
        />

        {/* Fly-Through Laser Beams & Streaks framing the portal interior */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const r = 3.6;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, Math.sin(angle) * r, -i * 0.8 - 1]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.04, 0.04, 8]} />
              <meshBasicMaterial
                color={i % 3 === 0 ? "#7A4CFF" : "#00E5FF"}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}