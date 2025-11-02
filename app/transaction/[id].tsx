import { useLocalSearchParams, useRouter } from 'expo-router';

import { useState, useMemo } from 'react';

import { View, Text, TouchableOpacity, FlatList, ScrollView, TextInput, Image } from 'react-native';

import { Ionicons } from '@expo/vector-icons';


import { useProducts } from '@/hooks/useProducts';

import Toast from 'react-native-toast-message';

import { useAppSettingsContext } from "@/context/AppSettingsContext";

import Input from '@/components/ui/input';

import { useStateCreateTransaction } from '@/components/transaction/create/lib/useStateCreateTransaction';

import CardTransaction from '@/components/transaction/create/CardTranscation';

import PaymentModal from '@/components/transaction/create/PaymentModal';

import BottomSheet from '@/helper/bottomsheets/BottomSheet';

export default function TransactionDetail() {
    const { formatIDR, formatDateTime } = useAppSettingsContext();

    const { id } = useLocalSearchParams();

    const router = useRouter();

    const transactionId = parseInt(id as string, 10);

    const { products } = useProducts();

    const {
        transaction,
        productsWithDetails,
        loading,
        customerName,
        setCustomerName,
        paymentMethod,
        setPaymentMethod,
        amountPaid,
        setAmountPaid,
        paymentCards,
        selectedPaymentCardId,
        showPaymentModal,
        setShowPaymentModal,
        paymentInfoFilled,
        formatIdrNumber,
        getAmountPaidValue,
        calculateChange,
        getSuggestedAmounts,
        isAmountInsufficient,
        getPaymentMethodLabel,
        updateItemQty,
        saveCustomerInfo,
        handlePaymentCardSelect,
        processPayment,
        savePaymentInfo,
        handleBayar,
        handleSettings,
        handleBack,
        addProductsToTransaction,
    } = useStateCreateTransaction({
        transactionId,
        products,
        formatIDR,
        router,
    });

    // State for products bottom sheet
    const [showProductsSheet, setShowProductsSheet] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<Record<number, number>>({});

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const query = searchTerm.toLowerCase();
        return products.filter((product: any) =>
            product.name?.toLowerCase().includes(query) ||
            product.barcode?.toLowerCase().includes(query)
        );
    }, [products, searchTerm]);

    // Add product quantity
    const addProductQty = (productId: number) => {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    // Subtract product quantity
    const subProductQty = (productId: number) => {
        setSelectedProducts(prev => {
            const current = prev[productId] || 0;
            if (current <= 1) {
                const { [productId]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: current - 1 };
        });
    };

    // Add selected products to transaction
    const handleAddProducts = async () => {
        const selectedCount = Object.keys(selectedProducts).length;
        if (selectedCount === 0) {
            Toast.show({
                type: 'info',
                text1: 'Pilih Produk',
                text2: 'Silakan pilih produk terlebih dahulu',
                visibilityTime: 2000
            });
            return;
        }

        try {
            await addProductsToTransaction(selectedProducts);
            setSelectedProducts({});
            setShowProductsSheet(false);
            setSearchTerm('');
            Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Produk berhasil ditambahkan',
                visibilityTime: 2000
            });
        } catch (error) {
            console.error('Error adding products:', error);
            Toast.show({
                type: 'error',
                text1: 'Kesalahan',
                text2: 'Gagal menambahkan produk',
                visibilityTime: 3000
            });
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <CardTransaction
            item={item}
            formatIDR={formatIDR}
            onUpdateQty={updateItemQty}
        />
    );

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Text className="text-gray-500">Memuat data...</Text>
            </View>
        );
    }

    if (!transaction) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-4">
                <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                <Text className="text-lg font-semibold text-gray-900 mt-4">Transaksi tidak ditemukan</Text>
                <TouchableOpacity
                    onPress={handleBack}
                    className="mt-4 px-6 py-3 bg-orange-500 rounded-xl"
                >
                    <Text className="text-white font-semibold">Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-1 pb-4 bg-white">
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-lg font-bold text-black ml-2">Detail Transaksi</Text>

                <View className="flex-row items-center gap-1">
                    <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={handleSettings}>
                        <Ionicons name="search-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-sm font-semibold text-blue-600">{transaction.transaction_number}</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Customer Info */}
                {transaction.status === 'draft' && (
                    <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-200">
                        <View>
                            <Input
                                label='Nama Pelanggan'
                                placeholder="Masukkan nama pelanggan"
                                placeholderTextColor="#9CA3AF"
                                value={customerName}
                                onChangeText={setCustomerName}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={saveCustomerInfo}
                            className="bg-blue-600 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-semibold">Simpan Data Pelanggan</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Items List */}
                <View className="mx-4 mt-4">
                    {productsWithDetails.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center border border-gray-200">
                            <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
                            <Text className="text-gray-500 mt-3">Belum ada produk dalam transaksi</Text>
                            <TouchableOpacity
                                onPress={handleBack}
                                className="mt-4 px-6 py-2 bg-blue-600 rounded-xl"
                            >
                                <Text className="text-white font-semibold">Tambah Produk</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={productsWithDetails}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                {/* Summary */}
                <View className="bg-white mx-4 mt-4 mb-4 rounded-2xl p-4 border border-gray-200">
                    {/* Calculate total discount from all items */}
                    {(() => {
                        // Calculate total base price (before discount)
                        const totalBasePrice = productsWithDetails.reduce((sum, item) => {
                            return sum + (item.price * item.quantity);
                        }, 0);

                        // Calculate total discount amount from all items
                        const totalItemsDiscount = productsWithDetails.reduce((sum, item) => {
                            const product = item.product;
                            const basePrice = item.price;
                            const discount = (product?.discount ?? item.discount ?? 0);
                            const discountValue = Number(discount) || 0;
                            const discountAmount = (basePrice * discountValue) / 100;
                            return sum + (discountAmount * item.quantity);
                        }, 0);

                        return (
                            <>
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-sm text-gray-900">Subtotal</Text>
                                    <Text className="text-sm font-semibold text-gray-900">{formatIDR(transaction.subtotal || totalBasePrice)}</Text>
                                </View>

                                {totalItemsDiscount > 0 && (
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-sm text-gray-900">Diskon Produk</Text>
                                        <Text className="text-sm font-semibold text-gray-900">-{formatIDR(totalItemsDiscount)}</Text>
                                    </View>
                                )}

                                {transaction.discount > 0 && (
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-sm text-gray-900">Promosi</Text>
                                        <Text className="text-sm font-semibold text-gray-900">-{formatIDR(transaction.discount)}</Text>
                                    </View>
                                )}

                                <View className="flex-row justify-between items-center">
                                    <Text className="text-base font-bold text-gray-900">Total</Text>
                                    <Text className="text-base font-bold text-gray-900">{formatIDR(transaction.total)}</Text>
                                </View>

                                {/* Payment Info Section - Show after payment info is filled */}
                                {paymentInfoFilled && transaction.status === 'draft' && (
                                    <>
                                        <View className="h-px bg-gray-200 my-3" />
                                        <Text className="text-sm font-bold text-gray-900 mb-3">Informasi Pembayaran</Text>

                                        {/* Payment Method */}
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-xs text-gray-500">Metode Pembayaran</Text>

                                            <Text className="text-xs font-semibold text-gray-900">
                                                {selectedPaymentCardId ? (
                                                    (() => {
                                                        const selectedCard = paymentCards.find(card => card.id === selectedPaymentCardId);
                                                        return selectedCard ? getPaymentMethodLabel(selectedCard.method) : 'Tunai';
                                                    })()
                                                ) : paymentMethod === 'cash' ? 'Tunai' :
                                                    paymentMethod === 'card' ? 'Kartu' : 'Transfer'}
                                            </Text>
                                        </View>

                                        {/* Amount Paid (for cash) */}
                                        {paymentMethod === 'cash' && selectedPaymentCardId === null && amountPaid && (
                                            <>
                                                <View className="flex-row justify-between items-center mb-2">
                                                    <Text className="text-base text-gray-500">Jumlah Dibayar</Text>
                                                    <Text className="text-base font-semibold text-gray-900">{formatIDR(getAmountPaidValue())}</Text>
                                                </View>
                                                {/* Change (for cash) - Always show if amount paid exists */}
                                                <View className="flex-row justify-between items-center mb-2">
                                                    <Text className="text-base text-gray-500">Kembalian</Text>
                                                    <Text className={`text-base font-bold ${calculateChange() > 0 ? 'text-green-600' : calculateChange() === 0 ? 'text-gray-600' : 'text-red-600'}`}>
                                                        {formatIDR(Math.max(0, calculateChange()))}
                                                    </Text>
                                                </View>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        );
                    })()}
                    {transaction.status !== 'draft' && (
                        <>
                            <View className="h-px bg-gray-200 my-3" />
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-xs text-gray-500">Metode</Text>
                                <Text className="text-xs font-semibold text-gray-900">
                                    {transaction.payment_method === 'cash' ? 'Tunai' :
                                        transaction.payment_method === 'card' ? 'Kartu' : 'Transfer'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-xs text-gray-500">Status</Text>
                                <View className={`px-2 py-1 rounded ${transaction.payment_status === 'paid' ? 'bg-green-100' :
                                    transaction.payment_status === 'cancelled' ? 'bg-red-100' :
                                        'bg-yellow-100'
                                    }`}>
                                    <Text className={`text-xs font-semibold ${transaction.payment_status === 'paid' ? 'text-green-700' :
                                        transaction.payment_status === 'cancelled' ? 'text-red-700' :
                                            'text-yellow-700'
                                        }`}>
                                        {transaction.payment_status === 'pending' ? 'Menunggu' :
                                            transaction.payment_status === 'paid' ? 'Lunas' : 'Dibatalkan'}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-xs text-gray-500">Tanggal</Text>
                                <Text className="text-xs font-semibold text-gray-900">
                                    {formatDateTime(transaction.created_at)}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            {transaction.status === 'draft' && (
                <>
                    {/* Tambah Produk Button */}
                    <View className="px-4 pb-2 bg-white">
                        <TouchableOpacity
                            onPress={() => {
                                setShowProductsSheet(true);
                                setSelectedProducts({});
                                setSearchTerm('');
                            }}
                            className="bg-green-600 rounded-xl py-3.5 items-center flex-row justify-center"
                        >
                            <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-sm font-semibold text-white">Tambah Produk</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Payment Buttons */}
                    <View className="flex-row px-4 pb-4 pt-2 bg-white gap-3">
                        {!paymentInfoFilled ? (
                            <>
                                <TouchableOpacity
                                    onPress={() => {
                                        Toast.show({
                                            type: 'info',
                                            text1: 'Cetak',
                                            text2: 'Fitur cetak sementara',
                                            visibilityTime: 2000
                                        });
                                    }}
                                    className="flex-1 bg-white border border-blue-300 rounded-xl py-3.5 items-center"
                                >
                                    <Text className="text-sm font-semibold text-blue-600">Cetak Sementara</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleBayar}
                                    className="flex-[1.2] bg-blue-600 rounded-xl py-3.5 items-center"
                                >
                                    <Text className="text-sm font-semibold text-white">Bayar</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                onPress={processPayment}
                                className="flex-1 bg-orange-500 rounded-xl py-3.5 items-center"
                            >
                                <Text className="text-sm font-semibold text-white">Konfirmasi Pembayaran</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </>
            )}

            {/* Payment Modal */}
            <PaymentModal
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                transaction={transaction}
                paymentMethod={paymentMethod}
                selectedPaymentCardId={selectedPaymentCardId}
                paymentCards={paymentCards}
                amountPaid={amountPaid}
                formatIDR={formatIDR}
                formatIdrNumber={formatIdrNumber}
                getAmountPaidValue={getAmountPaidValue}
                getSuggestedAmounts={getSuggestedAmounts}
                isAmountInsufficient={isAmountInsufficient}
                getPaymentMethodLabel={getPaymentMethodLabel}
                onPaymentMethodChange={setPaymentMethod}
                onPaymentCardSelect={handlePaymentCardSelect}
                onAmountPaidChange={(text: string) => setAmountPaid(formatIdrNumber(text))}
                onSavePaymentInfo={savePaymentInfo}
            />

            {/* Products Bottom Sheet */}
            <BottomSheet
                visible={showProductsSheet}
                title="Pilih Produk"
                onClose={() => {
                    setShowProductsSheet(false);
                    setSearchTerm('');
                    setSelectedProducts({});
                }}
                maxHeightPercent={0.9}
                footer={
                    Object.keys(selectedProducts).length > 0 ? (
                        <View className="bg-black rounded-2xl p-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-1">
                                    <Text className="text-white text-sm">
                                        {Object.values(selectedProducts).reduce((a, b) => a + b, 0)} item dipilih
                                    </Text>
                                    <Text className="text-gray-300 text-xs mt-1" numberOfLines={1}>
                                        {(() => {
                                            const selectedProductNames = Object.keys(selectedProducts)
                                                .map(pid => {
                                                    const p = products.find((pp: any) => pp.id === Number(pid));
                                                    return p?.name;
                                                })
                                                .filter(Boolean);
                                            const maxDisplay = 2;
                                            if (selectedProductNames.length <= maxDisplay) {
                                                return selectedProductNames.join(', ');
                                            }
                                            return selectedProductNames.slice(0, maxDisplay).join(', ') +
                                                ` +${selectedProductNames.length - maxDisplay} lainnya`;
                                        })()}
                                    </Text>
                                </View>
                                <Text className="text-white font-bold ml-3">
                                    {formatIDR(
                                        Object.entries(selectedProducts).reduce((sum, [pid, qty]) => {
                                            const p = products.find((pp: any) => pp.id === Number(pid));
                                            return sum + ((p?.price || 0) * qty);
                                        }, 0)
                                    )}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleAddProducts}
                                className="bg-orange-500 rounded-xl py-3 items-center"
                            >
                                <Text className="text-white font-semibold">Tambah ke Transaksi</Text>
                            </TouchableOpacity>
                        </View>
                    ) : undefined
                }
            >
                {/* Search Bar */}
                <View className="mb-4">
                    <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-gray-200">
                        <Ionicons name="search" size={18} color="#6B7280" />
                        <TextInput
                            className="ml-2 flex-1 text-gray-800"
                            placeholder="Cari produk..."
                            placeholderTextColor="#9CA3AF"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')}>
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Products List */}
                {filteredProducts.length > 0 ? (
                    <View className="flex-row flex-wrap">
                        {filteredProducts.map((item: any) => {
                            const qty = selectedProducts[item.id] || 0;
                            return (
                                <View key={item.id.toString()} className="w-1/2 px-1 mb-3">
                                    <View className="bg-white rounded-2xl p-3 border border-gray-200">
                                        {/* Product Image */}
                                        <View className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 items-center justify-center mb-2">
                                            {item.image_url ? (
                                                <Image
                                                    source={{ uri: item.image_url }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                                            )}
                                        </View>

                                        {/* Stock */}
                                        <View className="flex-row items-center mb-1">
                                            <View className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1" />
                                            <Text className="text-[10px] text-gray-600 font-semibold">
                                                Stok: {item.stock ?? 0}
                                            </Text>
                                        </View>

                                        {/* Product Name */}
                                        <Text numberOfLines={2} className="text-sm font-bold text-gray-900 mb-2" style={{ minHeight: 40 }}>
                                            {item.name}
                                        </Text>

                                        {/* Price */}
                                        <Text className="text-sm font-bold text-orange-500 mb-2">
                                            {formatIDR(item.price || 0)}
                                        </Text>

                                        {/* Quantity Controls */}
                                        {qty === 0 ? (
                                            <TouchableOpacity
                                                onPress={() => addProductQty(item.id)}
                                                className="w-full bg-orange-500 rounded-lg py-2 items-center justify-center"
                                            >
                                                <Ionicons name="add" size={18} color="white" />
                                            </TouchableOpacity>
                                        ) : (
                                            <View className="flex-row items-center justify-between">
                                                <TouchableOpacity
                                                    onPress={() => subProductQty(item.id)}
                                                    className="w-8 h-8 bg-gray-200 rounded-lg items-center justify-center"
                                                >
                                                    <Ionicons name="remove" size={16} color="#374151" />
                                                </TouchableOpacity>
                                                <Text className="text-sm font-semibold text-gray-900 min-w-[30px] text-center">
                                                    {qty}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => addProductQty(item.id)}
                                                    className="w-8 h-8 bg-orange-500 rounded-lg items-center justify-center"
                                                >
                                                    <Ionicons name="add" size={16} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="items-center justify-center py-12">
                        <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-3 text-center">
                            {searchTerm ? 'Produk tidak ditemukan' : 'Tidak ada produk'}
                        </Text>
                    </View>
                )}
            </BottomSheet>
        </View>
    );
}