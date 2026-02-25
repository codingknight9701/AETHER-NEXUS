import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { GraphNode } from '../../utils/vault';
import { extractTags } from '../../utils/exporter';

interface NotesListProps {
    nodes: GraphNode[];
    onNodePress: (id: string) => void;
    selectedTag: string | null;
}

export default function NotesList({ nodes, onNodePress, selectedTag }: NotesListProps) {
    const filteredNodes = selectedTag
        ? nodes.filter(node => extractTags(node.content).includes(selectedTag))
        : nodes;

    const renderItem = ({ item }: { item: GraphNode }) => {
        const tags = extractTags(item.content);
        const excerpt = item.content.replace(/#\w+/g, '').trim().substring(0, 100) + '...';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => onNodePress(item.id)}
                activeOpacity={0.7}
            >
                <Text style={styles.title} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.excerpt} numberOfLines={2}>{excerpt}</Text>

                {tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {tags.map((tag, index) => (
                            <View key={index} style={styles.tagBadge}>
                                <Text style={styles.tagText}>#{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (filteredNodes.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {selectedTag ? `No notes found for #${selectedTag}` : 'Your vault is empty.'}
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={filteredNodes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 20,
        paddingBottom: 120, // Space for FABs
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    excerpt: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagBadge: {
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 204, 0.3)',
    },
    tagText: {
        color: '#00ffcc',
        fontSize: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16,
        textAlign: 'center',
    }
});
