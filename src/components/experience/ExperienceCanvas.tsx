"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { Venue } from "./Venue";
import { ArenaGates } from "./ArenaGates";
import { StandingBanners } from "./StandingBanners";
import { GalleryAndAboutWall } from "./GalleryAndAboutWall";
import { DJBooth } from "./DJBooth";
import { ArtistFocus } from "./ArtistFocus";
import { ArenaStage } from "./ArenaStage";
import { Atmosphere } from "./Atmosphere";

interface ExperienceCanvasProps {
  progress: number;
}

export function ExperienceCanvas({ progress }: ExperienceCanvasProps) {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden pointer-events-auto cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 2.0, 104], fov: 46, near: 0.1, far: 380 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
      >
        {/* Deep concert darkness with volumetric fog */}
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 25, 220]} />

        {/* Camera Trajectory Rig (Driven by scroll progress 0.0 -> 1.0) */}
        <CameraRig progress={progress} />

        {/* Full-World Continuous 3D Spatial Architecture */}
        <Suspense fallback={null}>
          {/* 1. Global Venue Structure: 520m floor, steel columns, overhead trusses */}
          <Venue />

          {/* 2. Entrance: Monumental Arch, swinging gates & 3D VIP guide walker */}
          <ArenaGates progress={progress} />

          {/* 3. Entrance Foyer: Physical standing vertical concert banners (Delhi, Mumbai, Goa, Dubai) */}
          <StandingBanners />

          {/* 4. Corridor: Left wall framed festival photos + Right wall "About DJ G Spark" bio plaques */}
          <GalleryAndAboutWall />

          {/* 5. Stage Deck: Pioneer CDJ-3000s, DJM-V10 mixer, live VU meters & sweeping beams */}
          <DJBooth />

          {/* 6. Performer Focus: DJ G Spark live performance silhouette with rim lighting */}
          <ArtistFocus />

          {/* 7. Stadium Climax: 40k crowd amphitheater, rotating halo truss, cryogenic spark jets */}
          <ArenaStage />

          {/* 8. Atmosphere: Floating amber spark embers and concert haze */}
          <Atmosphere />
        </Suspense>
      </Canvas>
    </div>
  );
}
