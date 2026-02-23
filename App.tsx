import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import ReviewScreen from './src/screens/ReviewScreen';

export type RootStackParamList = {
  Home: undefined;
  Editor: undefined;
  Review: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade', // Smooth fading for all transitions
          contentStyle: { backgroundColor: '#121212' }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Editor"
          component={EditorScreen}
          options={{
            presentation: 'modal', // Slides up on iOS, fades on Android
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            animation: 'fade'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
