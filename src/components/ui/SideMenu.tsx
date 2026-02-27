import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Animated,
    Dimensions, TouchableWithoutFeedback, ScrollView, Platform,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { THEMES, THEME_ORDER } from '../../utils/themes';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
    const slideAnim = useRef(new Animated.Value(MENU_WIDTH)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const [isMounted, setIsMounted] = React.useState(visible);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTheme(id);
    };

    if (!isMounted) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
            {/* Dark overlay */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.overlay,
                        { opacity: overlayAnim },
                    ]}
                />
            </TouchableWithoutFeedback>

            {/* Panel */}
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
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={[styles.closeBtnText, { color: theme.textMuted }]}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
                    {/* THEMES SECTION */}
                    <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>🎨  THEMES</Text>

                    {THEME_ORDER.map((id) => {
                        const t = THEMES[id];
                        const isActive = themeId === id;
                        return (
                            <TouchableOpacity
                                key={id}
                                style={[
                                    styles.themeCard,
                                    {
                                        backgroundColor: t.surfaceBg,
                                        borderColor: isActive ? t.accent : 'transparent',
                                        borderWidth: isActive ? 2 : 1,
                                    },
                                ]}
                                onPress={() => handleThemeSelect(id)}
                                activeOpacity={0.75}
                            >
                                <View style={styles.themeCardLeft}>
                                    <View style={[styles.accentDot, { backgroundColor: t.accent, shadowColor: t.accent }]} />
                                    <View>
                                        <Text style={[styles.themeName, { color: '#fff' }]}>
                                            {t.emoji}  {t.name}
                                        </Text>
                                        <Text style={[styles.themeDesc, { color: 'rgba(255,255,255,0.5)' }]}>
                                            {t.description}
                                        </Text>
                                    </View>
                                </View>
                                {isActive && (
                                    <View style={[styles.activeBadge, { backgroundColor: t.accent }]}>
                                        <Text style={styles.activeBadgeText}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {/* REMINDERS SECTION */}
                    <Text style={[styles.sectionLabel, { color: theme.textMuted, marginTop: 28 }]}>🔔  REMINDERS</Text>
                    <View style={[styles.comingSoon, { backgroundColor: theme.surfaceBg, borderColor: theme.accentDim }]}>
                        <Text style={[styles.comingSoonText, { color: theme.textMuted }]}>Coming soon…</Text>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    panel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: MENU_WIDTH,
        borderLeftWidth: 1,
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
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    panelTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        fontSize: 18,
    },
    menuContent: {
        flex: 1,
        padding: 20,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginTop: 4,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    themeCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    accentDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 4,
    },
    themeName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    themeDesc: {
        fontSize: 12,
    },
    activeBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    comingSoon: {
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    comingSoonText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
});
