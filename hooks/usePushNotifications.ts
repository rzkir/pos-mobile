import { useState, useEffect, useRef } from "react";

import { Platform } from "react-native";

import * as Notifications from "expo-notifications";

import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_STORAGE_KEY = process.env
  .EXPO_PUBLIC_PUSH_NOTIFICATIONS as string;

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

  useEffect(() => {
    const initialize = async () => {
      await loadSettings();
      // Check existing permission status
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationPermission(status === "granted");
    };
    initialize();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        if (!parsedSettings.selectedSound) {
          parsedSettings.selectedSound = "default";
        }
        setSettings(parsedSettings);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

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

  const registerForPushNotifications = async () => {
    try {
      setLoading(true);

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const hasPermission = finalStatus === "granted";
      setNotificationPermission(hasPermission);

      if (!hasPermission) {
        return null;
      }

      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      const tokenData = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();
      const token = typeof tokenData === "string" ? tokenData : tokenData.data;
      setExpoPushToken(token);

      await AsyncStorage.setItem(
        process.env.EXPO_PUBLIC_PUSH_TOKEN as string,
        token
      );

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
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unregisterPushNotifications = async () => {
    try {
      await AsyncStorage.removeItem(
        process.env.EXPO_PUBLIC_PUSH_TOKEN as string
      );
      setExpoPushToken(null);
      // Don't change notificationPermission here, as it's about system permission
      // Only clear the token and expoPushToken
    } catch {}
  };

  const updatePushEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, pushEnabled: enabled };
    await saveSettings(newSettings);

    if (enabled) {
      await registerForPushNotifications();
    } else {
      await unregisterPushNotifications();
    }
  };

  const updateSoundEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, soundEnabled: enabled };
    await saveSettings(newSettings);
  };

  const updateSelectedSound = async (soundId: string) => {
    const newSettings = { ...settings, selectedSound: soundId };
    await saveSettings(newSettings);
  };

  const getSoundValue = (): string | undefined => {
    if (!settings.soundEnabled) {
      return undefined;
    }
    return "default";
  };

  const updateLowStockAlerts = async (enabled: boolean) => {
    const newSettings = { ...settings, lowStockAlerts: enabled };
    await saveSettings(newSettings);
  };

  // Setup notification listeners (always, regardless of settings)
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {});

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Register for push notifications if enabled (only when settings are loaded)
  useEffect(() => {
    if (!loading && settings.pushEnabled && notificationPermission) {
      // Only get token if permission is already granted
      const getToken = async () => {
        try {
          const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
          const tokenData = projectId
            ? await Notifications.getExpoPushTokenAsync({ projectId })
            : await Notifications.getExpoPushTokenAsync();
          const token =
            typeof tokenData === "string" ? tokenData : tokenData.data;
          setExpoPushToken(token);
          await AsyncStorage.setItem(
            process.env.EXPO_PUBLIC_PUSH_TOKEN as string,
            token
          );
        } catch (error) {
          console.error("Error getting push token:", error);
        }
      };
      getToken();
    }
  }, [loading, settings.pushEnabled, notificationPermission]);

  const sendLowStockAlert = async (
    productName: string,
    currentStock: number
  ) => {
    if (
      !settings.lowStockAlerts ||
      !settings.pushEnabled ||
      !notificationPermission
    ) {
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
      ...(Platform.OS === "android" && { channelId: "low_stock" }),
    });
  };

  const testNotification = async () => {
    if (!settings.pushEnabled || !notificationPermission) {
      throw new Error("Notifikasi belum diaktifkan atau izin belum diberikan");
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Test Notifikasi",
        body: "Ini adalah notifikasi uji coba. Pengaturan notifikasi Anda berfungsi dengan baik!",
        sound: getSoundValue(),
        data: { type: "test" },
      },
      trigger: null,
      identifier: `test_${Date.now()}`,
      ...(Platform.OS === "android" && { channelId: "default" }),
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
    sendLowStockAlert,
    testNotification,
  };
};
