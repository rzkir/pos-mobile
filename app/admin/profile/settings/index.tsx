import { useState } from 'react'

import { View, Text, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native'

import { router } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import Toast from 'react-native-toast-message'

export default function Settings() {
    const [pushNotifications, setPushNotifications] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [vibrationEnabled, setVibrationEnabled] = useState(true)
    const [transactionAlerts, setTransactionAlerts] = useState(true)
    const [lowStockAlerts, setLowStockAlerts] = useState(true)
    const [dailyReports, setDailyReports] = useState(false)

    // App Preferences State
    const [darkMode, setDarkMode] = useState(false)
    const [autoLogout, setAutoLogout] = useState(true)
    const [autoLogoutTime, setAutoLogoutTime] = useState(30) // minutes
    const [language, setLanguage] = useState('id') // Indonesian
    const [currency, setCurrency] = useState('IDR')
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
    const [decimalPlaces, setDecimalPlaces] = useState(2)

    // Bluetooth Classic via react-native-bluetooth-classic
    const [classicDevices, setClassicDevices] = useState<{ name: string; address: string; connected?: boolean }[]>([])
    const [classicConnected, setClassicConnected] = useState<string | null>(null)
    const RN_BC = 'react-native-bluetooth-classic' as const

    // Classic (ESC/POS) helpers
    const enableClassicAndList = async () => {
        try {
            const Mod: any = await import(RN_BC)
            const RNB = Mod.default || Mod
            if (!RNB) throw new Error('react-native-bluetooth-classic tidak tersedia')

            // Pastikan Bluetooth aktif
            const enabled = await RNB.isBluetoothEnabled?.()
            if (!enabled && RNB.requestBluetoothEnabled) {
                await RNB.requestBluetoothEnabled()
            }

            const bonded = (await RNB.getBondedDevices?.()) || []
            const found = (await RNB.discoverDevices?.()) || []
            const list = [...bonded, ...found]
            const normalized = list.map((d: any) => ({ name: d.name, address: d.address || d.id }))
            setClassicDevices(normalized)
            Toast.show({ type: 'success', text1: 'Perangkat paired dimuat' })
        } catch (e: any) {
            console.error(e)
            Toast.show({ type: 'error', text1: 'Gagal memuat perangkat Classic' })
        }
    }

    const connectClassic = async (address: string) => {
        try {
            const Mod: any = await import(RN_BC)
            const RNB = Mod.default || Mod
            if (!RNB) throw new Error('react-native-bluetooth-classic tidak tersedia')
            if (classicConnected === address) {
                await RNB.disconnectFromDevice?.(address)
                setClassicConnected(null)
                Toast.show({ type: 'success', text1: 'Terputus dari printer' })
                return
            }
            await RNB.connectToDevice?.(address)
            setClassicConnected(address)
            Toast.show({ type: 'success', text1: 'Terhubung ke printer' })
        } catch (e: any) {
            console.error(e)
            Toast.show({ type: 'error', text1: 'Gagal menghubungkan printer' })
        }
    }

    const testPrintClassic = async () => {
        if (!classicConnected) {
            Toast.show({ type: 'info', text1: 'Hubungkan printer Classic dulu' })
            return
        }
        try {
            const Mod: any = await import(RN_BC)
            const RNB = Mod.default || Mod
            if (!RNB) throw new Error('react-native-bluetooth-classic tidak tersedia')

            // Kirim ESC/POS dasar via string (banyak printer menerima ASCII langsung)
            const data = "\x1B@" + // init
                "TOKO KASIR\n" +
                "Jl. Contoh No. 123\n" +
                "-------------------------------\n" +
                "Item           Qty   Subtotal\n" +
                "Contoh A       1     10.000\n" +
                "Contoh B       2     20.000\n" +
                "-------------------------------\n" +
                "TOTAL                30.000\n\n" +
                "Terima kasih!\n\n"

            if (RNB.writeToDevice) {
                await RNB.writeToDevice(classicConnected, data)
            } else if (RNB.write) {
                // beberapa versi expose write(string) pada device global
                await RNB.write(data)
            }
            Toast.show({ type: 'success', text1: 'Tes cetak Classic terkirim' })
        } catch (e: any) {
            console.error(e)
            Toast.show({ type: 'error', text1: 'Gagal cetak (Classic)' })
        }
    }

    const handleSaveSettings = () => {
        // Here you would typically save to AsyncStorage or your backend
        Toast.show({
            type: 'success',
            text1: 'Pengaturan Disimpan',
            text2: 'Konfigurasi telah berhasil disimpan'
        })
    }

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
                        // Reset all settings to default
                        setPushNotifications(true)
                        setEmailNotifications(true)
                        setSoundEnabled(true)
                        setVibrationEnabled(true)
                        setTransactionAlerts(true)
                        setLowStockAlerts(true)
                        setDailyReports(false)
                        setDarkMode(false)
                        setAutoLogout(true)
                        setAutoLogoutTime(30)
                        setLanguage('id')
                        setCurrency('IDR')
                        setDateFormat('DD/MM/YYYY')
                        setDecimalPlaces(2)

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

    const handleLogoutTimeChange = () => {
        Alert.alert(
            'Waktu Auto Logout',
            'Pilih waktu untuk auto logout:',
            [
                { text: '15 menit', onPress: () => setAutoLogoutTime(15) },
                { text: '30 menit', onPress: () => setAutoLogoutTime(30) },
                { text: '60 menit', onPress: () => setAutoLogoutTime(60) },
                { text: '120 menit', onPress: () => setAutoLogoutTime(120) },
                { text: 'Batal', style: 'cancel' }
            ]
        )
    }

    const handleLanguageChange = () => {
        Alert.alert(
            'Bahasa',
            'Pilih bahasa aplikasi:',
            [
                { text: 'Bahasa Indonesia', onPress: () => setLanguage('id') },
                { text: 'English', onPress: () => setLanguage('en') },
                { text: 'Batal', style: 'cancel' }
            ]
        )
    }

    const handleCurrencyChange = () => {
        Alert.alert(
            'Mata Uang',
            'Pilih mata uang:',
            [
                { text: 'IDR (Rupiah)', onPress: () => setCurrency('IDR') },
                { text: 'USD (Dollar)', onPress: () => setCurrency('USD') },
                { text: 'Batal', style: 'cancel' }
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
                {/* Printer ESC/POS (Bluetooth Classic) */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Printer ESC/POS (Bluetooth Classic)</Text>

                    <View className="space-y-4">
                        {/* Classic Header */}
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
                                        colors={['#2563eb', '#1e40af']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="print" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Printer Classic</Text>
                                        <Text className="text-gray-600">Muat daftar perangkat paired dan tes cetak</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={enableClassicAndList}
                                    className={`px-4 py-2 rounded-xl bg-blue-600`}
                                >
                                    <Text className="text-white font-semibold">Muat Perangkat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Classic Devices List */}
                        <View className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="p-4">
                                {classicDevices.length === 0 ? (
                                    <Text className="text-gray-500 px-2 py-2">Belum ada daftar. Tap Muat Perangkat.</Text>
                                ) : (
                                    classicDevices.map((d: any) => (
                                        <View key={d.address} className="flex-row items-center justify-between px-2 py-3 border-b border-gray-100">
                                            <View className="flex-1">
                                                <Text className="text-gray-900 font-semibold">{d.name || 'Printer'}</Text>
                                                <Text className="text-gray-500 text-xs">{d.address}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => connectClassic(d.address)}
                                                className={`px-3 py-2 rounded-xl ${classicConnected === d.address ? 'bg-red-600' : 'bg-emerald-600'}`}
                                            >
                                                <Text className="text-white text-sm font-semibold">{classicConnected === d.address ? 'Putuskan' : 'Hubungkan'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>

                        {/* Test Print Classic */}
                        <TouchableOpacity
                            onPress={testPrintClassic}
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
                                colors={['#10b981', '#059669', '#047857']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="p-5"
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                        <Ionicons name="checkmark-circle" size={22} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-base font-bold mb-0.5">Tes Cetak (Classic)</Text>
                                        <Text className="text-green-100 text-xs">Kirim teks sederhana ke printer</Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={18} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bagian BLE dihapus: fokus pada Classic saja */}
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

                        {/* Email Notifications */}
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
                                        colors={['#10b981', '#059669']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="mail" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Email Notifications</Text>
                                        <Text className="text-gray-600">Terima notifikasi melalui email</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={emailNotifications}
                                    onValueChange={setEmailNotifications}
                                    trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                                    thumbColor={emailNotifications ? '#ffffff' : '#f3f4f6'}
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

                        {/* Vibration */}
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
                                        colors={['#8b5cf6', '#7c3aed']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="phone-portrait" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Getaran</Text>
                                        <Text className="text-gray-600">Aktifkan getaran untuk notifikasi</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={vibrationEnabled}
                                    onValueChange={setVibrationEnabled}
                                    trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
                                    thumbColor={vibrationEnabled ? '#ffffff' : '#f3f4f6'}
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

                        {/* Daily Reports */}
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
                                        colors={['#06b6d4', '#0891b2']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="document-text" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Laporan Harian</Text>
                                        <Text className="text-gray-600">Terima laporan harian via email</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={dailyReports}
                                    onValueChange={setDailyReports}
                                    trackColor={{ false: '#e5e7eb', true: '#06b6d4' }}
                                    thumbColor={dailyReports ? '#ffffff' : '#f3f4f6'}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* App Preferences */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Preferensi Aplikasi</Text>

                    <View className="space-y-4">
                        {/* Dark Mode */}
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
                                        colors={['#374151', '#1f2937']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="moon" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Mode Gelap</Text>
                                        <Text className="text-gray-600">Aktifkan tema gelap untuk aplikasi</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={darkMode}
                                    onValueChange={setDarkMode}
                                    trackColor={{ false: '#e5e7eb', true: '#374151' }}
                                    thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
                                />
                            </View>
                        </View>

                        {/* Auto Logout */}
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
                                        <Ionicons name="time" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Auto Logout</Text>
                                        <Text className="text-gray-600">Otomatis logout setelah tidak aktif</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={autoLogout}
                                    onValueChange={setAutoLogout}
                                    trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
                                    thumbColor={autoLogout ? '#ffffff' : '#f3f4f6'}
                                />
                            </View>
                        </View>

                        {/* Auto Logout Time */}
                        {autoLogout && (
                            <TouchableOpacity
                                onPress={handleLogoutTimeChange}
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
                                        colors={['#6b7280', '#4b5563']}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Ionicons name="timer" size={24} color="white" />
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">Waktu Auto Logout</Text>
                                        <Text className="text-gray-600">{autoLogoutTime} menit</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Language */}
                        <TouchableOpacity
                            onPress={handleLanguageChange}
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
                                    colors={['#3b82f6', '#1d4ed8']}
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                >
                                    <Ionicons name="language" size={24} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Bahasa</Text>
                                    <Text className="text-gray-600">{language === 'id' ? 'Bahasa Indonesia' : 'English'}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

                        {/* Currency */}
                        <TouchableOpacity
                            onPress={handleCurrencyChange}
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
                                    colors={['#10b981', '#059669']}
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                >
                                    <Ionicons name="cash" size={24} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Mata Uang</Text>
                                    <Text className="text-gray-600">{currency}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

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
                        {/* Save Settings */}
                        <TouchableOpacity
                            onPress={handleSaveSettings}
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
                                colors={['#10b981', '#059669', '#047857']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="p-6"
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                        <Ionicons name="save" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-bold mb-1">Simpan Pengaturan</Text>
                                        <Text className="text-green-100 text-sm">Simpan semua konfigurasi yang telah diubah</Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

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