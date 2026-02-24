import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter
} from 'd3-force-3d';
import { GraphNode, GraphLink } from '../../utils/vault';
import MemorySphere from './MemorySphere';

interface InteractiveGraphProps {
    nodes: GraphNode[];
    links: GraphLink[];
    onNodePress: (id: string) => void;
    selectedNodeId?: string | null;
    onFlightComplete?: (id: string) => void;
}

const GraphEdge = ({ sourceId, targetId, positionsRef }: { sourceId: string, targetId: string, positionsRef: React.MutableRefObject<Map<string, [number, number, number]>> }) => {
    const lineRef = useRef<THREE.Line>(null);

    useFrame(() => {
        if (lineRef.current) {
            const start = positionsRef.current.get(sourceId);
            const end = positionsRef.current.get(targetId);
            if (start && end) {
                const positions = new Float32Array([
                    start[0], start[1], start[2],
                    end[0], end[1], end[2]
                ]);
                lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                lineRef.current.geometry.attributes.position.needsUpdate = true;
            }
        }
    });

    return (
        <line ref={lineRef as any}>
            <bufferGeometry />
            <lineBasicMaterial color="rgba(0, 255, 204, 0.2)" transparent depthWrite={false} linewidth={2} />
        </line>
    );
};

export default function InteractiveGraph({ nodes, links, onNodePress, selectedNodeId, onFlightComplete }: InteractiveGraphProps) {
    const positionsRef = useRef(new Map<string, [number, number, number]>());
    const flightTarget = useRef<THREE.Vector3 | null>(null);

    // 1. Initialize Physics Engine
    const simulation = useMemo(() => {
        // We need to clone nodes and links because d3 mutates them
        const simNodes = nodes.map(n => ({ ...n }));
        const simLinks = links.map(l => ({ ...l }));

        const sim = forceSimulation(simNodes)
            .numDimensions(3) // 3D Canvas Depth
            // Gravity: Nodes repel each other (Neo-Noir anti-gravity weight)
            .force('charge', forceManyBody().strength(-300))
            // Links pull connected nodes together like springs
            .force('link', forceLink(simLinks).id((d: any) => d.id).distance(50))
            // Keeps the graph centered
            .force('center', forceCenter());

        // Stop auto-ticking, we will tick it in the WebGL render loop for smoothness
        sim.stop();
        return sim;
    }, [nodes, links]);

    // Handle incoming flight targets
    useEffect(() => {
        if (selectedNodeId) {
            const pos = positionsRef.current.get(selectedNodeId);
            if (pos) {
                // Fly to 5 units in front of the target sphere
                flightTarget.current = new THREE.Vector3(pos[0], pos[1], pos[2] + 5);
            }
        } else {
            flightTarget.current = null;
        }
    }, [selectedNodeId]);

    // 2. Tie Physics to the Render Loop
    useFrame((state) => {
        if (simulation.alpha() > simulation.alphaMin()) {
            simulation.tick(); // Apply physics calculation for this frame

            // Update visual positions based on physics output
            simulation.nodes().forEach((node: any) => {
                positionsRef.current.set(node.id, [node.x || 0, node.y || 0, node.z || 0]);
            });
        }

        // 3. Camera Flight Animation
        if (flightTarget.current && selectedNodeId && onFlightComplete) {
            // Lerp the camera to the target position
            state.camera.position.lerp(flightTarget.current, 0.04);
            // Look directly at the sphere (which is 5 units deeper on Z)
            state.camera.lookAt(flightTarget.current.x, flightTarget.current.y, flightTarget.current.z - 5);

            // If we are close enough, trigger the completion sequence
            if (state.camera.position.distanceTo(flightTarget.current) < 0.5) {
                onFlightComplete(selectedNodeId);
                flightTarget.current = null;
            }
        }
    });

    return (
        <group>
            {/* Render Lines (Connections) underneath nodes */}
            {links.map((link, i) => (
                <GraphEdge
                    key={`edge-${i}`}
                    sourceId={typeof link.source === 'string' ? link.source : (link.source as any).id}
                    targetId={typeof link.target === 'string' ? link.target : (link.target as any).id}
                    positionsRef={positionsRef}
                />
            ))}

            {/* Render Nodes (Files) */}
            {nodes.map(node => (
                <MemorySphere
                    key={node.id}
                    id={node.id}
                    label={node.label}
                    color="#00ffcc" // Cyberpunk/Neo-Noir Cyan
                    position={positionsRef.current.get(node.id) || [0, 0, 0]}
                    onPress={onNodePress}
                />
            ))}
        </group>
    );
}
