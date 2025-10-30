import { useState } from 'react'

import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { Ionicons } from '@expo/vector-icons'

import Toast from 'react-native-toast-message'

import { router } from 'expo-router'

export default function Printer() {
    // ===== STATE PRINTER CLASSIC =====
    const [classicDevices, setClassicDevices] = useState<{ name: string; address: string; connected?: boolean }[]>([])
    const [classicConnected, setClassicConnected] = useState<string | null>(null)
    const RN_BC = 'react-native-bluetooth-classic' as const

    // Enable and List Devices
    const enableClassicAndList = async () => {
        try {
            const Mod: any = await import(RN_BC)
            const RNB = Mod.default || Mod
            if (!RNB) throw new Error('react-native-bluetooth-classic tidak tersedia')
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
            // Kirim ESC/POS dasar via string
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
                await RNB.write(data)
            }
            Toast.show({ type: 'success', text1: 'Tes cetak Classic terkirim' })
        } catch (e: any) {
            console.error(e)
            Toast.show({ type: 'error', text1: 'Gagal cetak (Classic)' })
        }
    }
    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
            {/* Header */}
            <LinearGradient
                colors={["#1e40af", "#3b82f6", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-8 px-6"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-white mb-2">
                            Printer ESC/POS
                        </Text>
                        <Text className="text-blue-100 text-base">
                            Pengaturan dan tes printer Bluetooth Classic
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
                {/* Printer Classic Section */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Printer ESC/POS (Bluetooth Classic)</Text>
                    <View className="space-y-4">
                        {/* Classic Header */}
                        <View className="bg-white rounded-2xl overflow-hidden"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
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
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
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
                        {/* Test Print Button */}
                        <TouchableOpacity
                            onPress={testPrintClassic}
                            className="rounded-2xl overflow-hidden"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 }}
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
                    </View>{/* END space-y-4 */}
                </View>
            </ScrollView>
        </View>
    )
}