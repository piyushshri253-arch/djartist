"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface StandeeProps {
  position: [number, number, number];
  rotationY: number;
  posterSrc: string;
  cityName: string;
  dateText: string;
}

function Standee({ position, rotationY, posterSrc, cityName, dateText }: StandeeProps) {
  const posterTexture = useTexture(posterSrc);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 1. Heavy Black Steel Floor Base Plate */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.08, 0.65]} />
        <meshStandardMaterial color="#0c0c10" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* 2. Vertical Support Mast at back */}
      <mesh position={[0, 1.7, -0.12]}>
        <cylinderGeometry args={[0.03, 0.03, 3.4, 12]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* 3. Outer Frame Casing */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[1.5, 3.3, 0.06]} />
        <meshStandardMaterial color="#08080c" roughness={0.4} metalness={0.75} />
      </mesh>

      {/* 4. Glowing Amber Edge Frame Trim */}
      <mesh position={[0, 1.7, 0.032]}>
        <boxGeometry args={[1.44, 3.24, 0.01]} />
        <meshBasicMaterial color="#FF6A00" toneMapped={false} />
      </mesh>

      {/* Top City Header Badge */}
      <group position={[0, 3.15, 0.04]}>
        <mesh>
          <planeGeometry args={[1.36, 0.28]} />
          <meshBasicMaterial color="#0a0a0f" />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[1.34, 0.26]} />
          <meshBasicMaterial color="#1a1208" />
        </mesh>
      </group>

      {/* 5. Razor-Sharp High-Resolution Event Poster Graphic */}
      <mesh position={[0, 1.55, 0.04]}>
        <planeGeometry args={[1.38, 2.85]} />
        <meshBasicMaterial
          map={posterTexture}
          toneMapped={false}
        />
      </mesh>

      {/* 6. Upward Ground Spotlight grazing the poster face */}
      <spotLight
        position={[0, 0.15, 0.7]}
        target-position={[0, 1.6, 0]}
        color="#FFA030"
        intensity={2.5}
        distance={5.5}
        angle={0.65}
        penumbra={0.8}
      />
      <pointLight position={[0, 0.3, 0.5]} color="#FFA030" intensity={1.5} distance={3.5} />
    </group>
  );
}

export function StandingBanners() {
  return (
    <group>
      {/* Standee 1: Delhi (Left, Z: 64) */}
      <Standee
        position={[-3.6, 0, 64]}
        rotationY={0.35}
        posterSrc="/images/poster_delhi.jpg"
        cityName="DELHI // JLN STADIUM"
        dateText="DEC 18 • 2026"
      />

      {/* Standee 2: Mumbai (Right, Z: 54) */}
      <Standee
        position={[3.6, 0, 54]}
        rotationY={-0.35}
        posterSrc="/images/poster_mumbai.jpg"
        cityName="MUMBAI // D.Y. PATIL"
        dateText="DEC 24 • 2026"
      />

      {/* Standee 3: Goa (Left, Z: 44) */}
      <Standee
        position={[-3.6, 0, 44]}
        rotationY={0.35}
        posterSrc="/images/poster_goa.jpg"
        cityName="GOA // SUNBURN VAGATOR"
        dateText="DEC 31 • NYE"
      />

      {/* Standee 4: Dubai (Right, Z: 34) */}
      <Standee
        position={[3.6, 0, 34]}
        rotationY={-0.35}
        posterSrc="/images/poster_dubai.jpg"
        cityName="DUBAI // COCA-COLA ARENA"
        dateText="JAN 15 • 2027"
      />
    </group>
  );
}
