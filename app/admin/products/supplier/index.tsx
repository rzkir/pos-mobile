import { useSuppliers } from '@/hooks/useSuppliers'

import { SupplierService } from '@/services/supplierService'

import { Ionicons } from '@expo/vector-icons'

import { useRouter } from 'expo-router'

import { useState } from 'react'

import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native'

import Toast from 'react-native-toast-message'

export default function SupplierList() {
    const router = useRouter()
    const { suppliers, loading, refreshSuppliers } = useSuppliers()
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)
        try {
            await refreshSuppliers()
        } catch (error) {
            console.error('Error refreshing suppliers:', error)
        } finally {
            setRefreshing(false)
        }
    }

    const handleEdit = (supplier: any) => {
        router.push(`/admin/products/supplier/${supplier.id}`)
    }

    const handleDelete = (supplier: any) => {
        Alert.alert(
            'Konfirmasi Hapus',
            `Apakah Anda yakin ingin menghapus supplier "${supplier.name}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SupplierService.delete(supplier.id)
                            await refreshSuppliers()
                            Toast.show({ type: 'success', text1: 'Supplier berhasil dihapus' })
                        } catch (error) {
                            console.error('Error deleting supplier:', error)
                            Toast.show({ type: 'error', text1: 'Gagal menghapus supplier' })
                        }
                    }
                }
            ]
        )
    }

    const handleAdd = () => {
        router.push('/admin/products/supplier/new')
    }

    const renderSupplier = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800 mb-2" numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
                        Kontak: {item.contact_person}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
                        Telp: {item.phone}
                    </Text>
                    {item.email && (
                        <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
                            Email: {item.email}
                        </Text>
                    )}
                    <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                        Alamat: {item.address}
                    </Text>
                    <View className="flex-row items-center mb-2">
                        <View className={`px-2 py-1 rounded-full ${item.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-xs ${item.is_active ? 'text-green-700' : 'text-red-700'}`}>
                                {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-xs text-gray-500">
                        Dibuat: {new Date(item.created_at).toLocaleDateString()}
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
        </View>
    )

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600">Memuat supplier...</Text>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                        <Ionicons name="business-outline" size={24} color="#374151" />
                        <Text className="text-xl font-bold text-gray-800 ml-2">
                            Daftar Supplier
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleAdd}
                        className="bg-green-500 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Ionicons name="add" size={16} color="white" />
                        <Text className="text-white font-semibold ml-1">Tambah</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Suppliers List */}
            <FlatList
                data={suppliers}
                renderItem={renderSupplier}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
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
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <Ionicons name="business-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 text-center mt-4 text-lg">
                            Belum ada supplier
                        </Text>
                        <Text className="text-gray-400 text-center mt-2">
                            Tambahkan supplier pertama untuk mengatur produk
                        </Text>
                        <TouchableOpacity
                            onPress={handleAdd}
                            className="bg-green-500 px-6 py-3 rounded-lg mt-4"
                        >
                            <Text className="text-white font-semibold">
                                Tambah Supplier Pertama
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    )
}