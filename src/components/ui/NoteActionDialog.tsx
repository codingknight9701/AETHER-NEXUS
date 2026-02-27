import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface NoteActionDialogProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    onArchive: () => void;
    onSend: () => void;
    onCopy: () => void;
}

export default function NoteActionDialog({ visible, onClose, onDelete, onArchive, onSend, onCopy }: NoteActionDialogProps) {
    if (!visible) return null;

    const Wrapper = Platform.OS === 'ios' ? BlurView : View;
    const wrapperProps = Platform.OS === 'ios' ? { intensity: 50, tint: 'dark' as any } : { style: { backgroundColor: 'rgba(0,0,0,0.7)' } };

    const handleAction = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        action();
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <Wrapper {...wrapperProps} style={[StyleSheet.absoluteFill, styles.overlay]}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.dialogCard}>
                            <Text style={styles.headerTitle}>Note Actions</Text>

                            <TouchableOpacity style={styles.actionRow} onPress={() => handleAction(onCopy)}>
                                <Ionicons name="copy-outline" size={20} color="#fff" />
                                <Text style={styles.actionText}>Make a Copy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionRow} onPress={() => handleAction(onSend)}>
                                <Ionicons name="share-outline" size={20} color="#fff" />
                                <Text style={styles.actionText}>Send Note</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionRow} onPress={() => handleAction(onArchive)}>
                                <Ionicons name="archive-outline" size={20} color="#fff" />
                                <Text style={styles.actionText}>Archive</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.actionRow} onPress={() => handleAction(onDelete)}>
                                <Ionicons name="trash-outline" size={20} color="#ff3366" />
                                <Text style={[styles.actionText, styles.dangerText]}>Delete Permanently</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </Wrapper>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialogCard: {
        backgroundColor: '#161B22',
        width: '100%',
        maxWidth: 320,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(125, 95, 255, 0.3)',
        shadowColor: '#7D5FFF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    headerTitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
        textAlign: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
    },
    actionText: {
        color: '#ffffff',
        fontSize: 18,
        marginLeft: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 4,
    },
    dangerText: {
        color: '#ff3366',
    }
});
