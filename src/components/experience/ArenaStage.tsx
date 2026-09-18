"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function ArenaStage() {
  const arenaTexture = useTexture("/images/arena_crowd_pro.jpg");
  const ledWallTexture = useTexture("/images/concert_led_wall.jpg");
  const sideScreenTexture = useTexture("/images/world_tour_stage.jpg");
  const haloTrussRef = useRef<THREE.Group>(null);
  const spark1Ref = useRef<THREE.Mesh>(null);
  const spark2Ref = useRef<THREE.Mesh>(null);
  const spark3Ref = useRef<THREE.Mesh>(null);
  const spark4Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Slow cinematic rotation of the colossal halo gantry
    if (haloTrussRef.current) {
      haloTrussRef.current.rotation.y = t * 0.15;
    }

    // Roaring cryogenic spark fountain jets height flickering
    const sparkHeight1 = 12 + Math.sin(t * 18) * 3.5;
    const sparkHeight2 = 12 + Math.cos(t * 16) * 3.5;
    if (spark1Ref.current) spark1Ref.current.scale.y = sparkHeight1 / 12;
    if (spark2Ref.current) spark2Ref.current.scale.y = sparkHeight2 / 12;
    if (spark3Ref.current) spark3Ref.current.scale.y = sparkHeight1 / 12;
    if (spark4Ref.current) spark4Ref.current.scale.y = sparkHeight2 / 12;
  });

  return (
    <group position={[0, 0, -32]}>
      {/* 1. Colossal 40,000 Stadium Crowd Amphitheater Backdrop */}
      <mesh position={[0, 14, 0]}>
        <cylinderGeometry args={[52, 52, 28, 48, 1, true, -Math.PI / 1.35, (2 * Math.PI) / 1.35]} />
        <meshStandardMaterial
          map={arenaTexture}
          roughness={0.4}
          emissive="#FF4400"
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Elevated Main Stadium Stage Platform */}
      <mesh position={[0, 0.45, 0]} receiveShadow>
        <boxGeometry args={[32, 0.9, 20]} />
        <meshStandardMaterial color="#08080c" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Amber Glowing Stage Trim */}
      <mesh position={[0, 0.92, 10]}>
        <boxGeometry args={[32.1, 0.06, 0.06]} />
        <meshBasicMaterial color="#FF6A00" toneMapped={false} />
      </mesh>

      {/* 3. Massive Stadium Center LED Video Wall (Back of Stage) */}
      <mesh position={[0, 11, -12]}>
        <planeGeometry args={[34, 18]} />
        <meshBasicMaterial
          map={ledWallTexture}
          toneMapped={false}
        />
      </mesh>

      {/* 3b. Giant Left IMAG Side Screen */}
      <group position={[-20, 11, -6]} rotation={[0, 0.38, 0]}>
        <mesh>
          <boxGeometry args={[10.4, 14.4, 0.2]} />
          <meshStandardMaterial color="#0a0a0f" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[10, 14]} />
          <meshBasicMaterial map={sideScreenTexture} toneMapped={false} />
        </mesh>
      </group>

      {/* 3c. Giant Right IMAG Side Screen */}
      <group position={[20, 11, -6]} rotation={[0, -0.38, 0]}>
        <mesh>
          <boxGeometry args={[10.4, 14.4, 0.2]} />
          <meshStandardMaterial color="#0a0a0f" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[10, 14]} />
          <meshBasicMaterial map={sideScreenTexture} toneMapped={false} />
        </mesh>
      </group>

      {/* 4. Overhead Rotating Circular "G SPARK" Halo Truss Gantry */}
      <group ref={haloTrussRef} position={[0, 16, 2]}>
        <mesh>
          <torusGeometry args={[12, 0.35, 16, 64]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Neon Amber Underglow Ring */}
        <mesh position={[0, -0.22, 0]}>
          <torusGeometry args={[11.9, 0.08, 12, 64]} />
          <meshBasicMaterial color="#FF6A00" toneMapped={false} />
        </mesh>
        {/* Downward Stadium Floodlights mounted on halo */}
        {[-8, -4, 0, 4, 8].map((x, i) => (
          <pointLight
            key={i}
            position={[x, -0.6, 0]}
            color="#FFA030"
            intensity={4.5}
            distance={25}
          />
        ))}
      </group>

      {/* 5. Four Vertical Cryogenic Gold Spark Jets (Pyro Columns) */}
      {[
        { ref: spark1Ref, pos: [-9, 0.9, 5] as const },
        { ref: spark2Ref, pos: [-4.5, 0.9, 5] as const },
        { ref: spark3Ref, pos: [4.5, 0.9, 5] as const },
        { ref: spark4Ref, pos: [9, 0.9, 5] as const },
      ].map((jet, idx) => (
        <group key={idx} position={jet.pos}>
          {/* Base launcher nozzle */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.5, 16]} />
            <meshStandardMaterial color="#1f1f26" metalness={0.9} />
          </mesh>
          {/* Column of Golden Spark Fire */}
          <mesh ref={jet.ref} position={[0, 6, 0]}>
            <cylinderGeometry args={[0.4, 0.15, 12, 16]} />
            <meshBasicMaterial
              color="#FFB030"
              transparent={true}
              opacity={0.85}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <pointLight color="#FFAA00" intensity={6.0} distance={18} position={[0, 4, 0]} />
        </group>
      ))}
    </group>
  );
}
