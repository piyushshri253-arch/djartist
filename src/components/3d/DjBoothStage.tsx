"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export function DjBoothStage() {
  const djTexture = useTexture("/images/dj_performing.jpg");
  const beam1Ref = useRef<THREE.SpotLight>(null);
  const beam2Ref = useRef<THREE.SpotLight>(null);
  const jogLeftRef = useRef<THREE.Mesh>(null);
  const jogRightRef = useRef<THREE.Mesh>(null);
  const vuMeterRef = useRef<THREE.MeshBasicMaterial>(null);

  const cone1Ref = useRef<THREE.Group>(null);
  const cone2Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Spin CDJ jog wheels continuously
    if (jogLeftRef.current) jogLeftRef.current.rotation.y = t * 3.2;
    if (jogRightRef.current) jogRightRef.current.rotation.y = t * 3.2;

    // VU meter pulsing with electronic music beats
    if (vuMeterRef.current) {
      vuMeterRef.current.color.setRGB(1.0, 0.4 + Math.sin(t * 12) * 0.3, 0.0);
    }

    // Moving head beams sweeping through stage haze with volumetric cones
    const sweep1X = Math.sin(t * 0.8) * 3;
    const sweep1Y = 2 + Math.cos(t * 0.8) * 1.5;
    const sweep2X = Math.cos(t * 0.8) * 3;
    const sweep2Y = 2 + Math.sin(t * 0.8) * 1.5;

    if (beam1Ref.current) {
      beam1Ref.current.position.x = Math.sin(t * 0.8) * 4 - 4;
      beam1Ref.current.target.position.x = sweep1X;
      beam1Ref.current.target.position.y = sweep1Y;
      beam1Ref.current.target.updateMatrixWorld();
    }
    if (cone1Ref.current && beam1Ref.current) {
      cone1Ref.current.position.copy(beam1Ref.current.position);
      cone1Ref.current.lookAt(sweep1X, sweep1Y, 0);
    }

    if (beam2Ref.current) {
      beam2Ref.current.position.x = Math.cos(t * 0.8) * 4 + 4;
      beam2Ref.current.target.position.x = sweep2X;
      beam2Ref.current.target.position.y = sweep2Y;
      beam2Ref.current.target.updateMatrixWorld();
    }
    if (cone2Ref.current && beam2Ref.current) {
      cone2Ref.current.position.copy(beam2Ref.current.position);
      cone2Ref.current.lookAt(sweep2X, sweep2Y, 0);
    }
  });

  return (
    <group position={[0, 0, -25]}>
      {/* 1. Elevated Diamond-Plate Stage Riser Platform */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[16, 0.9, 12]} />
        <meshStandardMaterial color="#1F2833" roughness={0.35} metalness={0.75} />
      </mesh>
      {/* Amber Glowing Perimeter LED Step Trim */}
      <mesh position={[0, 0.9, 6.01]}>
        <boxGeometry args={[16.1, 0.05, 0.04]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} />
      </mesh>
      <mesh position={[-8.01, 0.9, 0]}>
        <boxGeometry args={[0.04, 0.05, 12.1]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} />
      </mesh>
      <mesh position={[8.01, 0.9, 0]}>
        <boxGeometry args={[0.04, 0.05, 12.1]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} />
      </mesh>

      {/* 2. DJ Command Console Desk (Heavy touring aluminum flight table) */}
      <group position={[0, 0.9, 1.8]}>
        {/* Main desk structure */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[4.6, 1.04, 1.3]} />
          <meshStandardMaterial color="#0f0f13" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* Front console branded plate */}
        <mesh position={[0, 0.52, 0.66]}>
          <boxGeometry args={[4.4, 0.8, 0.02]} />
          <meshStandardMaterial color="#08080a" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Pioneer CDJ-3000 Player #1 (Far Left) */}
        <group position={[-1.75, 1.08, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.1, 0.95]} />
            <meshStandardMaterial color="#181820" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.06, 0.1]}>
            <cylinderGeometry args={[0.24, 0.24, 0.03, 32]} />
            <meshStandardMaterial color="#22222c" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.06, -0.3]} rotation={[-0.25, 0, 0]}>
            <planeGeometry args={[0.42, 0.22]} />
            <meshBasicMaterial color="#0088FF" toneMapped={false} />
          </mesh>
        </group>

        {/* Pioneer CDJ-3000 Player #2 (Center Left) */}
        <group position={[-0.95, 1.08, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.1, 0.95]} />
            <meshStandardMaterial color="#181820" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Spinning Jog Dial */}
          <mesh ref={jogLeftRef} position={[0, 0.06, 0.1]}>
            <cylinderGeometry args={[0.24, 0.24, 0.03, 32]} />
            <meshStandardMaterial color="#22222c" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.06, -0.3]} rotation={[-0.25, 0, 0]}>
            <planeGeometry args={[0.42, 0.22]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>
        </group>

        {/* Pioneer DJM-V10 6-Channel Mixer (Center) */}
        <group position={[0, 1.08, 0]}>
          <mesh>
            <boxGeometry args={[0.85, 0.1, 0.95]} />
            <meshStandardMaterial color="#1F2833" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Channel Faders plate */}
          <mesh position={[0, 0.06, 0.12]}>
            <planeGeometry args={[0.65, 0.35]} />
            <meshBasicMaterial color="#1a1a24" />
          </mesh>
          {/* Pulsing VU Meters */}
          <mesh position={[0, 0.065, -0.15]}>
            <planeGeometry args={[0.45, 0.08]} />
            <meshBasicMaterial ref={vuMeterRef} color="#00E5FF" toneMapped={false} />
          </mesh>
        </group>

        {/* Pioneer CDJ-3000 Player #3 (Center Right) */}
        <group position={[0.95, 1.08, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.1, 0.95]} />
            <meshStandardMaterial color="#181820" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Spinning Jog Dial */}
          <mesh ref={jogRightRef} position={[0, 0.06, 0.1]}>
            <cylinderGeometry args={[0.24, 0.24, 0.03, 32]} />
            <meshStandardMaterial color="#22222c" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.06, -0.3]} rotation={[-0.25, 0, 0]}>
            <planeGeometry args={[0.42, 0.22]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>
        </group>

        {/* Pioneer CDJ-3000 Player #4 (Far Right) */}
        <group position={[1.75, 1.08, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.1, 0.95]} />
            <meshStandardMaterial color="#181820" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.06, 0.1]}>
            <cylinderGeometry args={[0.24, 0.24, 0.03, 32]} />
            <meshStandardMaterial color="#22222c" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.06, -0.3]} rotation={[-0.25, 0, 0]}>
            <planeGeometry args={[0.42, 0.22]} />
            <meshBasicMaterial color="#0088FF" toneMapped={false} />
          </mesh>
        </group>

        {/* DJ Headphones Hanging on Mixer Corner */}
        <group position={[-0.45, 1.02, 0.45]} rotation={[0, 0, 0.4]}>
          <mesh>
            <torusGeometry args={[0.12, 0.02, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#08080a" roughness={0.7} />
          </mesh>
          <mesh position={[-0.12, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
            <meshStandardMaterial color="#1a1a20" roughness={0.4} />
          </mesh>
        </group>

        {/* Dual Angled Stage Monitor Speakers (Left and Right of DJ) */}
        <mesh position={[-2.6, 0.95, 0.2]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.7, 1.1, 0.65]} />
          <meshStandardMaterial color="#0d0d10" roughness={0.6} />
        </mesh>
        <mesh position={[2.6, 0.95, 0.2]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.7, 1.1, 0.65]} />
          <meshStandardMaterial color="#0d0d10" roughness={0.6} />
        </mesh>
      </group>

      {/* 3. Central Performer Presence: Dj G-spark (High-Resolution Reference Image Billboard) */}
      <group position={[0, 2.7, 1.2]}>
        <mesh>
          <planeGeometry args={[4.6, 3.2]} />
          <meshStandardMaterial
            map={djTexture}
            transparent={true}
            roughness={0.3}
            metalness={0.2}
            emissive="#00B4D8"
            emissiveIntensity={0.18}
          />
        </mesh>
        {/* Warm back rim lighting behind DJ */}
        <pointLight position={[0, 1.2, -1.2]} color="#FFA030" intensity={3.5} distance={8} />
      </group>

      {/* 4. Giant Fiery Amber Curved LED Screen (Behind the DJ) */}
      <mesh position={[0, 5.2, -3.5]}>
        <cylinderGeometry args={[12, 12, 7.5, 32, 1, true, -Math.PI / 4, Math.PI / 2]} />
        <meshStandardMaterial
          color="#0B0C10"
          emissive="#00E5FF"
          emissiveIntensity={0.65}
          roughness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. Motorized Stage Moving Head Beam Spotlights */}
      <spotLight
        ref={beam1Ref}
        position={[-6, 8, 2]}
        color="#FFA030"
        intensity={9.0}
        angle={0.4}
        penumbra={0.5}
        distance={28}
        castShadow
      />
      <group ref={cone1Ref} position={[-6, 8, 2]}>
        <mesh position={[0, 0, 8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 3.4, 16, 24, 1, true]} />
          <meshBasicMaterial
            color="#FFA030"
            transparent={true}
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      <spotLight
        ref={beam2Ref}
        position={[6, 8, 2]}
        color="#00E5FF"
        intensity={9.0}
        angle={0.4}
        penumbra={0.5}
        distance={28}
        castShadow
      />
      <group ref={cone2Ref} position={[6, 8, 2]}>
        <mesh position={[0, 0, 8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 3.4, 16, 24, 1, true]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent={true}
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}