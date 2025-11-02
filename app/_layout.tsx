import { useEffect, useRef } from 'react';

import { Stack } from 'expo-router';

import { Platform } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import * as SystemUI from 'expo-system-ui';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import * as Notifications from 'expo-notifications';

import "@/global.css";

import Toast from 'react-native-toast-message';

import { PermissionProvider } from '@/context/PermissionContext';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ProductProvider } from '@/context';

import { AppSettingsProvider } from '@/context/AppSettingsContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Set status bar background color for Android
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('#FF9228').catch(() => { });

      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9228',
        sound: 'default',
      }).catch(() => { });

      Notifications.setNotificationChannelAsync('low_stock', {
        name: 'Low Stock Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9228',
        sound: 'default',
      }).catch(() => { });
    }

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      if (notification.request.content.data) {
        const data = notification.request.content.data;
        if (data.type === 'low_stock') {
        }
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.type === 'low_stock') {
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#FF9228" />

        <PermissionProvider>
          <AppSettingsProvider>
            <ProductProvider>
              <SafeAreaView className='flex-1 bg-background'>
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
              </SafeAreaView>
            </ProductProvider>
          </AppSettingsProvider>
        </PermissionProvider>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}