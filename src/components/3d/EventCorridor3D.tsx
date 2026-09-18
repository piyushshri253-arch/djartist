"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface EventBillboardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  city: string;
  venue: string;
  date: string;
  status: string;
}

function EventBillboard({ position, rotation = [0, 0, 0], city, venue, date, status }: EventBillboardProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Translucent Glass Card */}
      <mesh>
        <boxGeometry args={[4.4, 2.6, 0.08]} />
        <meshStandardMaterial
          color="#121218"
          roughness={0.15}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Amber Glowing Edge Border */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[4.44, 2.64, 0.02]} />
        <meshBasicMaterial color="#FF6A00" wireframe />
      </mesh>

      {/* Date Pill */}
      <group position={[-1.4, 0.8, 0.06]}>
        <Text fontSize={0.16} color="#FFA020" anchorX="center" letterSpacing={0.14}>
          {date}
        </Text>
      </group>

      {/* Status Badge */}
      <group position={[1.4, 0.8, 0.06]}>
        <Text fontSize={0.14} color="#00FF88" anchorX="center" letterSpacing={0.1}>
          {status}
        </Text>
      </group>

      {/* City Title */}
      <Text
        position={[0, 0.15, 0.06]}
        fontSize={0.62}
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb54C_k3HqUtEw.woff"
        color="#F4F1EA"
        anchorX="center"
        letterSpacing={0.1}
      >
        {city}
      </Text>

      {/* Venue Subtitle */}
      <Text
        position={[0, -0.45, 0.06]}
        fontSize={0.2}
        color="#969696"
        anchorX="center"
        letterSpacing={0.08}
      >
        {venue}
      </Text>

      {/* CTA Label */}
      <Text
        position={[0, -0.85, 0.06]}
        fontSize={0.18}
        color="#FF8400"
        anchorX="center"
        letterSpacing={0.14}
      >
        EXPLORE TICKETS &rarr;
      </Text>
    </group>
  );
}

export function EventCorridor3D() {
  return (
    <group position={[0, 2.5, -135]}>
      {/* Section Title Floating Overhead */}
      <group position={[0, 3.8, 8]}>
        <Text
          fontSize={0.24}
          color="#FF8400"
          anchorX="center"
          letterSpacing={0.2}
        >
          CHAPTER 06 • GLOBAL ARENA CIRCUIT
        </Text>
        <Text
          position={[0, -0.55, 0]}
          fontSize={0.88}
          font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb54C_k3HqUtEw.woff"
          color="#F4F1EA"
          anchorX="center"
          letterSpacing={0.1}
        >
          UPCOMING TOUR DATES
        </Text>
      </group>

      {/* Staggered Event Billboards */}
      <EventBillboard
        position={[-3.8, 0, 4]}
        rotation={[0, 0.22, 0]}
        city="NEW DELHI"
        venue="JLN Stadium Arena • 35,000 Capacity"
        date="18 OCT 2026"
        status="SELLING FAST"
      />

      <EventBillboard
        position={[3.8, 0, 0]}
        rotation={[0, -0.22, 0]}
        city="MUMBAI"
        venue="Dome NSCI Arena • Waterfront 360°"
        date="29 OCT 2026"
        status="LIMITED VIP"
      />

      <EventBillboard
        position={[-3.6, 0, -5]}
        rotation={[0, 0.22, 0]}
        city="GOA"
        venue="Sunburn Beach Stage • Vagator"
        date="31 DEC 2026"
        status="NYE HEADLINE"
      />

      <EventBillboard
        position={[3.6, 0, -9]}
        rotation={[0, -0.22, 0]}
        city="DUBAI"
        venue="Coca-Cola Arena • Kinetic Rig"
        date="14 NOV 2026"
        status="ALLOCATION 90%"
      />
    </group>
  );
}