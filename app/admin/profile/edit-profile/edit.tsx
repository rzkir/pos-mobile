import { useState } from 'react'

import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput, Image } from 'react-native'

import { router } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import Toast from 'react-native-toast-message'

import { useAuth } from '@/context/AuthContext'

import * as ImagePicker from 'expo-image-picker'

export default function EditAdminProfile() {
    const { user, updateUser } = useAuth()

    const [userName, setUserName] = useState(user?.name || '')
    const [userEmail, setUserEmail] = useState(user?.email || '')
    const [userRole, setUserRole] = useState<'admins' | 'karyawan'>(user?.role || 'admins')
    const [profileImage, setProfileImage] = useState<string | null>(null)

    const [loading, setLoading] = useState(false)

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
            setProfileImage(result.assets[0].uri)
        }
    }

    const handleSaveProfile = async () => {
        setLoading(true)

        try {
            if (!userName.trim() || !userEmail.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Mohon lengkapi semua field yang wajib diisi'
                })
                return
            }

            await new Promise(resolve => setTimeout(resolve, 1000))

            if (updateUser) {
                await updateUser({
                    name: userName,
                    email: userEmail,
                    role: userRole
                })
            }

            Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Profil berhasil diperbarui'
            })

            router.back()
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal memperbarui profil'
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
                            Edit Profil
                        </Text>
                        <Text className="text-blue-100 text-base">
                            Kelola informasi pribadi Anda
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
                {/* Admin Profile */}
                <View className="px-6 mb-8">
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
                            {/* Profile Photo */}
                            <View className="items-center mb-6">
                                <TouchableOpacity
                                    onPress={handleImagePicker}
                                    className="relative"
                                >
                                    {profileImage ? (
                                        <Image
                                            source={{ uri: profileImage }}
                                            className="w-24 h-24 rounded-full"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                                            className="w-24 h-24 rounded-full items-center justify-center"
                                        >
                                            <Ionicons name="person" size={48} color="white" />
                                        </LinearGradient>
                                    )}
                                    <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-2 border-white items-center justify-center">
                                        <Ionicons name="camera" size={16} color="white" />
                                    </View>
                                </TouchableOpacity>
                                <Text className="text-sm text-gray-600 mt-2">Tap untuk mengubah foto</Text>
                            </View>

                            <View className="space-y-4">
                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</Text>
                                    <TextInput
                                        value={userName}
                                        onChangeText={setUserName}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Email *</Text>
                                    <TextInput
                                        value={userEmail}
                                        onChangeText={setUserEmail}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900"
                                        placeholder="user@company.com"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Role</Text>
                                    <View className="flex-row space-x-4">
                                        <TouchableOpacity
                                            onPress={() => setUserRole('admins')}
                                            className={`flex-1 rounded-2xl px-4 py-3 border-2 ${userRole === 'admins'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-gray-50'
                                                }`}
                                        >
                                            <Text className={`text-center font-medium ${userRole === 'admins' ? 'text-blue-700' : 'text-gray-700'
                                                }`}>
                                                Admin
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setUserRole('karyawan')}
                                            className={`flex-1 rounded-2xl px-4 py-3 border-2 ${userRole === 'karyawan'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-gray-50'
                                                }`}
                                        >
                                            <Text className={`text-center font-medium ${userRole === 'karyawan' ? 'text-blue-700' : 'text-gray-700'
                                                }`}>
                                                Karyawan
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-6 mb-8">
                    <View className="space-y-4">
                        {/* Save Profile */}
                        <TouchableOpacity
                            onPress={handleSaveProfile}
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
                                            {loading ? 'Menyimpan...' : 'Simpan Profil'}
                                        </Text>
                                        <Text className="text-green-100 text-sm">
                                            {loading ? 'Mohon tunggu...' : 'Simpan perubahan profil'}
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