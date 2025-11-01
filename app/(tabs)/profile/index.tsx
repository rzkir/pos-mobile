import { router } from 'expo-router'

import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import { useCompanyProfile } from "@/hooks/useCompanyProfile";

export default function Profil() {
    const { companyProfile } = useCompanyProfile();

    const handleEditProfile = () => {
        router.push('/profile/edit-profile')
    }

    const handleAppSettings = () => {
        router.push('/profile/settings')
    }

    const handleAbout = () => {
        router.push('/profile/about')
    }

    const handlePrinterSettings = () => {
        router.push('/profile/printer')
    }

    const handlePaymentCardSettings = () => {
        router.push('/profile/payment-card')
    }

    const handleExportData = () => {
        router.push('/profile/export')
    }

    const handleImportData = () => {
        router.push('/profile/import')
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                <LinearGradient
                    colors={['#1e40af', '#3b82f6', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="pt-12 pb-8 px-6"
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-3xl font-bold text-white mb-2">
                                Profil
                            </Text>
                            <Text className="text-blue-100 text-base">
                                Kelola informasi dan pengaturan akun
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View
                    className="-mt-4"
                >
                    {/* Dummy card info user */}
                    <View className="px-6 mb-8">
                        <View
                            className="bg-white rounded-3xl overflow-hidden"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }}
                        >
                            <LinearGradient
                                colors={['#f8fafc', '#ffffff']}
                                className="p-8"
                            >
                                <View className="flex-row items-center mb-8">
                                    <View className="relative">
                                        {companyProfile?.logo_url ? (
                                            <Image
                                                source={{ uri: companyProfile.logo_url }}
                                                className="w-20 h-20 rounded-3xl"
                                            />
                                        ) : (
                                            <LinearGradient
                                                colors={["#3b82f6", "#8b5cf6", "#ec4899"]}
                                                className="w-20 h-20 rounded-3xl items-center justify-center"
                                            >
                                                <Ionicons name="person" size={36} color="white" />
                                            </LinearGradient>
                                        )}
                                    </View>
                                    <View className="flex-1 ml-6">
                                        <Text className="text-2xl font-bold text-gray-900 mb-2">
                                            {companyProfile?.name || "User"}
                                        </Text>
                                        <Text className="text-gray-500 text-base">
                                            {companyProfile?.phone}
                                        </Text>
                                    </View>
                                </View>
                                <View className="space-y-6">
                                    <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
                                        <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                                            <Ionicons name="mail" size={24} color="#3b82f6" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm text-gray-500 mb-1 font-medium">Email</Text>
                                            <Text className="text-base font-semibold text-gray-900">{companyProfile?.email || "-"}</Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                    {/* Management Sections */}
                    <View className="px-6">
                        <Text className="text-2xl font-bold text-gray-900 mb-6">Kelola Profil</Text>
                        <View className="flex-col gap-4">
                            {/* Edit Profile */}
                            <TouchableOpacity
                                onPress={handleEditProfile}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}
                            >
                                <View className="flex-row items-center p-6">
                                    <LinearGradient
                                        colors={['#3b82f6', '#1d4ed8']}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="create" size={28} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Edit Profil</Text>
                                        <Text className="text-gray-600">Ubah informasi pribadi dan foto profil</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                            {/* App Settings */}
                            <TouchableOpacity
                                onPress={handleAppSettings}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}
                            >
                                <View className="flex-row items-center p-6">
                                    <LinearGradient
                                        colors={['#10b981', '#059669']}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="settings" size={28} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Pengaturan Aplikasi</Text>
                                        <Text className="text-gray-600">Konfigurasi notifikasi dan preferensi</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                            {/* Printer Settings */}
                            <TouchableOpacity
                                onPress={handlePrinterSettings}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}
                            >
                                <View className="flex-row items-center p-6">
                                    <LinearGradient
                                        colors={['#8b5cf6', '#7c3aed']}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="print" size={28} color="white" />
                                    </LinearGradient>

                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Pengaturan Printer</Text>
                                        <Text className="text-gray-600">Konfigurasi printer untuk mencetak struk</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                            {/* Payment Card Settings */}
                            <TouchableOpacity
                                onPress={handlePaymentCardSettings}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}
                            >
                                <View className="flex-row items-center p-6">
                                    <LinearGradient
                                        colors={['#8b5cf6', '#7c3aed']}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="card" size={28} color="white" />
                                    </LinearGradient>

                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Pengaturan Kartu Pembayaran</Text>
                                        <Text className="text-gray-600">Konfigurasi kartu pembayaran untuk pembayaran</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                            {/* Export Data */}
                            <TouchableOpacity
                                onPress={handleExportData}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}
                            >
                                <View className="flex-row items-center p-6">
                                    <LinearGradient
                                        colors={['#3b82f6', '#1d4ed8']}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="download" size={28} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Export Data</Text>
                                        <Text className="text-gray-600">Ekspor semua data ke file JSON</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                            {/* Import Data */}
                            <TouchableOpacity
                                onPress={handleImportData}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}
                            >
                                <View className="flex-row items-center p-6">
                                    <LinearGradient
                                        colors={['#10b981', '#059669']}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="cloud-upload" size={28} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Import Data</Text>
                                        <Text className="text-gray-600">Impor data dari file JSON</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                            {/* About */}
                            <TouchableOpacity
                                onPress={handleAbout}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}
                            >
                                <View className="flex-row items-center p-6">
                                    <LinearGradient
                                        colors={['#8b5cf6', '#7c3aed']}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="information-circle" size={28} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Tentang Aplikasi</Text>
                                        <Text className="text-gray-600">Informasi versi dan dukungan</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}