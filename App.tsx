import React, { useEffect } from 'react';
import { View, StatusBar, StyleSheet, Animated, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useJournalStore } from './src/store/useJournalStore';
import { initAudio, playBackgroundMusic } from './src/utils/audio';
import { initVault } from './src/utils/vault';

// Ignore harmless R3F/Three.js ecosystem warnings manually
// LogBox doesn't always catch deep WebGL warnings on native
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.WARNING: Multiple instances') ||
      args[0].includes('THREE.THREE.Clock: This module has been deprecated'))
  ) {
    return;
  }
  originalWarn(...args);
};

const originalLog = console.log;
console.log = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('EXGL: gl.pixelStorei()')) {
    return;
  }
  originalLog(...args);
};

LogBox.ignoreLogs([
  'THREE.WARNING: Multiple instances',
  'THREE.THREE.Clock: This module has been deprecated',
  'EXGL: gl.pixelStorei()'
]);

// Screens
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import ReviewScreen from './src/screens/ReviewScreen';

export default function App() {
  const currentRoute = useJournalStore((state) => state.currentRoute);

  useEffect(() => {
    const setupApp = async () => {
      await initVault();
      await initAudio();
      playBackgroundMusic();
    };
    setupApp();
  }, []);

  const renderScreen = () => {
    switch (currentRoute.name) {
      case 'Home':
        return <HomeScreen />;
      case 'Editor':
        return <EditorScreen />;
      case 'Review':
        return <ReviewScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  }
});
