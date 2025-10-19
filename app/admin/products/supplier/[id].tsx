import Input from '@/components/ui/input'

import { useCallback, useEffect, useState } from 'react'

import { Switch, Text, TouchableOpacity, View } from 'react-native'

import Toast from 'react-native-toast-message'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { SupplierService } from '@/services/supplierService'

export default function SupplierForm() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const isEdit = id !== 'new'

    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        is_active: true
    })
    const [loading, setLoading] = useState(false)

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[0-9+\-\s()]+$/
        return phoneRegex.test(phone) && phone.length >= 10
    }

    const loadSupplierData = useCallback(async () => {
        try {
            setLoading(true)
            const supplier = await SupplierService.getById(Number(id))
            if (supplier) {
                setFormData({
                    name: supplier.name,
                    contact_person: supplier.contact_person,
                    phone: supplier.phone,
                    email: supplier.email || '',
                    address: supplier.address,
                    is_active: supplier.is_active
                })
            }
        } catch (error) {
            console.error('Error loading supplier:', error)
            Toast.show({ type: 'error', text1: 'Error', text2: 'Gagal memuat data supplier' })
        } finally {
            setLoading(false)
        }
    }, [id])

    // Load data for edit
    useEffect(() => {
        if (isEdit && id) {
            loadSupplierData()
        }
    }, [isEdit, id, loadSupplierData])

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Toast.show({ type: 'error', text1: 'Nama supplier harus diisi' })
            return
        }

        if (!formData.contact_person.trim()) {
            Toast.show({ type: 'error', text1: 'Nama kontak harus diisi' })
            return
        }

        if (!formData.phone.trim()) {
            Toast.show({ type: 'error', text1: 'Nomor telepon harus diisi' })
            return
        }

        if (!validatePhone(formData.phone)) {
            Toast.show({ type: 'error', text1: 'Format nomor telepon tidak valid' })
            return
        }

        if (formData.email && !validateEmail(formData.email)) {
            Toast.show({ type: 'error', text1: 'Format email tidak valid' })
            return
        }

        if (!formData.address.trim()) {
            Toast.show({ type: 'error', text1: 'Alamat harus diisi' })
            return
        }

        try {
            setLoading(true)

            if (isEdit) {
                await SupplierService.update(Number(id), {
                    name: formData.name.trim(),
                    contact_person: formData.contact_person.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim() || '',
                    address: formData.address.trim(),
                    is_active: formData.is_active
                })
                Toast.show({ type: 'success', text1: 'Supplier berhasil diperbarui' })
                router.back()
            } else {
                await SupplierService.create({
                    name: formData.name.trim(),
                    contact_person: formData.contact_person.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim() || '',
                    address: formData.address.trim(),
                    is_active: formData.is_active
                })
                Toast.show({ type: 'success', text1: 'Supplier berhasil disimpan' })
                setFormData({
                    name: '',
                    contact_person: '',
                    phone: '',
                    email: '',
                    address: '',
                    is_active: true
                })
            }
        } catch (error) {
            console.error('Error saving supplier:', error)
            Toast.show({ type: 'error', text1: isEdit ? 'Gagal memperbarui supplier' : 'Gagal menyimpan supplier' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Action Bar */}
            <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                    {isEdit ? 'Edit Supplier' : 'Tambah Supplier'}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    <Text className={`text-blue-600 text-base font-semibold ${loading ? 'opacity-50' : ''}`}>
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </Text>
                </TouchableOpacity>
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
                {/* Card */}
                <View className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <Input
                        label="Nama Supplier *"
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Masukkan nama supplier"
                        returnKeyType="next"
                    />

                    <Input
                        label="Nama Kontak *"
                        value={formData.contact_person}
                        onChangeText={(text) => handleInputChange('contact_person', text)}
                        placeholder="Masukkan nama kontak"
                        returnKeyType="next"
                    />

                    <Input
                        label="Nomor Telepon *"
                        value={formData.phone}
                        onChangeText={(text) => handleInputChange('phone', text)}
                        placeholder="Masukkan nomor telepon"
                        keyboardType="phone-pad"
                        returnKeyType="next"
                    />

                    <Input
                        label="Email (opsional)"
                        value={formData.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        placeholder="Masukkan email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                    />

                    <Input
                        label="Alamat *"
                        value={formData.address}
                        onChangeText={(text) => handleInputChange('address', text)}
                        placeholder="Masukkan alamat supplier"
                        multiline
                        numberOfLines={3}
                        returnKeyType="done"
                    />

                    {/* Status Toggle */}
                    <View className="mt-2 flex-row items-center justify-between">
                        <View>
                            <Text className="text-gray-700 font-medium">Status</Text>
                            <Text className="text-gray-500 text-xs mt-0.5">Tandai supplier sebagai aktif/tidak aktif</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className={`mr-2 text-sm ${formData.is_active ? 'text-green-700' : 'text-red-700'}`}>
                                {formData.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </Text>
                            <Switch
                                value={formData.is_active}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, is_active: val }))}
                                thumbColor={formData.is_active ? '#10B981' : '#F3F4F6'}
                                trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
                            />
                        </View>
                    </View>
                </View>

                {/* Bottom primary action */}
                <View className="mt-6">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className={`py-3 px-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui Supplier' : 'Simpan Supplier')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}