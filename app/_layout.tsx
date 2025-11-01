import { useEffect, useRef } from 'react';

import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import * as Notifications from 'expo-notifications';

import "@/global.css";

import Toast from 'react-native-toast-message';

import { PermissionProvider } from '@/context/PermissionContext';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ProductProvider } from '@/context';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      if (notification.request.content.data) {
        const data = notification.request.content.data;
        if (data.type === 'low_stock') {
          console.log('Low stock alert:', data);
        }
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;

      if (data?.type === 'low_stock') {
        console.log('Navigate to low stock product:', data);
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
            </SafeAreaView>
          </ProductProvider>
        </PermissionProvider>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}