import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useJournalStore } from '../store/useJournalStore';
import { Canvas } from '@react-three/fiber/native';
import MoodLandscape from '../components/3d/MoodLandscape';

type RootStackParamList = {
    Home: undefined;
    Editor: undefined;
    Review: { id: string };
};

type ReviewScreenRouteProp = {
    key: string;
    name: 'Review';
    params: { id: string };
};

export default function ReviewScreen() {
    const route = useRoute<ReviewScreenRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const entryId = route.params.id;

    const entry = useJournalStore((state) =>
        state.entries.find((e) => e.id === entryId)
    );

    if (!entry) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Memory not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Return</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return (
        <View style={styles.container}>
            {/* Background 3D Landscape */}
            <View style={StyleSheet.absoluteFill}>
                <Canvas camera={{ position: [0, 5, 5], fov: 60 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <MoodLandscape sentimentScore={entry.sentimentScore} />
                </Canvas>
            </View>

            {/* UI Overlay */}
            <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back to Cloud</Text>
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.glassCard}>
                        <Text style={styles.dateText}>{dateStr}</Text>
                        <Text style={styles.journalText}>{entry.text}</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    backBtn: {
        padding: 20,
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    }
});
