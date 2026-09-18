"use client";

import * as THREE from "three";
import { Text } from "@react-three/drei";

interface ArticleCardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  category: string;
  title: string;
  readTime: string;
}

function ArticleCard({ position, rotation = [0, 0, 0], category, title, readTime }: ArticleCardProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dark Slate Editorial Card */}
      <mesh>
        <boxGeometry args={[4.2, 2.5, 0.08]} />
        <meshStandardMaterial color="#0f0f14" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Subtle Rim border */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[4.24, 2.54, 0.02]} />
        <meshBasicMaterial color="#2d2d38" wireframe />
      </mesh>

      {/* Category */}
      <Text position={[-1.7, 0.85, 0.06]} fontSize={0.16} color="#00E5FF" anchorX="left" letterSpacing={0.14}>
        {category} • {readTime}
      </Text>

      {/* Article Title */}
      <Text
        position={[-1.7, 0.15, 0.06]}
        fontSize={0.32}
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb54C_k3HqUtEw.woff"
        color="#F5F6FA"
        anchorX="left"
        maxWidth={3.5}
        lineHeight={1.2}
      >
        {title}
      </Text>

      {/* Action */}
      <Text position={[-1.7, -0.85, 0.06]} fontSize={0.18} color="#00B4D8" anchorX="left" letterSpacing={0.12}>
        READ DISPATCH &rarr;
      </Text>
    </group>
  );
}

export function BlogRoom3D() {
  return (
    <group position={[0, 2.5, -135]}>
      {/* Header */}
      <group position={[0, 3.4, 4]}>
        <Text fontSize={0.22} color="#00B4D8" anchorX="center" letterSpacing={0.2}>
          CHAPTER 08 • EDITORIAL & DISPATCHES
        </Text>
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.82}
          font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb54C_k3HqUtEw.woff"
          color="#F5F6FA"
          anchorX="center"
          letterSpacing={0.1}
        >
          STUDIO CHRONICLES
        </Text>
      </group>

      {/* Article Cards in 3D Space */}
      <ArticleCard
        position={[-3.2, 0, 1]}
        rotation={[0, 0.18, 0]}
        category="BEHIND THE SCENES"
        readTime="5 MIN READ"
        title="Engineering The 100,000W Cardioid Sub Array"
      />

      <ArticleCard
        position={[3.2, 0, -3]}
        rotation={[0, -0.18, 0]}
        category="MUSIC PRODUCTION"
        readTime="7 MIN READ"
        title="Programming The Analog Modular Synths of Spark Theory"
      />

      <ArticleCard
        position={[-3.0, 0, -7]}
        rotation={[0, 0.18, 0]}
        category="DJ LIFE"
        readTime="4 MIN READ"
        title="Inside The Custom Touring Flight Cases & Telemetry"
      />
    </group>
  );
}