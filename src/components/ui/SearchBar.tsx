import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
}

export default function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                /* @ts-ignore */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(125,95,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            ) : (
                <Ionicons name="search" size={20} color="rgba(125,95,255,0.6)" style={styles.searchIcon} />
            )}
            <TextInput
                style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="Search Nexus..."
                placeholderTextColor="rgba(125,95,255,0.4)"
                value={value}
                onChangeText={onChangeText}
                autoCorrect={false}
                autoCapitalize="none"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={onClear} style={styles.clearButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C2333',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        marginHorizontal: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(125, 95, 255, 0.4)',
        shadowColor: '#7D5FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '400',
    },
    clearButton: {
        marginLeft: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: Platform.OS === 'ios' ? -2 : 0,
    }
});
