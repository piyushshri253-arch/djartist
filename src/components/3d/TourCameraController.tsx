"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface Waypoint {
  progress: number;
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
}

interface TourCameraControllerProps {
  progress: number; // 0.0 to 1.0 from scroll
}

export function TourCameraController({ progress }: TourCameraControllerProps) {
  const { camera } = useThree();

  const waypoints = useMemo<Waypoint[]>(() => [
    {
      // 0.00: Black intro / darkness threshold
      progress: 0.00,
      pos: new THREE.Vector3(0, 2.0, 95),
      lookAt: new THREE.Vector3(0, 2.0, 70),
      fov: 46,
    },
    {
      // 0.10: Backstage industrial corridor
      progress: 0.10,
      pos: new THREE.Vector3(0, 2.2, 65),
      lookAt: new THREE.Vector3(0, 2.2, 35),
      fov: 50,
    },
    {
      // 0.20: Sloped entrance ramp & glowing SPARK archway
      progress: 0.20,
      pos: new THREE.Vector3(0, 2.0, 28),
      lookAt: new THREE.Vector3(0, 2.4, -5),
      fov: 52,
    },
    {
      // 0.32: Center DJ Booth approach
      progress: 0.32,
      pos: new THREE.Vector3(0, 2.2, -5),
      lookAt: new THREE.Vector3(0, 2.2, -26),
      fov: 50,
    },
    {
      // 0.45: Artist Orbit (low-angle side profile looking at performer)
      progress: 0.45,
      pos: new THREE.Vector3(4.8, 2.8, -20),
      lookAt: new THREE.Vector3(0, 2.2, -25),
      fov: 48,
    },
    {
      // 0.55: LED Wall Monolith pass-through
      progress: 0.55,
      pos: new THREE.Vector3(0, 2.6, -44),
      lookAt: new THREE.Vector3(0, 2.6, -75),
      fov: 62,
    },
    {
      // 0.67: Music Chamber (vinyl & waveform bars)
      progress: 0.67,
      pos: new THREE.Vector3(0, 2.8, -80),
      lookAt: new THREE.Vector3(0, 2.6, -110),
      fov: 50,
    },
    {
      // 0.77: Tour Corridor (floating 3D tour billboards)
      progress: 0.77,
      pos: new THREE.Vector3(0, 2.4, -120),
      lookAt: new THREE.Vector3(0, 2.4, -150),
      fov: 52,
    },
    {
      // 0.88: Memory Gallery (museum framed prints)
      progress: 0.88,
      pos: new THREE.Vector3(0, 2.2, -155),
      lookAt: new THREE.Vector3(0, 2.2, -180),
      fov: 50,
    },
    {
      // 1.00: Final Massive Concert Arena reveal
      progress: 1.00,
      pos: new THREE.Vector3(0, 14.0, -188),
      lookAt: new THREE.Vector3(0, 3.0, -235),
      fov: 58,
    },
  ], []);

  const currentLookAt = useRef(new THREE.Vector3(0, 2.0, 85));
  const targetPos = useRef(new THREE.Vector3(0, 2.0, 120));
  const targetLookAt = useRef(new THREE.Vector3(0, 2.0, 85));
  const targetFov = useRef(48);
  const mouseOffset = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Find the two surrounding waypoints
    let p1 = waypoints[0];
    let p2 = waypoints[waypoints.length - 1];

    for (let i = 0; i < waypoints.length - 1; i++) {
      if (
        clampedProgress >= waypoints[i].progress &&
        clampedProgress <= waypoints[i + 1].progress
      ) {
        p1 = waypoints[i];
        p2 = waypoints[i + 1];
        break;
      }
    }

    const span = p2.progress - p1.progress || 0.001;
    const factor = (clampedProgress - p1.progress) / span;
    // Smooth easing factor for believable deceleration
    const easedFactor = factor < 0.5
      ? 2 * factor * factor
      : 1 - Math.pow(-2 * factor + 2, 2) / 2;

    // Interpolate targets
    targetPos.current.lerpVectors(p1.pos, p2.pos, easedFactor);
    targetLookAt.current.lerpVectors(p1.lookAt, p2.lookAt, easedFactor);
    targetFov.current = THREE.MathUtils.lerp(p1.fov, p2.fov, easedFactor);

    // Dynamic mouse parallax tracking (interactive 3D inertia)
    const mouseLerp = Math.min(1, delta * 3.5);
    mouseOffset.current.x += (state.pointer.x * 0.75 - mouseOffset.current.x) * mouseLerp;
    mouseOffset.current.y += (state.pointer.y * 0.45 - mouseOffset.current.y) * mouseLerp;

    // Add subtle cinematic handheld breathe
    const time = state.clock.elapsedTime;
    const breatheX = Math.sin(time * 0.8) * 0.04;
    const breatheY = Math.cos(time * 1.1) * 0.03;

    // Smooth lerp camera towards targets
    const lerpSpeed = Math.min(1, delta * 5.0);
    camera.position.x += (targetPos.current.x + breatheX + mouseOffset.current.x * 0.6 - camera.position.x) * lerpSpeed;
    camera.position.y += (targetPos.current.y + breatheY + mouseOffset.current.y * 0.4 - camera.position.y) * lerpSpeed;
    camera.position.z += (targetPos.current.z - camera.position.z) * lerpSpeed;

    currentLookAt.current.x += (targetLookAt.current.x + mouseOffset.current.x * 1.8 - currentLookAt.current.x) * lerpSpeed;
    currentLookAt.current.y += (targetLookAt.current.y + mouseOffset.current.y * 1.2 - currentLookAt.current.y) * lerpSpeed;
    currentLookAt.current.z += (targetLookAt.current.z - currentLookAt.current.z) * lerpSpeed;

    camera.lookAt(currentLookAt.current);

    // Subtle natural camera banking / roll
    camera.rotation.z += (-mouseOffset.current.x * 0.025 - camera.rotation.z) * lerpSpeed;

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov += (targetFov.current - camera.fov) * lerpSpeed;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}