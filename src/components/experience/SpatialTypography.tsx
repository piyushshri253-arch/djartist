"use client";

import { Text } from "@react-three/drei";
import * as THREE from "three";

export function SpatialTypography() {
  return (
    <group>
      {/* 01: ARRIVAL SPATIAL TEXT */}
      <group position={[0, 2.6, 75]}>
        <Text
          fontSize={1.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          material-toneMapped={false}
        >
          Dj G-spark
        </Text>
        <Text
          position={[0, -0.85, 0]}
          fontSize={0.4}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.25}
          material-toneMapped={false}
        >
          FEEL THE SPARK.
        </Text>
        <Text
          position={[0, -1.35, 0]}
          fontSize={0.22}
          color="#888888"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.3}
          material-toneMapped={false}
        >
          SCROLL TO EXPLORE THE VENUE
        </Text>
      </group>

      {/* 02: BACKSTAGE CORRIDOR WALL TEXT */}
      <group position={[-3.8, 2.6, 58]} rotation={[0, Math.PI / 2.2, 0]}>
        <Text
          fontSize={0.25}
          color="#00E5FF"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.24}
          material-toneMapped={false}
        >
          01 // BACKSTAGE
        </Text>
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.48}
          color="#F5F6FA"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.06}
          maxWidth={6}
          material-toneMapped={false}
        >
          BEHIND EVERY MOMENT IS A SPARK.
        </Text>
        <Text
          position={[0, -1.05, 0]}
          fontSize={0.18}
          color="#666666"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.2}
          material-toneMapped={false}
        >
          ALL-ACCESS CORRIDOR // TOUR PRODUCTION
        </Text>
      </group>

      {/* 03: ENTRANCE RAMP OVERHEAD TEXT */}
      <group position={[0, 5.2, 22]}>
        <Text
          fontSize={0.26}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.28}
          material-toneMapped={false}
        >
          02 // VENUE PORTAL
        </Text>
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.7}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.16}
          material-toneMapped={false}
        >
          ENTER THE SOUND
        </Text>
      </group>

      {/* 04: DJ BOOTH SPATIAL TEXT */}
      <group position={[3.6, 2.8, -7]} rotation={[0, -Math.PI / 2.4, 0]}>
        <Text
          fontSize={0.24}
          color="#00E5FF"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.22}
          material-toneMapped={false}
        >
          03 // THE BOOTH
        </Text>
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.52}
          color="#F5F6FA"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.08}
          maxWidth={6}
          material-toneMapped={false}
        >
          WHERE THE ENERGY BEGINS.
        </Text>
        <Text
          position={[0, -0.95, 0]}
          fontSize={0.18}
          color="#666666"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.22}
          material-toneMapped={false}
        >
          4X CDJ-3000 // DJM-V10 // 140 BPM LIVE
        </Text>
      </group>

      {/* 05: ARTIST FOCUS SPATIAL TEXT */}
      <group position={[-2.8, 3.4, -22]} rotation={[0, Math.PI / 4, 0]}>
        <Text
          fontSize={0.65}
          color="#FFFFFF"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.08}
          material-toneMapped={false}
        >
          Dj G-spark
        </Text>
        <Text
          position={[0, -0.55, 0]}
          fontSize={0.3}
          color="#00E5FF"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.22}
          material-toneMapped={false}
        >
          FEEL THE SPARK.
        </Text>
      </group>

      {/* 07: CROWD REVEAL SPATIAL TEXT */}
      <group position={[0, 6.2, -120]}>
        <Text
          fontSize={0.3}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.28}
          material-toneMapped={false}
        >
          THE ENERGY
        </Text>
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.8}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          material-toneMapped={false}
        >
          ONE ROOM. ONE FREQUENCY.
        </Text>
      </group>

      {/* 10: FINAL ARENA MONUMENTAL SKY TEXT */}
      <group position={[0, 20.0, -255]}>
        <Text
          fontSize={2.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          material-toneMapped={false}
        >
          Dj G-spark
        </Text>
        <Text
          position={[0, -1.6, 0]}
          fontSize={0.85}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.24}
          material-toneMapped={false}
        >
          FEEL THE SPARK. ENTER THE SOUND.
        </Text>
      </group>
    </group>
  );
}
