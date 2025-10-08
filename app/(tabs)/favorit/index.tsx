import React from 'react'

import { Text, View } from 'react-native'

export default function Favorit() {
    return (
        <View className="flex-1 justify-center items-center p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
                Favorit
            </Text>
            <Text className="text-gray-600 text-center">
                Produk dan layanan favorit Anda
            </Text>
        </View>
    )
}