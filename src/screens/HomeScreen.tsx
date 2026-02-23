import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import CloudCanvas from '../components/3d/MemoryCloud';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Home: undefined;
    Editor: undefined;
    Review: { id: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const handleSpherePress = (id: string) => {
        navigation.navigate('Review', { id });
    };

    const handleAddPress = () => {
        navigation.navigate('Editor');
    };

    return (
        <View style={styles.container}>
            <CloudCanvas onSpherePress={handleSpherePress} />

            {/* Floating Action Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.8}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background for the cloud to pop
    },
    fabContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
    },
    fab: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    fabText: {
        fontSize: 40,
        color: '#121212',
        fontWeight: '300',
        marginTop: -4, // Optical alignment
    },
});
