import { useRouter } from 'expo-router';

import { useEffect, useState } from 'react';

import { Alert, Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useProducts } from '@/hooks/useProducts';

import Toast from 'react-native-toast-message';

import { useCategories } from '@/hooks/useCategories';

import { useSizes } from '@/hooks/useSizes';

import { useSuppliers } from '@/hooks/useSuppliers';

import ProductDetailsView from '@/components/ProductDetailsView';

import ManagementSection from '@/components/products/ManagementSection';

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
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        refreshCategories();
        refreshSizes();
        refreshSuppliers();
    }, [refreshCategories, refreshSizes, refreshSuppliers]);

    useEffect(() => {
        let list = products;
        if (selectedCategoryId !== 'all') {
            list = list.filter((p: any) => p.category_id === selectedCategoryId);
        }
        if (searchTerm) {
            list = list.filter((product: any) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const sorted = [...list].sort((a: any, b: any) => {
            const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
            const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
            return bTime - aTime;
        });
        setFilteredProducts(sorted.slice(0, 10));
    }, [products, searchTerm, selectedCategoryId]);

    const handleEdit = (product: any) => {
        router.push(`/products/${product.id}`);
    };

    const handleAdd = () => {
        router.push('/products/new');
    };

    const handleNavigateToCategory = () => {
        router.push('/products/category');
    };

    const handleNavigateToSize = () => {
        router.push('/products/size');
    };

    const handleNavigateToSupplier = () => {
        router.push('/products/supplier');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refreshData(),
                refreshCategories(),
                refreshSizes(),
                refreshSuppliers()
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

    const renderProductCard = ({ item }: { item: any }) => (
        <View className="px-1 mb-4 w-1/2">
            <View className="bg-white rounded-2xl p-3" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleViewDetails(item)}>
                    <View className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 items-center justify-center">
                        {item.image_url ? (
                            <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                        )}
                    </View>
                </TouchableOpacity>

                <Text numberOfLines={1} className="mt-3 text-sm font-semibold text-gray-900">
                    {item.name}
                </Text>
                <Text className="text-gray-500 text-xs" numberOfLines={1}>{item.barcode}</Text>

                <Text className="mt-2 text-base font-bold text-gray-900">Rp {item.price?.toLocaleString()}</Text>

                <View className="mt-1 flex-row items-center">
                    <Ionicons name="albums-outline" size={14} color="#6B7280" />
                    <Text className="ml-1 text-gray-600 text-xs">Stok: {item.stock}</Text>
                </View>

                <View className="mt-3 flex-row items-center justify-end gap-2">
                    <TouchableOpacity onPress={() => handleEdit(item)} className="px-3 py-2 rounded-full bg-blue-500">
                        <Text className="text-white text-xs font-semibold">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} className="px-3 py-2 rounded-full bg-red-500">
                        <Text className="text-white text-xs font-semibold">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
            className="flex-1 bg-background px-4"
            showsVerticalScrollIndicator={false}
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
        >
            <ManagementSection
                categoryCount={categories.length}
                sizeCount={sizes.length}
                supplierCount={suppliers.length}
                productCount={products.length}
                onNavigateToCategory={handleNavigateToCategory}
                onNavigateToSize={handleNavigateToSize}
                onNavigateToSupplier={handleNavigateToSupplier}
            />

            {/* Header baru ala katalog */}
            <View className="px-1">
                <View className="px-1 mb-3 flex-row items-center justify-between">
                    <Text className="text-xl font-extrabold text-gray-900">Recent Items</Text>
                    <TouchableOpacity onPress={() => router.push('/products/all-products')}>
                        <Text className="text-emerald-600 font-semibold">See All</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-2 px-1 mb-3">
                    <TouchableOpacity onPress={handleAdd} className="flex-row items-center bg-white px-3 py-2 rounded-full" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
                        <Ionicons name="add" size={16} color="#10B981" />
                        <Text className="ml-1 text-gray-800 font-semibold">Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Pencarian dan Chips kategori */}
                <View className="relative mb-3">
                    <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                        <Ionicons name="search" size={20} color="#6B7280" />
                    </View>

                    <TextInput
                        className="bg-white pl-12 pr-4 py-3 rounded-2xl border border-gray-200 text-gray-800 placeholder-gray-500"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => setSelectedCategoryId('all')} className={`px-3 py-1.5 rounded-full ${selectedCategoryId === 'all' ? 'bg-emerald-500' : 'bg-white'}`} style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                            <Text className={`text-sm font-semibold ${selectedCategoryId === 'all' ? 'text-white' : 'text-gray-800'}`}>Semua</Text>
                        </TouchableOpacity>
                        {categories.map((cat: any) => (
                            <TouchableOpacity key={cat.id} onPress={() => setSelectedCategoryId(cat.id)} className={`px-3 py-1.5 rounded-full ${selectedCategoryId === cat.id ? 'bg-emerald-500' : 'bg-white'}`} style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                                <Text className={`text-sm font-semibold ${selectedCategoryId === cat.id ? 'text-white' : 'text-gray-800'}`}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Grid Produk 2 kolom menggunakan FlatList */}
            {filteredProducts.length > 0 ? (
                <View className="pt-2">
                    <FlatList
                        data={filteredProducts}
                        numColumns={2}
                        scrollEnabled={false}
                        renderItem={renderProductCard}
                        keyExtractor={(item: any) => item.id.toString()}
                    />
                </View>
            ) : (
                <View className="pt-5 pb-10 items-center">
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