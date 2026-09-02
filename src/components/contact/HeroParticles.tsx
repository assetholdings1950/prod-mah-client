// src/components/contact/HeroParticles.tsx
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ambient floating particles — meant to evoke fine water mist drifting up
 * from the Merlion fountain. Continuous motion only (no GSAP needed here);
 * per the skill's animation rule, ambient/idle motion uses useFrame with
 * mutated refs, never setState.
 */
function MistParticles({ count = 240 }: { count?: number }) {
    const pointsRef = useRef<THREE.Points>(null!);

    const { positions, speeds, drift } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        const drift = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 11;      // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 6;   // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;   // z
            speeds[i] = 0.12 + Math.random() * 0.3;
            drift[i] = Math.random() * Math.PI * 2;
        }
        return { positions, speeds, drift };
    }, [count]);

    useFrame((state, delta) => {
        const geom = pointsRef.current.geometry;
        const posAttr = geom.attributes.position as THREE.BufferAttribute;
        const t = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            let y = posAttr.getY(i);
            y += speeds[i] * delta;
            if (y > 3.2) y = -3.2;
            posAttr.setY(i, y);

            // gentle horizontal sway, mutated directly — no re-render
            const baseX = posAttr.getX(i);
            const sway = Math.sin(t * 0.4 + drift[i]) * 0.002;
            posAttr.setX(i, baseX + sway);
        }
        posAttr.needsUpdate = true;
        pointsRef.current.rotation.y += delta * 0.015;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.045}
                color="#eaf2fb"
                transparent
                opacity={0.55}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

export default function HeroParticles() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, 1.5]}
            style={{ position: "absolute", inset: 0 }}
        >
            <ambientLight intensity={0.7} />
            <MistParticles />
        </Canvas>
    );
}