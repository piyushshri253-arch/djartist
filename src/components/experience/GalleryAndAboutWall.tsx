"use client";

import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";

export function GalleryAndAboutWall() {
  // Left wall: festival history photographs
  const sunburnPic = useTexture("/images/past_event_crowd.jpg");
  const tomorrowlandPic = useTexture("/images/past_event_sunset.jpg");
  const stagePic = useTexture("/images/dj_spark_stage.jpg");
  const albumPic = useTexture("/images/album_art.jpg");

  // Right wall: artist biography and journey photographs
  const djHeroPic = useTexture("/images/dj_hero.jpg");
  const arenaCrowdPic = useTexture("/images/arena_crowd_pro.jpg");
  const djPerformingPic = useTexture("/images/dj_performing.jpg");
  const worldTourPic = useTexture("/images/world_tour_stage.jpg");

  return (
    <group>
      {/* ============================================================ */}
      {/* 1. LEFT WALL: HISTORIC FESTIVAL PHOTO EXHIBITS (X: -5.6)     */}
      {/* ============================================================ */}
      <group position={[-5.6, 2.8, 0]}>
        {/* Exhibit 1: Sunburn Goa 55k (Z: 18) */}
        <group position={[0, 0, 18]} rotation={[0, Math.PI / 2, 0]}>
          {/* Heavy Beveled Steel Wall Frame */}
          <mesh castShadow>
            <boxGeometry args={[4.8, 3.2, 0.14]} />
            <meshStandardMaterial color="#0b0b0f" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Backlit Glowing Inset Border */}
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[4.55, 2.95, 0.01]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>
          {/* Photograph Texture */}
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[4.4, 2.8]} />
            <meshBasicMaterial map={sunburnPic} toneMapped={false} />
          </mesh>
          {/* Stenciled Brass Wall Nameplate */}
          <group position={[0, -1.85, 0.05]}>
            <mesh>
              <boxGeometry args={[4.2, 0.42, 0.04]} />
              <meshStandardMaterial color="#1a1a22" roughness={0.3} metalness={0.9} />
            </mesh>
            <Text
              position={[0, 0.02, 0.03]}
              fontSize={0.14}
              color="#00B4D8"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.22}
              material-toneMapped={false}
            >
              SUNBURN GOA FESTIVAL // 55,000 HEADLINER SET
            </Text>
          </group>
          <pointLight color="#FFE0B0" intensity={2.5} distance={6} position={[0, 2.2, 1.2]} />
        </group>

        {/* Exhibit 2: Tomorrowland Sunset Anthem (Z: 7) */}
        <group position={[0, 0, 7]} rotation={[0, Math.PI / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[4.8, 3.2, 0.14]} />
            <meshStandardMaterial color="#0b0b0f" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[4.55, 2.95, 0.01]} />
            <meshBasicMaterial color="#9955FF" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[4.4, 2.8]} />
            <meshBasicMaterial map={tomorrowlandPic} toneMapped={false} />
          </mesh>
          <group position={[0, -1.85, 0.05]}>
            <mesh>
              <boxGeometry args={[4.2, 0.42, 0.04]} />
              <meshStandardMaterial color="#1a1a22" roughness={0.3} metalness={0.9} />
            </mesh>
            <Text
              position={[0, 0.02, 0.03]}
              fontSize={0.14}
              color="#C4A8FF"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.22}
              material-toneMapped={false}
            >
              TOMORROWLAND MAINSTAGE // SUNSET ARENA EUPHORIA
            </Text>
          </group>
          <pointLight color="#FFE0B0" intensity={2.5} distance={6} position={[0, 2.2, 1.2]} />
        </group>

        {/* Exhibit 3: Live Headline Arena Pyro (Z: -4) */}
        <group position={[0, 0, -4]} rotation={[0, Math.PI / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[4.8, 3.2, 0.14]} />
            <meshStandardMaterial color="#0b0b0f" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[4.55, 2.95, 0.01]} />
            <meshBasicMaterial color="#FF7700" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[4.4, 2.8]} />
            <meshBasicMaterial map={stagePic} toneMapped={false} />
          </mesh>
          <group position={[0, -1.85, 0.05]}>
            <mesh>
              <boxGeometry args={[4.2, 0.42, 0.04]} />
              <meshStandardMaterial color="#1a1a22" roughness={0.3} metalness={0.9} />
            </mesh>
            <Text
              position={[0, 0.02, 0.03]}
              fontSize={0.14}
              color="#FFA030"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.22}
              material-toneMapped={false}
            >
              WORLD TOUR HEADLINE ARENA // LIVE DECK PYRO
            </Text>
          </group>
          <pointLight color="#FFA030" intensity={2.5} distance={6} position={[0, 2.2, 1.2]} />
        </group>

        {/* Exhibit 4: Gold Record Album Art (Z: -15) */}
        <group position={[0, 0, -15]} rotation={[0, Math.PI / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[4.8, 3.2, 0.14]} />
            <meshStandardMaterial color="#0b0b0f" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[4.55, 2.95, 0.01]} />
            <meshBasicMaterial color="#FFB030" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[4.4, 2.8]} />
            <meshBasicMaterial map={albumPic} toneMapped={false} />
          </mesh>
          <group position={[0, -1.85, 0.05]}>
            <mesh>
              <boxGeometry args={[4.2, 0.42, 0.04]} />
              <meshStandardMaterial color="#1a1a22" roughness={0.3} metalness={0.9} />
            </mesh>
            <Text
              position={[0, 0.02, 0.03]}
              fontSize={0.14}
              color="#FFB030"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.22}
              material-toneMapped={false}
            >
              SPARK THEORY // 50M+ STREAMS // GOLD CERTIFIED
            </Text>
          </group>
          <pointLight color="#FFE0B0" intensity={2.5} distance={6} position={[0, 2.2, 1.2]} />
        </group>
      </group>

      {/* ============================================================ */}
      {/* 2. RIGHT WALL: BIOGRAPHY & JOURNEY EXHIBITS (X: +5.6)         */}
      {/* ============================================================ */}
      <group position={[5.6, 2.8, 0]}>
        {/* Exhibit 1: Artist Portrait & Bio (Z: 18) */}
        <group position={[0, 0, 18]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[5.2, 3.2, 0.1]} />
            <meshStandardMaterial color="#07070b" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <boxGeometry args={[5.05, 3.05, 0.01]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>

          {/* Left Side: Photo of Dj G-spark */}
          <mesh position={[-1.45, 0, 0.065]}>
            <planeGeometry args={[2.0, 2.8]} />
            <meshBasicMaterial map={djHeroPic} toneMapped={false} />
          </mesh>

          {/* Right Side: Illuminated Bio Plaque */}
          <group position={[0.7, 0, 0.07]}>
            <Text
              position={[0, 1.05, 0]}
              fontSize={0.13}
              color="#00E5FF"
              anchorX="left"
              letterSpacing={0.2}
              material-toneMapped={false}
            >
              ARTIST IDENTITY // 2026
            </Text>
            <Text
              position={[0, 0.65, 0]}
              fontSize={0.36}
              color="#FFFFFF"
              anchorX="left"
              letterSpacing={0.08}
              material-toneMapped={false}
            >
              Dj G-spark
            </Text>
            <Text
              position={[0, 0.28, 0]}
              fontSize={0.14}
              color="#FFA030"
              anchorX="left"
              letterSpacing={0.12}
              material-toneMapped={false}
            >
              HYBRID MELODIC TECHNO & EDM
            </Text>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.14}
              color="#CCCCCC"
              anchorX="left"
              maxWidth={2.5}
              lineHeight={1.4}
              letterSpacing={0.04}
              material-toneMapped={false}
            >
              Renowned for transcendent melodic builds and earth-shaking basslines that command the world&apos;s largest festival mainstages.
            </Text>
          </group>
          <pointLight color="#00B4D8" intensity={2.5} distance={6} position={[0, 1.8, 1.2]} />
        </group>

        {/* Exhibit 2: Stadium Arena Photo & Track Record (Z: 7) */}
        <group position={[0, 0, 7]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[5.2, 3.2, 0.1]} />
            <meshStandardMaterial color="#07070b" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <boxGeometry args={[5.05, 3.05, 0.01]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>

          {/* Left Side: Stadium Crowd Photo */}
          <mesh position={[-1.45, 0, 0.065]}>
            <planeGeometry args={[2.0, 2.8]} />
            <meshBasicMaterial map={arenaCrowdPic} toneMapped={false} />
          </mesh>

          {/* Right Side: Track Record Info */}
          <group position={[0.7, 0, 0.07]}>
            <Text
              position={[0, 1.05, 0]}
              fontSize={0.13}
              color="#00E5FF"
              anchorX="left"
              letterSpacing={0.2}
              material-toneMapped={false}
            >
              GLOBAL MILESTONE
            </Text>
            <Text
              position={[0, 0.65, 0]}
              fontSize={0.34}
              color="#FFFFFF"
              anchorX="left"
              letterSpacing={0.08}
              material-toneMapped={false}
            >
              240,000+ FANS
            </Text>
            <Text
              position={[0, 0.28, 0]}
              fontSize={0.14}
              color="#FFA030"
              anchorX="left"
              letterSpacing={0.12}
              material-toneMapped={false}
            >
              18 COUNTRIES // 4 CONTINENTS
            </Text>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.14}
              color="#CCCCCC"
              anchorX="left"
              maxWidth={2.5}
              lineHeight={1.4}
              letterSpacing={0.04}
              material-toneMapped={false}
            >
              From sun-drenched beach festivals in Goa to cavernous 40,000-seat arenas in Dubai and Mumbai, creating unforgettable sensory spectacles.
            </Text>
          </group>
          <pointLight color="#00B4D8" intensity={2.5} distance={6} position={[0, 1.8, 1.2]} />
        </group>

        {/* Exhibit 3: DJ Mixing Photo & Live Performance Craft (Z: -4) */}
        <group position={[0, 0, -4]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[5.2, 3.2, 0.1]} />
            <meshStandardMaterial color="#07070b" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <boxGeometry args={[5.05, 3.05, 0.01]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>

          {/* Left Side: DJ on Decks Photo */}
          <mesh position={[-1.45, 0, 0.065]}>
            <planeGeometry args={[2.0, 2.8]} />
            <meshBasicMaterial map={djPerformingPic} toneMapped={false} />
          </mesh>

          {/* Right Side: Live Craft */}
          <group position={[0.7, 0, 0.07]}>
            <Text
              position={[0, 1.05, 0]}
              fontSize={0.13}
              color="#00E5FF"
              anchorX="left"
              letterSpacing={0.2}
              material-toneMapped={false}
            >
              LIVE PRODUCTION
            </Text>
            <Text
              position={[0, 0.65, 0]}
              fontSize={0.32}
              color="#FFFFFF"
              anchorX="left"
              letterSpacing={0.08}
              material-toneMapped={false}
            >
              THE LIVE CRAFT
            </Text>
            <Text
              position={[0, 0.28, 0]}
              fontSize={0.14}
              color="#FFA030"
              anchorX="left"
              letterSpacing={0.12}
              material-toneMapped={false}
            >
              PIONEER CDJ-3000 • 4-DECK HYBRID
            </Text>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.14}
              color="#CCCCCC"
              anchorX="left"
              maxWidth={2.5}
              lineHeight={1.4}
              letterSpacing={0.04}
              material-toneMapped={false}
            >
              Every set is 100% live hardware mixing, live re-sampling, and custom SMPTE timecode laser synchronization engineered for peak intensity.
            </Text>
          </group>
          <pointLight color="#00B4D8" intensity={2.5} distance={6} position={[0, 1.8, 1.2]} />
        </group>

        {/* Exhibit 4: World Tour Stage & Sonic Philosophy (Z: -15) */}
        <group position={[0, 0, -15]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[5.2, 3.2, 0.1]} />
            <meshStandardMaterial color="#07070b" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <boxGeometry args={[5.05, 3.05, 0.01]} />
            <meshBasicMaterial color="#00E5FF" toneMapped={false} />
          </mesh>

          {/* Left Side: World Tour Stage Visual */}
          <mesh position={[-1.45, 0, 0.065]}>
            <planeGeometry args={[2.0, 2.8]} />
            <meshBasicMaterial map={worldTourPic} toneMapped={false} />
          </mesh>

          {/* Right Side: Philosophy Quote */}
          <group position={[0.7, 0, 0.07]}>
            <Text
              position={[0, 1.05, 0]}
              fontSize={0.13}
              color="#00E5FF"
              anchorX="left"
              letterSpacing={0.2}
              material-toneMapped={false}
            >
              SONIC PHILOSOPHY
            </Text>
            <Text
              position={[0, 0.65, 0]}
              fontSize={0.32}
              color="#FFFFFF"
              anchorX="left"
              letterSpacing={0.08}
              material-toneMapped={false}
            >
              FEEL THE SPARK
            </Text>
            <Text
              position={[0, 0.28, 0]}
              fontSize={0.14}
              color="#FFA030"
              anchorX="left"
              letterSpacing={0.12}
              material-toneMapped={false}
            >
              ENTER THE SOUND
            </Text>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.14}
              color="#CCCCCC"
              anchorX="left"
              maxWidth={2.5}
              lineHeight={1.4}
              letterSpacing={0.04}
              material-toneMapped={false}
            >
              &quot;Music is not just heard — it is felt. When the drop hits, forty thousand strangers breathe as one unified frequency.&quot;
            </Text>
          </group>
          <pointLight color="#00B4D8" intensity={2.5} distance={6} position={[0, 1.8, 1.2]} />
        </group>
      </group>
    </group>
  );
}
