import { useAuth } from '@/context/AuthContext'

import { router } from 'expo-router'

import { Alert, Text, TouchableOpacity, View } from 'react-native'

import Toast from 'react-native-toast-message'

export default function Beranda() {
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

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-2xl font-bold text-gray-800 mb-4">
                    Selamat Datang di POS Mobile
                </Text>
                <Text className="text-gray-600 text-center">
                    Aplikasi Point of Sale untuk bisnis Anda
                </Text>
                {user && (
                    <View className="mt-6 w-full px-6">
                        <Text className="text-lg text-gray-800 mb-1">Nama: {user.name}</Text>
                        <Text className="text-lg text-gray-800 mb-1">Email: {user.email}</Text>
                        <Text className="text-lg text-gray-800 mb-4">Role: {user.role}</Text>

                        {/* Action Buttons */}
                        <View className="space-y-3">
                            <TouchableOpacity
                                className="py-3 px-6 rounded-xl items-center bg-blue-500"
                                onPress={handleRoleChange}
                                disabled={loading}
                            >
                                <Text className="text-white text-base font-semibold">
                                    {loading ? 'Loading...' : `Ubah ke Role ${user.role === 'karyawan' ? 'Admin' : 'Karyawan'}`}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="py-3 px-6 rounded-xl items-center bg-red-500"
                                onPress={handleSignOut}
                                disabled={loading}
                            >
                                <Text className="text-white text-base font-semibold">
                                    {loading ? 'Loading...' : 'Logout'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    )
}