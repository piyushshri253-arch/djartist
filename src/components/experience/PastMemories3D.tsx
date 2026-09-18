"use client";

import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";

export function PastMemories3D() {
  const crowdPic = useTexture("/images/past_event_crowd.jpg");
  const sunsetPic = useTexture("/images/past_event_sunset.jpg");

  return (
    <group position={[0, 0, -200]}>
      {/* 1. Memory Panel Left: Sunburn Goa */}
      <group position={[-5.2, 3.2, 10]} rotation={[0, 0.28, -0.02]}>
        {/* Outer Heavy Steel Frame */}
        <mesh>
          <boxGeometry args={[5.2, 3.4, 0.16]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Backlit Amber Inset Rim */}
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[4.95, 3.15, 0.02]} />
          <meshBasicMaterial color="#FF6A00" toneMapped={false} />
        </mesh>
        {/* Photograph Surface */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[4.8, 3.0]} />
          <meshBasicMaterial map={crowdPic} />
        </mesh>
        {/* Brass Stenciled Nameplate */}
        <group position={[0, -1.9, 0.1]}>
          <mesh>
            <boxGeometry args={[4.2, 0.45, 0.08]} />
            <meshStandardMaterial color="#1a1a24" metalness={0.9} roughness={0.2} />
          </mesh>
          <Text
            position={[0, 0.02, 0.06]}
            fontSize={0.16}
            color="#FF8400"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.22}
            material-toneMapped={false}
          >
            SUNBURN GOA // 55,000 FANS // RECORD ATTENDANCE
          </Text>
        </group>
        {/* Dedicated Museum Framing Spotlight */}
        <pointLight color="#FFE0B0" intensity={2.8} distance={7} position={[0, 2.2, 1.2]} />
      </group>

      {/* 2. Memory Panel Right: Tomorrowland Sunset */}
      <group position={[5.2, 3.2, -8]} rotation={[0, -0.28, 0.02]}>
        <mesh>
          <boxGeometry args={[5.2, 3.4, 0.16]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[4.95, 3.15, 0.02]} />
          <meshBasicMaterial color="#7A4CFF" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[4.8, 3.0]} />
          <meshBasicMaterial map={sunsetPic} />
        </mesh>
        <group position={[0, -1.9, 0.1]}>
          <mesh>
            <boxGeometry args={[4.2, 0.45, 0.08]} />
            <meshStandardMaterial color="#1a1a24" metalness={0.9} roughness={0.2} />
          </mesh>
          <Text
            position={[0, 0.02, 0.06]}
            fontSize={0.16}
            color="#C4A8FF"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.22}
            material-toneMapped={false}
          >
            TOMORROWLAND MAINSTAGE // SUNSET ANTHEM
          </Text>
        </group>
        <pointLight color="#FFE0B0" intensity={2.8} distance={7} position={[0, 2.2, 1.2]} />
      </group>
    </group>
  );
}
