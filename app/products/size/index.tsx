import { useSizes } from '@/hooks/useSizes'

import { ProductSizeService } from '@/services/productSizeService'

import { Ionicons } from '@expo/vector-icons'

import { formatDate } from '@/helper/lib/FormatDate'

import { useRouter } from 'expo-router'

import { useState } from 'react'

import { Alert, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import Toast from 'react-native-toast-message'

import HeaderGradient from '@/components/ui/HeaderGradient'

export default function SizeList() {
    const router = useRouter()
    const { sizes, loading, refreshSizes } = useSizes()
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)
        try {
            await refreshSizes()
        } catch (error) {
            console.error('Error refreshing sizes:', error)
        } finally {
            setRefreshing(false)
        }
    }

    const handleEdit = (size: any) => {
        router.push(`/products/size/${size.id}`)
    }

    const handleDelete = (size: any) => {
        Alert.alert(
            'Konfirmasi Hapus',
            `Apakah Anda yakin ingin menghapus ukuran "${size.name}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ProductSizeService.delete(size.id)
                            await refreshSizes()
                            Toast.show({ type: 'success', text1: 'Ukuran berhasil dihapus' })
                        } catch (error) {
                            console.error('Error deleting size:', error)
                            Toast.show({ type: 'error', text1: 'Gagal menghapus ukuran' })
                        }
                    }
                }
            ]
        )
    }

    const handleAdd = () => {
        router.push('/products/size/new')
    }

    const renderTableHeader = () => (
        <View className="bg-gray-100 flex-row items-center py-3 px-4 border-b border-gray-200 rounded-t-lg">
            <View className="flex-1">
                <Text className="font-semibold text-gray-700 text-xs">Ukuran</Text>
            </View>
            <View className="w-24 items-center">
                <Text className="font-semibold text-gray-700 text-xs">Status</Text>
            </View>
            <View className="w-28 items-center">
                <Text className="font-semibold text-gray-700 text-xs">Tanggal</Text>
            </View>
            <View className="w-24 items-end">
                <Text className="font-semibold text-gray-700 text-xs">Aksi</Text>
            </View>
        </View>
    )

    const renderSizeRow = ({ item, index }: { item: any, index: number }) => (
        <View className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} flex-row items-center py-3 px-4 border-b border-gray-100`}>
            <View className="flex-1 pr-2">
                <Text className="text-gray-800 text-sm font-medium" numberOfLines={1}>
                    {item.name}
                </Text>
            </View>
            <View className="w-24 items-center">
                <View className={`${item.is_active ? 'bg-emerald-100 border-emerald-200' : 'bg-rose-100 border-rose-200'} px-2 py-0.5 rounded-full border`}>
                    <Text className={`text-[10px] font-semibold text-center ${item.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {item.is_active ? 'Aktif' : 'Tidak'}
                    </Text>
                </View>
            </View>
            <View className="w-28 items-center">
                <Text className="text-gray-500 text-xs">
                    {formatDate(item.created_at)}
                </Text>
            </View>
            <View className="w-24 flex-row justify-end">
                <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    className="bg-blue-500/90 px-2 py-1 rounded-md mr-2"
                    accessibilityLabel="Edit ukuran"
                >
                    <Ionicons name="create-outline" size={14} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    className="bg-red-500/90 px-2 py-1 rounded-md"
                    accessibilityLabel="Hapus ukuran"
                >
                    <Ionicons name="trash-outline" size={14} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </View>
    )

    if (loading) {
        return (
            <View className="flex-1 bg-background">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600">Memuat ukuran...</Text>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <HeaderGradient
                title="Daftar Ukuran"
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center mr-3">
                            <Ionicons name="resize-outline" size={20} color="white" />
                        </View>
                        <View>
                            <Text className="text-white font-bold">Daftar Ukuran</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={handleAdd}
                        className="bg-white/20 px-4 py-2 rounded-lg flex-row items-center"
                        style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    >
                        <Ionicons name="add" size={16} color="white" />
                        <Text className="text-white font-semibold ml-1">Tambah</Text>
                    </TouchableOpacity>
                </View>
            </HeaderGradient>

            {/* Table */}
            {sizes.length > 0 ? (
                <View className="mx-2 mt-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {renderTableHeader()}
                    <FlatList
                        data={sizes}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item, index }) => renderSizeRow({ item, index })}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#FF9228']}
                                tintColor="#FF9228"
                                title="Memuat ulang..."
                                titleColor="#6B7280"
                            />
                        }
                        ListFooterComponent={<View className="h-2" />}
                    />
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
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
                    <View className="items-center justify-center min-h-[500px] mx-4">
                        <Ionicons name="resize-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 text-center mt-4 text-lg">
                            Belum ada ukuran
                        </Text>
                        <Text className="text-gray-400 text-center mt-2">
                            Tambahkan ukuran pertama untuk mengatur produk
                        </Text>
                        <TouchableOpacity
                            onPress={handleAdd}
                            className="bg-accent-primary px-6 py-3 rounded-lg mt-4"
                        >
                            <Text className="text-white font-semibold">
                                Tambah Ukuran Pertama
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
    )
}