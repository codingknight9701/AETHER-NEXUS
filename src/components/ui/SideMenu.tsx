import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Animated,
    Dimensions, ScrollView, Platform, Pressable,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { THEMES, THEME_ORDER } from '../../utils/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(300, SCREEN_WIDTH * 0.78);

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
    // Use useNativeDriver=false on web — native driver breaks hit-testing after transform
    const useNative = Platform.OS !== 'web';
    const slideAnim = useRef(new Animated.Value(MENU_WIDTH)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const [isMounted, setIsMounted] = useState(false);
    const [themesOpen, setThemesOpen] = useState(false);
    const { themeId, setTheme, theme } = useThemeStore();

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            // Lock body scroll on web
            if (Platform.OS === 'web') {
                (document.body.style as any).overflow = 'hidden';
            }
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 280,
                    useNativeDriver: useNative,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: useNative,
                }),
            ]).start();
        } else {
            setThemesOpen(false);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: MENU_WIDTH,
                    duration: 260,
                    useNativeDriver: useNative,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: useNative,
                }),
            ]).start(() => {
                setIsMounted(false);
                // Unlock body scroll on web
                if (Platform.OS === 'web') {
                    (document.body.style as any).overflow = '';
                }
            });
        }
    }, [visible]);

    if (!isMounted) return null;

    // Fixed position on web to avoid page layout issues
    const outerStyle: any = Platform.OS === 'web'
        ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }
        : StyleSheet.absoluteFill;

    const panelStyle: any = Platform.OS === 'web'
        ? { position: 'fixed', top: 0, right: 0, bottom: 0, width: MENU_WIDTH, zIndex: 10000 }
        : styles.panelNative;

    return (
        <View style={[outerStyle, { pointerEvents: 'box-none' } as any]}>
            {/* Dark semi-transparent overlay — only covers the area LEFT of the panel */}
            <Animated.View
                style={{
                    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
                    top: 0, left: 0, bottom: 0,
                    right: MENU_WIDTH,
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    opacity: overlayAnim,
                } as any}
                pointerEvents={visible ? 'auto' : 'none'}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </Animated.View>

            {/* Sliding panel */}
            <Animated.View
                style={[
                    panelStyle,
                    {
                        backgroundColor: theme.cardBg,
                        borderLeftWidth: 1,
                        borderLeftColor: theme.accentDim,
                        transform: [{ translateX: slideAnim }],
                    },
                    Platform.OS === 'web' && ({
                        boxShadow: '-6px 0 32px rgba(0,0,0,0.7)',
                    } as any),
                ]}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.accentDim }]}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>⚙ Settings</Text>
                    <Pressable
                        style={[styles.closeBtn, { backgroundColor: `${theme.accent}22` }]}
                        onPress={onClose}
                    >
                        <Text style={[styles.closeBtnText, { color: theme.accent }]}>✕</Text>
                    </Pressable>
                </View>

                {/* Scrollable menu rows — stops scrolling the whole page */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── THEMES ROW ── */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.menuRow,
                            { borderColor: theme.accentDim, opacity: pressed ? 0.7 : 1 },
                        ]}
                        onPress={() => setThemesOpen(prev => !prev)}
                    >
                        <Text style={styles.menuRowEmoji}>🎨</Text>
                        <Text style={[styles.menuRowLabel, { color: theme.textPrimary }]}>Themes</Text>
                        <Text style={[styles.chevron, { color: theme.textMuted }]}>
                            {themesOpen ? '▲' : '▼'}
                        </Text>
                    </Pressable>

                    {/* Theme cards — shown when expanded */}
                    {themesOpen && (
                        <View style={styles.themeList}>
                            {THEME_ORDER.map((id) => {
                                const t = THEMES[id];
                                const isActive = themeId === id;
                                return (
                                    <Pressable
                                        key={id}
                                        style={({ pressed }) => ([
                                            styles.themeCard,
                                            {
                                                backgroundColor: isActive ? `${t.accent}22` : theme.surfaceBg,
                                                borderColor: isActive ? t.accent : `${theme.accent}30`,
                                                borderWidth: isActive ? 2 : 1,
                                                opacity: pressed ? 0.75 : 1,
                                            },
                                        ])}
                                        onPress={() => setTheme(id)}
                                    >
                                        <View style={[styles.accentDot, { backgroundColor: t.accent }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.themeName, { color: theme.textPrimary }]}>
                                                {t.emoji}  {t.name}
                                            </Text>
                                            <Text style={[styles.themeDesc, { color: theme.textMuted }]}>
                                                {t.description}
                                            </Text>
                                        </View>
                                        {isActive && (
                                            <View style={[styles.activeBadge, { backgroundColor: t.accent }]}>
                                                <Text style={styles.checkMark}>✓</Text>
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}

                    {/* ── REMINDERS ROW ── */}
                    <View style={[styles.menuRow, { borderColor: theme.accentDim, opacity: 0.5 }]}>
                        <Text style={styles.menuRowEmoji}>🔔</Text>
                        <Text style={[styles.menuRowLabel, { color: theme.textPrimary }]}>Reminders</Text>
                        <Text style={[styles.comingBadge, { backgroundColor: `${theme.accent}33`, color: theme.accentLight }]}>
                            Soon
                        </Text>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    panelNative: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: MENU_WIDTH,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
    },
    menuRowEmoji: {
        fontSize: 18,
        marginRight: 12,
    },
    menuRowLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    chevron: {
        fontSize: 13,
    },
    comingBadge: {
        fontSize: 10,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        overflow: 'hidden',
    },
    themeList: {
        marginBottom: 10,
        gap: 8,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    accentDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    themeName: {
        fontSize: 14,
        fontWeight: '600',
    },
    themeDesc: {
        fontSize: 11,
        marginTop: 2,
    },
    activeBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkMark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
});
