import { Image, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function CardProducts({ item, onViewDetails, onEdit, onDelete }: CardProductsProps) {
    return (
        <View
            className="bg-white mx-1 mb-4 rounded-2xl p-5 border border-gray-100"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 }}
        >
            <View className="flex-row items-start mb-4">
                {/* Product Image */}
                <View className="mr-4">
                    {item.image_url ? (
                        <Image
                            source={{ uri: item.image_url }}
                            style={{ width: 72, height: 72, borderRadius: 16 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            className="rounded-2xl items-center justify-center"
                            style={{ width: 72, height: 72, backgroundColor: '#F3F4F6' }}
                        >
                            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                        </View>
                    )}
                </View>

                <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                        {item.name}
                    </Text>

                    <View className="flex-row items-center mb-2">
                        <Ionicons name="barcode-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1" numberOfLines={1}>
                            {item.barcode}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        {item.is_active ? (
                            <View className="bg-green-50 px-2 py-1 rounded-full mr-2 border border-green-100">
                                <Text className="text-green-700 text-[10px] font-semibold">Aktif</Text>
                            </View>
                        ) : (
                            <View className="bg-gray-50 px-2 py-1 rounded-full mr-2 border border-gray-200">
                                <Text className="text-gray-600 text-[10px] font-semibold">Nonaktif</Text>
                            </View>
                        )}
                        <Text className="text-xs text-gray-500">Unit: {item.unit}</Text>
                    </View>
                </View>

                {item.best_seller ? (
                    <View className="ml-2">
                        <View className="bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                            <View className="flex-row items-center">
                                <Ionicons name="star" size={12} color="#D97706" />
                                <Text className="text-yellow-700 text-[10px] font-semibold ml-1">Best Seller</Text>
                            </View>
                        </View>
                    </View>
                ) : null}
            </View>

            <View className="flex-row justify-between items-end mb-4">
                <View>
                    <Text className="text-2xl font-extrabold text-green-600 mb-1">
                        Rp {item.price?.toLocaleString()}
                    </Text>

                    <Text className="text-xs text-gray-500">
                        Modal: Rp {item.modal?.toLocaleString()}
                    </Text>
                </View>

                <View className="items-end">
                    <Text className="text-xs text-gray-500 mb-1 font-medium">Stok</Text>
                    <View className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center w-20">
                        <Text className="font-semibold text-gray-800">{item.stock || 0}</Text>
                    </View>
                </View>
            </View>

            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={() => onViewDetails(item)}
                    className="flex-1 bg-green-500 px-4 py-3 rounded-xl"
                    style={{ shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="eye-outline" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2 text-sm">Detail</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onEdit(item)}
                    className="px-4 py-3 rounded-xl bg-blue-500"
                    style={{ shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="create-outline" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2 text-sm">Edit</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onDelete(item)}
                    className="px-4 py-3 rounded-xl bg-red-500"
                    style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="trash-outline" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2 text-sm">Hapus</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
