"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Text, useTexture } from "@react-three/drei";

interface FlightCaseProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  labelTop: string;
  labelBottom: string;
  size?: [number, number, number];
}

function FlightCase({
  position,
  rotation = [0, 0, 0],
  labelTop,
  labelBottom,
  size = [1.6, 1.1, 1.0],
}: FlightCaseProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main black plywood textured case */}
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.65} metalness={0.25} />
      </mesh>

      {/* Aluminum Edge Extrusions & Corner Brackets */}
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={[size[0] + 0.04, size[1] + 0.04, size[2] + 0.04]} />
        <meshStandardMaterial color="#4a4a55" metalness={0.92} roughness={0.2} wireframe />
      </mesh>

      {/* Recessed Butterfly Latch & Handles */}
      <mesh position={[0, size[1] * 0.5, size[2] / 2 + 0.02]}>
        <boxGeometry args={[0.22, 0.16, 0.02]} />
        <meshStandardMaterial color="#60606e" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Heavy Duty Swivel Casters / Wheels */}
      {[-size[0] / 2 + 0.16, size[0] / 2 - 0.16].map((x, xi) =>
        [-size[2] / 2 + 0.16, size[2] / 2 - 0.16].map((z, zi) => (
          <group key={`${xi}-${zi}`} position={[x, 0.09, z]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.12, 16]} />
              <meshStandardMaterial color="#141416" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[0.12, 0.04, 0.12]} />
              <meshStandardMaterial color="#3a3a42" metalness={0.9} />
            </mesh>
          </group>
        ))
      )}

      {/* Subtle Tour Stencil Text */}
      <group position={[0, size[1] * 0.65, size[2] / 2 + 0.025]}>
        <Text
          position={[0, 0.08, 0]}
          fontSize={0.11}
          color="#d0d0d8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.14}
        >
          {labelTop}
        </Text>
        <Text
          position={[0, -0.08, 0]}
          fontSize={0.09}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.18}
        >
          {labelBottom}
        </Text>
      </group>
    </group>
  );
}

