import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { useJournalStore } from '../store/useJournalStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [pin, setPin] = useState<string>('');
    const [isSettingPin, setIsSettingPin] = useState<boolean>(false);
    const [confirmingPin, setConfirmingPin] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [shakeAnim] = useState(new Animated.Value(0));

    const { hashedPin, setHashedPin, unlock } = useJournalStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!hashedPin) {
            setIsSettingPin(true);
        }
    }, [hashedPin]);

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const newPin = pin + num;
            setPin(newPin);
            setErrorMsg('');

            if (newPin.length === 4) {
                setTimeout(() => processPin(newPin), 100);
            }
        }
    };

    const handleDelete = () => {
        if (pin.length > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setPin(pin.slice(0, -1));
            setErrorMsg('');
        }
    };

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    const processPin = async (currentPin: string) => {
        if (isSettingPin) {
            if (!confirmingPin) {
                // Moving to confirm step
                setConfirmingPin(currentPin);
                setPin('');
            } else {
                if (currentPin === confirmingPin) {
                    // PINs match, save it
                    const hash = await Crypto.digestStringAsync(
                        Crypto.CryptoDigestAlgorithm.SHA256,
                        currentPin
                    );
                    setHashedPin(hash);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    unlock();
                } else {
                    // PINs don't match
                    setErrorMsg('PINs do not match. Try again.');
                    setPin('');
                    setConfirmingPin('');
                    triggerShake();
                }
            }
        } else {
            // Unlocking
            const hash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                currentPin
            );
            if (hash === hashedPin) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                unlock();
            } else {
                setErrorMsg('Incorrect PIN');
                setPin('');
                triggerShake();
            }
        }
    };

    const renderDots = () => {
        const dots = [];
        for (let i = 0; i < 4; i++) {
            dots.push(
                <View
                    key={i}
                    style={[
                        styles.dot,
                        pin.length > i ? styles.dotFilled : null,
                        errorMsg ? styles.dotError : null
                    ]}
                />
            );
        }
        return dots;
    };

    const renderKeypadMenu = () => {
        const rows = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', '⌫']
        ];

        return rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key, keyIndex) => (
                    <TouchableOpacity
                        key={keyIndex}
                        style={[styles.keypadButton, key === '' ? styles.keypadButtonEmpty : null]}
                        onPress={() => {
                            if (key === '⌫') handleDelete();
                            else if (key !== '') handleNumberPress(key);
                        }}
                        disabled={key === ''}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.keypadButtonText}>{key}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        ));
    };

    return (
        <LinearGradient
            colors={['#08080C', '#120f18', '#000000']}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
                <View style={[styles.header, { marginTop: insets.top + 60 }]}>
                    <Text style={styles.title}>
                        {isSettingPin
                            ? (confirmingPin ? 'Confirm PIN' : 'Set Vault PIN')
                            : 'Enter Vault PIN'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSettingPin
                            ? 'Secure your thoughts with a 4-digit code'
                            : 'Aether Nexus requires authentication'}
                    </Text>
                </View>

                <View style={styles.dotsContainer}>
                    {renderDots()}
                </View>

                <Text style={styles.errorText}>{errorMsg}</Text>

                <View style={styles.keypadContainer}>
                    {renderKeypadMenu()}
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        color: '#00ffcc',
        fontSize: 32,
        fontWeight: '300',
        marginBottom: 10,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 204, 0.5)',
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: '#00ffcc',
        borderColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    dotError: {
        borderColor: '#ff3366',
        backgroundColor: '#ff3366',
        shadowColor: '#ff3366',
    },
    errorText: {
        color: '#ff3366',
        height: 20,
        marginBottom: 20,
    },
    keypadContainer: {
        width: 280,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    keypadButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    keypadButtonEmpty: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    keypadButtonText: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: '300',
    },
});
