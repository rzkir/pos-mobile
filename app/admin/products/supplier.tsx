import Input from '@/components/ui/input'

import { useState } from 'react'

import { Alert, Text, TouchableOpacity, View } from 'react-native'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { SupplierService } from '@/services/supplierService'

export default function SupplierForm() {
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        is_active: true
    })

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

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Nama supplier harus diisi')
            return
        }

        if (!formData.contact_person.trim()) {
            Alert.alert('Error', 'Nama kontak harus diisi')
            return
        }

        if (!formData.phone.trim()) {
            Alert.alert('Error', 'Nomor telepon harus diisi')
            return
        }

        if (!validatePhone(formData.phone)) {
            Alert.alert('Error', 'Format nomor telepon tidak valid')
            return
        }

        if (formData.email && !validateEmail(formData.email)) {
            Alert.alert('Error', 'Format email tidak valid')
            return
        }

        if (!formData.address.trim()) {
            Alert.alert('Error', 'Alamat harus diisi')
            return
        }

        try {
            await SupplierService.create({
                name: formData.name.trim(),
                contact_person: formData.contact_person.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim() || '',
                address: formData.address.trim(),
                is_active: formData.is_active
            })

            Alert.alert('Success', 'Supplier berhasil disimpan', [
                {
                    text: 'OK',
                    onPress: () => {
                        setFormData({
                            name: '',
                            contact_person: '',
                            phone: '',
                            email: '',
                            address: '',
                            is_active: true
                        })
                    }
                }
            ])
        } catch (error) {
            console.error('Error saving supplier:', error)
            Alert.alert('Error', 'Gagal menyimpan supplier')
        }
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">Tambah Supplier</Text>
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
                    <Text className="text-gray-700 font-medium mb-2">Nama Supplier *</Text>
                    <Input
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Masukkan nama supplier"
                        returnKeyType="next"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Nama Kontak *</Text>
                    <Input
                        value={formData.contact_person}
                        onChangeText={(text) => handleInputChange('contact_person', text)}
                        placeholder="Masukkan nama kontak"
                        returnKeyType="next"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Nomor Telepon *</Text>
                    <Input
                        value={formData.phone}
                        onChangeText={(text) => handleInputChange('phone', text)}
                        placeholder="Masukkan nomor telepon"
                        keyboardType="phone-pad"
                        returnKeyType="next"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Email</Text>
                    <Input
                        value={formData.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        placeholder="Masukkan email (opsional)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Alamat *</Text>
                    <Input
                        value={formData.address}
                        onChangeText={(text) => handleInputChange('address', text)}
                        placeholder="Masukkan alamat supplier"
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
                            Simpan Supplier
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}