"use client";

import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";

export function Events3D() {
  const posterTexture = useTexture("/images/tour_poster.jpg");

  return (
    <group position={[0, 0, -160]}>
      {/* 1. Monolith #1: Delhi (Left Side, Angled Inward) */}
      <group position={[-5.8, 3.2, 10]} rotation={[0, 0.35, 0]}>
        {/* Steel chassis structure */}
        <mesh>
          <boxGeometry args={[4.2, 3.2, 0.25]} />
          <meshStandardMaterial color="#0c0c10" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* Amber LED Perimeter Border */}
        <mesh position={[0, 0, 0.14]}>
          <boxGeometry args={[4.05, 3.05, 0.02]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        {/* Dark Screen Surface */}
        <mesh position={[0, 0, 0.16]}>
          <planeGeometry args={[3.95, 2.95]} />
          <meshStandardMaterial color="#050508" roughness={0.2} emissive="#150800" />
        </mesh>
        {/* In-World Spatial Event Typography */}
        <group position={[0, 0, 0.18]}>
          <Text
            position={[-1.7, 0.95, 0]}
            fontSize={0.16}
            color="#00E5FF"
            anchorX="left"
            letterSpacing={0.22}
            material-toneMapped={false}
          >
            CONFIRMED LIVE SET
          </Text>
          <Text
            position={[-1.7, 0.45, 0]}
            fontSize={0.48}
            color="#FFFFFF"
            anchorX="left"
            letterSpacing={0.08}
            material-toneMapped={false}
          >
            NEW DELHI
          </Text>
          <Text
            position={[-1.7, -0.1, 0]}
            fontSize={0.22}
            color="#CCCCCC"
            anchorX="left"
            letterSpacing={0.12}
            material-toneMapped={false}
          >
            OCT 24, 2026 • JLN STADIUM
          </Text>
          <Text
            position={[-1.7, -0.65, 0]}
            fontSize={0.15}
            color="#888888"
            anchorX="left"
            letterSpacing={0.18}
            material-toneMapped={false}
          >
            CAPACITY: 35,000 • 360° IMMERSIVE
          </Text>
        </group>
        {/* Ground Floodlight */}
        <pointLight color="#00B4D8" intensity={2.5} distance={8} position={[0, -1.8, 0.8]} />
      </group>

      {/* 2. Monolith #2: Mumbai (Right Side, Angled Inward) */}
      <group position={[5.8, 3.2, -2]} rotation={[0, -0.35, 0]}>
        <mesh>
          <boxGeometry args={[4.2, 3.2, 0.25]} />
          <meshStandardMaterial color="#0c0c10" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <boxGeometry args={[4.05, 3.05, 0.02]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <planeGeometry args={[3.95, 2.95]} />
          <meshStandardMaterial color="#050508" roughness={0.2} emissive="#150800" />
        </mesh>
        <group position={[0, 0, 0.18]}>
          <Text
            position={[-1.7, 0.95, 0]}
            fontSize={0.16}
            color="#00E5FF"
            anchorX="left"
            letterSpacing={0.22}
            material-toneMapped={false}
          >
            WORLD TOUR HEADLINE
          </Text>
          <Text
            position={[-1.7, 0.45, 0]}
            fontSize={0.48}
            color="#FFFFFF"
            anchorX="left"
            letterSpacing={0.08}
            material-toneMapped={false}
          >
            MUMBAI
          </Text>
          <Text
            position={[-1.7, -0.1, 0]}
            fontSize={0.22}
            color="#CCCCCC"
            anchorX="left"
            letterSpacing={0.12}
            material-toneMapped={false}
          >
            NOV 12, 2026 • D.Y. PATIL
          </Text>
          <Text
            position={[-1.7, -0.65, 0]}
            fontSize={0.15}
            color="#888888"
            anchorX="left"
            letterSpacing={0.18}
            material-toneMapped={false}
          >
            CAPACITY: 42,000 • SENSORY STAGE
          </Text>
        </group>
        <pointLight color="#00E5FF" intensity={2.5} distance={8} position={[0, -1.8, 0.8]} />
      </group>

      {/* 3. Physical Tour Poster Monolith (Center Right) */}
      <group position={[3.2, 3.4, -14]} rotation={[0, -0.2, 0]}>
        <mesh>
          <boxGeometry args={[3.4, 4.8, 0.18]} />
          <meshStandardMaterial color="#101016" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[3.2, 4.6]} />
          <meshBasicMaterial map={posterTexture} />
        </mesh>
      </group>

      {/* 4. Overhead Gantry Signboard: Goa NYE & Dubai */}
      <group position={[0, 6.2, -8]}>
        <mesh>
          <boxGeometry args={[11, 1.2, 0.3]} />
          <meshStandardMaterial color="#0e0e13" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.17]}>
          <planeGeometry args={[10.7, 0.95]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        <Text
          position={[0, 0.05, 0.2]}
          fontSize={0.34}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.22}
        >
          GOA NYE 2025 // DUBAI WORLD TOUR 2026
        </Text>
      </group>
    </group>
  );
}
