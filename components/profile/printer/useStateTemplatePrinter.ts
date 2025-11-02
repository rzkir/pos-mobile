import { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as ImagePicker from "expo-image-picker";

import * as FileSystem from "expo-file-system/legacy";

import { Alert } from "react-native";

import Toast from "react-native-toast-message";

import { router } from "expo-router";

import { DEFAULT_TEMPLATE } from "@/app/profile/printer/template/index";

const STORAGE_KEY = process.env.EXPO_PUBLIC_PRINTER_CUSTUM as string;

export function useStateTemplatePrinter() {
  const [settings, setSettings] = useState<TemplateSettings>(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading template settings:", error);
      Toast.show({
        type: "error",
        text1: "Gagal Memuat",
        text2: "Gagal memuat pengaturan template",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      Toast.show({
        type: "success",
        text1: "Berhasil",
        text2: "Pengaturan template berhasil disimpan",
      });
      router.back();
    } catch (error) {
      console.error("Error saving template settings:", error);
      Toast.show({
        type: "error",
        text1: "Gagal Menyimpan",
        text2: "Gagal menyimpan pengaturan template",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePickLogo = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Diperlukan",
          "Izin akses galeri diperlukan untuk memilih logo"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // Convert image to base64 for printer compatibility
        try {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Get file extension to determine MIME type
          const fileExtension = uri.split(".").pop()?.toLowerCase() || "png";
          const mimeType =
            fileExtension === "jpg" || fileExtension === "jpeg"
              ? "image/jpeg"
              : fileExtension === "png"
              ? "image/png"
              : "image/png";

          // Create data URI format for HTML/printer use
          const base64DataUri = `data:${mimeType};base64,${base64}`;

          setSettings({ ...settings, logoUrl: base64DataUri, showLogo: true });
          Toast.show({
            type: "success",
            text1: "Berhasil",
            text2: "Logo berhasil dipilih dan dikonversi ke base64",
          });
        } catch (convertError) {
          console.error("Error converting to base64:", convertError);
          Toast.show({
            type: "error",
            text1: "Gagal",
            text2: "Gagal mengonversi logo ke base64",
          });
        }
      }
    } catch (error) {
      console.error("Error picking logo:", error);
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Gagal memilih logo",
      });
    }
  };

  const handleRemoveLogo = () => {
    Alert.alert("Hapus Logo", "Apakah Anda yakin ingin menghapus logo?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          setSettings({ ...settings, logoUrl: "", showLogo: false });
          Toast.show({
            type: "success",
            text1: "Berhasil",
            text2: "Logo berhasil dihapus",
          });
        },
      },
    ]);
  };

  const resetToDefault = () => {
    Alert.alert(
      "Reset ke Default",
      "Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setSettings(DEFAULT_TEMPLATE);
            Toast.show({
              type: "success",
              text1: "Berhasil",
              text2: "Pengaturan telah direset ke default",
            });
          },
        },
      ]
    );
  };

  return {
    settings,
    setSettings,
    loading,
    saving,
    loadSettings,
    saveSettings,
    handlePickLogo,
    handleRemoveLogo,
    resetToDefault,
  };
}
