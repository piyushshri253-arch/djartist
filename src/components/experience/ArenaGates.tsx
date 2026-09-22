"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, useTexture } from "@react-three/drei";
import { EXPERIENCE_PATH } from "@/data/experiencePath";

interface ArenaGatesProps {
  progress: number;
}

export function ArenaGates({ progress }: ArenaGatesProps) {
  const hoodieTexture = useTexture("/images/hoodie_graphic.png");
  const faceTexture = useTexture("/images/avatar_face.png");

  const leftGatePivot = useRef<THREE.Group>(null);
  const rightGatePivot = useRef<THREE.Group>(null);

  // Continuous 3D path curve for the venue aisle
  const pathCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      EXPERIENCE_PATH.map((p) => p.pos),
      false,
      "centripetal",
      0.25
    );
  }, []);

  // 3D Articulated Walker Reference Nodes
  const walkerRootRef = useRef<THREE.Group>(null);
  const pelvisRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // Limbs
  const leftThighRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const leftFootRef = useRef<THREE.Group>(null);
  const leftShadowRef = useRef<THREE.Mesh>(null);

  const rightThighRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const rightFootRef = useRef<THREE.Group>(null);
  const rightShadowRef = useRef<THREE.Mesh>(null);

  const leftArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  // Kinematics tracking
  const stridePhase = useRef(0);
  const prevProgress = useRef(progress);
  const currentWalkerPos = useRef(new THREE.Vector3(0, 0, 95));
  const targetWalkerPos = useRef(new THREE.Vector3());
  const currentYaw = useRef(Math.PI);

  useFrame((state, delta) => {
    // 1. Gate opening curve: starts immediately on scroll (0.005), fully open by 0.15
    const gateOpenFactor = Math.max(0, Math.min(1, (progress - 0.005) / 0.145));
    const targetAngle = (gateOpenFactor * Math.PI) / 2.3; // ~78 degrees

    if (leftGatePivot.current) {
      leftGatePivot.current.rotation.y = -targetAngle;
    }
    if (rightGatePivot.current) {
      rightGatePivot.current.rotation.y = targetAngle;
    }

    // 2. Continuous Path Walker Positioning (in World Space)
    // Walker stays 5-8 meters ahead of camera along the Catmull-Rom path leading the way
    const leadOffset = 0.055;
    const walkerProgress = Math.min(0.85, Math.max(0.04, progress + leadOffset));

    pathCurve.getPointAt(walkerProgress, targetWalkerPos.current);
    const tangent = pathCurve.getTangentAt(walkerProgress);

    // Smooth position interpolation
    const posLerp = Math.min(1, delta * 12.0);
    currentWalkerPos.current.lerp(targetWalkerPos.current, posLerp);

    if (walkerRootRef.current) {
      walkerRootRef.current.position.set(
        currentWalkerPos.current.x,
        0, // Anchored directly to floor Y=0
        currentWalkerPos.current.z
      );

      // Face forward along path direction into the arena
      const targetYaw = Math.atan2(tangent.x, tangent.z);
      let diffYaw = targetYaw - currentYaw.current;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      currentYaw.current += diffYaw * posLerp;
      walkerRootRef.current.rotation.y = currentYaw.current;
    }

    // 3. Real Walking Biomechanics Animation
    const scrollDelta = Math.abs(progress - prevProgress.current);
    prevProgress.current = progress;

    const isMoving = scrollDelta > 0.0001;
    // Step frequency scales with scroll movement + steady forward stride when touring
    const stepSpeed = scrollDelta * 160 + (progress < 0.84 ? delta * 4.2 : 0);
    stridePhase.current += stepSpeed;

    const phase = stridePhase.current;

    // --- LEGS & SNEAKERS ---
    const leftLegSwing = Math.sin(phase) * 0.72;
    const leftKneeBend = Math.max(0, -Math.sin(phase)) * 0.9;
    const leftFootRoll = -Math.sin(phase) * 0.3;

    const rightLegSwing = -Math.sin(phase) * 0.72;
    const rightKneeBend = Math.max(0, Math.sin(phase)) * 0.9;
    const rightFootRoll = Math.sin(phase) * 0.3;

    if (leftThighRef.current) leftThighRef.current.rotation.x = leftLegSwing;
    if (leftKneeRef.current) leftKneeRef.current.rotation.x = leftKneeBend;
    if (leftFootRef.current) leftFootRef.current.rotation.x = leftFootRoll;

    if (rightThighRef.current) rightThighRef.current.rotation.x = rightLegSwing;
    if (rightKneeRef.current) rightKneeRef.current.rotation.x = rightKneeBend;
    if (rightFootRef.current) rightFootRef.current.rotation.x = rightFootRoll;

    // Foot contact shadows scale dynamically with step
    if (leftShadowRef.current) {
      const leftGrounded = Math.max(0.3, 1.0 - Math.abs(leftLegSwing) * 0.6);
      leftShadowRef.current.scale.set(leftGrounded, leftGrounded, 1);
    }
    if (rightShadowRef.current) {
      const rightGrounded = Math.max(0.3, 1.0 - Math.abs(rightLegSwing) * 0.6);
      rightShadowRef.current.scale.set(rightGrounded, rightGrounded, 1);
    }

    // --- ARMS & HANDS (Natural human counter-swing) ---
    const armSwing = 0.58;
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -Math.sin(phase) * armSwing;
      if (leftForearmRef.current) {
        leftForearmRef.current.rotation.x = 0.25 + Math.max(0, -Math.sin(phase)) * 0.4;
      }
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(phase) * armSwing;
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = 0.25 + Math.max(0, Math.sin(phase)) * 0.4;
      }
    }

    // --- PELVIS & TORSO DYNAMICS ---
    const hipBounce = Math.abs(Math.sin(phase)) * 0.07;
    if (pelvisRef.current) {
      pelvisRef.current.position.y = 0.95 + hipBounce;
      pelvisRef.current.rotation.z = Math.sin(phase) * 0.04;
    }
    if (torsoRef.current) {
      torsoRef.current.rotation.y = -Math.sin(phase) * 0.06;
    }
    if (headRef.current) {
      headRef.current.rotation.z = -Math.sin(phase) * 0.03;
      if (!isMoving && progress > 0.05 && progress < 0.8) {
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.25 - 0.15;
      } else {
        headRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <group>
      {/* 1. Monumental Portal Arch Frame & Gates at Z: 88 */}
      <group position={[0, 0, 88]}>
      {/* 1. Monumental Portal Arch Frame */}
      <group position={[0, 4.5, 0]}>
        {/* Top Header Beam */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[14.8, 0.9, 1.2]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Left Column */}
        <mesh position={[-7.0, 0, 0]}>
          <boxGeometry args={[1.2, 7.2, 1.2]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Right Column */}
        <mesh position={[7.0, 0, 0]}>
          <boxGeometry args={[1.2, 7.2, 1.2]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Arch Illuminated Header Sign */}
        <Text
          position={[0, 3.25, 0.65]}
          fontSize={0.45}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.25}
          material-toneMapped={false}
        >
          Dj G-spark • MAIN ARENA
        </Text>
        <Text
          position={[0, 2.7, 0.65]}
          fontSize={0.18}
          color="#888888"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.3}
          material-toneMapped={false}
        >
          ALL ACCESS VIP PASS // ENTER THE SOUND
        </Text>
      </group>

      {/* 2. Left Heavy Steel Arena Gate (Hinged at X: -6.4) */}
      <group ref={leftGatePivot} position={[-6.4, 0, 0]}>
        <mesh position={[3.2, 2.8, 0]} castShadow>
          <boxGeometry args={[6.3, 5.5, 0.22]} />
          <meshStandardMaterial color="#101015" roughness={0.45} metalness={0.75} />
        </mesh>
        {/* Left Gate Amber Glowing Border Trim */}
        <mesh position={[3.2, 2.8, 0.13]}>
          <boxGeometry args={[6.0, 5.2, 0.02]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        {/* Left Gate Steel Grille Slats */}
        {[-2, -1, 0, 1, 2].map((xOffset) => (
          <mesh key={xOffset} position={[3.2 + xOffset * 1.1, 2.8, 0.15]}>
            <boxGeometry args={[0.08, 4.8, 0.04]} />
            <meshStandardMaterial color="#22222a" metalness={0.9} />
          </mesh>
        ))}
        {/* Left Gate Handle */}
        <mesh position={[5.8, 2.8, 0.22]}>
          <boxGeometry args={[0.08, 0.8, 0.18]} />
          <meshStandardMaterial color="#00B4D8" metalness={0.9} />
        </mesh>
      </group>

      {/* 3. Right Heavy Steel Arena Gate (Hinged at X: 6.4) */}
      <group ref={rightGatePivot} position={[6.4, 0, 0]}>
        <mesh position={[-3.2, 2.8, 0]} castShadow>
          <boxGeometry args={[6.3, 5.5, 0.22]} />
          <meshStandardMaterial color="#101015" roughness={0.45} metalness={0.75} />
        </mesh>
        {/* Right Gate Amber Glowing Border Trim */}
        <mesh position={[-3.2, 2.8, 0.13]}>
          <boxGeometry args={[6.0, 5.2, 0.02]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        {/* Right Gate Steel Grille Slats */}
        {[-2, -1, 0, 1, 2].map((xOffset) => (
          <mesh key={xOffset} position={[-3.2 + xOffset * 1.1, 2.8, 0.15]}>
            <boxGeometry args={[0.08, 4.8, 0.04]} />
            <meshStandardMaterial color="#22222a" metalness={0.9} />
          </mesh>
        ))}
        {/* Right Gate Handle */}
        <mesh position={[-5.8, 2.8, 0.22]}>
          <boxGeometry args={[0.08, 0.8, 0.18]} />
          <meshStandardMaterial color="#00B4D8" metalness={0.9} />
        </mesh>
      </group>

      {/* 4. Gate Threshold Lighting (Warm Amber Flood) */}
      <pointLight position={[0, 4.8, 1.2]} color="#FFA030" intensity={4.5} distance={14} />
    </group>

    {/* ======================================================== */}
    {/* 5. FULLY ARTICULATED 3D WALKING Dj G-spark GUIDE         */}
    {/* (Follows continuous venue path curve leading the tour)   */}
    {/* ======================================================== */}
    <group ref={walkerRootRef} position={[0, 0, 95]}>
      {/* Dynamic follow spotlight casting warm amber glow on the walking artist */}
      <pointLight position={[0, 2.8, 0.4]} color="#FFAA30" intensity={3.0} distance={7} />
      <spotLight
        position={[0, 5.0, 1.5]}
        target-position={[0, 1.0, 0]}
        color="#FFE5C0"
        intensity={3.8}
        distance={12}
        angle={0.5}
        penumbra={0.7}
      />

      {/* 1. PELVIS & LOWER BODY ROOT */}
      <group ref={pelvisRef} position={[0, 0.95, 0]}>
        {/* Pelvis/Hips Mesh (Black Joggers Waist) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.2, 0.26]} />
          <meshStandardMaterial color="#131318" roughness={0.7} />
        </mesh>

        {/* LEFT LEG HIERARCHY */}
        <group ref={leftThighRef} position={[-0.15, -0.05, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.16, 0.44, 0.18]} />
            <meshStandardMaterial color="#1F2833" roughness={0.7} />
          </mesh>

          <group ref={leftKneeRef} position={[0, -0.44, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.14, 0.42, 0.16]} />
              <meshStandardMaterial color="#0e0e13" roughness={0.75} />
            </mesh>

            <group ref={leftFootRef} position={[0, -0.42, 0]}>
              {/* White Chunky Sneaker Body */}
              <mesh position={[0, -0.05, 0.06]}>
                <boxGeometry args={[0.16, 0.12, 0.32]} />
                <meshStandardMaterial color="#F5F5FA" roughness={0.4} metalness={0.1} />
              </mesh>
              {/* Neon Green Laces Accent */}
              <mesh position={[0, 0.015, 0.06]}>
                <boxGeometry args={[0.11, 0.02, 0.18]} />
                <meshBasicMaterial color="#22C55E" toneMapped={false} />
              </mesh>
              {/* Sneaker Sole / Tread */}
              <mesh position={[0, -0.11, 0.06]}>
                <boxGeometry args={[0.165, 0.03, 0.33]} />
                <meshStandardMaterial color="#181822" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>

        {/* RIGHT LEG HIERARCHY */}
        <group ref={rightThighRef} position={[0.15, -0.05, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.16, 0.44, 0.18]} />
            <meshStandardMaterial color="#1F2833" roughness={0.7} />
          </mesh>

          <group ref={rightKneeRef} position={[0, -0.44, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.14, 0.42, 0.16]} />
              <meshStandardMaterial color="#0e0e13" roughness={0.75} />
            </mesh>

            <group ref={rightFootRef} position={[0, -0.42, 0]}>
              {/* White Chunky Sneaker Body */}
              <mesh position={[0, -0.05, 0.06]}>
                <boxGeometry args={[0.16, 0.12, 0.32]} />
                <meshStandardMaterial color="#F5F5FA" roughness={0.4} metalness={0.1} />
              </mesh>
              {/* Neon Green Laces Accent */}
              <mesh position={[0, 0.015, 0.06]}>
                <boxGeometry args={[0.11, 0.02, 0.18]} />
                <meshBasicMaterial color="#22C55E" toneMapped={false} />
              </mesh>
              {/* Sneaker Sole / Tread */}
              <mesh position={[0, -0.11, 0.06]}>
                <boxGeometry args={[0.165, 0.03, 0.33]} />
                <meshStandardMaterial color="#181822" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>

        {/* 2. TORSO & UPPER BODY */}
        <group ref={torsoRef} position={[0, 0.1, 0]}>
          {/* Main White Hoodie Body */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.54, 0.64, 0.32]} />
            <meshStandardMaterial
              color="#EDEDF4"
              roughness={0.55}
              metalness={0.05}
              emissive="#FFFFFF"
              emissiveIntensity={0.08}
            />
          </mesh>

          {/* Front Kangaroo Pouch Pocket */}
          <mesh position={[0, 0.16, 0.165]}>
            <boxGeometry args={[0.38, 0.18, 0.04]} />
            <meshStandardMaterial color="#E2E2EA" roughness={0.6} />
          </mesh>

          {/* Chest DJ MODE Graphic */}
          <mesh position={[0, 0.38, 0.165]}>
            <planeGeometry args={[0.38, 0.28]} />
            <meshBasicMaterial map={hoodieTexture} transparent={true} toneMapped={false} />
          </mesh>

          {/* Back Hood Folds */}
          <mesh position={[0, 0.54, -0.16]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.36, 0.26, 0.12]} />
            <meshStandardMaterial color="#E5E5EE" roughness={0.6} />
          </mesh>

          {/* LEFT ARM HIERARCHY */}
          <group ref={leftArmRef} position={[-0.34, 0.54, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.15, 0.38, 0.16]} />
              <meshStandardMaterial color="#EDEDF4" roughness={0.55} />
            </mesh>

            <group ref={leftForearmRef} position={[0, -0.38, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <boxGeometry args={[0.13, 0.34, 0.14]} />
                <meshStandardMaterial color="#EDEDF4" roughness={0.55} />
              </mesh>
              {/* Left Hand (Indian Skin Tone) */}
              <mesh position={[0, -0.38, 0]}>
                <boxGeometry args={[0.09, 0.14, 0.09]} />
                <meshStandardMaterial color="#C48D68" roughness={0.5} />
              </mesh>
            </group>
          </group>

          {/* RIGHT ARM HIERARCHY */}
          <group ref={rightArmRef} position={[0.34, 0.54, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.15, 0.38, 0.16]} />
              <meshStandardMaterial color="#EDEDF4" roughness={0.55} />
            </mesh>

            <group ref={rightForearmRef} position={[0, -0.38, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <boxGeometry args={[0.13, 0.34, 0.14]} />
                <meshStandardMaterial color="#EDEDF4" roughness={0.55} />
              </mesh>
              {/* Right Hand (Indian Skin Tone) */}
              <mesh position={[0, -0.38, 0]}>
                <boxGeometry args={[0.09, 0.14, 0.09]} />
                <meshStandardMaterial color="#C48D68" roughness={0.5} />
              </mesh>
            </group>
          </group>

          {/* 3. HEAD & FACE */}
          <group ref={headRef} position={[0, 0.74, 0]}>
            {/* Neck */}
            <mesh position={[0, -0.06, 0]}>
              <cylinderGeometry args={[0.09, 0.11, 0.12, 12]} />
              <meshStandardMaterial color="#B57B54" roughness={0.5} />
            </mesh>

            {/* Bald Head Shape */}
            <mesh position={[0, 0.16, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color="#C48D68" roughness={0.45} />
            </mesh>

            {/* Face Front Decal (Beard, Glasses, Features) */}
            <mesh position={[0, 0.14, 0.181]}>
              <planeGeometry args={[0.32, 0.28]} />
              <meshBasicMaterial map={faceTexture} transparent={true} toneMapped={false} />
            </mesh>

            {/* Black Stylish Glasses Frame */}
            <mesh position={[0, 0.19, 0.188]}>
              <boxGeometry args={[0.26, 0.07, 0.03]} />
              <meshStandardMaterial color="#0A0A0E" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Black Trimmed Beard around jaw */}
            <mesh position={[0, 0.08, 0.08]}>
              <boxGeometry args={[0.26, 0.14, 0.22]} />
              <meshStandardMaterial color="#1F2833" roughness={0.9} />
            </mesh>

            {/* White DJ Headphones around neck */}
            <group position={[0, 0.02, 0]}>
              <mesh position={[0, 0, -0.08]} rotation={[0.4, 0, 0]}>
                <torusGeometry args={[0.18, 0.025, 8, 24, Math.PI]} />
                <meshStandardMaterial color="#FAFAFA" roughness={0.3} metalness={0.2} />
              </mesh>
              <mesh position={[-0.18, 0.02, 0.05]} rotation={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
              </mesh>
              <mesh position={[-0.18, 0.02, 0.08]} rotation={[0, 0.4, 0]}>
                <torusGeometry args={[0.045, 0.008, 8, 16]} />
                <meshBasicMaterial color="#00E5FF" toneMapped={false} />
              </mesh>
              <mesh position={[0.18, 0.02, 0.05]} rotation={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
              </mesh>
              <mesh position={[0.18, 0.02, 0.08]} rotation={[0, -0.4, 0]}>
                <torusGeometry args={[0.045, 0.008, 8, 16]} />
                <meshBasicMaterial color="#00E5FF" toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* 4. DUAL CONTACT GROUND SHADOWS */}
      <mesh
        ref={leftShadowRef}
        position={[-0.15, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.3, 0.48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>

      <mesh
        ref={rightShadowRef}
        position={[0.15, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.3, 0.48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  </group>
  );
}
