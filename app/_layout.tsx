import { DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import "@/global.css";

import Toast from 'react-native-toast-message';

import { AuthProvider } from '@/context/AuthContext';

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
        <StatusBar hidden={false} translucent />
        <AuthProvider>
          <PermissionProvider>
            <ProductProvider>
              <ThemeProvider value={DefaultTheme}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: 'slide_from_right',
                      animationDuration: 300,
                      contentStyle: { backgroundColor: '#ffffff' },
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="permissions" />
                    <Stack.Screen name="auth" />
                    <Stack.Screen name="(tabs)/admin" />
                    <Stack.Screen name="(tabs)/karywan" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <Toast />
                </SafeAreaView>
              </ThemeProvider>
            </ProductProvider>
          </PermissionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}