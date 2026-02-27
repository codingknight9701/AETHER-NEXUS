import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { useJournalStore } from '../store/useJournalStore';
import { isWebAuthnSupported, registerWebAuthn, authenticateWebAuthn } from '../utils/webAuthn';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [currentPin, setCurrentPin] = useState<string>('');
    const [isSettingPin, setIsSettingPin] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [shakeAnim] = useState(new Animated.Value(0));

    const { hashedPin, setHashedPin, unlock, webAuthnCredentialId, setWebAuthnCredentialId } = useJournalStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!hashedPin) {
            setIsSettingPin(true);
        }
        // Deliberately NOT calling checkBiometrics() here to prevent
        // annoying automatic Passkey/Windows Hello popups on every load.
        // Users must tap the 👤 button to trigger it manually.
    }, [hashedPin]);

    const checkBiometrics = async () => {
        try {
            if (isWebAuthnSupported()) {
                if (webAuthnCredentialId) {
                    const success = await authenticateWebAuthn(webAuthnCredentialId);
                    if (success) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        unlock();
                    } else {
                        setErrorMsg('Face/Touch ID canceled or failed.');
                        triggerShake();
                    }
                } else {
                    setErrorMsg('Face ID not set up for this browser.');
                    triggerShake();
                }
                return;
            }

            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Unlock Aether Vault',
                    fallbackLabel: 'Use PIN',
                    disableDeviceFallback: false,
                });

                if (result.success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    unlock();
                } else {
                    setErrorMsg('Face/Touch ID canceled or failed.');
                    triggerShake();
                }
            } else {
                setErrorMsg('Biometrics unavailable on this device.');
                triggerShake();
            }
        } catch (error) {
            console.log("Biometric auth failed:", error);
            setErrorMsg('Biometrics unsupported (e.g., HTTP or missing hardware).');
            triggerShake();
        }
    };

    const handleNumberPress = (num: string) => {
        if (currentPin.length < 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const newPin = currentPin + num;
            setCurrentPin(newPin);
            setErrorMsg('');

            if (newPin.length === 4) {
                // Must be synchronous to maintain user gesture for WebAuthn API 
                processPin(newPin);
            }
        }
    };

    const handleDelete = () => {
        if (currentPin.length > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentPin(currentPin.slice(0, -1));
            setErrorMsg('');
        }
    };

    const triggerShake = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const processPin = async (pin: string) => {
        try {
            if (isSettingPin) {
                // First pass of setting PIN: just require a 4 digit code
                if (currentPin.length === 3) {
                    // Wait for state to update, this function is called with newPin directly
                }

                // When component mounts, it either finds a hashed pin or not.
                // Assuming we just want them to enter it once and hit 4 digits to save
                if (pin.length === 4) {
                    // PINs match, save it
                    const hash = await Crypto.digestStringAsync(
                        Crypto.CryptoDigestAlgorithm.SHA256,
                        pin
                    );
                    setHashedPin(hash);

                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    unlock();
                } else {
                    triggerShake();
                    setCurrentPin('');
                }
            } else {
                // Unlocking
                const hash = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    pin
                );
                if (hash === hashedPin) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    unlock();
                } else {
                    triggerShake();
                    setCurrentPin('');
                    setErrorMsg('Incorrect PIN');
                }
            }
        } catch (e) {
            console.error("Authentication error:", e);
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
                        currentPin.length > i ? styles.dotFilled : null,
                        errorMsg !== '' ? styles.dotError : null
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
            ['👤', '0', '⌫']
        ];

        return rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key, keyIndex) => {
                    const isEmptyOrDisabledBio = key === '👤' && isSettingPin;
                    return (
                        <TouchableOpacity
                            key={keyIndex}
                            style={[styles.keypadButton, isEmptyOrDisabledBio ? styles.keypadButtonEmpty : null]}
                            onPress={() => {
                                if (key === '⌫') handleDelete();
                                else if (key === '👤') {
                                    if (!isSettingPin) checkBiometrics();
                                }
                                else handleNumberPress(key);
                            }}
                            disabled={isEmptyOrDisabledBio}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.keypadButtonText}>{isEmptyOrDisabledBio ? '' : key}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        ));
    };

    return (
        <LinearGradient
            colors={['#0B0E14', '#0B0E14']}
            style={styles.container}
        >
            <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
                <Animated.View style={[styles.headerContainer, { transform: [{ translateX: shakeAnim }] }]}>
                    <Text style={styles.title}>
                        {isSettingPin ? 'Create Vault PIN' : 'Aether Vault'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSettingPin
                            ? 'Secure your thoughts. This PIN is local to this device.'
                            : 'Enter your 4-digit PIN to unlock.'}
                    </Text>

                    <View style={styles.dotsContainer}>
                        {renderDots()}
                    </View>

                    <Text style={styles.errorText}>{errorMsg}</Text>
                </Animated.View>

                <View style={styles.keypadContainer}>
                    {renderKeypadMenu()}
                </View>
            </View>
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
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        color: '#ffffff',
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    dotFilled: {
        backgroundColor: '#7D5FFF',
        borderColor: '#7D5FFF',
        shadowColor: '#7D5FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    dotError: {
        backgroundColor: '#ff3366',
        borderColor: '#ff3366',
        shadowColor: '#ff3366',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    errorText: {
        color: '#ff3366',
        height: 20,
        fontSize: 14,
    },
    keypadContainer: {
        width: '100%',
        paddingHorizontal: 30,
        gap: 20,
        maxWidth: 400,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    keypadButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#161B22',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(125,95,255,0.2)',
    },
    keypadButtonEmpty: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    keypadButtonText: {
        fontSize: 28,
        color: '#ffffff',
        fontWeight: '400',
    }
});
