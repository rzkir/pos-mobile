import { useRouter } from 'expo-router';

import { useEffect, useState } from 'react';

import { FlatList, Text, TouchableOpacity, View, Image, RefreshControl } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useProducts } from '@/hooks/useProducts';

import { formatIDR } from '@/helper/lib/FormatIdr';

export default function AllProducts() {
    const router = useRouter();
    const { products, refreshData, loading } = useProducts();
    const [list, setList] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setList(products);
    }, [products]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshData();
        } catch {
        } finally {
            setRefreshing(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 rounded-2xl mb-2 flex-row items-center justify-between">
            <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 items-center justify-center mr-3">
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                )}
            </View>
            <View className="flex-1 pr-2">
                <Text numberOfLines={1} className="text-base font-semibold text-gray-900">{item.name}</Text>
                <Text numberOfLines={1} className="text-xs text-gray-500">{item.barcode}</Text>
                <View className="mt-1 flex-row items-center">
                    <Ionicons name="albums-outline" size={14} color="#6B7280" />
                    <Text className="ml-1 text-gray-600 text-xs">Stok: {item.stock}</Text>
                </View>
            </View>
            <Text className="text-sm font-bold text-gray-900">{formatIDR(item.price || 0)}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 px-4 pt-4">
            <View className="flex-row items-center mb-4">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-2">
                    <Ionicons name="arrow-back" size={20} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-gray-900">All Products</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <Ionicons name="cube-outline" size={32} color="#3B82F6" />
                    <Text className="mt-2 text-gray-600">Memuat produk...</Text>
                </View>
            ) : list.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Ionicons name="pricetags-outline" size={40} color="#3B82F6" />

                    <Text className="mt-4 text-gray-600 text-lg">Tidak ada produk</Text>

                    <View className="items-center justify-center">
                        <TouchableOpacity
                            onPress={() => router.push('/products/new')}
                            className="mt-4 bg-blue-600 py-3 px-6 rounded-xl items-center justify-center"
                        >
                            <Text className="text-white font-semibold text-lg">Tambah Produk</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={list}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3B82F6']}
                            tintColor="#3B82F6"
                            title="Memuat ulang..."
                            titleColor="#6B7280"
                        />
                    }
                />
            )}
        </View>
    );
}