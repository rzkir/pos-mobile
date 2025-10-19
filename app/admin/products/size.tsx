import Input from '@/components/ui/input'

import { useState } from 'react'

import { Alert, Text, TouchableOpacity, View } from 'react-native'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { ProductSizeService } from '@/services/productSizeService'

export default function SizeForm() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Nama ukuran harus diisi')
            return
        }

        try {
            await ProductSizeService.create({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                is_active: formData.is_active
            })

            Alert.alert('Success', 'Ukuran berhasil disimpan', [
                {
                    text: 'OK',
                    onPress: () => {
                        setFormData({
                            name: '',
                            description: '',
                            is_active: true
                        })
                    }
                }
            ])
        } catch (error) {
            console.error('Error saving size:', error)
            Alert.alert('Error', 'Gagal menyimpan ukuran')
        }
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">Tambah Ukuran</Text>
            </View>

            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                keyboardShouldPersistTaps="always"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={50}
                extraHeight={100}
                showsVerticalScrollIndicator={false}
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={true}
            >
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Nama Ukuran *</Text>
                    <Input
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Masukkan nama ukuran (contoh: S, M, L, XL)"
                        returnKeyType="next"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Deskripsi</Text>
                    <Input
                        value={formData.description}
                        onChangeText={(text) => handleInputChange('description', text)}
                        placeholder="Masukkan deskripsi ukuran (opsional)"
                        multiline
                        numberOfLines={3}
                        returnKeyType="done"
                    />
                </View>

                <View className="mb-6">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-600 py-3 px-4 rounded-lg"
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            Simpan Ukuran
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}