import { useLocalSearchParams, useRouter } from 'expo-router';

import { useEffect, useState, useCallback } from 'react';

import { View, Text, TouchableOpacity, FlatList, Image, TextInput, Alert, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { TransactionService } from '@/services/transactionService';

import { useProducts } from '@/hooks/useProducts';

import { formatIDR } from '@/helper/lib/FormatIdr';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { PaymentCardService } from '@/services/paymentCard';

import BottomSheet from '@/helper/bottomsheets/BottomSheet';

import Toast from 'react-native-toast-message';

export default function TransactionDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const transactionId = parseInt(id as string, 10);

    const { products } = useProducts();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [items, setItems] = useState<TransactionItem[]>([]);
    const [productsWithDetails, setProductsWithDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
    const [selectedPaymentCardId, setSelectedPaymentCardId] = useState<number | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const loadTransaction = useCallback(async () => {
        try {
            setLoading(true);
            const trans = await TransactionService.getById(transactionId);
            if (trans) {
                setTransaction(trans);
                setCustomerName(trans.customer_name || '');
                setPaymentMethod(trans.payment_method);
                setAmountPaid('');

                const transactionItems = await TransactionService.getItemsByTransactionId(transactionId);
                setItems(transactionItems);

                // Load product details for each item
                const itemsWithProducts = transactionItems.map(item => {
                    const product = products.find((p: any) => p.id === item.product_id);
                    return {
                        ...item,
                        product
                    };
                });
                setProductsWithDetails(itemsWithProducts);
            }
        } catch (error) {
            console.error('Error loading transaction:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal memuat data transaksi',
                visibilityTime: 3000
            });
        } finally {
            setLoading(false);
        }
    }, [transactionId, products]);

    useEffect(() => {
        loadTransaction();
        loadPaymentCards();
    }, [loadTransaction]);

    const loadPaymentCards = async () => {
        try {
            const cards = await PaymentCardService.getAll();
            const activeCards = cards.filter(card => card.is_active);
            setPaymentCards(activeCards);
        } catch (error) {
            console.error('Error loading payment cards:', error);
        }
    };

    const addProductsToTransaction = useCallback(async (productIdToQty: Record<number, number>) => {
        try {
            for (const [productIdStr, qty] of Object.entries(productIdToQty)) {
                const productId = parseInt(productIdStr, 10);
                const product = products.find((p: any) => p.id === productId);

                if (product && qty > 0) {
                    // Check if item already exists
                    const currentItems = await TransactionService.getItemsByTransactionId(transactionId);
                    const existingItem = currentItems.find(item => item.product_id === productId);

                    if (existingItem) {
                        // Update quantity
                        const newQty = existingItem.quantity + (qty as number);
                        const subtotal = newQty * (product.price || 0);
                        await TransactionService.updateItem(existingItem.id, {
                            quantity: newQty,
                            subtotal
                        });
                    } else {
                        // Add new item
                        const price = product.price || 0;
                        const subtotal = (qty as number) * price;
                        await TransactionService.addItem({
                            transaction_id: transactionId,
                            product_id: productId,
                            quantity: qty as number,
                            price,
                            discount: 0,
                            subtotal
                        });
                    }
                }
            }
            loadTransaction();
        } catch (error) {
            console.error('Error adding products:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal menambahkan produk',
                visibilityTime: 3000
            });
        }
    }, [transactionId, products, loadTransaction]);

    // Load selected products from beranda if available
    useEffect(() => {
        const loadSelectedProducts = async () => {
            try {
                const selectedData = await AsyncStorage.getItem('selected_products');
                if (selectedData) {
                    const selected = JSON.parse(selectedData);
                    await addProductsToTransaction(selected);
                    await AsyncStorage.removeItem('selected_products');
                }
            } catch (error) {
                console.error('Error loading selected products:', error);
            }
        };

        if (transaction && transaction.status === 'draft') {
            loadSelectedProducts();
        }
    }, [transaction, addProductsToTransaction]);


    const updateItemQty = async (itemId: number, newQty: number) => {
        if (newQty <= 0) {
            await deleteItem(itemId);
            return;
        }

        try {
            const item = items.find(i => i.id === itemId);
            if (item) {
                const newSubtotal = newQty * item.price;
                await TransactionService.updateItem(itemId, {
                    quantity: newQty,
                    subtotal: newSubtotal
                });
                loadTransaction();
            }
        } catch (error) {
            console.error('Error updating item:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal memperbarui item',
                visibilityTime: 3000
            });
        }
    };

    const deleteItem = async (itemId: number) => {
        try {
            await TransactionService.deleteItem(itemId);
            loadTransaction();
        } catch (error) {
            console.error('Error deleting item:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal menghapus item',
                visibilityTime: 3000
            });
        }
    };

    const saveCustomerInfo = async () => {
        if (!transaction) return;

        try {
            await TransactionService.update(transactionId, {
                customer_name: customerName || undefined
            });
            loadTransaction();
            Toast.show({
                type: 'success',
                text1: 'Sukses',
                text2: 'Data pelanggan berhasil disimpan',
                visibilityTime: 3000
            });
        } catch (error) {
            console.error('Error saving customer info:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal menyimpan data pelanggan',
                visibilityTime: 3000
            });
        }
    };


    const getPaymentMethodLabel = (method: PaymentMethodOption): string => {
        const labels: Record<PaymentMethodOption, string> = {
            'gopay': 'GoPay',
            'ovo': 'OVO',
            'dana': 'DANA',
            'shopeepay': 'ShopeePay',
            'linkaja': 'LinkAja',
            'qris': 'QRIS',
            'debit_card': 'Kartu Debit',
            'credit_card': 'Kartu Kredit',
            'bank_transfer': 'Transfer Bank'
        };
        return labels[method] || method;
    };

    const handlePaymentCardSelect = (cardId: number | null) => {
        setSelectedPaymentCardId(cardId);
        if (cardId) {
            const selectedCard = paymentCards.find(card => card.id === cardId);
            if (selectedCard) {
                if (selectedCard.method === 'debit_card' || selectedCard.method === 'credit_card') {
                    setPaymentMethod('card');
                } else if (selectedCard.method === 'bank_transfer') {
                    setPaymentMethod('transfer');
                } else {
                    setPaymentMethod('transfer');
                }
            }
        }
    };

    const savePaymentInfo = async () => {
        if (!transaction) return;

        // Validate amount paid for cash payments
        if (paymentMethod === 'cash' && selectedPaymentCardId === null) {
            const paid = getAmountPaidValue();
            if (amountPaid && paid > 0 && paid < transaction.total) {
                const shortage = transaction.total - paid;
                Toast.show({
                    type: 'error',
                    text1: 'Jumlah Pembayaran Kurang',
                    text2: `Jumlah yang dibayar ${formatIDR(paid)} kurang dari total ${formatIDR(transaction.total)}. Kekurangan: ${formatIDR(shortage)}`,
                    visibilityTime: 4000
                });
                return;
            }
        }

        try {
            // Map payment card method to transaction payment method
            let mappedMethod: 'cash' | 'card' | 'transfer' = 'cash';
            if (selectedPaymentCardId) {
                const selectedCard = paymentCards.find(card => card.id === selectedPaymentCardId);
                if (selectedCard) {
                    // Map PaymentMethodOption to transaction payment_method
                    if (selectedCard.method === 'debit_card' || selectedCard.method === 'credit_card') {
                        mappedMethod = 'card';
                    } else if (selectedCard.method === 'bank_transfer') {
                        mappedMethod = 'transfer';
                    } else {
                        // For e-wallet methods (gopay, ovo, dana, etc.), use 'transfer'
                        mappedMethod = 'transfer';
                    }
                }
            } else {
                mappedMethod = paymentMethod;
            }

            // Set status to 'paid' automatically when confirming payment
            await TransactionService.update(transactionId, {
                payment_method: mappedMethod,
                payment_status: 'paid',
                status: 'completed'
            });
            await TransactionService.clearActiveTransaction();

            // Navigate to success page
            router.push({
                pathname: '/transaction/success/[transactionId]',
                params: { transactionId: transactionId.toString() }
            });
        } catch (error) {
            console.error('Error saving payment info:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal menyimpan data pembayaran',
                visibilityTime: 3000
            });
        }
    };

    const formatIdrNumber = (raw: string) => {
        if (!raw) return '';
        const digitsOnly = raw.replace(/[^0-9]/g, '');
        if (!digitsOnly) return '';
        return new Intl.NumberFormat('id-ID').format(Number(digitsOnly));
    };

    const unformatIdrNumber = (formatted: string) => {
        if (!formatted) return '';
        return formatted.replace(/\./g, '');
    };

    const calculateChange = () => {
        if (!amountPaid || !transaction) return 0;
        const paid = parseFloat(unformatIdrNumber(amountPaid)) || 0;
        const change = paid - transaction.total;
        return change > 0 ? change : 0;
    };

    const getAmountPaidValue = () => {
        if (!amountPaid || !transaction) return 0;
        return parseFloat(unformatIdrNumber(amountPaid)) || 0;
    };

    const isAmountInsufficient = () => {
        if (paymentMethod !== 'cash' || selectedPaymentCardId !== null) return false;
        if (!amountPaid) return false;
        const paid = getAmountPaidValue();
        return paid > 0 && paid < (transaction?.total || 0);
    };

    const handleBayar = () => {
        setShowPaymentModal(true);
    };

    const handleBatal = async () => {
        Alert.alert(
            'Konfirmasi',
            'Apakah Anda yakin ingin membatalkan transaksi ini? Transaksi akan dihapus.',
            [
                {
                    text: 'Tidak',
                    style: 'cancel'
                },
                {
                    text: 'Ya, Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await TransactionService.delete(transactionId);
                            await TransactionService.clearActiveTransaction();
                            router.back();
                        } catch (error) {
                            console.error('Error deleting transaction:', error);
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Gagal menghapus transaksi',
                                visibilityTime: 3000
                            });
                        }
                    }
                }
            ]
        );
    };


    const renderItem = ({ item }: { item: any }) => {
        const product = item.product;

        return (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1 flex-row items-center">
                        {product?.image_url ? (
                            <Image
                                source={{ uri: product.image_url }}
                                className="w-16 h-16 rounded-xl mr-3"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                            </View>
                        )}
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                                {product?.name || 'Produk tidak ditemukan'}
                            </Text>
                            <Text className="text-sm text-gray-500">{formatIDR(item.price)}</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => updateItemQty(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-red-100 items-center justify-center"
                        >
                            <Ionicons name="remove" size={16} color="#DC2626" />
                        </TouchableOpacity>
                        <Text className="mx-3 text-base font-semibold text-gray-900">
                            {item.quantity}
                        </Text>
                        <TouchableOpacity
                            onPress={() => updateItemQty(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center"
                        >
                            <Ionicons name="add" size={16} color="#059669" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-base font-bold text-gray-900 mr-3">
                            {formatIDR(item.subtotal)}
                        </Text>
                        <TouchableOpacity
                            onPress={() => deleteItem(item.id)}
                            className="w-8 h-8 rounded-full bg-red-100 items-center justify-center"
                        >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-gray-500">Memuat data...</Text>
            </View>
        );
    }

    if (!transaction) {
        return (
            <View className="flex-1 bg-background items-center justify-center p-4">
                <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                <Text className="text-lg font-semibold text-gray-900 mt-4">Transaksi tidak ditemukan</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
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
            <LinearGradient
                colors={["#f97316", "#fb923c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 20 }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/30 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1 ml-4">
                        <Text className="text-white font-bold text-lg">Detail Transaksi</Text>
                        <Text className="text-white/80 text-xs">{transaction.transaction_number}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${transaction.status === 'draft' ? 'bg-yellow-500' :
                        transaction.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                        <Text className="text-white text-xs font-semibold">
                            {transaction.status === 'draft' ? 'Draft' :
                                transaction.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Customer Info */}
                {transaction.status === 'draft' && (
                    <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-200">
                        <Text className="text-base font-bold text-gray-900 mb-3">Informasi Pelanggan</Text>
                        <View className="mb-3">
                            <Text className="text-sm text-gray-600 mb-1">Nama Pelanggan</Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                                placeholder="Masukkan nama pelanggan"
                                value={customerName}
                                onChangeText={setCustomerName}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={saveCustomerInfo}
                            className="bg-orange-500 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-semibold">Simpan Data Pelanggan</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Items List */}
                <View className="mx-4 mt-4">
                    <Text className="text-base font-bold text-gray-900 mb-3">Daftar Produk</Text>
                    {productsWithDetails.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center border border-gray-200">
                            <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
                            <Text className="text-gray-500 mt-3">Belum ada produk dalam transaksi</Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mt-4 px-6 py-2 bg-orange-500 rounded-xl"
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
                    <Text className="text-base font-bold text-gray-900 mb-3">Ringkasan</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Subtotal</Text>
                        <Text className="text-gray-900 font-semibold">{formatIDR(transaction.subtotal)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Diskon</Text>
                        <Text className="text-gray-900 font-semibold">{formatIDR(transaction.discount)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Pajak</Text>
                        <Text className="text-gray-900 font-semibold">{formatIDR(transaction.tax)}</Text>
                    </View>
                    <View className="h-px bg-gray-200 my-3" />
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-lg font-bold text-gray-900">Total</Text>
                        <Text className="text-lg font-bold text-orange-500">{formatIDR(transaction.total)}</Text>
                    </View>
                    {transaction.status !== 'draft' && (
                        <>
                            <View className="h-px bg-gray-200 my-2" />
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-sm text-gray-600">Metode</Text>
                                <Text className="text-sm text-gray-900 font-semibold">
                                    {transaction.payment_method === 'cash' ? 'Tunai' :
                                        transaction.payment_method === 'card' ? 'Kartu' : 'Transfer'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-gray-600">Status</Text>
                                <View className={`px-2 py-1 rounded ${transaction.payment_status === 'paid' ? 'bg-green-100' :
                                    transaction.payment_status === 'cancelled' ? 'bg-red-100' :
                                        'bg-yellow-100'
                                    }`}>
                                    <Text className={`text-xs font-semibold ${transaction.payment_status === 'paid' ? 'text-green-700' :
                                        transaction.payment_status === 'cancelled' ? 'text-red-700' :
                                            'text-yellow-700'
                                        }`}>
                                        {transaction.payment_status === 'pending' ? 'Pending' :
                                            transaction.payment_status === 'paid' ? 'Lunas' : 'Dibatalkan'}
                                    </Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            {transaction.status === 'draft' && (
                <View className="px-4 pb-4 pt-2 bg-white border-t border-gray-200">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleBatal}
                            className="flex-1 bg-red-500 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-semibold">Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleBayar}
                            className="flex-1 bg-orange-500 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-semibold">Bayar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Payment Modal */}
            <BottomSheet
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Pembayaran"
                footer={
                    <TouchableOpacity
                        onPress={savePaymentInfo}
                        className="bg-orange-500 rounded-xl py-3 items-center"
                    >
                        <Text className="text-white font-semibold text-base">Konfirmasi Pembayaran</Text>
                    </TouchableOpacity>
                }
            >
                <View className="pb-4">
                    {/* Summary in Modal */}
                    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                        <Text className="text-sm font-bold text-gray-900 mb-3">Total Pembayaran</Text>
                        <Text className="text-2xl font-bold text-orange-500">{formatIDR(transaction?.total || 0)}</Text>
                    </View>

                    {/* Payment Method */}
                    <View className="mb-4">
                        <Text className="text-sm text-gray-600 mb-2 font-semibold">Metode Pembayaran</Text>

                        {/* Cash Option */}
                        <TouchableOpacity
                            onPress={() => {
                                setPaymentMethod('cash');
                                setSelectedPaymentCardId(null);
                            }}
                            className={`mb-2 p-3 rounded-xl border-2 ${paymentMethod === 'cash' && !selectedPaymentCardId
                                ? 'bg-orange-500 border-orange-500'
                                : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="cash"
                                    size={20}
                                    color={paymentMethod === 'cash' && !selectedPaymentCardId ? 'white' : '#6B7280'}
                                />
                                <Text className={`ml-2 text-sm font-semibold ${paymentMethod === 'cash' && !selectedPaymentCardId
                                    ? 'text-white'
                                    : 'text-gray-700'
                                    }`}>
                                    Tunai
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Payment Cards */}
                        {paymentCards.length > 0 && (
                            <View className="mt-2">
                                <Text className="text-xs text-gray-500 mb-2">Metode Pembayaran Digital</Text>
                                {paymentCards.map((card) => (
                                    <TouchableOpacity
                                        key={card.id}
                                        onPress={() => handlePaymentCardSelect(card.id)}
                                        className={`mb-2 p-3 rounded-xl border-2 ${selectedPaymentCardId === card.id
                                            ? 'bg-orange-500 border-orange-500'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                {card.image?.url ? (
                                                    <Image
                                                        source={{ uri: card.image.url }}
                                                        className="w-8 h-8 rounded mr-2"
                                                        resizeMode="contain"
                                                    />
                                                ) : (
                                                    <View className="w-8 h-8 rounded bg-gray-200 items-center justify-center mr-2">
                                                        <Ionicons
                                                            name="card-outline"
                                                            size={16}
                                                            color={selectedPaymentCardId === card.id ? 'white' : '#6B7280'}
                                                        />
                                                    </View>
                                                )}
                                                <View className="flex-1">
                                                    <Text className={`text-sm font-semibold ${selectedPaymentCardId === card.id
                                                        ? 'text-white'
                                                        : 'text-gray-700'
                                                        }`}>
                                                        {getPaymentMethodLabel(card.method)}
                                                    </Text>
                                                    {card.bank && (
                                                        <Text className={`text-xs ${selectedPaymentCardId === card.id
                                                            ? 'text-white/80'
                                                            : 'text-gray-500'
                                                            }`}>
                                                            {card.bank.toUpperCase()}
                                                        </Text>
                                                    )}
                                                    {card.account_number && (
                                                        <Text className={`text-xs ${selectedPaymentCardId === card.id
                                                            ? 'text-white/80'
                                                            : 'text-gray-500'
                                                            }`}>
                                                            {card.account_number}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            {selectedPaymentCardId === card.id && (
                                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {paymentCards.length === 0 && (
                            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-2">
                                <Text className="text-xs text-yellow-800">
                                    Belum ada metode pembayaran digital yang aktif. Hanya bisa menggunakan Tunai.
                                </Text>
                            </View>
                        )}
                    </View>


                    {/* Amount Paid (for cash payments) */}
                    {(paymentMethod === 'cash' && selectedPaymentCardId === null) && (
                        <View className="mb-4">
                            <Text className="text-sm text-gray-600 mb-1 font-semibold">Jumlah Dibayar</Text>
                            <TextInput
                                className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border ${isAmountInsufficient()
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200'
                                    }`}
                                placeholder="Masukkan jumlah yang dibayar"
                                value={amountPaid}
                                onChangeText={(text) => setAmountPaid(formatIdrNumber(text))}
                                keyboardType="numeric"
                            />
                            {isAmountInsufficient() && (
                                <View className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
                                    <View className="flex-row items-center mb-1">
                                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                        <Text className="ml-2 text-sm font-semibold text-red-700">
                                            Jumlah Pembayaran Kurang
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-red-600 mt-1">
                                        Jumlah yang dibayar ({formatIDR(getAmountPaidValue())}) kurang dari total pembayaran ({formatIDR(transaction?.total || 0)}).
                                    </Text>
                                    <Text className="text-xs font-semibold text-red-700 mt-1">
                                        Kekurangan: {formatIDR((transaction?.total || 0) - getAmountPaidValue())}
                                    </Text>
                                </View>
                            )}
                            {amountPaid && calculateChange() > 0 && (
                                <View className="mt-2">
                                    <Text className="text-sm text-gray-600">Kembalian</Text>
                                    <Text className="text-lg font-bold text-green-600">
                                        {formatIDR(calculateChange())}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </BottomSheet>
        </View>
    );
}