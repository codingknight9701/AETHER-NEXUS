import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
// import { Sphere } from '@react-three/drei';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import * as THREE from 'three';
import * as Haptics from 'expo-haptics';

interface MemorySphereProps {
    id: string;
    color: string;
    position: [number, number, number];
    onPress: (id: string) => void;
}

export default function MemorySphere({ id, color, position, onPress }: MemorySphereProps) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);

    // Custom gravity/attractor logic: Pull towards the center (0,0,0)
    useFrame(() => {
        if (rigidBodyRef.current) {
            const pos = rigidBodyRef.current.translation();
            const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);

            // Calculate force vector pointing towards origin
            const forceDirection = currentPos.clone().negate().normalize();

            // Distance from origin determines force strength (closer = weaker pull)
            const distance = currentPos.length();
            const pullStrength = distance * 0.5; // Adjust this scale to change cloud tightness

            const appliedForce = forceDirection.multiplyScalar(pullStrength);

            rigidBodyRef.current.applyImpulse({ x: appliedForce.x, y: appliedForce.y, z: appliedForce.z }, true);
        }
    });

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Give it a little boop away from camera when touched
        if (rigidBodyRef.current) {
            rigidBodyRef.current.applyImpulse({ x: Math.random() - 0.5, y: Math.random() - 0.5, z: -5 }, true);
        }

        onPress(id);
    };

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={position}
            restitution={0.8} // Bounciness
            linearDamping={1.5} // Drag to prevent infinite flying
            angularDamping={1.5}
        >
            <BallCollider args={[1]} />
            <mesh onPointerDown={handlePointerDown}>
                <sphereGeometry args={[1, 32, 32]} />
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
        </RigidBody>
    );
}
