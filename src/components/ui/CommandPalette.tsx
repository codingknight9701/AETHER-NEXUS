import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { GraphNode, resetVault } from '../../utils/vault';
import { useJournalStore } from '../../store/useJournalStore';
import * as Haptics from 'expo-haptics';

interface CommandPaletteProps {
    visible: boolean;
    nodes: GraphNode[];
    onClose: () => void;
    onSelectNode: (id: string) => void;
}

export default function CommandPalette({ visible, nodes, onClose, onSelectNode }: CommandPaletteProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNodes, setFilteredNodes] = useState<GraphNode[]>(nodes);
    const navigate = useJournalStore((state) => state.navigate);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredNodes(nodes);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredNodes(nodes.filter(n => n.label.toLowerCase().includes(lowerQuery)));
        }
    }, [searchQuery, nodes]);

    // Reset search on open
    useEffect(() => {
        if (visible) setSearchQuery('');
    }, [visible]);

    const handleSelect = (id: string) => {
        onSelectNode(id);
        onClose();
    };

    const handleCreateNew = () => {
        if (!searchQuery.trim()) return;
        onClose();
        navigate('Editor', { prefillTitle: searchQuery.trim() });
    };

    const handleResetVault = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Reset Vault",
            "This will permanently delete all thoughts and reset to the template. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        await resetVault();
                        onClose(); // This triggers HomeScreen to reload notes
                    }
                }
            ]
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={70} tint="dark" style={styles.container}>
                <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.paletteContainer}
                >
                    <View style={styles.searchBarContainer}>
                        <Text style={styles.promptArrow}>{'>'}</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find or generate a thought..."
                            placeholderTextColor="#555"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                            returnKeyType="go"
                            keyboardAppearance="dark"
                        />
                    </View>

                    <FlatList
                        data={filteredNodes}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item.id)}>
                                <Text style={styles.resultTitle}>{item.label}</Text>
                                {item.backlinks.length > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.backlinks.length} links</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            searchQuery.trim() ? (
                                <TouchableOpacity style={styles.createContainer} onPress={handleCreateNew}>
                                    <View style={styles.createIconContainer}>
                                        <Text style={styles.createIcon}>+</Text>
                                    </View>
                                    <Text style={styles.createText}>Create new thought: <Text style={styles.createHighlight}>'{searchQuery}'</Text></Text>
                                </TouchableOpacity>
                            ) : null
                        }
                    />

                    <TouchableOpacity style={styles.resetBtn} onPress={handleResetVault}>
                        <Text style={styles.resetBtnText}>Reset Vault</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 80,
    },
    dismissOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    paletteContainer: {
        width: '90%',
        maxHeight: '60%',
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: '#222',
        backgroundColor: 'rgba(5, 5, 8, 0.5)',
    },
    promptArrow: {
        color: '#00ffcc',
        fontSize: 22,
        fontWeight: 'bold',
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    resultTitle: {
        color: '#eee',
        fontSize: 16,
    },
    badge: {
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 204, 0.3)',
    },
    badgeText: {
        color: '#00ffcc',
        fontSize: 12,
        fontWeight: '600',
    },
    createContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'rgba(0, 255, 204, 0.2)',
        backgroundColor: 'rgba(0, 255, 204, 0.05)',
    },
    createIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0, 255, 204, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    createIcon: {
        color: '#00ffcc',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: -3,
    },
    createText: {
        color: '#eee',
        fontSize: 16,
    },
    createHighlight: {
        color: '#00ffcc',
        fontWeight: 'bold',
    },
    resetBtn: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#333',
        backgroundColor: 'rgba(255, 50, 50, 0.05)',
    },
    resetBtnText: {
        color: '#ff4444',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
