import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CloudCanvas from '../components/3d/MemoryCloud';
import { useJournalStore } from '../store/useJournalStore';
import CommandPalette from '../components/ui/CommandPalette';
import { buildGraph, GraphNode } from '../utils/vault';

export default function HomeScreen() {
    const navigate = useJournalStore((state) => state.navigate);
    const [isPaletteOpen, setPaletteOpen] = useState(false);
    const [flyingTo, setFlyingTo] = useState<string | null>(null);
    const [nodes, setNodes] = useState<GraphNode[]>([]);

    useEffect(() => {
        const loadNodes = async () => {
            const data = await buildGraph();
            setNodes(data.nodes);
        };
        loadNodes();
    }, [isPaletteOpen]); // Refresh nodes when palette opens

    const handleSpherePress = (id: string) => {
        navigate('Review', { id });
    };

    const handleAddPress = () => {
        navigate('Editor');
    };

    const handleSelectNode = (id: string) => {
        setFlyingTo(id); // Trigger flight instead of immediate nav
    };

    const handleFlightComplete = (id: string) => {
        setFlyingTo(null);
        navigate('Review', { id });
    };

    return (
        <LinearGradient
            colors={['#08080C', '#120f18', '#000000']} // Deeper, moodier neo-noir zen colors
            style={styles.container}
        >
            <CloudCanvas
                onSpherePress={handleSpherePress}
                selectedNodeId={flyingTo}
                onFlightComplete={handleFlightComplete}
            />

            <CommandPalette
                visible={isPaletteOpen}
                nodes={nodes}
                onClose={() => setPaletteOpen(false)}
                onSelectNode={handleSelectNode}
            />

            {/* Floating Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={[styles.fab, styles.paletteFab]} onPress={() => setPaletteOpen(true)} activeOpacity={0.8}>
                    <Text style={styles.paletteFabText}>{'/'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.8}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 20,
    },
    fab: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    fabText: {
        fontSize: 40,
        color: '#121212',
        fontWeight: '300',
        marginTop: -4, // Optical alignment
    },
    paletteFab: {
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#00ffcc',
    },
    paletteFabText: {
        fontSize: 30,
        color: '#00ffcc',
        fontWeight: '600',
    }
});
