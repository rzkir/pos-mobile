import { FlatList, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useProducts } from '@/components/products/lib/useProducts';

import ProductDetailsView from '@/components/ProductDetailsView';

import ManagementSection from '@/components/products/ManagementSection';

import CardProducts from '@/components/products/CardProducts';

import FilterBottomSheet from '@/components/products/FilterBottomSheet';

export default function Products() {
    const {
        // data
        products,
        categories,
        sizes,
        suppliers,
        loading,

        // actions
        onRefresh,
        handleEdit,
        handleAdd,
        handleNavigateToCategory,
        handleNavigateToSize,
        handleNavigateToSupplier,
        handleDelete,
        handleNavigateAllProducts,

        // view state
        searchTerm,
        setSearchTerm,
        bestSellerProducts,
        regularProducts,
        showDetailsView,
        selectedProduct,
        refreshing,
        handleViewDetails,
        closeDetailsView,

        // filter state
        showFilterSheet,
        selectedCategoryId,
        selectedSizeId,
        handleOpenFilter,
        handleCloseFilter,
        handleApplyFilter,
        handleResetFilter,
    } = useProducts();

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
            <ManagementSection
                categoriesCount={categories.length}
                sizesCount={sizes.length}
                suppliersCount={suppliers.length}
                productsCount={products.length}
                onNavigateCategory={handleNavigateToCategory}
                onNavigateSize={handleNavigateToSize}
                onNavigateSupplier={handleNavigateToSupplier}
            />

            {/* CTA: Filter dan Lihat Semua Produk */}
            <View className="px-1 mb-3 flex-row justify-between items-center gap-2">
                <TouchableOpacity
                    onPress={handleOpenFilter}
                    className="flex-1 bg-gray-600 px-4 py-3 rounded-2xl"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="filter-outline" size={18} color="white" />
                        <Text className="text-white font-semibold ml-2">Filter</Text>
                        {(selectedCategoryId !== null || selectedSizeId !== null) && (
                            <View className="ml-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                                <Text className="text-white text-xs font-bold">
                                    {(selectedCategoryId !== null ? 1 : 0) + (selectedSizeId !== null ? 1 : 0)}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleNavigateAllProducts}
                    className="flex-1 bg-blue-600 px-4 py-3 rounded-2xl"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="list-outline" size={18} color="white" />
                        <Text className="text-white font-semibold ml-2">Lihat Semua</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Best Seller Products Section */}
            {bestSellerProducts.length > 0 && (
                <View className="mb-6 mt-4">
                    <View className="flex-row items-center justify-between mb-4 px-1">
                        <View className="flex-row items-center">
                            <View className="bg-yellow-100 p-2 rounded-xl mr-2">
                                <Ionicons name="star" size={20} color="#D97706" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-800">
                                    Best Seller
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    Produk terlaris
                                </Text>
                            </View>
                        </View>
                    </View>

                    <FlatList
                        data={bestSellerProducts}
                        horizontal={true}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        showsHorizontalScrollIndicator={true}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={({ item }: { item: any }) => (
                            <View className="w-80 px-1 mr-4" style={{ width: 320 }}>
                                <CardProducts
                                    item={item}
                                    onViewDetails={handleViewDetails}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </View>
                        )}
                        style={{ flexGrow: 0 }}
                    />
                </View>
            )}

            {/* Regular Products Section */}
            {regularProducts.length > 0 && (
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-4 px-1">
                        <View className="flex-row items-center">
                            <View className="bg-blue-100 p-2 rounded-xl mr-2">
                                <Ionicons name="cube-outline" size={20} color="#3B82F6" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-800">
                                    Produk Lainnya
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    Semua produk
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="flex-row flex-wrap px-1">
                        {regularProducts.map((item: any) => (
                            <View key={item.id.toString()} className="w-1/2 px-1 mb-4">
                                <CardProducts
                                    item={item}
                                    onViewDetails={handleViewDetails}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Empty State */}
            {bestSellerProducts.length === 0 && regularProducts.length === 0 && (
                <View className="mt-5 items-center w-full">
                    <View className="bg-white p-8 w-full rounded-3l items-center">
                        <View className="w-20 h-20 bg-gray-100 rounded-3l items-center justify-center mb-6">
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

            {/* Filter Bottom Sheet */}
            <FilterBottomSheet
                visible={showFilterSheet}
                categories={categories}
                sizes={sizes}
                selectedCategoryId={selectedCategoryId}
                selectedSizeId={selectedSizeId}
                onClose={handleCloseFilter}
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
            />
        </ScrollView>
    );
}