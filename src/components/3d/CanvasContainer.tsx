"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { TourCameraController } from "./TourCameraController";
import { VenueEnvironment } from "./VenueEnvironment";
import { EntrancePortal } from "./EntrancePortal";
import { BackstageCorridor } from "./BackstageCorridor";
import { DjBoothStage } from "./DjBoothStage";
import { LedWallPortal } from "./LedWallPortal";
import { FloatingMusicWorld } from "./FloatingMusicWorld";
import { EventCorridor3D } from "./EventCorridor3D";
import { PastGallery3D } from "./PastGallery3D";
import { BlogRoom3D } from "./BlogRoom3D";
import { FinalArenaStage } from "./FinalArenaStage";
import { EmberParticles } from "./EmberParticles";

interface CanvasContainerProps {
  progress: number;
}

export function CanvasContainer({ progress }: CanvasContainerProps) {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto z-0 bg-[#050505]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 2, 95], fov: 46, near: 0.1, far: 500 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 35, 260]} />

        <Suspense fallback={null}>
          {/* Scroll-Driven Camera Controller */}
          <TourCameraController progress={progress} />

          {/* Environmental Base Lighting & Concrete Architecture */}
          <VenueEnvironment />

          {/* Floating Embers & Stardust Particles */}
          <EmberParticles count={500} />

          {/* Waypoint 0.10: Backstage Equipment Corridor */}
          <BackstageCorridor />

          {/* Waypoint 0.20: Entrance Ramp & Glowing SPARK Archway */}
          <EntrancePortal />

          {/* Waypoint 0.32 & 0.45: DJ Booth & Performer Orbit */}
          <DjBoothStage />

          {/* Waypoint 0.55: LED Wall Portal (Fly-through) */}
          <LedWallPortal />

          {/* Waypoint 0.67: Floating Music World */}
          <FloatingMusicWorld />

          {/* Waypoint 0.77: Event Corridor */}
          <EventCorridor3D />

          {/* Waypoint 0.88: Past Events Gallery */}
          <PastGallery3D />

          {/* Waypoint 0.94: Blog Room */}
          <BlogRoom3D />

          {/* Waypoint 1.00: Final Massive Concert Arena Reveal */}
          <FinalArenaStage />
        </Suspense>
      </Canvas>
    </div>
  );
}