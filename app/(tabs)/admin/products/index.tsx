import { useRouter } from 'expo-router';

import { useEffect, useState } from 'react';

import {
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useProducts } from '@/hooks/useProducts';

import { useCategories } from '@/hooks/useCategories';

import { useSizes } from '@/hooks/useSizes';

import { useSuppliers } from '@/hooks/useSuppliers';

export default function Products() {
    const router = useRouter();
    const {
        products,
        loading,
        deleteProduct,
        updateProductStock,
        refreshData
    } = useProducts();

    const { categories, refreshCategories } = useCategories();
    const { sizes, refreshSizes } = useSizes();
    const { suppliers, refreshSuppliers } = useSuppliers();

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

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

    const handleAddCategory = () => {
        router.push('/admin/products/category');
    };

    const handleAddSize = () => {
        router.push('/admin/products/size');
    };

    const handleAddSupplier = () => {
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
                            Alert.alert('Sukses', 'Produk berhasil dihapus');
                        } catch {
                            Alert.alert('Error', 'Gagal menghapus produk');
                        }
                    }
                }
            ]
        );
    };

    const handleStockUpdate = (product: any, newStock: string) => {
        const stock = parseInt(newStock);
        if (isNaN(stock) || stock < 0) {
            Alert.alert('Error', 'Stok harus berupa angka positif');
            return;
        }

        updateProductStock(product.id, stock);
    };

    const renderProduct = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                        {item.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-1">
                        Barcode: {item.barcode}
                    </Text>
                    <Text className="text-sm text-gray-600">
                        SKU: {item.sku}
                    </Text>
                </View>
                <View className="flex-row space-x-2">
                    <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        className="bg-blue-500 px-3 py-1 rounded"
                    >
                        <Text className="text-white text-xs">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        className="bg-red-500 px-3 py-1 rounded"
                    >
                        <Text className="text-white text-xs">Hapus</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-green-600">
                    Rp {item.price?.toLocaleString()}
                </Text>
                <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600 mr-2">Stok:</Text>
                    <TextInput
                        className="border border-gray-300 rounded px-2 py-1 text-center w-16"
                        value={item.stock?.toString()}
                        onChangeText={(text) => handleStockUpdate(item, text)}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View className="flex-row justify-between text-sm text-gray-500">
                <Text>Modal: Rp {item.modal?.toLocaleString()}</Text>
                <Text>Unit: {item.unit}</Text>
            </View>

            {item.description && (
                <Text className="text-sm text-gray-600 mt-2">
                    {item.description}
                </Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600">Memuat produk...</Text>
                </View>
            </View>
        );
    }


    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-gray-800">
                        Daftar Produk
                    </Text>
                    <TouchableOpacity
                        onPress={handleAdd}
                        className="bg-blue-500 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white font-semibold">Tambah Produk</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <TextInput
                    className="bg-gray-100 p-3 rounded-lg border border-gray-300"
                    placeholder="Cari produk berdasarkan nama atau barcode..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            {/* Management Sections */}
            <View className="bg-white p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-800 mb-4">Kelola Data Master</Text>

                {/* Grid Layout - 2 Columns */}
                <View className="flex-row flex-wrap">
                    {/* Categories Section */}
                    <View className="w-1/2 pr-2 mb-4">
                        <View className="bg-gray-50 p-3 rounded-lg">
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <Ionicons name="grid-outline" size={16} color="#374151" />
                                    <Text className="text-base font-medium text-gray-700 ml-2">Kategori</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleAddCategory}
                                    className="bg-green-500 px-2 py-1 rounded flex-row items-center"
                                >
                                    <Ionicons name="add" size={12} color="white" />
                                    <Text className="text-white text-xs ml-1">Tambah</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap">
                                {categories.length > 0 ? (
                                    categories.slice(0, 2).map((category: any) => (
                                        <View key={category.id} className="bg-white px-2 py-1 rounded mr-1 mb-1">
                                            <Text className="text-xs text-gray-700">{category.name}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="text-gray-500 text-xs">Belum ada</Text>
                                )}
                                {categories.length > 2 && (
                                    <View className="bg-blue-100 px-2 py-1 rounded">
                                        <Text className="text-xs text-blue-700">+{categories.length - 2}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Sizes Section */}
                    <View className="w-1/2 pl-2 mb-4">
                        <View className="bg-gray-50 p-3 rounded-lg">
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <Ionicons name="resize-outline" size={16} color="#374151" />
                                    <Text className="text-base font-medium text-gray-700 ml-2">Ukuran</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleAddSize}
                                    className="bg-green-500 px-2 py-1 rounded flex-row items-center"
                                >
                                    <Ionicons name="add" size={12} color="white" />
                                    <Text className="text-white text-xs ml-1">Tambah</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap">
                                {sizes.length > 0 ? (
                                    sizes.slice(0, 2).map((size: any) => (
                                        <View key={size.id} className="bg-white px-2 py-1 rounded mr-1 mb-1">
                                            <Text className="text-xs text-gray-700">{size.name}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="text-gray-500 text-xs">Belum ada</Text>
                                )}
                                {sizes.length > 2 && (
                                    <View className="bg-blue-100 px-2 py-1 rounded">
                                        <Text className="text-xs text-blue-700">+{sizes.length - 2}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Suppliers Section */}
                    <View className="w-1/2 pr-2 mb-4">
                        <View className="bg-gray-50 p-3 rounded-lg">
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <Ionicons name="business-outline" size={16} color="#374151" />
                                    <Text className="text-base font-medium text-gray-700 ml-2">Supplier</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleAddSupplier}
                                    className="bg-green-500 px-2 py-1 rounded flex-row items-center"
                                >
                                    <Ionicons name="add" size={12} color="white" />
                                    <Text className="text-white text-xs ml-1">Tambah</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap">
                                {suppliers.length > 0 ? (
                                    suppliers.slice(0, 2).map((supplier: any) => (
                                        <View key={supplier.id} className="bg-white px-2 py-1 rounded mr-1 mb-1">
                                            <Text className="text-xs text-gray-700">{supplier.name}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="text-gray-500 text-xs">Belum ada</Text>
                                )}
                                {suppliers.length > 2 && (
                                    <View className="bg-blue-100 px-2 py-1 rounded">
                                        <Text className="text-xs text-blue-700">+{suppliers.length - 2}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Products Summary Section */}
                    <View className="w-1/2 pl-2 mb-4">
                        <View className="bg-gray-50 p-3 rounded-lg">
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <Ionicons name="cube-outline" size={16} color="#374151" />
                                    <Text className="text-base font-medium text-gray-700 ml-2">Produk</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleAdd}
                                    className="bg-blue-500 px-2 py-1 rounded flex-row items-center"
                                >
                                    <Ionicons name="add" size={12} color="white" />
                                    <Text className="text-white text-xs ml-1">Tambah</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap">
                                <View className="bg-white px-2 py-1 rounded mr-1 mb-1">
                                    <Text className="text-xs text-gray-700">Total: {products.length}</Text>
                                </View>
                                <View className="bg-white px-2 py-1 rounded mr-1 mb-1">
                                    <Text className="text-xs text-gray-700">Aktif: {products.filter((p: any) => p.is_active).length}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Products List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
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
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-gray-500 text-center">
                            {searchTerm ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                        </Text>
                        {!searchTerm && (
                            <TouchableOpacity
                                onPress={handleAdd}
                                className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
                            >
                                <Text className="text-white font-semibold">
                                    Tambah Produk Pertama
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </View>
    );
}