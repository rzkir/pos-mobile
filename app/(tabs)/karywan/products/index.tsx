import { useCategories } from '@/hooks/useCategories';

import { useProducts } from '@/hooks/useProducts';

import { useSizes } from '@/hooks/useSizes';

import { useSuppliers } from '@/hooks/useSuppliers';

import { Ionicons } from '@expo/vector-icons';

import { useEffect, useState } from 'react';

import { Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ProductDetailsViewKaryawan from '@/components/ProductDetailsViewKaryawan';

export default function Products() {
    const {
        products,
        loading,
        refreshData
    } = useProducts();

    const { categories, refreshCategories } = useCategories();
    const { sizes, refreshSizes } = useSizes();
    const { suppliers, refreshSuppliers } = useSuppliers();

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showDetailsView, setShowDetailsView] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Refresh master data when component mounts
    useEffect(() => {
        refreshCategories();
        refreshSizes();
        refreshSuppliers();
    }, [refreshCategories, refreshSizes, refreshSuppliers]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = products.filter((product: any) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [products, searchTerm]);

    const handleViewDetails = (product: any) => {
        setSelectedProduct(product);
        setShowDetailsView(true);
    };

    const closeDetailsView = () => {
        setShowDetailsView(false);
        setSelectedProduct(null);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Refresh all data in parallel
            await Promise.all([
                refreshData(), // Products
                refreshCategories(), // Categories
                refreshSizes(), // Sizes
                refreshSuppliers() // Suppliers
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderProductList = ({ item }: { item: any }) => (
        <View className="bg-white mx-1 mb-4 rounded-2xl p-5">
            <View className="flex-row items-start mb-4">
                {/* Product Image */}
                <View className="mr-4">
                    {item.image_url ? (
                        <Image
                            source={{ uri: item.image_url }}
                            style={{ width: 70, height: 70, borderRadius: 16 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-17 h-17 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl items-center justify-center" style={{ width: 70, height: 70 }}>
                            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                        </View>
                    )}
                </View>

                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 mb-1 leading-5">
                        {item.name}
                    </Text>

                    <View className="flex-row items-center mb-2">
                        <Ionicons name="barcode-outline" size={14} color="#6B7280" />
                        <Text className="text-sm text-gray-600 ml-1 font-medium">
                            {item.barcode}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                            <Text className="text-green-700 text-xs font-semibold">Aktif</Text>
                        </View>
                        <Text className="text-xs text-gray-500">Unit: {item.unit}</Text>
                    </View>
                </View>

                <View className="flex-row gap-1">
                    <TouchableOpacity
                        onPress={() => handleViewDetails(item)}
                        className="bg-green-500 px-4 py-2 rounded-xl"
                    >
                        <Ionicons name="eye-outline" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-2xl font-bold text-green-600 mb-1">
                        Rp {item.price?.toLocaleString()}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Modal: Rp {item.modal?.toLocaleString()}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-sm text-gray-600 mb-2 font-medium">Stok</Text>
                    <View className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center w-20">
                        <Text className="font-semibold text-gray-800">{item.stock || 0}</Text>
                    </View>
                </View>
            </View>

            {item.description && (
                <View className="bg-gray-50 rounded-xl p-3">
                    <Text className="text-sm text-gray-600 leading-5">
                        {item.description}
                    </Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <ScrollView
                className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50"
                contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
                <View className="bg-white p-8 rounded-3xl items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 }}>
                    <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="cube-outline" size={32} color="#3B82F6" />
                    </View>
                    <Text className="text-gray-700 font-semibold text-lg mb-2">Memuat Produk</Text>
                    <Text className="text-gray-500 text-center">Mohon tunggu sebentar...</Text>
                </View>
            </ScrollView>
        );
    }

    // Show details view if selected
    if (showDetailsView && selectedProduct) {
        return (
            <ProductDetailsViewKaryawan
                product={selectedProduct}
                categories={categories}
                sizes={sizes}
                suppliers={suppliers}
                onClose={closeDetailsView}
            />
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 px-4"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3B82F6']} // Android
                    tintColor="#3B82F6" // iOS
                    title="Memuat ulang..." // iOS
                    titleColor="#6B7280" // iOS
                />
            }
        >
            {/* Header */}
            <View className="pt-5 px-1">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-gray-800 mb-1">
                            Daftar Produk
                        </Text>
                        <Text className="text-gray-500 text-sm">
                            Lihat informasi produk
                        </Text>
                    </View>
                </View>

                {/* Search */}
                <View className="relative mb-4">
                    <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                        <Ionicons name="search" size={20} color="#6B7280" />
                    </View>
                    <TextInput
                        className="bg-white/95 backdrop-blur-sm pl-12 pr-4 py-4 rounded-2xl border-0 text-gray-800 placeholder-gray-500"
                        placeholder="Cari produk berdasarkan nama atau barcode..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
                    />
                </View>
            </View>

            {/* Products List */}
            {filteredProducts.length > 0 ? (
                filteredProducts.map((item: any) => (
                    <View key={item.id.toString()}>
                        {renderProductList({ item })}
                    </View>
                ))
            ) : (
                <View className="py-20 items-center">
                    <View className="bg-white p-8 rounded-3xl items-center">
                        <View className="w-20 h-20 bg-gray-100 rounded-3xl items-center justify-center mb-6">
                            <Ionicons name="cube-outline" size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-700 font-bold text-xl mb-2 text-center">
                            {searchTerm ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
                        </Text>
                        <Text className="text-gray-500 text-center mb-6 leading-6">
                            {searchTerm
                                ? `Tidak ada produk yang cocok dengan "${searchTerm}"`
                                : 'Tidak ada produk yang tersedia'
                            }
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

