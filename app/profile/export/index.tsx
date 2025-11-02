import { router } from 'expo-router'

import { useState } from 'react'

import { ScrollView, Text, TouchableOpacity, View, Alert, Platform } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import Toast from 'react-native-toast-message'

import { DataExportImportService } from '@/services/dataExportImportService'

export default function ExportData() {
    const [isExporting, setIsExporting] = useState(false)

    const handleExportData = async () => {
        try {
            setIsExporting(true)
            const jsonData = await DataExportImportService.exportAllData()

            // Create file with .json extension
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
            const fileName = `pos_data_export_${timestamp}.json`
            let fileUri: string | null = null

            try {
                // First, try to share directly without saving
                const SharingModule = await import('expo-sharing' as any)
                const Sharing = SharingModule.default || SharingModule
                const isAvailable = await (Sharing.isAvailableAsync?.() || Sharing.isAvailableAsync())

                if (isAvailable) {
                    // Try to save to cache first, then share
                    try {
                        const FileSystem = await import('expo-file-system' as any)
                        const FS = FileSystem.default || FileSystem

                        // Use cacheDirectory first as it's more reliable
                        const cacheDir = FS.cacheDirectory || FS.documentDirectory

                        if (cacheDir) {
                            fileUri = `${cacheDir}${fileName}`
                            // Write to cache
                            const writeMethod = FS.writeAsStringAsync || FS.default?.writeAsStringAsync
                            if (writeMethod) {
                                await writeMethod(fileUri, jsonData)

                                // Share the file
                                const shareMethod = Sharing.shareAsync || Sharing.default?.shareAsync
                                if (shareMethod) {
                                    await shareMethod(fileUri, {
                                        mimeType: 'application/json',
                                        dialogTitle: 'Export Data POS',
                                        UTI: 'public.json'
                                    })
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Export Berhasil',
                                        text2: 'File JSON telah dibagikan',
                                        visibilityTime: 4000
                                    })
                                    return
                                }
                            }
                        }
                    } catch (fileError) {
                        console.log('File save error, trying direct share:', fileError)
                    }

                    // Fallback: Try sharing JSON as text using Share API
                    try {
                        const { Share } = await import('react-native')
                        await Share.share({
                            message: jsonData,
                            title: 'Export Data POS'
                        })
                        Toast.show({
                            type: 'success',
                            text1: 'Export Berhasil',
                            text2: 'Data JSON telah dibagikan',
                            visibilityTime: 4000
                        })
                        return
                    } catch (shareError) {
                        console.log('Share error:', shareError)
                    }
                }

                // If sharing not available, try to save to file system
                const FileSystem = await import('expo-file-system' as any)
                const FS = FileSystem.default || FileSystem

                // Try cacheDirectory first (more reliable)
                let baseDir = FS.cacheDirectory || FS.documentDirectory

                if (!baseDir) {
                    throw new Error('FileSystem directory tidak tersedia')
                }

                const folderName = 'kasir-mini'
                const folderUri = `${baseDir}${folderName}/`

                // Create folder if needed
                try {
                    const getInfoMethod = FS.getInfoAsync || FS.default?.getInfoAsync
                    if (getInfoMethod) {
                        const folderInfo = await getInfoMethod(folderUri)
                        if (!folderInfo?.exists) {
                            const mkdirMethod = FS.makeDirectoryAsync || FS.default?.makeDirectoryAsync
                            if (mkdirMethod) {
                                await mkdirMethod(folderUri, { intermediates: true })
                            }
                        }
                    }
                } catch (mkdirError) {
                    console.log('Error creating folder:', mkdirError)
                }

                fileUri = `${folderUri}${fileName}`

                // Write JSON file
                const writeMethod = FS.writeAsStringAsync || FS.default?.writeAsStringAsync
                if (!writeMethod) {
                    throw new Error('writeAsStringAsync tidak tersedia')
                }
                await writeMethod(fileUri, jsonData)

                // Success - file saved
                Toast.show({
                    type: 'success',
                    text1: 'Export Berhasil',
                    text2: `File tersimpan`,
                    visibilityTime: 4000
                })

            } catch (error) {
                console.error('Export error:', error)

                // Final fallback: Show in console
                Alert.alert(
                    'Export Data',
                    'Gagal menyimpan file. Data JSON tersedia di console log.\n\nAnda bisa copy manual dari console.',
                    [{ text: 'OK' }]
                )
                console.log('=== EXPORT DATA JSON ===')
                console.log(jsonData)
                console.log('=== END EXPORT DATA ===')
                Toast.show({
                    type: 'info',
                    text1: 'Periksa Console',
                    text2: 'Data JSON tersedia di console log'
                })
            }
        } catch (error) {
            console.error('Export error:', error)
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: error instanceof Error ? error.message : 'Gagal mengekspor data'
            })
        } finally {
            setIsExporting(false)
        }
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
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-3xl font-bold text-white mb-2">
                                Export Data
                            </Text>
                            <Text className="text-blue-100 text-base">
                                Ekspor semua data ke file JSON
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View className="px-6 mt-8">
                    <View className="bg-white rounded-3xl overflow-hidden mb-6"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }}
                    >
                        <View className="p-8">
                            <View className="items-center mb-6">
                                <LinearGradient
                                    colors={['#3b82f6', '#1d4ed8']}
                                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                >
                                    <Ionicons name="download" size={40} color="white" />
                                </LinearGradient>
                                <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                    Export Data
                                </Text>
                                <Text className="text-gray-600 text-center text-base">
                                    Ekspor semua data aplikasi ke file JSON untuk backup atau transfer ke perangkat lain
                                </Text>
                            </View>

                            <View className="space-y-4 mb-6">
                                <View className="flex-row items-start">
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" className="mr-3 mt-1" />
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-gray-900 mb-1">Data Lengkap</Text>
                                        <Text className="text-gray-600 text-sm">Semua data termasuk produk, transaksi, dan pengaturan akan diekspor</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-start">
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" className="mr-3 mt-1" />
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-gray-900 mb-1">Format JSON</Text>
                                        <Text className="text-gray-600 text-sm">File akan disimpan dalam format JSON yang mudah dibaca dan dibuka</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-start">
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" className="mr-3 mt-1" />
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-gray-900 mb-1">Lokasi Penyimpanan</Text>
                                        <Text className="text-gray-600 text-sm">
                                            {Platform.OS === 'android'
                                                ? 'File akan disimpan di Penyimpanan Internal/kasir-mini'
                                                : 'File akan disimpan di Files App > On My iPhone/iPad > kasir-mini'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleExportData}
                                disabled={isExporting}
                                className={`rounded-2xl py-4 items-center ${isExporting ? 'bg-gray-300' : 'bg-blue-600'}`}
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
                            >
                                {isExporting ? (
                                    <Text className="text-white text-lg font-bold">Mengekspor Data...</Text>
                                ) : (
                                    <Text className="text-white text-lg font-bold">Ekspor Data Sekarang</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

