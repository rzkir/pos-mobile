import { useLocalSearchParams, useRouter } from 'expo-router';

import { useEffect, useState, useCallback } from 'react';

import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { TransactionService } from '@/services/transactionService';

import { formatIDR } from '@/helper/lib/FormatIdr';

import { useProducts } from '@/hooks/useProducts';

import { usePrinter } from '@/hooks';

import Toast from 'react-native-toast-message';

import { generateReceiptText, generateReceiptHTML } from '@/app/profile/printer/template';

export default function TransactionSuccess() {
    const { transactionId } = useLocalSearchParams();
    const router = useRouter();
    const id = parseInt(transactionId as string, 10);

    const { products } = useProducts();
    const { connectedAddress, printText } = usePrinter();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [printing, setPrinting] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const loadTransaction = useCallback(async () => {
        try {
            setLoading(true);
            const trans = await TransactionService.getById(id);
            if (trans) {
                setTransaction(trans);
                const transactionItems = await TransactionService.getItemsByTransactionId(id);

                // Load product details for each item
                const itemsWithProducts = transactionItems.map(item => {
                    const product = products.find((p: any) => p.id === item.product_id);
                    return {
                        ...item,
                        product
                    };
                });
                setItems(itemsWithProducts);
            }
        } catch (error) {
            console.error('Error loading transaction:', error);
        } finally {
            setLoading(false);
        }
    }, [id, products]);

    useEffect(() => {
        loadTransaction();
    }, [loadTransaction]);

    const handleBackToHome = () => {
        router.replace('/(tabs)/beranda');
    };

    // Print receipt using Bluetooth printer
    const handlePrint = async () => {
        if (!transaction) return;

        // Check if printer is connected (from localStorage)
        if (!connectedAddress) {
            Alert.alert(
                'Printer Belum Terhubung',
                'Printer belum terhubung. Silakan hubungkan printer terlebih dahulu di Pengaturan Printer.',
                [
                    { text: 'OK' },
                    {
                        text: 'Buka Pengaturan',
                        onPress: () => router.push('/profile/printer')
                    }
                ]
            );
            return;
        }

        try {
            setPrinting(true);

            // Generate receipt menggunakan template custom
            const receiptText = await generateReceiptText({
                transaction,
                items
            });

            // Print menggunakan hook (akan otomatis menggunakan connected printer)
            await printText(receiptText);

            Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Struk berhasil dikirim ke printer',
                visibilityTime: 3000
            });
        } catch (error: any) {
            console.error('Print error:', error);
            Toast.show({
                type: 'error',
                text1: 'Gagal Print',
                text2: error.message || 'Gagal mencetak struk',
                visibilityTime: 3000
            });
        } finally {
            setPrinting(false);
        }
    };

    // Generate and download PDF
    const handleDownloadPDF = async () => {
        if (!transaction) return;

        try {
            setDownloading(true);

            // Try to dynamically import expo-print and expo-sharing
            let Print: any, FileSystem: any, Sharing: any;
            try {
                Print = await import('expo-print' as any);
                FileSystem = await import('expo-file-system' as any);
                Sharing = await import('expo-sharing' as any);
            } catch {
                Toast.show({
                    type: 'info',
                    text1: 'Library Belum Terinstall',
                    text2: 'Silakan install: npm install expo-print expo-file-system expo-sharing',
                    visibilityTime: 4000
                });
                return;
            }

            // Generate HTML menggunakan template custom
            // Template akan otomatis memuat custom settings (logo, nama toko, footer, dll)
            const htmlContent = await generateReceiptHTML({
                transaction,
                items
            });

            // Generate PDF
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
            });

            // Save PDF to device
            const fileName = `Receipt_${transaction.transaction_number}_${Date.now()}.pdf`;
            const documentDir = FileSystem.documentDirectory || FileSystem.default?.documentDirectory;
            if (!documentDir) {
                throw new Error('documentDirectory tidak ditemukan');
            }
            const fileUri = `${documentDir}${fileName}`;
            await FileSystem.moveAsync?.({
                from: uri,
                to: fileUri,
            }) || FileSystem.default?.moveAsync?.({
                from: uri,
                to: fileUri,
            });

            // Share/download PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Simpan atau Bagikan PDF',
                });
                Toast.show({
                    type: 'success',
                    text1: 'Berhasil',
                    text2: 'PDF berhasil dibuat dan dibagikan',
                    visibilityTime: 3000
                });
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Berhasil',
                    text2: `PDF disimpan di: ${fileUri}`,
                    visibilityTime: 3000
                });
            }
        } catch (error: any) {
            console.error('PDF generation error:', error);
            Toast.show({
                type: 'error',
                text1: 'Gagal Download PDF',
                text2: error.message || 'Gagal membuat PDF. Pastikan library expo-print, expo-file-system, dan expo-sharing sudah terinstall.',
                visibilityTime: 4000
            });
        } finally {
            setDownloading(false);
        }
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
                    onPress={handleBackToHome}
                    className="mt-4 px-6 py-3 bg-orange-500 rounded-xl"
                >
                    <Text className="text-white font-semibold">Kembali ke Beranda</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <LinearGradient
                colors={["#059669", "#10b981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 40 }}
            >
                <View className="items-center">
                    <View className="w-20 h-20 rounded-full bg-white/30 items-center justify-center mb-4">
                        <Ionicons name="checkmark-circle" size={48} color="white" />
                    </View>
                    <Text className="text-white font-bold text-2xl mb-2">Pembayaran Berhasil!</Text>
                    <Text className="text-white/80 text-sm">Transaksi telah selesai</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Transaction Info */}
                <View className="mx-4 mt-6">
                    <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
                        <Text className="text-sm text-gray-500 mb-1">Nomor Transaksi</Text>
                        <Text className="text-lg font-bold text-gray-900">{transaction.transaction_number}</Text>

                        {transaction.customer_name && (
                            <>
                                <View className="h-px bg-gray-200 my-3" />
                                <Text className="text-sm text-gray-500 mb-1">Nama Pelanggan</Text>
                                <Text className="text-base font-semibold text-gray-900">{transaction.customer_name}</Text>
                            </>
                        )}
                    </View>

                    {/* Items Summary */}
                    {items.length > 0 && (
                        <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
                            <Text className="text-base font-bold text-gray-900 mb-3">Detail Pembelian</Text>
                            {items.map((item, index) => (
                                <View key={item.id} className={index !== items.length - 1 ? "mb-3 pb-3 border-b border-gray-100" : ""}>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-sm font-semibold text-gray-900">
                                                {item.product?.name || 'Produk'}
                                            </Text>
                                            <Text className="text-xs text-gray-600">
                                                {item.quantity} x {formatIDR(item.price)}
                                            </Text>
                                        </View>
                                        <Text className="text-sm font-bold text-gray-900">
                                            {formatIDR(item.subtotal)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Payment Summary */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
                        <Text className="text-base font-bold text-gray-900 mb-3">Ringkasan Pembayaran</Text>
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
                            <Text className="text-lg font-bold text-green-600">{formatIDR(transaction.total)}</Text>
                        </View>
                        <View className="h-px bg-gray-200 my-2" />
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-sm text-gray-600">Metode Pembayaran</Text>
                            <Text className="text-sm text-gray-900 font-semibold">
                                {transaction.payment_method === 'cash' ? 'Tunai' :
                                    transaction.payment_method === 'card' ? 'Kartu' : 'Transfer'}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">Status</Text>
                            <View className="px-2 py-1 rounded bg-green-100">
                                <Text className="text-xs font-semibold text-green-700">Lunas</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="px-4 pb-4 pt-2 bg-white border-t border-gray-200">
                <View className="flex-row gap-3 mb-3">
                    <TouchableOpacity
                        onPress={handlePrint}
                        disabled={printing}
                        className="flex-1 bg-blue-600 rounded-xl py-3 items-center flex-row justify-center"
                    >
                        {printing ? (
                            <Text className="text-white font-semibold text-base">Mencetak...</Text>
                        ) : (
                            <>
                                <Ionicons name="print" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-semibold text-base">Print</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleDownloadPDF}
                        disabled={downloading}
                        className="flex-1 bg-green-600 rounded-xl py-3 items-center flex-row justify-center"
                    >
                        {downloading ? (
                            <Text className="text-white font-semibold text-base">Membuat PDF...</Text>
                        ) : (
                            <>
                                <Ionicons name="download" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-semibold text-base">PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={handleBackToHome}
                    className="bg-orange-500 rounded-xl py-3 items-center"
                >
                    <Text className="text-white font-semibold text-base">Kembali ke Beranda</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

