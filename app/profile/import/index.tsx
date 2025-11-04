import { router } from 'expo-router'

import { ScrollView, Text, TouchableOpacity, View, TextInput, Modal } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import HeaderGradient from '@/components/ui/HeaderGradient';

import { useStateImport } from '@/components/profile/backup/useStateImport'

export default function ImportData() {
    const {
        showImportModal,
        importJsonText,
        setImportJsonText,
        isImporting,
        handleImportData,
        handleConfirmImport,
        handleCancelImport,
        handleManualPaste,
    } = useStateImport()

    return (
        <View className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false}>
                <HeaderGradient
                    colors={['#FF9228', '#FF9228']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    title="Import Data"
                    icon="📂"
                >
                    <View className="flex-row justify-between items-center w-full">
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-white mb-1">Import Data</Text>
                            <Text className="text-white/80 text-md">Impor data dari file JSON</Text>
                        </View>

                        <TouchableOpacity
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </HeaderGradient>

                <View className="px-4 mt-4">
                    <View className="bg-card rounded-2xl overflow-hidden mb-6">
                        <View className="p-8">
                            <View className="items-center mb-6">
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    className="w-20 h-20 rounded-full items-center justify-center mb-4 overflow-hidden"
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

                            <View className="flex-col gap-2 mb-6">
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

                            <View className="flex-col gap-3">
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