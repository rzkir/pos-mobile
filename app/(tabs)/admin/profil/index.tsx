import { useAuth } from '@/context/AuthContext'

import { router } from 'expo-router'

import React from 'react'

import { Text, TouchableOpacity, View } from 'react-native'

export default function Profil() {
    const { user, signOut, loading } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        router.replace('/auth/signin')
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-2xl font-bold text-gray-800 mb-4">
                    Profil
                </Text>
                {user ? (
                    <View className="w-full px-6 mt-4">
                        <Text className="text-lg text-gray-800 mb-1">Nama: {user.name}</Text>
                        <Text className="text-lg text-gray-800 mb-1">Email: {user.email}</Text>
                        <Text className="text-lg text-gray-800">Role: {user.role}</Text>
                    </View>
                ) : (
                    <Text className="text-gray-600 text-center">Tidak ada data pengguna</Text>
                )}

                <TouchableOpacity
                    className="mt-8 py-3 px-6 rounded-xl items-center bg-red-500"
                    onPress={handleSignOut}
                    disabled={loading}
                >
                    <Text className="text-white text-base font-semibold">
                        {loading ? 'Signing Out...' : 'Sign Out'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}