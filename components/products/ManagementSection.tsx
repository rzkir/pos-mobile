import { Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function ManagementSection({
    categoryCount,
    sizeCount,
    supplierCount,
    productCount,
    onNavigateToCategory,
    onNavigateToSize,
    onNavigateToSupplier
}: ManagementSectionProps) {
    return (
        <View className="pt-5">
            <Text className="text-xl font-bold text-gray-800 mb-4 px-1">Kelola Data Master</Text>

            <View className="flex-row flex-wrap">
                <View className="w-1/2 px-1 mb-2">
                    <TouchableOpacity
                        onPress={onNavigateToCategory}
                        className="bg-white p-5 rounded-2xl border border-border"
                    >
                        <View className="flex-col items-start justify-start relative gap-4">
                            <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center">
                                <Ionicons name="grid-outline" size={24} color="white" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-800">Kategori</Text>
                                <Text className="text-sm text-gray-600">Kelola kategori produk</Text>
                            </View>

                            <View className="bg-emerald-100 px-3 py-2 rounded-xl absolute top-0 right-0">
                                <Text className="text-emerald-700 text-sm font-bold">{categoryCount}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="w-1/2 px-1 mb-2">
                    <TouchableOpacity
                        onPress={onNavigateToSize}
                        className="bg-white p-5 rounded-2xl border border-border"
                    >
                        <View className="flex-col items-start justify-start relative gap-4">
                            <View className="w-12 h-12 bg-purple-500 rounded-2xl items-center justify-center">
                                <Ionicons name="resize-outline" size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-800">Ukuran</Text>
                                <Text className="text-sm text-gray-600">Kelola ukuran produk</Text>
                            </View>

                            <View className="bg-purple-100 px-3 py-2 rounded-xl absolute top-0 right-0">
                                <Text className="text-purple-700 text-sm font-bold">{sizeCount}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="w-1/2 px-1 mb-4">
                    <TouchableOpacity
                        onPress={onNavigateToSupplier}
                        className="bg-white p-5 rounded-2xl border border-border"
                    >
                        <View className="flex-col items-start justify-start relative gap-4">
                            <View className="w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center">
                                <Ionicons name="business-outline" size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-800">Supplier</Text>
                                <Text className="text-sm text-gray-600">Kelola data supplier</Text>
                            </View>
                            <View className="bg-orange-100 px-3 py-2 rounded-xl absolute top-0 right-0">
                                <Text className="text-orange-700 text-sm font-bold">{supplierCount}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="w-1/2 px-1 mb-4">
                    <View className="bg-white p-5 rounded-2xl border border-border">
                        <View className="flex-col items-start justify-start relative gap-4">
                            <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center">
                                <Ionicons name="cube-outline" size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-800">Produk</Text>
                                <Text className="text-sm text-gray-600">Ringkasan data produk</Text>
                            </View>
                            <View className="bg-blue-100 px-3 py-2 rounded-xl absolute top-0 right-0">
                                <Text className="text-blue-700 text-sm font-bold">{productCount}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}