export function BackstageCorridor() {
  const backstageRefTexture = useTexture("/images/backstage_corridor.png");

  return (
    <group position={[0, 0, 52]}>
      {/* 0. Photorealistic Reference Wall Panel at Entrance Arch (Z = 22) */}
      <mesh position={[0, 4.5, 22]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial
          map={backstageRefTexture}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* 1. Dark Industrial Steel & Concrete Corridor Walls */}
      <mesh position={[-6.8, 4.5, 0]}>
        <boxGeometry args={[0.8, 9, 36]} />
        <meshStandardMaterial color="#0e0e12" roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh position={[6.8, 4.5, 0]}>
        <boxGeometry args={[0.8, 9, 36]} />
        <meshStandardMaterial color="#0e0e12" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* 2. Steel I-Beam Vertical Architectural Columns */}
      {[-14, -7, 0, 7, 14].map((z, i) => (
        <group key={i}>
          <mesh position={[-6.3, 4.5, z]}>
            <boxGeometry args={[0.3, 9, 0.6]} />
            <meshStandardMaterial color="#16161c" metalness={0.92} roughness={0.3} />
          </mesh>
          <mesh position={[6.3, 4.5, z]}>
            <boxGeometry args={[0.3, 9, 0.6]} />
            <meshStandardMaterial color="#16161c" metalness={0.92} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 3. Overhead Steel Box Trusses & Hanging Rigging */}
      <group position={[0, 8.2, 0]}>
        <mesh>
          <boxGeometry args={[13.2, 0.5, 36]} />
          <meshStandardMaterial color="#1a1a22" metalness={0.9} roughness={0.35} />
        </mesh>
        {/* Longitudinal pipe cords */}
        {[-3, 0, 3].map((x, xi) => (
          <mesh key={xi} position={[x, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 36, 12]} />
            <meshStandardMaterial color="#2a2a35" metalness={0.95} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 4. Coiled Multicore Audio/Power Cable Snakes on Walls and Floor */}
      {[-10, -2, 6, 14].map((z, i) => (
        <group key={i}>
          {/* Wall cable bundles */}
          <mesh position={[-6.3, 3.2, z]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.55, 0.12, 12, 24]} />
            <meshStandardMaterial color="#0B0C10" roughness={0.9} />
          </mesh>
          <mesh position={[6.3, 3.2, z]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.55, 0.12, 12, 24]} />
            <meshStandardMaterial color="#0B0C10" roughness={0.9} />
          </mesh>

          {/* Floor cable runs along baseboards */}
          <mesh position={[-5.8, 0.05, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 7, 10]} />
            <meshStandardMaterial color="#08080a" roughness={0.85} />
          </mesh>
          <mesh position={[5.8, 0.05, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 7, 10]} />
            <meshStandardMaterial color="#08080a" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* 5. Professional Road Cases (from user reference image) */}
      <FlightCase
        position={[-4.5, 0, 10]}
        rotation={[0, 0.06, 0]}
        labelTop="Dj G-Spark"
        labelBottom="MAIN STAGE"
        size={[2.2, 1.2, 1.1]}
      />
      <FlightCase
        position={[-4.2, 0, 2]}
        rotation={[0, -0.04, 0]}
        labelTop="PIONEER CDJ-3000"
        labelBottom="RACK A // RIG"
        size={[1.9, 1.0, 1.0]}
      />
      <FlightCase
        position={[-4.4, 0, -6]}
        rotation={[0, 0.08, 0]}
        labelTop="Dj G-Spark"
        labelBottom="MAIN STAGE"
        size={[2.1, 1.1, 1.1]}
      />
      <FlightCase
        position={[4.4, 0, 8]}
        rotation={[0, -0.1, 0]}
        labelTop="LIGHTING CONTROL"
        labelBottom="MA3 // NET"
        size={[2.0, 1.2, 1.1]}
      />
      <FlightCase
        position={[4.2, 0, -1]}
        rotation={[0, 0.05, 0]}
        labelTop="Dj G-Spark"
        labelBottom="MAIN STAGE"
        size={[1.9, 1.0, 1.0]}
      />
      <FlightCase
        position={[4.5, 0, -9]}
        rotation={[0, -0.08, 0]}
        labelTop="STAGE PYRO"
        labelBottom="SPARK JETS // M4"
        size={[1.8, 0.9, 1.0]}
      />

      {/* 6. Heavy Stage Subwoofer Cabinets along Corridor */}
      <mesh position={[-4.8, 0.8, -13]}>
        <boxGeometry args={[1.5, 1.6, 1.4]} />
        <meshStandardMaterial color="#09090c" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[4.8, 0.8, -13]}>
        <boxGeometry args={[1.5, 1.6, 1.4]} />
        <meshStandardMaterial color="#09090c" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* 7. Realistic Practical Warm Amber Lights & Spot Fixtures */}
      {[-10, 0, 10].map((z, i) => (
        <group key={i}>
          {/* Left Warm Tube */}
          <mesh position={[-6.3, 6.2, z]}>
            <boxGeometry args={[0.08, 0.12, 2.8]} />
            <meshBasicMaterial color="#FFB050" toneMapped={false} />
          </mesh>
          <pointLight
            position={[-5.6, 6.0, z]}
            color="#FFA030"
            intensity={2.2}
            distance={11}
            decay={2}
          />

          {/* Right Warm Tube */}
          <mesh position={[6.3, 6.2, z]}>
            <boxGeometry args={[0.08, 0.12, 2.8]} />
            <meshBasicMaterial color="#FFB050" toneMapped={false} />
          </mesh>
          <pointLight
            position={[6.3, 6.0, z]}
            color="#FFA030"
            intensity={2.2}
            distance={11}
            decay={2}
          />
        </group>
      ))}

      {/* 8. Concrete Threshold into Entrance Arch */}
      <group position={[0, 0, -18]}>
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[14, 9, 0.6]} />
          <meshStandardMaterial color="#121216" roughness={0.7} />
        </mesh>
        {/* Arch cutout */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[7.5, 6.4, 0.7]} />
          <meshStandardMaterial color="#0B0C10" />
        </mesh>
      </group>
    </group>
  );
}