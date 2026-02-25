import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CloudCanvas from '../components/3d/MemoryCloud';
import { useJournalStore } from '../store/useJournalStore';
import CommandPalette from '../components/ui/CommandPalette';
import NotesList from '../components/ui/NotesList';
import { buildGraph, GraphNode, readAllThoughts } from '../utils/vault';
import { exportToNotebookLM } from '../utils/exporter';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
    const navigate = useJournalStore((state) => state.navigate);
    const [isPaletteOpen, setPaletteOpen] = useState(false);
    const [flyingTo, setFlyingTo] = useState<string | null>(null);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [allNotes, setAllNotes] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        const loadNodes = async () => {
            const data = await buildGraph();
            setNodes(data.nodes);
            const notes = await readAllThoughts();
            setAllNotes(notes);
        };
        loadNodes();
    }, [isPaletteOpen]); // Refresh nodes when palette opens

    const handleSpherePress = (id: string) => {
        // In the 3D graph, spheres are tags now. 
        // In the NotesList, items are notes (handled below).
        // Let's differentiate based on viewMode.
        if (viewMode === 'cloud') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedTag(id);
            setViewMode('list');
        } else {
            // In list mode, clicking an item navigates to it
            navigate('Review', { id });
        }
    };

    const handleAddPress = () => {
        navigate('Editor');
    };

    const handleSelectNode = (id: string) => {
        // Command palette now also shows tags since it uses `nodes`
        setFlyingTo(id);
    };

    const handleFlightComplete = (id: string) => {
        setFlyingTo(null);
        setSelectedTag(id);
        setViewMode('list');
    };

    const toggleViewMode = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setViewMode(prev => prev === 'cloud' ? 'list' : 'cloud');
        if (viewMode === 'list') {
            setSelectedTag(null); // Clear filter when returning to cloud
        }
    };

    const handleExport = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await exportToNotebookLM();
    };

    return (
        <LinearGradient
            colors={['#08080C', '#120f18', '#000000']} // Deeper, moodier neo-noir zen colors
            style={styles.container}
        >
            {viewMode === 'cloud' ? (
                <CloudCanvas
                    onSpherePress={handleSpherePress}
                    selectedNodeId={flyingTo}
                    onFlightComplete={handleFlightComplete}
                />
            ) : (
                <NotesList
                    nodes={allNotes}
                    onNodePress={handleSpherePress}
                    selectedTag={selectedTag}
                />
            )}

            <CommandPalette
                visible={isPaletteOpen}
                nodes={nodes}
                onClose={() => setPaletteOpen(false)}
                onSelectNode={handleSelectNode}
            />

            {/* Floating Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={[styles.fab, styles.secondaryFab]} onPress={handleExport} activeOpacity={0.8}>
                    <Text style={styles.secondaryFabText}>Export</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.fab, styles.paletteFab]} onPress={() => setPaletteOpen(true)} activeOpacity={0.8}>
                    <Text style={styles.paletteFabText}>{'/'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.8}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.fab, styles.secondaryFab]} onPress={toggleViewMode} activeOpacity={0.8}>
                    <Text style={styles.secondaryFabText}>{viewMode === 'cloud' ? 'List' : 'Cloud'}</Text>
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
    secondaryFab: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a24',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 10,
    },
    secondaryFabText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
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
