import { useState } from 'react'

import { View, Text, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native'

import { router } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import Toast from 'react-native-toast-message'

export default function Settings() {
    const [pushNotifications, setPushNotifications] = useState(true)

    const [soundEnabled, setSoundEnabled] = useState(true)

    const [transactionAlerts, setTransactionAlerts] = useState(true)

    const [lowStockAlerts, setLowStockAlerts] = useState(true)

    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')

    const [decimalPlaces, setDecimalPlaces] = useState(2)

    const handleResetSettings = () => {
        Alert.alert(
            'Reset Pengaturan',
            'Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setPushNotifications(true)
                        setSoundEnabled(true)
                        setTransactionAlerts(true)
                        setLowStockAlerts(true)

                        Toast.show({
                            type: 'success',
                            text1: 'Pengaturan Direset',
                            text2: 'Semua pengaturan telah dikembalikan ke default'
                        })
                    }
                }
            ]
        )
    }

    const handleDateFormatChange = () => {
        Alert.alert(
            'Format Tanggal',
            'Pilih format tanggal:',
            [
                { text: 'DD/MM/YYYY', onPress: () => setDateFormat('DD/MM/YYYY') },
                { text: 'MM/DD/YYYY', onPress: () => setDateFormat('MM/DD/YYYY') },
                { text: 'YYYY-MM-DD', onPress: () => setDateFormat('YYYY-MM-DD') },
                { text: 'Batal', style: 'cancel' }
            ]
        )
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

            {/* Header */}
            <LinearGradient
                colors={['#1e40af', '#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-8 px-6"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-white mb-2">
                            Pengaturan Aplikasi
                        </Text>
                        <Text className="text-blue-100 text-base">
                            Konfigurasi notifikasi dan preferensi
                        </Text>
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
                {/* CTA Printer */}
                <View className="px-6 mt-6 mb-5">
                    <TouchableOpacity
                        className="flex-row items-center bg-blue-600 rounded-2xl p-4 shadow-lg"
                        onPress={() => router.push('/profile/printer')}
                    >
                        <Ionicons name="print" size={24} color="white" style={{ marginRight: 16 }} />
                        <Text className="text-white text-lg font-bold flex-1">Pengaturan Printer</Text>
                        <Ionicons name="chevron-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                {/* Notification Settings */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Notifikasi</Text>

                    <View className="space-y-4">
                        {/* Push Notifications */}
                        <View className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center justify-between p-6">
                                <View className="flex-row items-center flex-1">
                                    <LinearGradient
                                        colors={['#3b82f6', '#1d4ed8']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="notifications" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Push Notifications</Text>
                                        <Text className="text-gray-600">Terima notifikasi push dari aplikasi</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={pushNotifications}
                                    onValueChange={setPushNotifications}
                                    trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                                    thumbColor={pushNotifications ? '#ffffff' : '#f3f4f6'}
                                />
                            </View>
                        </View>

                        {/* Sound Settings */}
                        <View className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center justify-between p-6">
                                <View className="flex-row items-center flex-1">
                                    <LinearGradient
                                        colors={['#f59e0b', '#d97706']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="volume-high" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Suara Notifikasi</Text>
                                        <Text className="text-gray-600">Aktifkan suara untuk notifikasi</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={soundEnabled}
                                    onValueChange={setSoundEnabled}
                                    trackColor={{ false: '#e5e7eb', true: '#f59e0b' }}
                                    thumbColor={soundEnabled ? '#ffffff' : '#f3f4f6'}
                                />
                            </View>
                        </View>

                        {/* Transaction Alerts */}
                        <View className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center justify-between p-6">
                                <View className="flex-row items-center flex-1">
                                    <LinearGradient
                                        colors={['#ef4444', '#dc2626']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="receipt" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Alert Transaksi</Text>
                                        <Text className="text-gray-600">Notifikasi untuk setiap transaksi baru</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={transactionAlerts}
                                    onValueChange={setTransactionAlerts}
                                    trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
                                    thumbColor={transactionAlerts ? '#ffffff' : '#f3f4f6'}
                                />
                            </View>
                        </View>

                        {/* Low Stock Alerts */}
                        <View className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center justify-between p-6">
                                <View className="flex-row items-center flex-1">
                                    <LinearGradient
                                        colors={['#f97316', '#ea580c']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="warning" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Alert Stok Rendah</Text>
                                        <Text className="text-gray-600">Notifikasi ketika stok produk rendah</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={lowStockAlerts}
                                    onValueChange={setLowStockAlerts}
                                    trackColor={{ false: '#e5e7eb', true: '#f97316' }}
                                    thumbColor={lowStockAlerts ? '#ffffff' : '#f3f4f6'}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* App Preferences */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Preferensi Aplikasi</Text>

                    <View className="space-y-4">
                        {/* Date Format */}
                        <TouchableOpacity
                            onPress={handleDateFormatChange}
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center p-6">
                                <LinearGradient
                                    colors={['#8b5cf6', '#7c3aed']}
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                >
                                    <Ionicons name="calendar" size={24} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Format Tanggal</Text>
                                    <Text className="text-gray-600">{dateFormat}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

                        {/* Decimal Places */}
                        <View className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center justify-between p-6">
                                <View className="flex-row items-center flex-1">
                                    <LinearGradient
                                        colors={['#f59e0b', '#d97706']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="calculator" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Desimal Harga</Text>
                                        <Text className="text-gray-600">{decimalPlaces} angka di belakang koma</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <TouchableOpacity
                                        onPress={() => setDecimalPlaces(Math.max(0, decimalPlaces - 1))}
                                        className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-2"
                                    >
                                        <Ionicons name="remove" size={16} color="#6b7280" />
                                    </TouchableOpacity>
                                    <Text className="text-lg font-bold text-gray-900 mx-3">{decimalPlaces}</Text>
                                    <TouchableOpacity
                                        onPress={() => setDecimalPlaces(Math.min(4, decimalPlaces + 1))}
                                        className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center ml-2"
                                    >
                                        <Ionicons name="add" size={16} color="#6b7280" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-6 mb-8">
                    <View className="space-y-4">
                        {/* Reset Settings */}
                        <TouchableOpacity
                            onPress={handleResetSettings}
                            className="rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.2,
                                shadowRadius: 16,
                                elevation: 8
                            }}
                        >
                            <LinearGradient
                                colors={['#ef4444', '#dc2626', '#b91c1c']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="p-6"
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                        <Ionicons name="refresh" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-bold mb-1">Reset Pengaturan</Text>
                                        <Text className="text-red-100 text-sm">Kembalikan semua pengaturan ke default</Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}