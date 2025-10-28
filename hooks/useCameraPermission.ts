import { useCameraPermissions } from "expo-camera";

import { Alert, Linking, Platform } from "react-native";

export const useCameraPermission = () => {
  const [permission, requestPermission] = useCameraPermissions();

  const requestPermissionWithAlert = async () => {
    if (permission?.granted) {
      return true;
    }

    const result = await requestPermission();

    if (!result.granted) {
      // Show alert to guide user to settings
      Alert.alert(
        "Izin Kamera Diperlukan",
        "Aplikasi memerlukan akses kamera untuk scan barcode. Silakan aktifkan izin kamera di pengaturan.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Buka Pengaturan",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return false;
    }

    return true;
  };

  return {
    hasPermission: permission?.granted ?? null,
    isRequesting: permission === null,
    requestPermission: requestPermissionWithAlert,
    checkPermission: () => permission?.granted ?? false,
  };
};
