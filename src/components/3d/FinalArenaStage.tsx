"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture, Text } from "@react-three/drei";

export function FinalArenaStage() {
  const crowdTexture = useTexture("/images/arena_crowd.jpg");
  const haloRef = useRef<THREE.Group>(null);
  const sparkParticlesRef = useRef<THREE.Points>(null);
  const beam1Ref = useRef<THREE.SpotLight>(null);
  const beam2Ref = useRef<THREE.SpotLight>(null);
  const beam3Ref = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (haloRef.current) {
      haloRef.current.rotation.y = t * 0.08;
    }
    // Dynamic sweeping spotlights over the 40k crowd
    if (beam1Ref.current) {
      beam1Ref.current.position.x = Math.sin(t * 0.7) * 14;
      beam1Ref.current.target.position.x = Math.sin(t * 0.7) * 9;
      beam1Ref.current.target.updateMatrixWorld();
    }
    if (beam2Ref.current) {
      beam2Ref.current.position.x = Math.cos(t * 0.9) * 16;
      beam2Ref.current.target.position.x = Math.cos(t * 0.9) * 7;
      beam2Ref.current.target.updateMatrixWorld();
    }
    if (beam3Ref.current) {
      beam3Ref.current.position.y = 16 + Math.sin(t * 1.5) * 2;
    }
    // Animate upward spark fountain points
    if (sparkParticlesRef.current) {
      const positions = sparkParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.25;
        if (positions[i] > 14) positions[i] = 2.0;
      }
      sparkParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, -230]}>
      {/* 1. Massive 40,000 Fan Stadium Amphitheater (Curved Arena Crowd from Reference Image) */}
      <mesh position={[0, 7, 24]}>
        <planeGeometry args={[52, 18]} />
        <meshStandardMaterial
          map={crowdTexture}
          roughness={0.65}
          metalness={0.15}
          emissive="#00E5FF"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* 2. Colossal Stadium Concert Stage Deck */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[32, 2.8, 16]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Stage Front Amber Glow Strip */}
      <mesh position={[0, 2.82, 8.01]}>
        <boxGeometry args={[32.1, 0.08, 0.06]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} />
      </mesh>

      {/* 3. Circular Truss Overhead LED Halo (Iconic G SPARK Halo from Reference Photo) */}
      <group ref={haloRef} position={[0, 17, -2]}>
        {/* Truss Ring Cage */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[9.5, 0.55, 16, 64]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.92} roughness={0.25} />
        </mesh>
        {/* Inner 360-Degree LED Ribbon Screen */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[9.2, 9.2, 2.8, 64, 1, true]} />
          <meshBasicMaterial color="#00B4D8" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {/* Halo Illuminated Artist Branding */}
        <Text
          position={[0, 0, 9.25]}
          fontSize={1.8}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.22}
        >
          G SPARK
        </Text>
        <Text
          position={[0, 0, -9.25]}
          rotation={[0, Math.PI, 0]}
          fontSize={1.8}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.22}
        >
          G SPARK
        </Text>
      </group>

      {/* 4. Giant Mainstage Stadium LED Wall Backdrop */}
      <group position={[0, 10, -7]}>
        <mesh>
          <planeGeometry args={[28, 14]} />
          <meshStandardMaterial
            color="#08080a"
            emissive="#00E5FF"
            emissiveIntensity={0.55}
            roughness={0.2}
          />
        </mesh>
        <Text
          position={[0, 1.2, 0.1]}
          fontSize={4.2}
          color="#FFA030"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.25}
        >
          G SPARK
          <meshBasicMaterial color="#FFA030" toneMapped={false} />
        </Text>
        <Text
          position={[0, -2.2, 0.1]}
          fontSize={1.2}
          color="#F5F6FA"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.35}
        >
          FEEL THE SPARK. ENTER THE SOUND.
          <meshBasicMaterial color="#F5F6FA" toneMapped={false} />
        </Text>
      </group>

      {/* 5. Left and Right Floating IMAG Broadcast Screens */}
      <mesh position={[-18, 9.5, -4]} rotation={[0, 0.35, 0]}>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial
          map={crowdTexture}
          emissive="#00E5FF"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[18, 9.5, -4]} rotation={[0, -0.35, 0]}>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial
          map={crowdTexture}
          emissive="#00E5FF"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* 6. Vertical Pyro Spark Fountain Jets (Cryogenic Spark Cannons) */}
      <group>
        {[-10, -5, 5, 10].map((x, i) => (
          <group key={i} position={[x, 2.8, 3]}>
            {/* Spark Mortar Cannon */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.22, 0.28, 0.6, 16]} />
              <meshStandardMaterial color="#181820" metalness={0.92} />
            </mesh>
            {/* Illuminated Spark Jet Column */}
            <mesh position={[0, 5.0, 0]}>
              <cylinderGeometry args={[0.08, 0.32, 9.5, 12]} />
              <meshBasicMaterial
                color="#FFA030"
                toneMapped={false}
                transparent
                opacity={0.8}
              />
            </mesh>
            <pointLight position={[0, 4.5, 0]} color="#00B4D8" intensity={5.0} distance={14} />
          </group>
        ))}
      </group>

      {/* 7. Concert Stadium Moving Spotlights */}
      <spotLight
        ref={beam1Ref}
        position={[-14, 22, 2]}
        color="#FFA030"
        intensity={16.0}
        angle={0.5}
        penumbra={0.6}
        distance={55}
        castShadow
      />
      <spotLight
        ref={beam2Ref}
        position={[14, 22, 2]}
        color="#00E5FF"
        intensity={16.0}
        angle={0.5}
        penumbra={0.6}
        distance={55}
        castShadow
      />
      <spotLight
        ref={beam3Ref}
        position={[0, 24, -6]}
        color="#7A4CFF"
        intensity={12.0}
        angle={0.65}
        penumbra={0.7}
        distance={60}
      />
    </group>
  );
}