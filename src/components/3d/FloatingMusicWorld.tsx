"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture, Text } from "@react-three/drei";
import { useAudio } from "@/context/AudioContext";

export function FloatingMusicWorld() {
  const albumTexture = useTexture("/images/album_art.jpg");
  const vinylRef = useRef<THREE.Group>(null);
  const waveGroupRef = useRef<THREE.Group>(null);
  const { isPlaying, togglePlay, currentTrack } = useAudio();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Rotate vinyl if playing
    if (vinylRef.current && isPlaying) {
      vinylRef.current.rotation.z -= 0.02;
    }
    // Animate waveform bars
    if (waveGroupRef.current) {
      waveGroupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const s = isPlaying
            ? Math.abs(Math.sin(t * 5 + i * 0.4)) * 1.8 + 0.2
            : 0.2;
          child.scale.y = s;
        }
      });
    }
  });

  return (
    <group position={[0, 2.8, -95]}>
      {/* 1. Floating Album Cover Card */}
      <group position={[-2.2, 0, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <boxGeometry args={[3.2, 3.2, 0.12]} />
          <meshStandardMaterial
            map={albumTexture}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* 2. Vinyl Record disc peeking out of sleeve */}
      <group ref={vinylRef} position={[-0.4, 0, -0.05]}>
        <mesh>
          <cylinderGeometry args={[1.4, 1.4, 0.02, 48]} />
          <meshStandardMaterial color="#08080a" roughness={0.15} metalness={0.8} />
        </mesh>
        {/* Vinyl Center Label */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.02, 32]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
      </group>

      {/* 3. Right: Track Info Typography & Controls */}
      <group position={[2.4, 0, 0]}>
        <Text
          position={[0, 1.1, 0]}
          fontSize={0.22}
          color="#8A8D93"
          anchorX="left"
          letterSpacing={0.16}
        >
          FEATURED ANTHEM
        </Text>

        <Text
          position={[0, 0.65, 0]}
          fontSize={0.52}
          font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb54C_k3HqUtEw.woff"
          color="#F5F6FA"
          anchorX="left"
          letterSpacing={0.06}
        >
          {currentTrack ? currentTrack.title : "FEEL THE SPARK"}
        </Text>

        <Text
          position={[0, 0.2, 0]}
          fontSize={0.24}
          color="#00B4D8"
          anchorX="left"
          letterSpacing={0.12}
        >
          Dj G-Spark • 135 BPM • F MINOR
        </Text>

        {/* Interactive Play Button Ring */}
        <group
          position={[0.5, -0.6, 0]}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <mesh>
            <circleGeometry args={[0.45, 32]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.26} color="#FFFFFF">
            {isPlaying ? "❚❚" : "▶"}
          </Text>
        </group>

        {/* Animated Waveform Visualizer Bars */}
        <group ref={waveGroupRef} position={[1.4, -0.6, 0]}>
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh key={i} position={[i * 0.16, 0, 0]}>
              <boxGeometry args={[0.08, 0.7, 0.05]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#00B4D8" : "#FFA020"} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}