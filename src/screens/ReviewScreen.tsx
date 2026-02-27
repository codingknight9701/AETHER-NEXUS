import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useJournalStore } from '../store/useJournalStore';
import { useThemeStore } from '../store/useThemeStore';
import { readThought } from '../utils/vault';
import { Canvas } from '@react-three/fiber';
import MoodLandscape from '../components/3d/MoodLandscape';

export default function ReviewScreen() {
    const { currentRoute, navigate, goBack } = useJournalStore();
    const { theme } = useThemeStore();
    const entryId = currentRoute.params?.id; // e.g. "neo-noir.md"
    const insets = useSafeAreaInsets();

    const [thought, setThought] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (entryId) {
                const data = await readThought(entryId);
                setThought(data);
            }
            setLoading(false);
        };
        load();
    }, [entryId]);

    if (loading) return null;

    if (!thought) {
        return (
            <LinearGradient colors={['#0B0E14', '#0B0E14']} style={styles.container}>
                <Text style={styles.errorText}>Thought not found in Vault.</Text>
                <TouchableOpacity onPress={goBack} style={[styles.backBtn, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Text style={styles.backBtnText}>Return</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0B0E14', '#0B0E14']} style={styles.container}>
            {/* UI Overlay */}
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
                    <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Back to Nexus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => useJournalStore.getState().navigate('Editor', { id: thought.id })} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>Edit ✎</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.titleText}>{thought.title}</Text>

                    {(thought.createdAt || thought.updatedAt) && (
                        <View style={styles.timestampContainer}>
                            {thought.createdAt && (
                                <Text style={styles.timestampText}>
                                    Created: {new Date(thought.createdAt).toLocaleString()}
                                </Text>
                            )}
                            {thought.updatedAt && thought.updatedAt !== thought.createdAt && (
                                <Text style={styles.timestampText}>
                                    Last Edited: {new Date(thought.updatedAt).toLocaleString()}
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.accentDim, shadowColor: theme.accent }]}>
                        <Text style={styles.journalText}>{thought.content}</Text>
                    </View>

                    {thought.links && thought.links.length > 0 && (
                        <View style={styles.linksContainer}>
                            <Text style={styles.linksHeader}>References:</Text>
                            {thought.links.map((link: string, i: number) => (
                                <View key={`link-${i}`} style={styles.linkBadge}>
                                    <Text style={styles.linkBadgeText}>{link}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    backBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    backBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.8,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    glassCard: {
        backgroundColor: '#1C2333',
        borderRadius: 20,
        padding: 24,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(125, 95, 255, 0.35)',
        shadowColor: '#7D5FFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    dateText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    titleText: {
        color: '#7D5FFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    timestampContainer: {
        flexDirection: 'column',
        gap: 4,
        marginBottom: 20,
    },
    timestampText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        fontStyle: 'italic',
    },
    journalText: {
        color: 'rgba(255, 255, 255, 0.92)',
        fontSize: 22,
        lineHeight: 34,
        fontWeight: '300',
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
    linksContainer: {
        marginTop: 30,
        paddingHorizontal: 10,
    },
    linksHeader: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    linkBadge: {
        backgroundColor: 'rgba(125, 95, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(125, 95, 255, 0.3)',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    linkBadgeText: {
        color: '#7D5FFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
