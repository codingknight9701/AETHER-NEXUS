import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber/native';

import { buildGraph, GraphNode, GraphLink } from '../../utils/vault';
import InteractiveGraph from './InteractiveGraph';

interface CloudCanvasProps {
    onSpherePress: (id: string) => void;
    selectedNodeId?: string | null;
    onFlightComplete?: (id: string) => void;
}

export default function CloudCanvas({ onSpherePress, selectedNodeId, onFlightComplete }: CloudCanvasProps) {
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });

    useEffect(() => {
        const loadGraph = async () => {
            const data = await buildGraph();
            setGraphData(data);
        };
        loadGraph();
    }, []);

    return (
        <Canvas camera={{ position: [0, 0, 150], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            <InteractiveGraph
                nodes={graphData.nodes}
                links={graphData.links}
                onNodePress={onSpherePress}
                selectedNodeId={selectedNodeId}
                onFlightComplete={onFlightComplete}
            />
        </Canvas>
    );
}