import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import * as Haptics from 'expo-haptics';
// import { Text } from '@react-three/drei/native'; // Causes ReferenceError: Property 'document' doesn't exist in React Native

interface MemorySphereProps {
    id: string;
    label: string;
    color: string;
    position: [number, number, number];
    frequency?: number;
    onPress: (id: string) => void;
}

export default function MemorySphere({ id, label, color, position, frequency = 1, onPress }: MemorySphereProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const targetScale = useRef(1);
    const currentScale = useRef(0); // Start scale at 0 for entrance animation

    // Physics properties for Neo-Noir Zen Anti-Gravity feel
    const velocityY = useRef(0);
    const targetY = useRef(position[1]);
    const inertia = 0.95; // High inertia (keeps moving)
    const damping = 0.05; // Low damping (slow to stop)

    // Give each sphere a unique random offset so they don't bob uniformly
    const randomOffset = useMemo(() => Math.random() * 100, []);

    useFrame(({ clock, camera }) => {
        if (groupRef.current && meshRef.current) {
            // Smooth entrance and tap animations using linear interpolation
            currentScale.current += (targetScale.current - currentScale.current) * 0.15;
            groupRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);

            // Floating Anti-Gravity Physics (Inertia + Damping)
            const t = clock.getElapsedTime() + randomOffset;
            const intendedBobbingY = position[1] + Math.sin(t * 0.5) * 0.8; // Slower, wider sine wave

            // Calculate distance to intended position
            const accelerationY = (intendedBobbingY - groupRef.current.position.y) * damping;

            // Apply inertia and damping to velocity
            velocityY.current = (velocityY.current * inertia) + accelerationY;

            // Apply velocity to actual position (simulates heavy, floating weight) applied to the parent group
            groupRef.current.position.y += velocityY.current;

            // Very slow, deliberate rotation applied ONLY to the sphere mesh, so text stays flat
            meshRef.current.rotation.x += 0.002;
            meshRef.current.rotation.y += 0.003;
        }
    });

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        // Use Heavy impact to reinforce the feeling of weight and inertia
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Visual feedback on tap
        targetScale.current = 0.7; // Shrink
        setTimeout(() => {
            targetScale.current = 1; // Grow back
        }, 150);

        onPress(id);
    };

    return (
        <group ref={groupRef} position={position}>
            <mesh
                ref={meshRef}
                onPointerDown={handlePointerDown}
            >
                {/* Base scale is 1, add 0.2 for each additional occurrence of the tag */}
                <sphereGeometry args={[1 + (frequency - 1) * 0.2, 32, 32]} />
                <meshPhysicalMaterial
                    color={color}
                    transmission={0.9}
                    opacity={1}
                    metalness={0}
                    roughness={0.1}
                    ior={1.5}
                    thickness={0.5}
                />
            </mesh>

            {/* 3D Text is not supported out of the box in React Native Three.js without DOM. */}
            {/* 
            <Text
                position={[0, 1.5, 0]}
                fontSize={0.4}
                color="#00ffcc"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {label}
            </Text>
            */}
        </group>
    );
}
