import { useState, useEffect } from 'react';

import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import Toast from 'react-native-toast-message';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImagePicker from 'expo-image-picker';

import * as FileSystem from 'expo-file-system/legacy';

import { DEFAULT_TEMPLATE } from './index';

const STORAGE_KEY = process.env.EXPO_PUBLIC_PRINTER_CUSTUM as string;

export default function CustomTemplate() {
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
            console.error('Error loading template settings:', error);
            Toast.show({
                type: 'error',
                text1: 'Gagal Memuat',
                text2: 'Gagal memuat pengaturan template',
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
                type: 'success',
                text1: 'Berhasil',
                text2: 'Pengaturan template berhasil disimpan',
            });
            router.back();
        } catch (error) {
            console.error('Error saving template settings:', error);
            Toast.show({
                type: 'error',
                text1: 'Gagal Menyimpan',
                text2: 'Gagal menyimpan pengaturan template',
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePickLogo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Diperlukan', 'Izin akses galeri diperlukan untuk memilih logo');
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
                    const fileExtension = uri.split('.').pop()?.toLowerCase() || 'png';
                    const mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg'
                        ? 'image/jpeg'
                        : fileExtension === 'png'
                            ? 'image/png'
                            : 'image/png';

                    // Create data URI format for HTML/printer use
                    const base64DataUri = `data:${mimeType};base64,${base64}`;

                    setSettings({ ...settings, logoUrl: base64DataUri, showLogo: true });
                    Toast.show({
                        type: 'success',
                        text1: 'Berhasil',
                        text2: 'Logo berhasil dipilih dan dikonversi ke base64',
                    });
                } catch (convertError) {
                    console.error('Error converting to base64:', convertError);
                    Toast.show({
                        type: 'error',
                        text1: 'Gagal',
                        text2: 'Gagal mengonversi logo ke base64',
                    });
                }
            }
        } catch (error) {
            console.error('Error picking logo:', error);
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: 'Gagal memilih logo',
            });
        }
    };

    const handleRemoveLogo = () => {
        Alert.alert(
            'Hapus Logo',
            'Apakah Anda yakin ingin menghapus logo?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: () => {
                        setSettings({ ...settings, logoUrl: '', showLogo: false });
                        Toast.show({
                            type: 'success',
                            text1: 'Berhasil',
                            text2: 'Logo berhasil dihapus',
                        });
                    },
                },
            ]
        );
    };

    const resetToDefault = () => {
        Alert.alert(
            'Reset ke Default',
            'Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setSettings(DEFAULT_TEMPLATE);
                        Toast.show({
                            type: 'success',
                            text1: 'Berhasil',
                            text2: 'Pengaturan telah direset ke default',
                        });
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-500">Memuat pengaturan...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-8 px-6"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-white mb-2">Custom Template Struk</Text>
                        <Text className="text-purple-100 text-base">Sesuaikan informasi toko dan pesan footer</Text>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1 -mt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View className="px-6 pt-6">
                    {/* Informasi Toko */}
                    <View className="bg-white rounded-2xl p-6 mb-6 overflow-hidden"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
                        <View className="flex-row items-center mb-4">
                            <LinearGradient
                                colors={['#8b5cf6', '#7c3aed']}
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            >
                                <Ionicons name="storefront" size={20} color="white" />
                            </LinearGradient>
                            <Text className="text-xl font-bold text-gray-900">Informasi Toko</Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Nama Toko *</Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                                placeholder="Masukkan nama toko"
                                placeholderTextColor="#9CA3AF"
                                value={settings.storeName}
                                onChangeText={(text) => setSettings({ ...settings, storeName: text })}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Alamat Toko</Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                                placeholder="Masukkan alamat toko"
                                placeholderTextColor="#9CA3AF"
                                value={settings.storeAddress}
                                onChangeText={(text) => setSettings({ ...settings, storeAddress: text })}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">No. Telepon</Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                                placeholder="Masukkan nomor telepon"
                                placeholderTextColor="#9CA3AF"
                                value={settings.storePhone}
                                onChangeText={(text) => setSettings({ ...settings, storePhone: text })}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Logo Section */}
                        <View className="mb-4">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-sm font-semibold text-gray-700">Logo Toko</Text>
                                <TouchableOpacity
                                    onPress={() => setSettings({ ...settings, showLogo: !settings.showLogo })}
                                    className={`px-3 py-1 rounded-lg ${settings.showLogo ? 'bg-green-100' : 'bg-gray-200'}`}
                                >
                                    <Text className={`text-xs font-semibold ${settings.showLogo ? 'text-green-700' : 'text-gray-600'}`}>
                                        {settings.showLogo ? 'Aktif' : 'Nonaktif'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {settings.logoUrl ? (
                                <View className="mt-2">
                                    <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 items-center">
                                        <Image
                                            source={{ uri: settings.logoUrl }}
                                            style={{
                                                width: settings.logoWidth || 200,
                                                height: settings.logoHeight || 80,
                                                maxWidth: '100%',
                                                marginBottom: 12
                                            }}
                                            className="rounded-lg"
                                            resizeMode="contain"
                                        />
                                        {/* Ukuran Logo */}
                                        <View className="w-full mt-3">
                                            <Text className="text-sm font-semibold text-gray-700 mb-2">Ukuran Logo</Text>
                                            <View className="flex-row gap-2 mb-2">
                                                <View className="flex-1">
                                                    <Text className="text-xs text-gray-600 mb-1">Lebar (px)</Text>
                                                    <TextInput
                                                        className="bg-white rounded-lg px-3 py-2 text-gray-900 border border-gray-300"
                                                        placeholder="200"
                                                        placeholderTextColor="#9CA3AF"
                                                        value={settings.logoWidth?.toString() || '200'}
                                                        onChangeText={(text) => {
                                                            const num = parseInt(text) || 200;
                                                            setSettings({ ...settings, logoWidth: Math.min(Math.max(num, 50), 500) });
                                                        }}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-xs text-gray-600 mb-1">Tinggi (px)</Text>
                                                    <TextInput
                                                        className="bg-white rounded-lg px-3 py-2 text-gray-900 border border-gray-300"
                                                        placeholder="80"
                                                        placeholderTextColor="#9CA3AF"
                                                        value={settings.logoHeight?.toString() || '80'}
                                                        onChangeText={(text) => {
                                                            const num = parseInt(text) || 80;
                                                            setSettings({ ...settings, logoHeight: Math.min(Math.max(num, 20), 300) });
                                                        }}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                            <Text className="text-xs text-gray-500">Rentang: Lebar 50-500px, Tinggi 20-300px</Text>
                                        </View>
                                        <View className="flex-row gap-2 mt-3">
                                            <TouchableOpacity
                                                onPress={handlePickLogo}
                                                className="bg-blue-600 px-4 py-2 rounded-lg"
                                            >
                                                <Text className="text-white text-sm font-semibold">Ubah Logo</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={handleRemoveLogo}
                                                className="bg-red-600 px-4 py-2 rounded-lg"
                                            >
                                                <Text className="text-white text-sm font-semibold">Hapus</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={handlePickLogo}
                                    disabled={!settings.showLogo}
                                    className={`mt-2 border-2 border-dashed rounded-xl p-6 items-center ${settings.showLogo ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-gray-50'}`}
                                >
                                    <Ionicons
                                        name="image-outline"
                                        size={32}
                                        color={settings.showLogo ? '#8b5cf6' : '#9CA3AF'}
                                    />
                                    <Text className={`mt-2 text-sm font-semibold ${settings.showLogo ? 'text-purple-600' : 'text-gray-500'}`}>
                                        {settings.showLogo ? 'Pilih Logo Toko' : 'Aktifkan terlebih dahulu'}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-1">
                                        Format: JPG, PNG (Rasio 3:1)
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Footer Message */}
                    <View className="bg-white rounded-2xl p-6 mb-6 overflow-hidden"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                >
                                    <Ionicons name="document-text" size={20} color="white" />
                                </LinearGradient>
                                <Text className="text-xl font-bold text-gray-900">Pesan Footer</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setSettings({ ...settings, showFooter: !settings.showFooter })}
                                className={`px-4 py-2 rounded-xl ${settings.showFooter ? 'bg-green-100' : 'bg-gray-200'}`}
                            >
                                <Text className={`text-sm font-semibold ${settings.showFooter ? 'text-green-700' : 'text-gray-600'}`}>
                                    {settings.showFooter ? 'Aktif' : 'Nonaktif'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-semibold text-gray-700 mb-2">Pesan Footer</Text>
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                            placeholder="Masukkan pesan footer (gunakan \n untuk baris baru)"
                            placeholderTextColor="#9CA3AF"
                            value={settings.footerMessage}
                            onChangeText={(text) => setSettings({ ...settings, footerMessage: text })}
                            multiline
                            numberOfLines={4}
                            editable={settings.showFooter}
                        />
                        <Text className="text-xs text-gray-500 mt-2">
                            Gunakan \n untuk membuat baris baru
                        </Text>
                    </View>

                    {/* Preview Section */}
                    <View className="bg-white rounded-2xl p-6 mb-6 overflow-hidden"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
                        <View className="flex-row items-center mb-4">
                            <LinearGradient
                                colors={['#3b82f6', '#2563eb']}
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            >
                                <Ionicons name="eye" size={20} color="white" />
                            </LinearGradient>
                            <Text className="text-xl font-bold text-gray-900">Preview</Text>
                        </View>

                        <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            {settings.showLogo && settings.logoUrl && (
                                <View className="items-center mb-3">
                                    <Image
                                        source={{ uri: settings.logoUrl }}
                                        style={{
                                            width: settings.logoWidth || 200,
                                            height: settings.logoHeight || 80,
                                            maxWidth: '100%'
                                        }}
                                        className="rounded-lg"
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
                            <Text className="text-center font-bold text-gray-900 mb-2" style={{ fontSize: 18 }}>
                                {settings.storeName || 'Nama Toko'}
                            </Text>
                            {settings.storeAddress && (
                                <Text className="text-center text-gray-600 text-sm mb-1">{settings.storeAddress}</Text>
                            )}
                            {settings.storePhone && (
                                <Text className="text-center text-gray-600 text-sm mb-3">Telp: {settings.storePhone}</Text>
                            )}
                            <View className="h-px bg-gray-300 my-3" />
                            {settings.showFooter && settings.footerMessage && (
                                <>
                                    <View className="h-px bg-gray-300 my-3" />
                                    <Text className="text-center text-gray-600 text-xs" style={{ lineHeight: 18 }}>
                                        {settings.footerMessage.split('\\n').map((line, i) => (
                                            <Text key={i}>{line}{'\n'}</Text>
                                        ))}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity
                        onPress={resetToDefault}
                        className="bg-gray-200 rounded-xl py-4 items-center mb-6"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="refresh" size={20} color="#6B7280" />
                            <Text className="text-gray-700 font-semibold ml-2">Reset ke Default</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="px-6 pb-4 pt-2 bg-white border-t border-gray-200">
                <TouchableOpacity
                    onPress={saveSettings}
                    disabled={saving || !settings.storeName.trim()}
                    className={`rounded-xl py-4 items-center ${saving || !settings.storeName.trim() ? 'bg-gray-300' : 'bg-purple-600'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
                >
                    {saving ? (
                        <Text className="text-white font-semibold text-base">Menyimpan...</Text>
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="white" />
                            <Text className="text-white font-semibold text-base ml-2">Simpan Pengaturan</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

