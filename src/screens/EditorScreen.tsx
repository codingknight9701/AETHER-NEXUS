import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useJournalStore } from '../store/useJournalStore';
import { analyzeSentiment, getSentimentColor } from '../utils/sentiment';
import * as Haptics from 'expo-haptics';

export default function EditorScreen() {
    const [text, setText] = useState('');
    const navigation = useNavigation();
    const addEntry = useJournalStore((state) => state.addEntry);

    const handleSave = () => {
        if (!text.trim()) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Core NLP Logic processing
        const score = analyzeSentiment(text);
        const color = getSentimentColor(score);

        addEntry(text, score, color);

        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Text style={styles.headerBtnText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.headerBtn, !text.trim() && styles.disabledBtn]}
                    disabled={!text.trim()}
                >
                    <Text style={[styles.headerBtnText, styles.saveText]}>Save</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor="#666"
                multiline
                autoFocus
                value={text}
                onChangeText={setText}
                textAlignVertical="top"
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
    },
    headerBtn: {
        padding: 10,
    },
    headerBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    saveText: {
        color: '#A2D9CE', // Soft teal for save
        fontWeight: '700',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 24,
        lineHeight: 34,
        paddingHorizontal: 24,
        fontWeight: '300',
    },
});
