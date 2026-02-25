import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useJournalStore } from '../store/useJournalStore';
import { readThought } from '../utils/vault';
import { Canvas } from '@react-three/fiber';
import MoodLandscape from '../components/3d/MoodLandscape';

export default function ReviewScreen() {
    const currentRoute = useJournalStore((state) => state.currentRoute);
    const goBack = useJournalStore((state) => state.goBack);
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
            <LinearGradient colors={['#151833', '#0a0b1a']} style={styles.container}>
                <Text style={styles.errorText}>Thought not found in Vault.</Text>
                <TouchableOpacity onPress={goBack} style={[styles.backBtn, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Text style={styles.backBtnText}>Return</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#08080C', '#120f18', '#000000']} style={styles.container}>
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

                    <View style={styles.glassCard}>
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
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    dateText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    titleText: {
        color: '#00ffcc',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    journalText: {
        color: '#fff',
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
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 204, 0.3)',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    linkBadgeText: {
        color: '#00ffcc',
        fontSize: 16,
        fontWeight: '600',
    }
});
