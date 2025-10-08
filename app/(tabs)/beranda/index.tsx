import React from 'react'
import { SafeAreaView, Text, View } from 'react-native'

export default function Beranda() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-2xl font-bold text-gray-800 mb-4">
                    Selamat Datang di POS Mobile
                </Text>
                <Text className="text-gray-600 text-center">
                    Aplikasi Point of Sale untuk bisnis Anda
                </Text>
            </View>
        </SafeAreaView>
    )
}