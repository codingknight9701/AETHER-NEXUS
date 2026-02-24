import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useJournalStore } from '../store/useJournalStore';
import * as Haptics from 'expo-haptics';
import { playSaveChime } from '../utils/audio';
import { saveThought, readThought } from '../utils/vault';

export default function EditorScreen() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [showSaved, setShowSaved] = useState(false);
    const goBack = useJournalStore((state) => state.goBack);
    const currentRoute = useJournalStore((state) => state.currentRoute);
    const idToEdit = currentRoute.params?.id;
    const prefillTitle = currentRoute.params?.prefillTitle;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (idToEdit) {
            readThought(idToEdit).then((data) => {
                if (data) {
                    setTitle(data.title);
                    setText(data.content);
                }
            });
        } else if (prefillTitle) {
            setTitle(prefillTitle);
        }
    }, [idToEdit, prefillTitle]);

    const handleSave = async () => {
        if (!text.trim() || !title.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 150);
        playSaveChime();

        await saveThought(title, text);

        setShowSaved(true);
        setTimeout(() => {
            setShowSaved(false);
            goBack();
        }, 1000);
    };

    return (
        <LinearGradient
            colors={['#151833', '#0a0b1a']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                    <TouchableOpacity onPress={goBack} style={styles.headerBtn}>
                        <Text style={styles.headerBtnText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.headerBtn, (!text.trim() || !title.trim()) && styles.disabledBtn]}
                        disabled={!text.trim() || !title.trim() || showSaved}
                    >
                        <Text style={[styles.headerBtnText, styles.saveText]}>Save to Vault</Text>
                    </TouchableOpacity>
                </View>

                {showSaved && (
                    <View style={[styles.toastContainer, { top: insets.top + 60 }]}>
                        <Text style={styles.toastText}>✓ Saved to Vault</Text>
                    </View>
                )}

                <TextInput
                    style={styles.titleInput}
                    placeholder="Thought Title..."
                    placeholderTextColor="rgba(0,255,204,0.4)"
                    value={title}
                    onChangeText={setTitle}
                    autoCapitalize="words"
                />
                <Text style={styles.helperText}>Syntax:  [[Exact Title Name]]  to link</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Start typing your thought... use [[links]] to connect concepts."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline
                    autoFocus
                    value={text}
                    onChangeText={setText}
                    textAlignVertical="top"
                />
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
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
        fontSize: 20,
        lineHeight: 30,
        paddingHorizontal: 24,
        fontWeight: '300',
    },
    titleInput: {
        color: '#00ffcc',
        fontSize: 32,
        fontWeight: 'bold',
        paddingHorizontal: 24,
        marginBottom: 5,
    },
    helperText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    toastContainer: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#00ffcc',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        zIndex: 100,
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
