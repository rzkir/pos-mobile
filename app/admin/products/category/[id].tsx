import Input from '@/components/ui/input'

import { useCallback, useEffect, useState } from 'react'

import { Text, TouchableOpacity, View } from 'react-native'

import Toast from 'react-native-toast-message'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { useAuth } from '@/context/AuthContext'

import { ProductCategoryService } from '@/services/productCategoryService'

export default function CategoryForm() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const isEdit = id !== 'new'
    const { user } = useAuth()

    const [formData, setFormData] = useState({
        uid: '',
        name: '',
        is_active: true
    })
    const [loading, setLoading] = useState(false)

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const loadCategoryData = useCallback(async () => {
        try {
            setLoading(true)
            const category = await ProductCategoryService.getById(Number(id))
            if (category) {
                setFormData({
                    uid: category.uid,
                    name: category.name,
                    is_active: category.is_active
                })
            }
        } catch (error) {
            console.error('Error loading category:', error)
            Toast.show({ type: 'error', text1: 'Error', text2: 'Gagal memuat data kategori' })
        } finally {
            setLoading(false)
        }
    }, [id])

    // Load data for edit
    useEffect(() => {
        if (isEdit && id) {
            loadCategoryData()
        }
    }, [isEdit, id, loadCategoryData])

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Toast.show({ type: 'error', text1: 'Nama kategori harus diisi' })
            return
        }

        try {
            setLoading(true)

            if (isEdit) {
                await ProductCategoryService.update(Number(id), {
                    uid: user?.id || formData.uid || '',
                    name: formData.name.trim(),
                    is_active: formData.is_active
                })
                Toast.show({ type: 'success', text1: 'Kategori berhasil diperbarui' })
                router.back()
            } else {
                await ProductCategoryService.create({
                    uid: user?.id || `CAT${Date.now()}`,
                    name: formData.name.trim(),
                    is_active: formData.is_active
                })
                Toast.show({ type: 'success', text1: 'Kategori berhasil disimpan' })
                setFormData({
                    uid: '',
                    name: '',
                    is_active: true
                })
            }
        } catch (error) {
            console.error('Error saving category:', error)
            Toast.show({ type: 'error', text1: isEdit ? 'Gagal memperbarui kategori' : 'Gagal menyimpan kategori' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                    {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
                </Text>
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

                <View className="mb-6">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className={`py-3 px-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui Kategori' : 'Simpan Kategori')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}