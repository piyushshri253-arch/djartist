"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EXPERIENCE_PATH } from "@/data/experiencePath";

interface CameraRigProps {
  progress: number;
}

export function CameraRig({ progress }: CameraRigProps) {
  const { camera } = useThree();

  // Create smooth continuous 3D Catmull-Rom splines through the venue waypoints
  const pathCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      EXPERIENCE_PATH.map((p) => p.pos),
      false,
      "centripetal",
      0.25
    );
  }, []);

  const lookAtCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      EXPERIENCE_PATH.map((p) => p.lookAt),
      false,
      "centripetal",
      0.25
    );
  }, []);

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const baseFwd = useRef(new THREE.Vector3());
  const lookDir = useRef(new THREE.Vector3());
  const finalLookTarget = useRef(new THREE.Vector3());
  const mouseOffset = useRef({ x: 0, y: 0 });

  // 360-degree free look drag orientation
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const targetDragYaw = useRef(0);
  const currentDragYaw = useRef(0);
  const targetDragPitch = useRef(0);
  const currentDragPitch = useRef(0);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Ignore clicks on buttons, links, inputs
      const target = e.target as HTMLElement | null;
      if (target && target.closest("button, a, input, textarea")) {
        return;
      }
      isDragging.current = true;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      // Full 360-degree yaw rotation (no clamping - infinite 360 pan)
      targetDragYaw.current += dx * 0.0055;
      // Vertical pitch rotation (clamped between -75deg and +75deg)
      targetDragPitch.current = Math.max(
        -1.3,
        Math.min(1.3, targetDragPitch.current + dy * 0.004)
      );
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    // Double click to recenter 360 view
    const handleDblClick = () => {
      targetDragYaw.current = 0;
      targetDragPitch.current = 0;
    };

    // Custom recenter event from HUD
    const handleRecenter = () => {
      targetDragYaw.current = 0;
      targetDragPitch.current = 0;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("dblclick", handleDblClick);
    window.addEventListener("recenterCamera360", handleRecenter);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("dblclick", handleDblClick);
      window.removeEventListener("recenterCamera360", handleRecenter);
    };
  }, []);

  useFrame((state, delta) => {
    const clamped = Math.max(0, Math.min(1, progress));

    // Sample the continuous 3D camera trajectory curve
    pathCurve.getPointAt(clamped, targetPos.current);
    lookAtCurve.getPointAt(clamped, targetLookAt.current);

    // Compute base forward direction and base yaw/pitch angles from spline
    baseFwd.current
      .subVectors(targetLookAt.current, targetPos.current)
      .normalize();
    const baseYaw = Math.atan2(baseFwd.current.x, baseFwd.current.z);
    const basePitch = Math.asin(
      THREE.MathUtils.clamp(baseFwd.current.y, -0.99, 0.99)
    );

    // Smooth drag interpolation (responsive, zero latency drag feel)
    const dragLerp = Math.min(1, delta * 14.0);
    currentDragYaw.current +=
      (targetDragYaw.current - currentDragYaw.current) * dragLerp;
    currentDragPitch.current +=
      (targetDragPitch.current - currentDragPitch.current) * dragLerp;

    // Gentle mouse parallax when not actively dragging
    const mouseLerp = Math.min(1, delta * 6.0);
    mouseOffset.current.x +=
      (state.pointer.x * 0.15 - mouseOffset.current.x) * mouseLerp;
    mouseOffset.current.y +=
      (state.pointer.y * 0.08 - mouseOffset.current.y) * mouseLerp;

    // Calculate total 360-degree spherical orientation
    const totalYaw =
      baseYaw + currentDragYaw.current + mouseOffset.current.x;
    const totalPitch = THREE.MathUtils.clamp(
      basePitch - currentDragPitch.current + mouseOffset.current.y,
      -1.35,
      1.35
    );

    // Convert spherical angles to 3D unit vector
    lookDir.current.set(
      Math.sin(totalYaw) * Math.cos(totalPitch),
      Math.sin(totalPitch),
      Math.cos(totalYaw) * Math.cos(totalPitch)
    );

    // Handheld cinematic breathe
    const time = state.clock.elapsedTime;
    const breatheX = Math.sin(time * 0.7) * 0.02;
    const breatheY = Math.cos(time * 1.0) * 0.015;

    // Smooth camera position update
    const posLerp = Math.min(1, delta * 12.0);
    camera.position.x +=
      (targetPos.current.x + breatheX - camera.position.x) * posLerp;
    camera.position.y +=
      (targetPos.current.y + breatheY - camera.position.y) * posLerp;
    camera.position.z += (targetPos.current.z - camera.position.z) * posLerp;

    // Apply look direction 30 units ahead
    finalLookTarget.current
      .copy(camera.position)
      .addScaledVector(lookDir.current, 30);
    camera.lookAt(finalLookTarget.current);

    // Subtle banking roll based on drag velocity
    camera.rotation.z = -mouseOffset.current.x * 0.015;

    // Interpolate FOV smoothly between zones
    let targetFov = 48;
    for (let i = 0; i < EXPERIENCE_PATH.length - 1; i++) {
      if (
        clamped >= EXPERIENCE_PATH[i].progress &&
        clamped <= EXPERIENCE_PATH[i + 1].progress
      ) {
        const span =
          EXPERIENCE_PATH[i + 1].progress -
            EXPERIENCE_PATH[i].progress || 0.001;
        const f = (clamped - EXPERIENCE_PATH[i].progress) / span;
        targetFov = THREE.MathUtils.lerp(
          EXPERIENCE_PATH[i].fov,
          EXPERIENCE_PATH[i + 1].fov,
          f
        );
        break;
      }
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov += (targetFov - camera.fov) * posLerp;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
