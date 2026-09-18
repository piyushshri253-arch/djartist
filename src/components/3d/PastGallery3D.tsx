"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useTexture, Text } from "@react-three/drei";

export function PastGallery3D() {
  const sunsetTexture = useTexture("/images/past_event_sunset.jpg");
  const crowdTexture = useTexture("/images/past_event_crowd.jpg");
  const ledTexture = useTexture("/images/concert_led.jpg");

  return (
    <group position={[0, 2.4, -170]}>
      {/* Gallery Header */}
      <group position={[0, 3.4, 4]}>
        <Text fontSize={0.22} color="#00B4D8" anchorX="center" letterSpacing={0.2}>
          CHAPTER 07 • CONCERT ARCHIVES
        </Text>
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.82}
          font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb54C_k3HqUtEw.woff"
          color="#F5F6FA"
          anchorX="center"
          letterSpacing={0.1}
        >
          HISTORIC PERFORMANCES
        </Text>
      </group>

      {/* Frame 1 (Left): Sunburn Goa */}
      <group position={[-3.6, 0, 0]} rotation={[0, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[3.8, 2.5, 0.1]} />
          <meshStandardMaterial color="#1F2833" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[3.6, 2.3]} />
          <meshStandardMaterial map={sunsetTexture} roughness={0.4} />
        </mesh>
        <Text position={[0, -1.45, 0]} fontSize={0.18} color="#00B4D8" anchorX="center" letterSpacing={0.12}>
          GOA SUNBURN 2025 • 55,000 FANS
        </Text>
        <spotLight position={[0, 3, 2]} intensity={2.5} angle={0.5} color="#FFA040" distance={8} />
      </group>

      {/* Frame 2 (Center): Tomorrowland Belgium */}
      <group position={[0, 0, -5]}>
        <mesh>
          <boxGeometry args={[4.4, 2.8, 0.1]} />
          <meshStandardMaterial color="#1F2833" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[4.2, 2.6]} />
          <meshStandardMaterial map={crowdTexture} roughness={0.4} />
        </mesh>
        <Text position={[0, -1.6, 0]} fontSize={0.2} color="#FFA020" anchorX="center" letterSpacing={0.12}>
          TOMORROWLAND 2024 • 70,000 UNITED
        </Text>
        <spotLight position={[0, 3.5, 2]} intensity={3.0} angle={0.5} color="#00B4D8" distance={9} />
      </group>

      {/* Frame 3 (Right): Ultra Miami */}
      <group position={[3.6, 0, 0]} rotation={[0, -0.2, 0]}>
        <mesh>
          <boxGeometry args={[3.8, 2.5, 0.1]} />
          <meshStandardMaterial color="#1F2833" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[3.6, 2.3]} />
          <meshStandardMaterial map={ledTexture} roughness={0.4} />
        </mesh>
        <Text position={[0, -1.45, 0]} fontSize={0.18} color="#00B4D8" anchorX="center" letterSpacing={0.12}>
          ULTRA MIAMI 2025 • 38,000 AUDIENCE
        </Text>
        <spotLight position={[0, 3, 2]} intensity={2.5} angle={0.5} color="#FFA040" distance={8} />
      </group>
    </group>
  );
}