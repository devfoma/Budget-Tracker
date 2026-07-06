import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTour, ProfileSetupGate } from './src/components';
import { AppDataProvider } from './src/context/AppDataContext';
import { MainTabs } from './src/navigation/MainTabs';
import { navigationRef } from './src/navigation/navigationRef';
import './src/services/notifications';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="light" />
          <MainTabs />
          <ProfileSetupGate />
          <AppTour />
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
