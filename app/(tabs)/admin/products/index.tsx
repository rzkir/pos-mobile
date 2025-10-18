import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useProducts } from '../../../../hooks/useProducts';

export default function Products() {
    const router = useRouter();
    const {
        products,
        loading,
        deleteProduct,
        updateProductStock,
        refreshData
    } = useProducts();

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

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
        router.push(`/(tabs)/admin/products/${product.id}` as any);
    };

    const handleAdd = () => {
        router.push('/(tabs)/admin/products/new' as any);
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
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600">Memuat produk...</Text>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView className="flex-1 bg-gray-50">
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

            {/* Products List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
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
        </SafeAreaView>
    );
}