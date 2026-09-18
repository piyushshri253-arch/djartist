"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function LEDTunnel() {
  const ledTexture = useTexture("/images/concert_led.jpg");
  const ringGroupRef = useRef<THREE.Group>(null);
  const portalGlowRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z = t * 0.25;
    }
    if (portalGlowRef.current) {
      portalGlowRef.current.color.setRGB(
        1.0,
        0.35 + Math.sin(t * 3.5) * 0.15,
        0.0
      );
    }
  });

  return (
    <group position={[0, 0, -68]}>
      {/* 1. Curved 55-Meter Cylindrical LED Wall Tunnel */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6.2, 6.2, 54, 36, 1, true]} />
        <meshStandardMaterial
          map={ledTexture}
          emissive="#00E5FF"
          emissiveIntensity={0.55}
          roughness={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 2. Kinetic Glowing LED Portal Rings Encircling the Path */}
      <group ref={ringGroupRef}>
        {[-22, -11, 0, 11, 22].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            <mesh>
              <torusGeometry args={[5.9, 0.08, 12, 48]} />
              <meshBasicMaterial
                color={idx % 2 === 0 ? "#00E5FF" : "#7A4CFF"}
                toneMapped={false}
              />
            </mesh>
            {/* Pulsing strobe accent node */}
            <mesh position={[Math.sin(idx) * 5.8, Math.cos(idx) * 5.8, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Entrance Arch Monolith Wall (Fly-Through Portal) */}
      <group position={[0, 0, 26]}>
        {/* Curved Header LED Monolith Displaying MUSIC • ENERGY • SPARK */}
        <mesh position={[0, 3.8, 0]}>
          <cylinderGeometry args={[8.5, 8.5, 3.2, 32, 1, true, -Math.PI / 3, (2 * Math.PI) / 3]} />
          <meshStandardMaterial
            color="#08080c"
            emissive="#00E5FF"
            emissiveIntensity={0.7}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Center Fly-Through Arch Trim */}
        <mesh position={[0, 2.5, 0]}>
          <torusGeometry args={[3.6, 0.12, 16, 36, Math.PI]} />
          <meshBasicMaterial ref={portalGlowRef} color="#00E5FF" toneMapped={false} />
        </mesh>
      </group>

      {/* 4. Interior Tunnel Atmospheric Light */}
      <pointLight color="#FF7700" intensity={3.5} distance={24} position={[0, 2.6, 0]} />
      <pointLight color="#7A4CFF" intensity={2.5} distance={20} position={[0, 2.6, -20]} />
    </group>
  );
}
