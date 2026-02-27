import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJournalStore } from '../store/useJournalStore';
import { useThemeStore } from '../store/useThemeStore';
import NotesList from '../components/ui/NotesList';
import StarfieldBackground from '../components/ui/StarfieldBackground';
import SearchBar from '../components/ui/SearchBar';
import NoteActionDialog from '../components/ui/NoteActionDialog';
import SideMenu from '../components/ui/SideMenu';
import { buildGraph, GraphNode, readAllThoughts, deleteThought, archiveThought, readThought, saveThought } from '../utils/vault';
import { exportToNotebookLM } from '../utils/exporter';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
    const { navigate, removeEntry, currentRoute } = useJournalStore();
    const { theme } = useThemeStore();
    const insets = useSafeAreaInsets();
    const [allNotes, setAllNotes] = useState<any[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [sideMenuVisible, setSideMenuVisible] = useState(false);

    useEffect(() => {
        const loadNodes = async () => {
            const notes = await readAllThoughts();
            setAllNotes(notes);
        };
        if (currentRoute.name === 'Home') {
            loadNodes();
        }
    }, [currentRoute.name]);

    const handleNotePress = (id: string) => {
        navigate('Review', { id });
    };

    const handleLongPress = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedNoteId(id);
    };

    const handleDeletePress = async () => {
        if (!selectedNoteId) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        removeEntry(selectedNoteId); // Zustand cleanup
        await deleteThought(selectedNoteId); // Hard file/web cleanup
        setAllNotes(prev => prev.filter(note => note.id !== selectedNoteId));
    };

    const handleArchivePress = async () => {
        if (!selectedNoteId) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await archiveThought(selectedNoteId);
        setAllNotes(prev => prev.filter(note => note.id !== selectedNoteId));
    };

    const handleSendPress = async () => {
        if (!selectedNoteId) return;
        const note = await readThought(selectedNoteId);
        if (note) {
            try {
                await Share.share({
                    message: `${note.title}\n\n${note.content}`,
                    title: note.title
                });
            } catch (error) {
                console.error("Error sharing note:", error);
            }
        }
    };

    const handleCopyPress = async () => {
        if (!selectedNoteId) return;
        const note = await readThought(selectedNoteId);
        if (note) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const newTitle = `${note.title} (Copy)`;
            const newId = await saveThought(newTitle, note.content);
            const newNote = await readThought(newId);
            if (newNote) {
                setAllNotes(prev => [newNote, ...prev]);
            }
        }
    };

    const handleAddPress = () => {
        navigate('Editor');
    };

    const clearFilter = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTag(null);
    };

    const handleExport = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await exportToNotebookLM();
    };

    return (
        <LinearGradient
            colors={[theme.bgFrom, theme.bgTo]}
            style={styles.container}
        >
            <StarfieldBackground />

            <View style={[styles.contentWrapper, { paddingTop: Math.max(insets.top, 10) }]}>
                {/* Top bar: Search + Hamburger */}
                <View style={styles.topBar}>
                    <View style={styles.searchWrapper}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onClear={() => setSearchQuery('')}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.menuBtn, { backgroundColor: theme.cardBg, borderColor: theme.accentDim }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSideMenuVisible(true); }}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.menuBtnText, { color: theme.textPrimary }]}>☰</Text>
                    </TouchableOpacity>
                </View>

                <NotesList
                    nodes={allNotes}
                    onNodePress={handleNotePress}
                    onLongPress={handleLongPress}
                    selectedTag={selectedTag}
                    searchQuery={searchQuery}
                />
            </View>

            <NoteActionDialog
                visible={!!selectedNoteId}
                onClose={() => setSelectedNoteId(null)}
                onDelete={handleDeletePress}
                onArchive={handleArchivePress}
                onSend={handleSendPress}
                onCopy={handleCopyPress}
            />

            <SideMenu visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />

            {/* Floating Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={[styles.fab, styles.secondaryFab, { backgroundColor: theme.cardBg, borderColor: theme.accentDim }]}
                    onPress={handleExport} activeOpacity={0.8}
                >
                    <Text style={[styles.secondaryFabText, { color: theme.textSecondary }]}>Export</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
                    onPress={handleAddPress} activeOpacity={0.8}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>

                {selectedTag && (
                    <TouchableOpacity
                        style={[styles.fab, styles.secondaryFab, { backgroundColor: theme.cardBg, borderColor: theme.accentDim }]}
                        onPress={clearFilter} activeOpacity={0.8}
                    >
                        <Text style={[styles.secondaryFabText, { color: theme.textSecondary }]}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        zIndex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 20,
    },
    searchWrapper: {
        flex: 1,
    },
    menuBtn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginTop: 20,
        marginLeft: 10,
    },
    menuBtnText: {
        fontSize: 20,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 20,
        zIndex: 10,
    },
    fab: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.7,
        shadowRadius: 14,
        elevation: 12,
    },
    fabText: {
        fontSize: 40,
        color: '#ffffff',
        fontWeight: '300',
        marginTop: -4, // Optical alignment
    },
    secondaryFab: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 1,
        marginTop: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    secondaryFabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    paletteFab: {
        backgroundColor: '#161B22',
        borderWidth: 1,
        borderColor: 'rgba(125,95,255,0.2)',
        shadowColor: '#7D5FFF',
    },
    paletteFabText: {
        fontSize: 30,
        color: '#7D5FFF',
        fontWeight: '600',
    }
});
