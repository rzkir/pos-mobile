import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { formatDate, formatDateTime } from '../helper/lib/FormatDate';

import { BarcodeVisual } from './ui/BarcodeVisual';

export default function ProductDetailsView({
    product,
    categories,
    sizes,
    suppliers,
    onClose,
    onEdit
}: ProductDetailsViewProps) {
    return (
        <View className="flex-1 bg-gray-50">
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 pt-4 pb-4"
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-white/20 backdrop-blur-sm p-3 rounded-full"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white">Detail Produk</Text>
                    <TouchableOpacity
                        onPress={() => onEdit(product)}
                        className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl"
                    >
                        <Text className="text-white font-bold text-base">Edit</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Product Image with Enhanced Design */}
                <View className="items-center mb-6 mt-4">
                    <View
                        className="bg-white rounded-3xl p-4"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.15,
                            shadowRadius: 20,
                            elevation: 8
                        }}
                    >
                        {product.image_url ? (
                            <Image
                                source={{ uri: product.image_url }}
                                style={{ width: 180, height: 180, borderRadius: 20 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <LinearGradient
                                colors={['#f3f4f6', '#e5e7eb']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ width: 180, height: 180, borderRadius: 20 }}
                                className="items-center justify-center"
                            >
                                <Ionicons name="image-outline" size={80} color="#9CA3AF" />
                            </LinearGradient>
                        )}
                    </View>
                </View>

                {/* Basic Information with Modern Card */}
                <View
                    className="bg-white rounded-3xl p-8 mb-6"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 6
                    }}
                >
                    <Text className="text-3xl font-bold text-gray-900 mb-4 text-center leading-tight">
                        {product.name}
                    </Text>

                    <View className="items-center mb-6">
                        <BarcodeVisual
                            barcode={product.barcode}
                            width={280}
                            height={60}
                            showText={true}
                            productName={product.name}
                        />
                    </View>

                    <View className="flex-row items-center justify-center space-x-4">
                        <View
                            className={`px-4 py-2 rounded-2xl ${product.is_active ? 'bg-green-100' : 'bg-red-100'
                                }`}
                        >
                            <Text className={`text-sm font-bold ${product.is_active ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {product.is_active ? '✓ Aktif' : '✗ Tidak Aktif'}
                            </Text>
                        </View>
                        <View className="bg-blue-100 px-4 py-2 rounded-2xl">
                            <Text className="text-sm font-bold text-blue-700">
                                Unit: {product.unit}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Price Information with Enhanced Design */}
                <LinearGradient
                    colors={['#10b981', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl p-8 mb-6"
                    style={{
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8
                    }}
                >
                    <View className="flex-row items-center justify-center mb-6">
                        <View className="bg-white/20 p-3 rounded-2xl mr-3">
                            <Ionicons name="cash-outline" size={24} color="#FFFFFF" />
                        </View>
                        <Text className="text-2xl font-bold text-white">Informasi Harga</Text>
                    </View>

                    <View className="flex-col gap-2">
                        <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/90 text-lg font-semibold">Harga Jual:</Text>
                                <Text className="text-3xl font-bold text-white">
                                    Rp {product.price?.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/90 text-lg font-semibold">Harga Modal:</Text>
                                <Text className="text-xl font-bold text-white/90">
                                    Rp {product.modal?.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white font-bold text-lg">Keuntungan:</Text>
                                <Text className="text-2xl font-bold text-yellow-300">
                                    Rp {((product.price || 0) - (product.modal || 0)).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Stock Information with Enhanced Design */}
                <LinearGradient
                    colors={['#8b5cf6', '#06b6d4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl p-8 mb-6"
                    style={{
                        shadowColor: '#8b5cf6',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8
                    }}
                >
                    <View className="flex-row items-center justify-center mb-6">
                        <View className="bg-white/20 p-3 rounded-2xl mr-3">
                            <Ionicons name="cube-outline" size={24} color="#FFFFFF" />
                        </View>
                        <Text className="text-2xl font-bold text-white">Informasi Stok</Text>
                    </View>

                    <View className="flex-col gap-2">
                        <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/90 text-lg font-semibold">Stok Tersedia:</Text>
                                <Text className="text-3xl font-bold text-white">
                                    {product.stock || 0}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/90 text-lg font-semibold">Terjual:</Text>
                                <Text className="text-xl font-bold text-white/90">
                                    {product.sold || 0}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white font-bold text-lg">Stok Minimum:</Text>
                                <Text className="text-2xl font-bold text-orange-300">
                                    {product.min_stock || 0}
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Additional Information with Modern Cards */}
                <View className="flex-col gap-4 mb-6">
                    {/* Category */}
                    {product.category_id && (
                        <View
                            className="bg-white rounded-2xl p-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="bg-purple-100 p-2 rounded-xl mr-3">
                                    <Ionicons name="grid-outline" size={20} color="#8b5cf6" />
                                </View>
                                <Text className="text-sm text-gray-500 font-medium">Kategori</Text>
                            </View>
                            <Text className="text-xl font-bold text-gray-900">
                                {categories.find(cat => cat.id === product.category_id)?.name || 'Tidak Diketahui'}
                            </Text>
                        </View>
                    )}

                    {/* Size */}
                    {product.size_id && (
                        <View
                            className="bg-white rounded-2xl p-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="bg-blue-100 p-2 rounded-xl mr-3">
                                    <Ionicons name="resize-outline" size={20} color="#3b82f6" />
                                </View>
                                <Text className="text-sm text-gray-500 font-medium">Ukuran</Text>
                            </View>
                            <Text className="text-xl font-bold text-gray-900">
                                {sizes.find(size => size.id === product.size_id)?.name || 'Tidak Diketahui'}
                            </Text>
                        </View>
                    )}

                    {/* Supplier */}
                    {product.supplier_id && (
                        <View
                            className="bg-white rounded-2xl p-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="bg-green-100 p-2 rounded-xl mr-3">
                                    <Ionicons name="business-outline" size={20} color="#10b981" />
                                </View>
                                <Text className="text-sm text-gray-500 font-medium">Supplier</Text>
                            </View>
                            <Text className="text-xl font-bold text-gray-900">
                                {suppliers.find(supplier => supplier.id === product.supplier_id)?.name || 'Tidak Diketahui'}
                            </Text>
                        </View>
                    )}

                    {/* Discount */}
                    {product.discount > 0 && (
                        <View
                            className="bg-white rounded-2xl p-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="bg-red-100 p-2 rounded-xl mr-3">
                                    <Ionicons name="pricetag-outline" size={20} color="#ef4444" />
                                </View>
                                <Text className="text-sm text-gray-500 font-medium">Diskon</Text>
                            </View>
                            <Text className="text-3xl font-bold text-red-600">
                                {product.discount}%
                            </Text>
                        </View>
                    )}

                    {/* Expiration Date */}
                    {product.expiration_date && (
                        <View
                            className="bg-white rounded-2xl p-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="bg-orange-100 p-2 rounded-xl mr-3">
                                    <Ionicons name="calendar-outline" size={20} color="#f97316" />
                                </View>
                                <Text className="text-sm text-gray-500 font-medium">Tanggal Kadaluarsa</Text>
                            </View>
                            <Text className="text-xl font-bold text-gray-900">
                                {formatDate(product.expiration_date)}
                            </Text>
                        </View>
                    )}

                    {/* Description */}
                    {product.description && (
                        <View
                            className="bg-white rounded-2xl p-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4
                            }}
                        >
                            <View className="flex-row items-center mb-4">
                                <View className="bg-indigo-100 p-2 rounded-xl mr-3">
                                    <Ionicons name="document-text-outline" size={20} color="#6366f1" />
                                </View>
                                <Text className="text-sm text-gray-500 font-medium">Deskripsi</Text>
                            </View>
                            <Text className="text-gray-800 leading-7 text-base">
                                {product.description}
                            </Text>
                        </View>
                    )}

                    {/* System Information with Enhanced Design */}
                    <View
                        className="bg-white rounded-2xl p-6"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 4
                        }}
                    >
                        <View className="flex-row items-center mb-6">
                            <View className="bg-gradient-to-r from-slate-100 to-slate-200 p-3 rounded-2xl mr-4">
                                <Ionicons name="server-outline" size={24} color="#475569" />
                            </View>
                            <Text className="text-lg text-gray-800 font-bold">Informasi Sistem</Text>
                        </View>
                        <View className="space-y-4">
                            {/* Created Date */}
                            <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <Ionicons name="add-circle-outline" size={18} color="#3b82f6" />
                                        </View>
                                        <Text className="text-sm text-gray-600 font-medium">Dibuat</Text>
                                    </View>
                                    <Text className="text-sm font-bold text-gray-800">
                                        {formatDateTime(product.created_at)}
                                    </Text>
                                </View>
                            </View>

                            {/* Updated Date */}
                            <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="bg-green-100 p-2 rounded-lg mr-3">
                                            <Ionicons name="refresh-circle-outline" size={18} color="#10b981" />
                                        </View>
                                        <Text className="text-sm text-gray-600 font-medium">Diperbarui</Text>
                                    </View>
                                    <Text className="text-sm font-bold text-gray-800">
                                        {formatDateTime(product.updated_at)}
                                    </Text>
                                </View>
                            </View>

                            {/* Created By */}
                            <View className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="bg-purple-100 p-2 rounded-lg mr-3">
                                            <Ionicons name="person-outline" size={18} color="#8b5cf6" />
                                        </View>
                                        <Text className="text-sm text-gray-600 font-medium">Dibuat oleh</Text>
                                    </View>
                                    <Text className="text-sm font-bold text-gray-800">
                                        {product.created_by}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
