import { View, Text, ScrollView, TouchableOpacity } from 'react-native'

import { router } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

export default function EditProfile() {
    const handleEditCompanyInfo = () => {
        router.push('/profile/edit-profile/information')
    }

    return (
        <View className="flex-1 bg-gray-50">
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
                            Pilih bagian yang ingin diedit
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
                {/* Edit Options */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Pilih Bagian untuk Diedit</Text>

                    <View className="space-y-4">
                        {/* Edit Company Information */}
                        <TouchableOpacity
                            onPress={handleEditCompanyInfo}
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
                                    <Ionicons name="business" size={28} color="white" />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">Informasi Perusahaan</Text>
                                    <Text className="text-gray-600">Edit data perusahaan dan bisnis</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Info */}
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
                            <View className="items-center">
                                <LinearGradient
                                    colors={['#8b5cf6', '#7c3aed']}
                                    className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                                >
                                    <Ionicons name="information-circle" size={32} color="white" />
                                </LinearGradient>
                                <Text className="text-xl font-bold text-gray-900 mb-2">
                                    Informasi
                                </Text>
                                <Text className="text-gray-600 text-center">
                                    Pilih bagian yang ingin Anda edit. Setiap bagian memiliki pengaturan
                                    yang berbeda untuk memudahkan pengelolaan profil.
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}