import { useProducts } from '@/hooks/useProducts'

import { formatIDR } from '@/helper/lib/FormatIdr'

import { router } from 'expo-router'

import { useMemo, useState, useEffect } from 'react'

import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import AsyncStorage from '@react-native-async-storage/async-storage';

import { TransactionService } from '@/services/transactionService';

export default function Beranda() {
    useEffect(() => {
        AsyncStorage.setItem('isLoggedIn', 'true');
    }, []);
    const { products, productsWithRelations } = useProducts()
    const categories = useMemo(() => {
        const unique = new Map<number, any>()
        productsWithRelations.forEach((p: any) => {
            const cat = (p as any).product_categories
            if (cat && typeof cat.id === 'number' && !unique.has(cat.id)) unique.set(cat.id, cat)
        })
        return Array.from(unique.values())
    }, [productsWithRelations])

    const [search, setSearch] = useState('')
    const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all')
    const [productIdToQty, setProductIdToQty] = useState<Record<number, number>>({})

    // Top Seller Products
    const topSellerProducts = useMemo(() => {
        let list = products.filter((p: any) => p.best_seller === true)
        if (activeCategoryId !== 'all') {
            list = list.filter((p: any) => p.category_id === activeCategoryId)
        }
        if (search) {
            const q = search.toLowerCase()
            list = list.filter((p: any) =>
                p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q)
            )
        }
        return list
    }, [products, search, activeCategoryId])

    // Regular Products (excluding top seller)
    const filtered = useMemo(() => {
        let list = products.filter((p: any) => p.best_seller !== true)
        if (activeCategoryId !== 'all') {
            list = list.filter((p: any) => p.category_id === activeCategoryId)
        }
        if (search) {
            const q = search.toLowerCase()
            list = list.filter((p: any) =>
                p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q)
            )
        }
        return list
    }, [products, search, activeCategoryId])

    const addQty = (id: number) => {
        setProductIdToQty(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    }
    const subQty = (id: number) => {
        setProductIdToQty(prev => {
            const current = prev[id] ?? 0
            if (current <= 1) {
                const { [id]: _removed, ...rest } = prev
                return rest
            }
            return { ...prev, [id]: current - 1 }
        })
    }

    const selectedCount = Object.values(productIdToQty).reduce((a, b) => a + b, 0)
    const selectedTotal = useMemo(() => {
        return products.reduce((sum: number, p: any) => sum + (productIdToQty[p.id] ? productIdToQty[p.id] * (p.price || 0) : 0), 0)
    }, [products, productIdToQty])

    const handleCartPress = async () => {
        try {
            // Save selected products to AsyncStorage before navigation
            await AsyncStorage.setItem('selected_products', JSON.stringify(productIdToQty));

            const transaction = await TransactionService.getOrCreateDraft();
            router.push({
                pathname: '/transaction/[id]',
                params: { id: transaction.id.toString() }
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    }

    const renderCard = ({ item }: { item: any }) => {
        const qty = productIdToQty[item.id] || 0
        return (
            <View className="px-1 mb-4 w-1/2">
                <View className="bg-white rounded-2xl flex-col gap-1.5 p-3 border border-border">
                    <View className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 items-center justify-center">
                        {item.image_url ? (
                            <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name="image-outline" size={28} className="text-gray-400" />
                        )}
                    </View>

                    <View className="mt-1 flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-accent-primary mr-1" />
                        <Text className="text-[11px] text-accent-primary font-semibold">{item.stock ?? 0} Stock</Text>
                    </View>

                    <Text numberOfLines={1} className="text-lg font-semibold text-text-secondary">{item.name}</Text>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-text-primary">{formatIDR(item.price || 0)}</Text>
                        {qty === 0 ? (
                            <TouchableOpacity onPress={() => addQty(item.id)} className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
                                <Ionicons name="add" size={18} color={"white"} />
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row items-center">
                                <TouchableOpacity onPress={() => subQty(item.id)} className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
                                    <Ionicons name="remove" size={18} color={"white"} />
                                </TouchableOpacity>

                                <Text className="mx-2 text-sm font-semibold text-gray-900">{qty}</Text>

                                <TouchableOpacity onPress={() => addQty(item.id)} className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
                                    <Ionicons name="add" size={18} color={"white"} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        )
    }

    const renderTopSellerCard = ({ item }: { item: any }) => {
        const qty = productIdToQty[item.id] || 0
        return (
            <View className="px-1 mr-3" style={{ width: 200 }}>
                <View className="bg-white rounded-2xl flex-col gap-1.5 p-3 border border-border">
                    <View className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 items-center justify-center">
                        {item.image_url ? (
                            <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name="image-outline" size={28} className="text-gray-400" />
                        )}
                    </View>

                    <View className="mt-1 flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-accent-primary mr-1" />
                        <Text className="text-[11px] text-accent-primary font-semibold">{item.stock ?? 0} Stock</Text>
                    </View>

                    <Text numberOfLines={1} className="text-lg font-semibold text-text-secondary">{item.name}</Text>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-text-primary">{formatIDR(item.price || 0)}</Text>
                        {qty === 0 ? (
                            <TouchableOpacity onPress={() => addQty(item.id)} className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
                                <Ionicons name="add" size={18} color={"white"} />
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row items-center">
                                <TouchableOpacity onPress={() => subQty(item.id)} className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
                                    <Ionicons name="remove" size={18} color={"white"} />
                                </TouchableOpacity>

                                <Text className="mx-2 text-sm font-semibold text-gray-900">{qty}</Text>

                                <TouchableOpacity onPress={() => addQty(item.id)} className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
                                    <Ionicons name="add" size={18} color={"white"} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-background">
            {/* Header (Linear Gradient) */}
            <LinearGradient
                colors={["#f97316", "#fb923c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center mr-3">
                        <Text className="text-white font-bold">P</Text>
                    </View>
                    <View>
                        <Text className="text-white font-bold">Pelanggan</Text>
                        <Text className="text-white/80 text-xs">Kasir</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Search + Add (overlap card) */}
            <View className="px-4" style={{ marginTop: -24, position: 'relative' }}>
                <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow">
                    <Ionicons name="search" size={18} className="text-gray-500" />
                    <TextInput
                        className="ml-2 flex-1 text-gray-800"
                        placeholder="Search something"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {/* Spacer to avoid text under the floating + */}
                    <View style={{ width: 40 }} />
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/products/new')}
                    className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center shadow"
                    style={{ position: 'absolute', right: 24, top: '50%', marginTop: -20 }}
                >
                    <Ionicons name="add" size={20} className="text-white" />
                </TouchableOpacity>
            </View>

            {/* Category chips */}
            <View className="px-4 mt-4">
                <FlatList
                    data={[{ id: 'all', name: 'All Menu' }, ...categories] as any[]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(it: any) => `${it.id}`}
                    renderItem={({ item }: any) => (
                        <TouchableOpacity
                            onPress={() => setActiveCategoryId(item.id === 'all' ? 'all' : item.id)}
                            className={`mr-3 items-center`}
                        >
                            <View className={`w-12 h-12 rounded-full ${activeCategoryId === item.id || (item.id === 'all' && activeCategoryId === 'all') ? 'bg-orange-500' : 'bg-white'} items-center justify-center`}>
                                <Ionicons
                                    name="fast-food-outline"
                                    size={20}
                                    color={(activeCategoryId === item.id || (item.id === 'all' && activeCategoryId === 'all')) ? '#ffffff' : '#111827'}
                                />
                            </View>
                            <Text className="text-xs mt-1 text-gray-700" numberOfLines={1}>
                                {item.id === 'all' ? 'All Menu' : item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Top Seller Section */}
            {topSellerProducts.length > 0 && (
                <View className="mt-6">
                    <View className="px-4 mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-yellow-100 p-2 rounded-xl mr-2">
                                <Ionicons name="star" size={20} color="#D97706" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-800">
                                    Top Seller
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    Produk terlaris
                                </Text>
                            </View>
                        </View>
                    </View>

                    <FlatList
                        className="px-2"
                        data={topSellerProducts}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={renderTopSellerCard}
                    />
                </View>
            )}

            {/* Section title */}
            <View className="px-4 mt-4 mb-2 flex-row items-center justify-between">
                <Text className="text-base font-extrabold text-gray-900">Today&apos;s Special Menu</Text>
            </View>

            {/* Grid */}
            <FlatList
                className="px-2"
                data={filtered}
                numColumns={2}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={renderCard}
                contentContainerStyle={{ paddingBottom: selectedCount > 0 ? 100 : 24 }}
            />

            {/* Bottom bar */}
            {selectedCount > 0 && (
                <View className="absolute left-0 right-0 bottom-4 px-4">
                    <View className="bg-black rounded-2xl p-4 flex-row items-center justify-between opacity-95">
                        <View>
                            <Text className="text-white text-sm">{selectedCount} items selected</Text>
                            <Text className="text-gray-300 text-xs" numberOfLines={1}>
                                {Object.keys(productIdToQty).map(pid => {
                                    const p = products.find((pp: any) => pp.id === Number(pid))
                                    return p?.name
                                }).filter(Boolean).join(', ')}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-white font-bold mr-3">{formatIDR(selectedTotal)}</Text>
                            <TouchableOpacity
                                onPress={handleCartPress}
                                className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center"
                            >
                                <Ionicons name="cart" size={18} className="text-white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}