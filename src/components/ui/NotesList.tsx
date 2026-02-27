import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { GraphNode } from '../../utils/vault';
import { extractTags } from '../../utils/exporter';

interface NotesListProps {
    nodes: GraphNode[];
    onNodePress: (id: string) => void;
    onLongPress?: (id: string) => void;
    selectedTag: string | null;
    searchQuery?: string;
}

export default function NotesList({ nodes, onNodePress, onLongPress, selectedTag, searchQuery = '' }: NotesListProps) {
    let filteredNodes = selectedTag
        ? nodes.filter(node => extractTags(node.content).includes(selectedTag))
        : nodes;

    if (searchQuery.trim().length > 0) {
        const lowerQuery = searchQuery.toLowerCase().trim();
        filteredNodes = filteredNodes.filter(node => {
            const titleStr = node.title || '';
            const contentStr = node.content || '';
            return titleStr.toLowerCase().includes(lowerQuery) ||
                contentStr.toLowerCase().includes(lowerQuery);
        });
    }

    const renderItem = ({ item }: { item: any }) => {
        const tags = extractTags(item.content);
        const excerpt = item.content.replace(/#\w+/g, '').trim().substring(0, 100) + '...';

        const formatDate = (timestamp?: number) => {
            if (!timestamp) return '';
            return new Date(timestamp).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        };

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => onNodePress(item.id)}
                onLongPress={() => onLongPress && onLongPress(item.id)}
                delayLongPress={500}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                </View>
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

                {(item.createdAt || item.updatedAt) && (
                    <View style={styles.timestampContainer}>
                        {item.createdAt && (
                            <Text style={styles.timestampText}>
                                Created: {formatDate(item.createdAt)}
                            </Text>
                        )}
                        {item.updatedAt && item.updatedAt !== item.createdAt && (
                            <Text style={styles.timestampText}>
                                Last Edited: {formatDate(item.updatedAt)}
                            </Text>
                        )}
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
        backgroundColor: '#161B22', // Dark Slate
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(125, 95, 255, 0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
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
        backgroundColor: 'rgba(125, 95, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(125, 95, 255, 0.3)',
    },
    tagText: {
        color: '#7D5FFF',
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
    },
    timestampContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        flexDirection: 'column',
        gap: 4,
    },
    timestampText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontStyle: 'italic',
    }
});
