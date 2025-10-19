import { useRouter } from 'expo-router';

import { useEffect, useState } from 'react';

import { Alert, Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Toast from 'react-native-toast-message';

import { Ionicons } from '@expo/vector-icons';

import { useProducts } from '@/hooks/useProducts';

import { useCategories } from '@/hooks/useCategories';

import { useSizes } from '@/hooks/useSizes';

import { useSuppliers } from '@/hooks/useSuppliers';

import ProductDetailsView from '@/components/ProductDetailsView';

export default function Products() {
    const router = useRouter();
    const {
        products,
        loading,
        deleteProduct,
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

    const handleEdit = (product: any) => {
        router.push(`/admin/products/${product.id}`);
    };

    const handleAdd = () => {
        router.push('/admin/products/new');
    };

    const handleNavigateToCategory = () => {
        router.push('/admin/products/category');
    };

    const handleNavigateToSize = () => {
        router.push('/admin/products/size');
    };

    const handleNavigateToSupplier = () => {
        router.push('/admin/products/supplier');
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

    const handleDelete = (product: any) => {
        Alert.alert(
            'Konfirmasi Hapus',
            `Apakah Anda yakin ingin menghapus produk "${product.name}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProduct(product.id);
                            Toast.show({ type: 'success', text1: 'Produk berhasil dihapus' });
                        } catch {
                            Toast.show({ type: 'error', text1: 'Gagal menghapus produk' });
                        }
                    }
                }
            ]
        );
    };

    const handleViewDetails = (product: any) => {
        setSelectedProduct(product);
        setShowDetailsView(true);
    };

    const closeDetailsView = () => {
        setShowDetailsView(false);
        setSelectedProduct(null);
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
                    <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        className="bg-blue-500 px-4 py-2 rounded-xl"
                    >
                        <Ionicons name="create-outline" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        className="bg-red-500 px-4 py-2 rounded-xl"
                    >
                        <Ionicons name="trash-outline" size={16} color="white" />
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
            <ProductDetailsView
                product={selectedProduct}
                categories={categories}
                sizes={sizes}
                suppliers={suppliers}
                onClose={closeDetailsView}
                onEdit={handleEdit}
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
                            Kelola inventori produk Anda
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleAdd}
                        className="bg-green-500 px-5 py-3 rounded-xl"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, backgroundColor: '#66BB6A' }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Tambah</Text>
                        </View>
                    </TouchableOpacity>
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

            {/* Management Sections */}
            <View>
                <Text className="text-xl font-bold text-gray-800 mb-4 px-1">Kelola Data Master</Text>

                {/* Grid Layout - 2 Columns */}
                <View className="flex-row flex-wrap">
                    {/* Categories Section */}
                    <View className="w-1/2 px-1 mb-2">
                        <TouchableOpacity
                            onPress={handleNavigateToCategory}
                            className="bg-white p-5 rounded-2xl"
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
                                    <Text className="text-emerald-700 text-sm font-bold">{categories.length}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Sizes Section */}
                    <View className="w-1/2 px-1 mb-2">
                        <TouchableOpacity
                            onPress={handleNavigateToSize}
                            className="bg-white p-5 rounded-2xl"
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
                                    <Text className="text-purple-700 text-sm font-bold">{sizes.length}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Suppliers Section */}
                    <View className="w-1/2 px-1 mb-4">
                        <TouchableOpacity
                            onPress={handleNavigateToSupplier}
                            className="bg-white p-5 rounded-2xl"
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
                                    <Text className="text-orange-700 text-sm font-bold">{suppliers.length}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Products Summary Section */}
                    <View className="w-1/2 px-1 mb-4">
                        <View className="bg-white p-5 rounded-2xl">
                            <View className="flex-col items-start justify-start relative gap-4">
                                <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center">
                                    <Ionicons name="cube-outline" size={24} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-800">Produk</Text>
                                    <Text className="text-sm text-gray-600">Ringkasan data produk</Text>
                                </View>
                                <View className="bg-blue-100 px-3 py-2 rounded-xl absolute top-0 right-0">
                                    <Text className="text-blue-700 text-sm font-bold">{products.length}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
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
                                : 'Mulai dengan menambahkan produk pertama Anda'
                            }
                        </Text>
                        {!searchTerm && (
                            <TouchableOpacity
                                onPress={handleAdd}
                                className="bg-green-500 px-8 py-4 rounded-2xl"
                                style={{ shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="add" size={20} color="white" />
                                    <Text className="text-white font-bold ml-2 text-lg">
                                        Tambah Produk Pertama
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}