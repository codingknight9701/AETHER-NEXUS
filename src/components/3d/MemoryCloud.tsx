import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber/native';
import { Physics } from '@react-three/rapier';

import MemorySphere from './MemorySphere';
import { useJournalStore } from '../../store/useJournalStore';

interface CloudCanvasProps {
    onSpherePress: (id: string) => void;
}

export default function CloudCanvas({ onSpherePress }: CloudCanvasProps) {
    const entries = useJournalStore((state) => state.entries);

    // Distribute initially in a random loose cloud
    const initialPositions = useMemo(() => {
        return entries.map(() => [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        ] as [number, number, number]);
    }, [entries.length]);

    return (
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
            {/* Removed visible={true} as it is true by default */}
            <ambientLight intensity={0.5} />

            {/* Removed castShadow={false} and visible={true} to avoid the Boolean cast error */}
            <directionalLight position={[10, 10, 5]} intensity={1} />

            <color attach="background" args={['#121212']} />

            <Physics gravity={[Number(0), Number(0), Number(0)]}>
                {entries.map((entry, index) => (
                    <MemorySphere
                        key={entry.id}
                        id={entry.id}
                        color={entry.color}
                        position={initialPositions[index]}
                        onPress={onSpherePress}
                    />
                ))}
            </Physics>
        </Canvas>
    );
}