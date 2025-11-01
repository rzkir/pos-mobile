import { useLocalSearchParams, useRouter } from 'expo-router';

import { useEffect, useState, useCallback } from 'react';

import { View, Text, TouchableOpacity, FlatList, Image, TextInput, Alert, ScrollView, BackHandler } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { TransactionService } from '@/services/transactionService';

import { ProductService } from '@/services/productService';

import { useProducts } from '@/hooks/useProducts';

import { formatIDR } from '@/helper/lib/FormatIdr';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { PaymentCardService } from '@/services/paymentCard';

import BottomSheet from '@/helper/bottomsheets/BottomSheet';

import Toast from 'react-native-toast-message';

import { TransactionNotificationService } from '@/services/transactionNotificationService';

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
                    // Ensure discount is properly set - use product discount if available, otherwise use item discount
                    const itemWithProduct = {
                        ...item,
                        product,
                        // Ensure discount field is properly set from product or item
                        discount: Number(product?.discount ?? item.discount ?? 0) || 0
                    };
                    return itemWithProduct;
                });
                setProductsWithDetails(itemsWithProducts);
            }
        } catch (error) {
            console.error('Error loading transaction:', error);
            Toast.show({
                type: 'error',
                text1: 'Kesalahan',
                text2: 'Gagal memuat data transaksi',
                visibilityTime: 3000
            });
        } finally {
            setLoading(false);
        }
    }, [transactionId, products]);

    // Cleanup function to clear localStorage traces
    const cleanupLocalStorage = useCallback(async () => {
        try {
            await AsyncStorage.removeItem('selected_products');
        } catch (error) {
            console.error('Error cleaning up localStorage:', error);
        }
    }, []);

    useEffect(() => {
        loadTransaction();
        loadPaymentCards();

        // Cleanup function: clear localStorage when component unmounts
        return () => {
            cleanupLocalStorage();
        };
    }, [loadTransaction, cleanupLocalStorage]);

    // Handle Android hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            cleanupLocalStorage();
            router.back();
            return true; // Prevent default behavior
        });

        return () => backHandler.remove();
    }, [cleanupLocalStorage, router]);

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

                    // Calculate discount from product
                    const basePrice = product.price ?? 0;
                    const productDiscount = Number(product.discount ?? 0) || 0;
                    // Discount is percentage, so calculate discounted price
                    const discountAmount = (basePrice * productDiscount) / 100;
                    const discountedPrice = basePrice - discountAmount;

                    if (existingItem) {
                        // Update quantity
                        const newQty = existingItem.quantity + (qty as number);
                        const subtotal = newQty * discountedPrice;
                        await TransactionService.updateItem(existingItem.id, {
                            quantity: newQty,
                            discount: productDiscount,
                            subtotal
                        });
                    } else {
                        // Add new item
                        const subtotal = (qty as number) * discountedPrice;
                        await TransactionService.addItem({
                            transaction_id: transactionId,
                            product_id: productId,
                            quantity: qty as number,
                            price: basePrice,
                            discount: productDiscount,
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
                text1: 'Kesalahan',
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
                    // Hapus semua item transaction yang ada sebelumnya (dari session sebelumnya)
                    const existingItems = await TransactionService.getItemsByTransactionId(transactionId);
                    for (const item of existingItems) {
                        await TransactionService.deleteItem(item.id);
                    }

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
    }, [transaction, addProductsToTransaction, transactionId]);


    const updateItemQty = async (itemId: number, newQty: number) => {
        if (newQty <= 0) {
            await deleteItem(itemId);
            return;
        }

        try {
            const item = items.find(i => i.id === itemId);
            if (item) {
                const product = products.find((p: any) => p.id === item.product_id);
                const basePrice = item.price;
                // Use discount from product if available, otherwise use item discount
                const productDiscount = Number(product?.discount ?? item.discount ?? 0) || 0;
                const discountAmount = (basePrice * productDiscount) / 100;
                const discountedPrice = basePrice - discountAmount;
                const newSubtotal = newQty * discountedPrice;

                await TransactionService.updateItem(itemId, {
                    quantity: newQty,
                    discount: productDiscount,
                    subtotal: newSubtotal
                });
                loadTransaction();
            }
        } catch (error) {
            console.error('Error updating item:', error);
            Toast.show({
                type: 'error',
                text1: 'Kesalahan',
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
                text1: 'Kesalahan',
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
                text1: 'Kesalahan',
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

            const updatedTransaction = await TransactionService.update(transactionId, {
                payment_method: mappedMethod,
                payment_status: 'paid',
                status: 'completed'
            });

            if (!updatedTransaction) {
                throw new Error('Failed to update transaction');
            }

            const transactionItems = await TransactionService.getItemsByTransactionId(transactionId);
            for (const item of transactionItems) {
                try {
                    await ProductService.updateSold(item.product_id, item.quantity);
                } catch (error) {
                    console.error(`Error updating product ${item.product_id}:`, error);
                }
            }

            // Send transaction success notification
            await TransactionNotificationService.sendTransactionSuccessNotification({
                id: updatedTransaction.id,
                transaction_number: updatedTransaction.transaction_number,
                total: updatedTransaction.total,
                payment_method: updatedTransaction.payment_method,
                customer_name: updatedTransaction.customer_name,
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
                text1: 'Kesalahan',
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
                                text1: 'Kesalahan',
                                text2: 'Gagal menghapus transaksi',
                                visibilityTime: 3000
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleSettings = () => {
        // Settings menu - could include cancel transaction option
        Alert.alert(
            'Pengaturan',
            'Pilih aksi',
            [
                {
                    text: 'Batal Transaksi',
                    style: 'destructive',
                    onPress: handleBatal
                },
                {
                    text: 'Tutup',
                    style: 'cancel'
                }
            ]
        );
    };

    // Handle back navigation with cleanup
    const handleBack = async () => {
        await cleanupLocalStorage();
        router.back();
    };


    const renderItem = ({ item }: { item: any }) => {
        const product = item.product;
        // Calculate price with discount
        const basePrice = item.price;
        // Use nullish coalescing to properly handle 0 as a valid discount value
        const discount = (product?.discount ?? item.discount ?? 0);
        // Ensure discount is a number
        const discountValue = Number(discount) || 0;
        const discountAmount = (basePrice * discountValue) / 100;
        const discountedPrice = basePrice - discountAmount;
        const hasDiscount = discountValue > 0;

        return (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200">
                <View className="flex-row items-center">
                    {/* Circular Image */}
                    <View className="mr-3">
                        {product?.image_url ? (
                            <Image
                                source={{ uri: product.image_url }}
                                className="w-16 h-16 rounded-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                                <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                            </View>
                        )}
                    </View>

                    {/* Item Info */}
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
                            {product?.name || 'Produk tidak ditemukan'}
                        </Text>
                        {hasDiscount ? (
                            <View className="mb-1">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-xs line-through text-gray-400">{formatIDR(basePrice)}</Text>
                                    <Text className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                        -{discountValue}%
                                    </Text>
                                </View>
                                <Text className="text-sm font-bold text-blue-600">{formatIDR(discountedPrice)}</Text>
                            </View>
                        ) : (
                            <Text className="text-sm font-bold text-blue-600 mb-1">{formatIDR(basePrice)}</Text>
                        )}
                        <Text className="text-xs text-gray-400">Catatan</Text>
                    </View>

                    {/* Quantity Selector */}
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => updateItemQty(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 bg-gray-50 items-center justify-center"
                        >
                            <View className="w-3 h-0.5 bg-gray-700 rounded" />
                        </TouchableOpacity>
                        <Text className="text-base font-semibold text-gray-900 min-w-[24px] text-center">{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => updateItemQty(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 bg-gray-50 items-center justify-center"
                        >
                            <Ionicons name="add" size={16} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

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
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white">
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-lg font-bold text-black ml-2">Detail Transaksi</Text>
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={handleSettings}>
                        <Ionicons name="settings-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-sm font-semibold text-blue-600">{transaction.transaction_number}</Text>
                </View>
            </View>

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

                {/* Promotion Section */}
                {transaction.discount > 0 && (
                    <View className="bg-white mx-4 mt-2 rounded-2xl p-4 border border-gray-200 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="pricetag-outline" size={20} color="#2563EB" />
                            <Text className="text-sm font-semibold text-gray-900">Promosi</Text>
                        </View>
                        <Text className="text-sm font-semibold text-blue-600">CN30K</Text>
                    </View>
                )}

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
                            <View className="flex-row justify-between items-center">
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
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            {transaction.status === 'draft' && (
                <View className="flex-row px-4 pb-4 pt-2 bg-white gap-3">
                    <TouchableOpacity
                        onPress={() => {
                            // Handle print temporary bill
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
                        className="bg-orange-500 rounded-xl py-4 items-center"
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
                        <Text className="text-sm text-secondary-50 mb-2 font-semibold">Metode Pembayaran</Text>

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