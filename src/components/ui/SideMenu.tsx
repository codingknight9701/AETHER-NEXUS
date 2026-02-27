import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Animated,
    Dimensions, ScrollView, Platform,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { THEMES, THEME_ORDER } from '../../utils/themes';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(310, SCREEN_WIDTH * 0.80);

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
    const slideAnim = useRef(new Animated.Value(MENU_WIDTH)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const [isMounted, setIsMounted] = useState(false);
    const [themesOpen, setThemesOpen] = useState(false);
    const { themeId, setTheme, theme } = useThemeStore();

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            setThemesOpen(false);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: MENU_WIDTH,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsMounted(false));
        }
    }, [visible]);

    const handleThemeSelect = (id: string) => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTheme(id);
    };

    if (!isMounted) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Overlay — only covers the left portion, NOT the panel */}
            <Animated.View
                style={[
                    styles.overlay,
                    { opacity: overlayAnim, right: MENU_WIDTH },
                ]}
                pointerEvents={visible ? 'auto' : 'none'}
            >
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
            </Animated.View>

            {/* Panel — slides in from right */}
            <Animated.View
                style={[
                    styles.panel,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.accentDim,
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                {/* Header */}
                <View style={[styles.panelHeader, { borderBottomColor: theme.accentDim }]}>
                    <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>⚙ Settings</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                        <Text style={[styles.closeBtnText, { color: theme.accent }]}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>

                    {/* ── THEMES ROW (collapsible) ── */}
                    <TouchableOpacity
                        style={[styles.menuRow, { borderColor: theme.accentDim }]}
                        onPress={() => setThemesOpen(prev => !prev)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.menuRowIcon}>🎨</Text>
                        <Text style={[styles.menuRowLabel, { color: theme.textPrimary }]}>Themes</Text>
                        <Text style={[styles.menuRowChevron, { color: theme.textMuted }]}>
                            {themesOpen ? '▲' : '▼'}
                        </Text>
                    </TouchableOpacity>

                    {/* Theme cards (only shown when expanded) */}
                    {themesOpen && (
                        <View style={styles.themesContainer}>
                            {THEME_ORDER.map((id) => {
                                const t = THEMES[id];
                                const isActive = themeId === id;
                                return (
                                    <TouchableOpacity
                                        key={id}
                                        style={[
                                            styles.themeCard,
                                            {
                                                backgroundColor: isActive ? `${t.accent}22` : theme.surfaceBg,
                                                borderColor: isActive ? t.accent : theme.accentDim,
                                                borderWidth: isActive ? 2 : 1,
                                            },
                                        ]}
                                        onPress={() => handleThemeSelect(id)}
                                        activeOpacity={0.7}
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
                                                <Text style={styles.activeBadgeText}>✓</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* ── REMINDERS ROW ── */}
                    <TouchableOpacity
                        style={[styles.menuRow, { borderColor: theme.accentDim, marginTop: 6 }]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.menuRowIcon}>🔔</Text>
                        <Text style={[styles.menuRowLabel, { color: theme.textPrimary }]}>Reminders</Text>
                        <Text style={[styles.menuRowBadge, { backgroundColor: theme.accentDim, color: theme.textMuted }]}>
                            Soon
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    panel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: MENU_WIDTH,
        borderLeftWidth: 1,
        zIndex: 100,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: -4, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
            },
            android: { elevation: 20 },
            web: { boxShadow: '-8px 0 40px rgba(0,0,0,0.6)' },
        }),
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    closeBtnText: {
        fontSize: 22,
        fontWeight: '700',
    },
    menuContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 8,
    },
    menuRowIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuRowLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    menuRowChevron: {
        fontSize: 12,
        marginLeft: 8,
    },
    menuRowBadge: {
        fontSize: 10,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        overflow: 'hidden',
    },
    themesContainer: {
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    accentDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    themeName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    themeDesc: {
        fontSize: 12,
    },
    activeBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
});
