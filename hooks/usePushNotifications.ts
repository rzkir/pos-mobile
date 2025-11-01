import { useState, useEffect, useRef } from "react";

import { Platform } from "react-native";

import * as Notifications from "expo-notifications";

import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_STORAGE_KEY = process.env
  .EXPO_PUBLIC_PUSH_NOTIFICATIONS as string;

export interface NotificationSound {
  id: string;
  name: string;
  value: string;
  description: string;
}

export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  {
    id: "default",
    name: "Default",
    value: "default",
    description: "Suara default sistem",
  },
  { id: "bell", name: "Bell", value: "default", description: "Suara bel" },
  { id: "chime", name: "Chime", value: "default", description: "Suara chime" },
  { id: "alert", name: "Alert", value: "default", description: "Suara alert" },
  {
    id: "notification",
    name: "Notification",
    value: "default",
    description: "Suara notifikasi",
  },
  {
    id: "none",
    name: "Tanpa Suara",
    value: "",
    description: "Tidak ada suara",
  },
];

interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
  lowStockAlerts: boolean;
  selectedSound: string; // ID dari NOTIFICATION_SOUNDS
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<boolean>(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    soundEnabled: true,
    lowStockAlerts: true,
    selectedSound: "default",
  });
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Ensure selectedSound exists, default to 'default' if missing
        if (!parsedSettings.selectedSound) {
          parsedSettings.selectedSound = "default";
        }
        setSettings(parsedSettings);
      }
    } catch {
      // Silently fail
    }
  };

  // Save settings to storage
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings)
      );
      setSettings(newSettings);
    } catch (error) {
      throw error;
    }
  };

  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      setLoading(true);

      // Check existing permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setNotificationPermission(finalStatus === "granted");

      if (finalStatus !== "granted") {
        return null;
      }

      // Get push token
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      const tokenData = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();
      const token = typeof tokenData === "string" ? tokenData : tokenData.data;
      setExpoPushToken(token);

      // Save token to storage
      await AsyncStorage.setItem(
        process.env.EXPO_PUBLIC_PUSH_TOKEN as string,
        token
      );

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF9228",
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("low_stock", {
          name: "Low Stock Alerts",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF9228",
          sound: "default",
        });
      }

      return token;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Unregister from push notifications
  const unregisterPushNotifications = async () => {
    try {
      await AsyncStorage.removeItem(
        process.env.EXPO_PUBLIC_PUSH_TOKEN as string
      );
      setExpoPushToken(null);
      setNotificationPermission(false);
    } catch {
      // Silently fail
    }
  };

  // Update push notifications setting
  const updatePushEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, pushEnabled: enabled };
    await saveSettings(newSettings);

    if (enabled) {
      await registerForPushNotifications();
    } else {
      await unregisterPushNotifications();
    }
  };

  // Update sound setting
  const updateSoundEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, soundEnabled: enabled };
    await saveSettings(newSettings);
  };

  // Update selected sound
  const updateSelectedSound = async (soundId: string) => {
    const newSettings = { ...settings, selectedSound: soundId };
    await saveSettings(newSettings);
  };

  // Get sound value for notification
  const getSoundValue = (): string | undefined => {
    if (!settings.soundEnabled) {
      return undefined;
    }
    const sound = NOTIFICATION_SOUNDS.find(
      (s) => s.id === settings.selectedSound
    );
    if (!sound || sound.value === "") {
      return undefined;
    }
    return sound.value;
  };

  // Update low stock alerts setting
  const updateLowStockAlerts = async (enabled: boolean) => {
    const newSettings = { ...settings, lowStockAlerts: enabled };
    await saveSettings(newSettings);
  };

  // Initialize on mount
  useEffect(() => {
    registerForPushNotifications();

    // Listen for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Handle notification if needed
      });

    // Listen for user tapping on notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        // Handle notification response if needed
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

  // Schedule a local notification (for testing)
  const scheduleTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notifikasi",
        body: "Ini adalah notifikasi percobaan",
        sound: getSoundValue(),
        data: { type: "test" },
      },
      trigger: null, // Show immediately
    });
  };

  // Test sound notification (with sound)
  const scheduleTestSoundNotification = async () => {
    const soundValue = getSoundValue() || "default";
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Test Suara",
        body: "Notifikasi ini akan berbunyi untuk menguji suara notifikasi",
        sound: soundValue,
        data: { type: "test_sound" },
      },
      trigger: null,
      identifier: `test_sound_${Date.now()}`,
    });
  };

  // Test low stock alert notification
  const scheduleTestLowStockAlert = async () => {
    // Always send test, regardless of settings
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Test Alert Stok Rendah",
        body: "Produk Test tersisa 5 unit - Ini adalah notifikasi percobaan",
        sound: getSoundValue(),
        data: {
          type: "low_stock",
          productName: "Produk Test",
          currentStock: 5,
          isTest: true,
        },
      },
      trigger: null,
      identifier: `test_low_stock_${Date.now()}`,
    });
  };

  // Send low stock alert notification
  const sendLowStockAlert = async (
    productName: string,
    currentStock: number
  ) => {
    if (!settings.lowStockAlerts || !settings.pushEnabled) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Stok Rendah",
        body: `${productName} tersisa ${currentStock} unit`,
        sound: getSoundValue(),
        data: { type: "low_stock", productName, currentStock },
      },
      trigger: null,
      identifier: `low_stock_${Date.now()}`,
    });
  };

  return {
    expoPushToken,
    notificationPermission,
    settings,
    loading,
    registerForPushNotifications,
    unregisterPushNotifications,
    updatePushEnabled,
    updateSoundEnabled,
    updateLowStockAlerts,
    updateSelectedSound,
    getSoundValue,
    scheduleTestNotification,
    scheduleTestSoundNotification,
    scheduleTestLowStockAlert,
    sendLowStockAlert,
  };
};
