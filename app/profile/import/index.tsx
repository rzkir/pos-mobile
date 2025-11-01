import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, Alert, TextInput, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Toast from 'react-native-toast-message'
import { DataExportImportService } from '@/services/dataExportImportService'

export default function ImportData() {
    const [showImportModal, setShowImportModal] = useState(false)
    const [importJsonText, setImportJsonText] = useState('')
    const [isImporting, setIsImporting] = useState(false)

    const handleImportData = async () => {
        try {
            setIsImporting(true)

            // Try to use expo-document-picker
            try {
                const DocumentPicker = await import('expo-document-picker' as any)
                const FileSystem = await import('expo-file-system' as any)

                // Pick JSON file
                const result = await DocumentPicker.getDocumentAsync?.({
                    type: 'application/json',
                    copyToCacheDirectory: true,
                    multiple: false
                }) || DocumentPicker.default?.getDocumentAsync?.({
                    type: 'application/json',
                    copyToCacheDirectory: true,
                    multiple: false
                })

                if (result?.canceled || !result?.assets?.[0]) {
                    setIsImporting(false)
                    return
                }

                const fileUri = result.assets[0].uri

                // Read file content
                const fileContent = await FileSystem.readAsStringAsync?.(fileUri) ||
                    FileSystem.default?.readAsStringAsync?.(fileUri)

                if (!fileContent) {
                    throw new Error('File kosong atau tidak dapat dibaca')
                }

                // Confirm import
                Alert.alert(
                    'Import Data',
                    `File: ${result.assets[0].name}\n\nApakah Anda yakin ingin mengimpor data? Data lama akan digantikan.`,
                    [
                        { text: 'Batal', style: 'cancel', onPress: () => setIsImporting(false) },
                        {
                            text: 'Import',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await DataExportImportService.importData(fileContent)
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Berhasil',
                                        text2: 'Data berhasil diimpor'
                                    })
                                    // Navigate back after successful import
                                    setTimeout(() => {
                                        router.back()
                                    }, 1500)
                                } catch (error) {
                                    console.error('Import error:', error)
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Gagal',
                                        text2: error instanceof Error ? error.message : 'Gagal mengimpor data'
                                    })
                                } finally {
                                    setIsImporting(false)
                                }
                            }
                        }
                    ]
                )
            } catch (pickerError) {
                // Fallback: Use file system to read from kasir-mini folder
                console.log('DocumentPicker not available, using file system fallback:', pickerError)

                try {
                    const FileSystem = await import('expo-file-system' as any)
                    const folderName = 'kasir-mini'
                    const documentDir = FileSystem.documentDirectory || FileSystem.default?.documentDirectory

                    if (!documentDir) {
                        throw new Error('documentDirectory tidak ditemukan')
                    }

                    const folderUri = `${documentDir}${folderName}/`

                    // List files in kasir-mini folder
                    const files = await FileSystem.readDirectoryAsync?.(folderUri) ||
                        FileSystem.default?.readDirectoryAsync?.(folderUri)

                    if (!files || files.length === 0) {
                        throw new Error('Tidak ada file JSON di folder kasir-mini')
                    }

                    // Filter JSON files
                    const jsonFiles = files.filter((file: string) => file.endsWith('.json'))

                    if (jsonFiles.length === 0) {
                        throw new Error('Tidak ada file JSON di folder kasir-mini')
                    }

                    // Show file selection dialog
                    if (jsonFiles.length === 1) {
                        // Only one file, use it directly
                        const fileUri = `${folderUri}${jsonFiles[0]}`
                        const fileContent = await FileSystem.readAsStringAsync?.(fileUri) ||
                            FileSystem.default?.readAsStringAsync?.(fileUri)

                        Alert.alert(
                            'Import Data',
                            `File: ${jsonFiles[0]}\n\nApakah Anda yakin ingin mengimpor data? Data lama akan digantikan.`,
                            [
                                { text: 'Batal', style: 'cancel', onPress: () => setIsImporting(false) },
                                {
                                    text: 'Import',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await DataExportImportService.importData(fileContent)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Berhasil',
                                                text2: 'Data berhasil diimpor'
                                            })
                                            // Navigate back after successful import
                                            setTimeout(() => {
                                                router.back()
                                            }, 1500)
                                        } catch (error) {
                                            console.error('Import error:', error)
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Gagal',
                                                text2: error instanceof Error ? error.message : 'Gagal mengimpor data'
                                            })
                                        } finally {
                                            setIsImporting(false)
                                        }
                                    }
                                }
                            ]
                        )
                    } else {
                        // Multiple files - show selection
                        Alert.alert(
                            'Pilih File',
                            'Pilih file JSON yang ingin diimpor:',
                            [
                                ...jsonFiles.map((file: string) => ({
                                    text: file,
                                    onPress: async () => {
                                        try {
                                            const fileUri = `${folderUri}${file}`
                                            const fileContent = await FileSystem.readAsStringAsync?.(fileUri) ||
                                                FileSystem.default?.readAsStringAsync?.(fileUri)

                                            await DataExportImportService.importData(fileContent)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Berhasil',
                                                text2: 'Data berhasil diimpor'
                                            })
                                            // Navigate back after successful import
                                            setTimeout(() => {
                                                router.back()
                                            }, 1500)
                                        } catch (error) {
                                            console.error('Import error:', error)
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Gagal',
                                                text2: error instanceof Error ? error.message : 'Gagal mengimpor data'
                                            })
                                        } finally {
                                            setIsImporting(false)
                                        }
                                    }
                                })),
                                { text: 'Batal', style: 'cancel', onPress: () => setIsImporting(false) }
                            ]
                        )
                    }
                } catch (fallbackError) {
                    console.error('Fallback import error:', fallbackError)
                    // Last resort: Show modal for manual paste
                    setShowImportModal(true)
                    setIsImporting(false)
                }
            }
        } catch (error) {
            console.error('Import error:', error)
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: error instanceof Error ? error.message : 'Gagal mengimpor data'
            })
            setIsImporting(false)
        }
    }

    const handleConfirmImport = async () => {
        if (!importJsonText.trim()) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'JSON tidak boleh kosong' })
            return
        }

        Alert.alert(
            'Import Data',
            'Apakah Anda yakin ingin mengimpor data? Data lama akan digantikan.',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Import',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsImporting(true)
                            await DataExportImportService.importData(importJsonText)
                            setShowImportModal(false)
                            setImportJsonText('')
                            Toast.show({
                                type: 'success',
                                text1: 'Berhasil',
                                text2: 'Data berhasil diimpor'
                            })
                            // Navigate back after successful import
                            setTimeout(() => {
                                router.back()
                            }, 1500)
                        } catch (error) {
                            console.error('Import error:', error)
                            Toast.show({
                                type: 'error',
                                text1: 'Gagal',
                                text2: error instanceof Error ? error.message : 'Gagal mengimpor data'
                            })
                        } finally {
                            setIsImporting(false)
                        }
                    }
                }
            ]
        )
    }

    const handleCancelImport = () => {
        setShowImportModal(false)
        setImportJsonText('')
    }

    const handleManualPaste = () => {
        setShowImportModal(true)
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
                                Import Data
                            </Text>
                            <Text className="text-blue-100 text-base">
                                Impor data dari file JSON
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
                                    colors={['#10b981', '#059669']}
                                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                >
                                    <Ionicons name="cloud-upload" size={40} color="white" />
                                </LinearGradient>
                                <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                    Import Data
                                </Text>
                                <Text className="text-gray-600 text-center text-base">
                                    Impor data aplikasi dari file JSON untuk restore backup atau transfer dari perangkat lain
                                </Text>
                            </View>

                            <View className="space-y-4 mb-6">
                                <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                                    <View className="flex-row items-start">
                                        <Ionicons name="warning" size={24} color="#ef4444" className="mr-3 mt-1" />
                                        <View className="flex-1">
                                            <Text className="text-base font-semibold text-red-900 mb-1">Peringatan!</Text>
                                            <Text className="text-red-700 text-sm">Data lama akan digantikan dengan data yang diimpor. Pastikan Anda telah melakukan backup sebelumnya.</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row items-start">
                                    <Ionicons name="information-circle" size={24} color="#3b82f6" className="mr-3 mt-1" />
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-gray-900 mb-1">Pilih File</Text>
                                        <Text className="text-gray-600 text-sm">Pilih file JSON yang sebelumnya diekspor dari aplikasi</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-start">
                                    <Ionicons name="information-circle" size={24} color="#3b82f6" className="mr-3 mt-1" />
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-gray-900 mb-1">Format JSON</Text>
                                        <Text className="text-gray-600 text-sm">File harus dalam format JSON yang valid dari export aplikasi</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-start">
                                    <Ionicons name="information-circle" size={24} color="#3b82f6" className="mr-3 mt-1" />
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-gray-900 mb-1">Manual Paste</Text>
                                        <Text className="text-gray-600 text-sm">Jika file picker tidak berfungsi, Anda dapat paste JSON secara manual</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-3">
                                <TouchableOpacity
                                    onPress={handleImportData}
                                    disabled={isImporting}
                                    className={`rounded-2xl py-4 items-center ${isImporting ? 'bg-gray-300' : 'bg-green-600'}`}
                                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
                                >
                                    {isImporting ? (
                                        <Text className="text-white text-lg font-bold">Mengimpor Data...</Text>
                                    ) : (
                                        <Text className="text-white text-lg font-bold">Pilih File untuk Import</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleManualPaste}
                                    disabled={isImporting}
                                    className="rounded-2xl py-4 items-center bg-gray-200"
                                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                                >
                                    <Text className="text-gray-700 text-lg font-bold">Paste JSON Manual</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Import Data Modal */}
            <Modal
                visible={showImportModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelImport}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-900">Import Data</Text>
                            <TouchableOpacity onPress={handleCancelImport}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm text-gray-600 mb-3">
                            Paste JSON data yang ingin diimpor di bawah ini:
                        </Text>

                        <TextInput
                            className="border border-gray-300 rounded-lg p-4 mb-4 text-gray-900 min-h-[200px] text-base"
                            multiline
                            numberOfLines={10}
                            value={importJsonText}
                            onChangeText={setImportJsonText}
                            placeholder="Paste JSON data di sini..."
                            placeholderTextColor="#9CA3AF"
                            style={{ textAlignVertical: 'top' }}
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleCancelImport}
                                className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                                disabled={isImporting}
                            >
                                <Text className="text-base font-semibold text-gray-700">Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirmImport}
                                className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
                                disabled={isImporting || !importJsonText.trim()}
                            >
                                <Text className="text-base font-semibold text-white">
                                    {isImporting ? 'Mengimpor...' : 'Import'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

