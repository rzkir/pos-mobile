import Input from '@/components/ui/input'

import { useState } from 'react'

import { Alert, Text, TouchableOpacity, View } from 'react-native'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { ProductCategoryService } from '@/services/productCategoryService'

export default function CategoryForm() {
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
            Alert.alert('Error', 'Nama kategori harus diisi')
            return
        }

        try {
            await ProductCategoryService.create({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                is_active: formData.is_active
            })

            Alert.alert('Success', 'Kategori berhasil disimpan', [
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
            console.error('Error saving category:', error)
            Alert.alert('Error', 'Gagal menyimpan kategori')
        }
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">Tambah Kategori</Text>
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
                    <Text className="text-gray-700 font-medium mb-2">Nama Kategori *</Text>
                    <Input
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Masukkan nama kategori"
                        returnKeyType="next"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Deskripsi</Text>
                    <Input
                        value={formData.description}
                        onChangeText={(text) => handleInputChange('description', text)}
                        placeholder="Masukkan deskripsi kategori (opsional)"
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
                            Simpan Kategori
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}