import * as THREE from "three";

export interface CameraWaypoint {
  progress: number;
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
  roll?: number; // Subtle camera banking
  zone: string;
}

export const EXPERIENCE_PATH: CameraWaypoint[] = [
  {
    // 01: ARRIVAL OUTSIDE GATES (0% - 7%)
    progress: 0.00,
    pos: new THREE.Vector3(0, 2.0, 104),
    lookAt: new THREE.Vector3(0, 2.1, 75),
    fov: 46,
    zone: "VENUE PORTAL",
  },
  {
    // 02: GATE APPROACH & SWING (7% - 14%)
    progress: 0.07,
    pos: new THREE.Vector3(0, 2.0, 94),
    lookAt: new THREE.Vector3(0, 2.1, 70),
    fov: 48,
    zone: "GATE ENTRY",
  },
  {
    // 03: CROSSING THE THRESHOLD (14% - 21%)
    progress: 0.14,
    pos: new THREE.Vector3(0, 2.0, 83),
    lookAt: new THREE.Vector3(0, 2.0, 56),
    fov: 50,
    zone: "VIP FOYER",
  },
  {
    // 04: STANDING BANNER // DELHI (21% - 28%)
    progress: 0.22,
    pos: new THREE.Vector3(-0.5, 2.0, 68),
    lookAt: new THREE.Vector3(-1.4, 1.8, 64),
    fov: 50,
    roll: -0.015,
    zone: "TOUR: DELHI",
  },
  {
    // 05: STANDING BANNER // MUMBAI (28% - 35%)
    progress: 0.30,
    pos: new THREE.Vector3(0.5, 2.0, 54),
    lookAt: new THREE.Vector3(1.4, 1.8, 54),
    fov: 50,
    roll: 0.015,
    zone: "TOUR: MUMBAI",
  },
  {
    // 06: STANDING BANNERS // GOA & DUBAI (35% - 42%)
    progress: 0.38,
    pos: new THREE.Vector3(-0.3, 2.0, 42),
    lookAt: new THREE.Vector3(-1.0, 1.8, 40),
    fov: 52,
    zone: "TOUR: GOA & DUBAI",
  },
  {
    // 07: GALLERY CORRIDOR ENTRY (42% - 50%)
    progress: 0.46,
    pos: new THREE.Vector3(0, 2.05, 28),
    lookAt: new THREE.Vector3(0, 2.1, 10),
    fov: 52,
    zone: "GALLERY CORRIDOR",
  },
  {
    // 08: GALLERY: SUNBURN GOA & ABOUT Dj G-Spark (50% - 58%)
    progress: 0.54,
    pos: new THREE.Vector3(-0.5, 2.1, 16),
    lookAt: new THREE.Vector3(-2.6, 2.3, 16),
    fov: 48,
    roll: -0.01,
    zone: "ARCHIVES // SUNBURN",
  },
  {
    // 09: GALLERY: SUNBURN & GRAND ARENAS (58% - 66%)
    progress: 0.62,
    pos: new THREE.Vector3(0.5, 2.1, 4),
    lookAt: new THREE.Vector3(2.6, 2.3, 4),
    fov: 48,
    roll: 0.01,
    zone: "ABOUT // 15+ YEARS",
  },
  {
    // 10: GALLERY: GOLD RECORD & PHILOSOPHY (66% - 73%)
    progress: 0.70,
    pos: new THREE.Vector3(0, 2.1, -7),
    lookAt: new THREE.Vector3(-2.2, 2.3, -7),
    fov: 50,
    zone: "PHILOSOPHY // SPARK",
  },
  {
    // 11: DJ BOOTH COMMAND DECK (73% - 81%)
    progress: 0.78,
    pos: new THREE.Vector3(0, 2.15, -16),
    lookAt: new THREE.Vector3(0, 2.1, -26),
    fov: 52,
    zone: "DJ BOOTH // CDJ-3000",
  },
  {
    // 12: ARTIST FOCUS & LASER INTENSITY (81% - 88%)
    progress: 0.85,
    pos: new THREE.Vector3(1.2, 2.35, -22),
    lookAt: new THREE.Vector3(0, 2.1, -26),
    fov: 52,
    roll: 0.015,
    zone: "ARTIST FOCUS",
  },
  {
    // 13: STAGE ASCENT & PYRO JET LAUNCH (88% - 94%)
    progress: 0.92,
    pos: new THREE.Vector3(0, 5.2, -30),
    lookAt: new THREE.Vector3(0, 3.2, -60),
    fov: 58,
    zone: "PYRO SPARKS",
  },
  {
    // 14: COLOSSAL STADIUM ARENA CLIMAX (94% - 100%)
    progress: 1.00,
    pos: new THREE.Vector3(0, 14.0, -48),
    lookAt: new THREE.Vector3(0, 3.5, -95),
    fov: 65,
    zone: "ARENA CLIMAX",
  },
];
