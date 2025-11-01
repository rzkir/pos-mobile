import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import "@/global.css";

import Toast from 'react-native-toast-message';

import { PermissionProvider } from '@/context/PermissionContext';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ProductProvider } from '@/context';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar hidden={false} translucent backgroundColor="#FF9228" />
        <PermissionProvider>
          <ProductProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
              <Stack
                initialRouteName="index"
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                  contentStyle: { backgroundColor: '#ffffff' },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
              </Stack>
              <Toast />
            </SafeAreaView>
          </ProductProvider>
        </PermissionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}