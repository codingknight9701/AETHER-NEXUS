import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useJournalStore } from '../store/useJournalStore';
import * as Haptics from 'expo-haptics';
import { playSaveChime } from '../utils/audio';
import { saveThought, readThought } from '../utils/vault';
import StarfieldBackground from '../components/ui/StarfieldBackground';

export default function EditorScreen() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [showSaved, setShowSaved] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const goBack = useJournalStore((state) => state.goBack);
    const currentRoute = useJournalStore((state) => state.currentRoute);
    const idToEdit = currentRoute.params?.id;
    const prefillTitle = currentRoute.params?.prefillTitle;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (idToEdit) {
            readThought(idToEdit).then((data) => {
                if (data) {
                    setTitle(data.title || '');
                    let contentBody = data.content;
                    if (contentBody.startsWith(`# ${data.title}\n\n`)) {
                        contentBody = contentBody.replace(`# ${data.title}\n\n`, '');
                    } else if (contentBody.startsWith(`# ${data.title}\n`)) {
                        contentBody = contentBody.replace(`# ${data.title}\n`, '');
                    }
                    setText(contentBody);
                }
            });
        } else if (prefillTitle) {
            setTitle(prefillTitle);
        }
    }, [idToEdit, prefillTitle]);

    const handleSave = async () => {
        if (!text.trim() && !title.trim()) return;

        const finalTitle = title.trim() || 'Untitled Thought';

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 150);
        playSaveChime();

        await saveThought(finalTitle, text, idToEdit);

        setShowSaved(true);
        setTimeout(() => {
            setShowSaved(false);
            goBack();
        }, 1000);
    };

    const glowStyle = {
        backgroundColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255, 255, 255, 0.01)', 'rgba(125, 95, 255, 0.05)']
        }),
        borderColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255, 255, 255, 0.05)', 'rgba(125, 95, 255, 0.5)']
        }),
        borderWidth: 1,
        borderRadius: 16,
        ...(Platform.OS === 'web' ? { transition: 'box-shadow 0.3s ease, border-color 0.3s ease', boxShadow: isFocused ? '0 0 15px rgba(125, 95, 255, 0.15)' : 'none' } : {})
    };

    return (
        <LinearGradient
            colors={['#0B0E14', '#0B0E14']}
            style={styles.container}
        >
            <View style={styles.backgroundLayer} pointerEvents="none">
                <StarfieldBackground />
                <View style={styles.darkOverlay} />
            </View>

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
                        style={[styles.headerBtn, (!text.trim() && !title.trim()) && styles.disabledBtn]}
                        disabled={(!text.trim() && !title.trim()) || showSaved}
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
                    style={[styles.titleInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="Thought Title..."
                    placeholderTextColor="rgba(125,95,255,0.4)" // Glowing purple placeholder
                    value={title}
                    onChangeText={setTitle}
                    autoCapitalize="words"
                />

                <Animated.View style={[styles.inputWrapper, glowStyle]}>
                    <TextInput
                        style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                        placeholder="Start typing your thought..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        multiline
                        autoFocus
                        value={text}
                        onChangeText={setText}
                        textAlignVertical="top"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </Animated.View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(11, 14, 20, 0.65)', // 65% opacity Deep Space Black
    },
    keyboardView: {
        flex: 1,
        zIndex: 2,
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
        color: '#7D5FFF', // Nebula Purple
        fontWeight: '700',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    titleInput: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        paddingHorizontal: 24,
        marginBottom: 10,
    },
    inputWrapper: {
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 20,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 20,
        lineHeight: 30,
        paddingHorizontal: 8,
        paddingTop: 16,
        fontWeight: '300',
    },
    toastContainer: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#7D5FFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        zIndex: 100,
        shadowColor: '#7D5FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
