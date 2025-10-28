import { useAuth } from '@/context/AuthContext'

import { router } from 'expo-router'

import { Alert, ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native'

import Toast from 'react-native-toast-message'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

export default function Profil() {
    const { user, signOut, changeRole, loading } = useAuth()

    const handleSignOut = async () => {
        Alert.alert(
            'Konfirmasi Logout',
            'Apakah Anda yakin ingin keluar?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut()
                        router.replace('/auth/signin')
                    }
                }
            ]
        )
    }

    const handleRoleChange = () => {
        const newRole = user?.role === 'karyawan' ? 'admins' : 'karyawan'
        Alert.alert(
            'Ubah Role',
            `Apakah Anda yakin ingin mengubah role menjadi ${newRole}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Ubah',
                    onPress: async () => {
                        await changeRole(newRole)
                        Toast.show({ type: 'success', text1: `Role diubah ke ${newRole}` })
                        // Navigate to appropriate tab based on new role
                        if (newRole === 'admins') {
                            router.replace('/(tabs)/admin/beranda')
                        } else {
                            router.replace('/(tabs)/karywan/beranda')
                        }
                    }
                }
            ]
        )
    }

    const handleEditProfile = () => {
        router.push('/admin/profile/edit-profile')
    }

    const handleChangePassword = () => {
        Toast.show({ type: 'info', text1: 'Fitur ubah password akan segera tersedia' })
    }

    const handleAppSettings = () => {
        router.push('/admin/profile/settings')
    }

    const handleAbout = () => {
        router.push('/admin/profile/about')
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
            <LinearGradient
                colors={['#1e40af', '#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-8 px-6"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-white mb-2">
                            Profil Saya
                        </Text>
                        <Text className="text-blue-100 text-base">
                            Kelola informasi dan pengaturan akun Anda
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

                {/* User Information Card */}
                {user && (
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
                                className="p-8"
                            >
                                <View className="flex-row items-center mb-8">
                                    <View className="relative">
                                        <LinearGradient
                                            colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                                            className="w-20 h-20 rounded-3xl items-center justify-center"
                                        >
                                            <Ionicons name="person" size={36} color="white" />
                                        </LinearGradient>
                                        <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white items-center justify-center">
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        </View>
                                    </View>
                                    <View className="flex-1 ml-6">
                                        <Text className="text-2xl font-bold text-gray-900 mb-2">
                                            {user.name}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <LinearGradient
                                                colors={user.role === 'admins' ? ['#10b981', '#059669'] : ['#3b82f6', '#2563eb']}
                                                className="px-4 py-2 rounded-full"
                                            >
                                                <Text className="text-white text-sm font-semibold">
                                                    {user.role === 'admins' ? 'Administrator' : 'Karyawan'}
                                                </Text>
                                            </LinearGradient>
                                        </View>
                                    </View>
                                </View>

                                <View className="space-y-6">
                                    <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
                                        <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                                            <Ionicons name="mail" size={24} color="#3b82f6" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm text-gray-500 mb-1 font-medium">Email Address</Text>
                                            <Text className="text-base font-semibold text-gray-900">{user.email}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
                                        <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center mr-4">
                                            <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm text-gray-500 mb-1 font-medium">Role & Permissions</Text>
                                            <Text className="text-base font-semibold text-gray-900">
                                                {user.role === 'admins' ? 'Full Access Administrator' : 'Employee Access'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                )}

                {/* Profile Management Sections */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Kelola Profil</Text>

                    <View className="space-y-4">
                        {/* Edit Profile */}
                        <TouchableOpacity
                            onPress={handleEditProfile}
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center p-6">
                                <LinearGradient
                                    colors={['#3b82f6', '#1d4ed8']}
                                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                >
                                    <Ionicons name="create" size={28} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Edit Profil</Text>
                                    <Text className="text-gray-600">Ubah informasi pribadi dan foto profil</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

                        {/* Change Password */}
                        <TouchableOpacity
                            onPress={handleChangePassword}
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center p-6">
                                <LinearGradient
                                    colors={['#f59e0b', '#d97706']}
                                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                >
                                    <Ionicons name="key" size={28} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Ubah Password</Text>
                                    <Text className="text-gray-600">Ganti kata sandi untuk keamanan akun</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

                        {/* App Settings */}
                        <TouchableOpacity
                            onPress={handleAppSettings}
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center p-6">
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                >
                                    <Ionicons name="settings" size={28} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Pengaturan Aplikasi</Text>
                                    <Text className="text-gray-600">Konfigurasi notifikasi dan preferensi</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

                        {/* About */}
                        <TouchableOpacity
                            onPress={handleAbout}
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center p-6">
                                <LinearGradient
                                    colors={['#8b5cf6', '#7c3aed']}
                                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                >
                                    <Ionicons name="information-circle" size={28} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Tentang Aplikasi</Text>
                                    <Text className="text-gray-600">Informasi versi dan dukungan</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Aksi Cepat</Text>

                    <View className="space-y-4">
                        {/* Role Change Button */}
                        <TouchableOpacity
                            onPress={handleRoleChange}
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
                                colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="p-6"
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                        <Ionicons name="swap-horizontal" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-bold mb-1">
                                            {loading ? 'Memproses...' : `Ubah ke Role ${user?.role === 'karyawan' ? 'Admin' : 'Karyawan'}`}
                                        </Text>
                                        <Text className="text-blue-100 text-sm">
                                            {loading ? 'Mohon tunggu...' : 'Ganti peran pengguna Anda'}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={handleSignOut}
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
                                colors={['#ef4444', '#dc2626', '#b91c1c']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="p-6"
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                        <Ionicons name="log-out" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-bold mb-1">
                                            {loading ? 'Memproses...' : 'Keluar dari Akun'}
                                        </Text>
                                        <Text className="text-red-100 text-sm">
                                            {loading ? 'Mohon tunggu...' : 'Logout dari aplikasi POS Mobile'}
                                        </Text>
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