import { useState, useEffect } from 'react'

import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput, Image } from 'react-native'

import { router } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import Toast from 'react-native-toast-message'

import * as ImagePicker from 'expo-image-picker'

import { CompanyProfileService } from '@/services'

export default function EditCompanyInfo() {
    const [companyName, setCompanyName] = useState('')
    const [companyAddress, setCompanyAddress] = useState('')
    const [companyPhone, setCompanyPhone] = useState('')
    const [companyEmail, setCompanyEmail] = useState('')
    const [companyWebsite, setCompanyWebsite] = useState('')
    const [logoUrl, setLogoUrl] = useState<string | null>(null)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadCompanyProfile()
    }, [])

    const loadCompanyProfile = async () => {
        try {
            const profile = await CompanyProfileService.get()
            if (profile) {
                setCompanyName(profile.name)
                setCompanyAddress(profile.address)
                setCompanyPhone(profile.phone)
                setCompanyEmail(profile.email)
                setCompanyWebsite(profile.website)
                setLogoUrl(profile.logo_url || null)
            }
        } catch (error) {
            console.error('Error loading company profile:', error)
        }
    }

    const handleImagePicker = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!result.canceled) {
            setLogoUrl(result.assets[0].uri)
        }
    }

    const handleSaveInfo = async () => {
        setLoading(true)

        try {
            // Validate required fields
            if (!companyName.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Mohon lengkapi nama perusahaan'
                })
                return
            }

            // Save company profile to local storage
            const profileData = {
                name: companyName.trim(),
                address: companyAddress.trim(),
                phone: companyPhone.trim(),
                email: companyEmail.trim(),
                website: companyWebsite.trim(),
                logo_url: logoUrl || undefined
            }

            await CompanyProfileService.save(profileData)

            Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Informasi perusahaan berhasil diperbarui'
            })

            router.back()
        } catch (error) {
            console.error('Error saving company profile:', error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal memperbarui informasi perusahaan'
            })
        } finally {
            setLoading(false)
        }
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
                            Informasi Perusahaan
                        </Text>
                        <Text className="text-blue-100 text-base">
                            Kelola data perusahaan dan pengaturan bisnis
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
                {/* Company Information */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Data Perusahaan</Text>

                    <View
                        className="bg-white rounded-3xl overflow-hidden"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.15,
                            shadowRadius: 20,
                            elevation: 8
                        }}
                    >
                        <LinearGradient
                            colors={['#f8fafc', '#ffffff']}
                            className="p-6"
                        >
                            {/* Company Logo */}
                            <View className="items-center mb-6">
                                <TouchableOpacity
                                    onPress={handleImagePicker}
                                    className="relative"
                                >
                                    {logoUrl ? (
                                        <Image
                                            source={{ uri: logoUrl }}
                                            className="w-24 h-24 rounded-full"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                                            className="w-24 h-24 rounded-full items-center justify-center"
                                        >
                                            <Ionicons name="business" size={48} color="white" />
                                        </LinearGradient>
                                    )}
                                    <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-2 border-white items-center justify-center">
                                        <Ionicons name="camera" size={16} color="white" />
                                    </View>
                                </TouchableOpacity>
                                <Text className="text-sm text-gray-600 mt-2">Tap untuk mengubah logo</Text>
                            </View>

                            <View className="space-y-4">
                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Nama Perusahaan *</Text>
                                    <TextInput
                                        value={companyName}
                                        onChangeText={setCompanyName}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900"
                                        placeholder="Masukkan nama perusahaan"
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Alamat Perusahaan</Text>
                                    <TextInput
                                        value={companyAddress}
                                        onChangeText={setCompanyAddress}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900"
                                        placeholder="Masukkan alamat perusahaan"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View className="flex-row space-x-4">
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-gray-700 mb-2">Telepon</Text>
                                        <TextInput
                                            value={companyPhone}
                                            onChangeText={setCompanyPhone}
                                            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900"
                                            placeholder="+62 21 1234 5678"
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                                        <TextInput
                                            value={companyEmail}
                                            onChangeText={setCompanyEmail}
                                            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900"
                                            placeholder="info@company.com"
                                            keyboardType="email-address"
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Website</Text>
                                    <TextInput
                                        value={companyWebsite}
                                        onChangeText={setCompanyWebsite}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900"
                                        placeholder="www.company.com"
                                        keyboardType="url"
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-6 mb-8">
                    <View className="space-y-4">
                        {/* Save Info */}
                        <TouchableOpacity
                            onPress={handleSaveInfo}
                            disabled={loading}
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
                                        <Text className="text-white text-lg font-bold mb-1">
                                            {loading ? 'Menyimpan...' : 'Simpan Informasi'}
                                        </Text>
                                        <Text className="text-green-100 text-sm">
                                            {loading ? 'Mohon tunggu...' : 'Simpan perubahan informasi perusahaan'}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            disabled={loading}
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
                                colors={['#6b7280', '#4b5563', '#374151']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="p-6"
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                        <Ionicons name="close" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-bold mb-1">Batal</Text>
                                        <Text className="text-gray-100 text-sm">Kembali tanpa menyimpan perubahan</Text>
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