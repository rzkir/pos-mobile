import { useEffect, useState } from 'react';

import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { TransactionService } from '@/services/transactionService';

import { useAppSettingsContext } from '@/context/AppSettingsContext';

export default function Transaction() {
    const router = useRouter();
    const { formatIDR, formatDateTime } = useAppSettingsContext();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadTransactions = async () => {
        try {
            const allTransactions = await TransactionService.getAll();
            const sorted = allTransactions.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setTransactions(sorted);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadTransactions();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'return':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'cash':
                return 'cash';
            case 'card':
                return 'card';
            case 'transfer':
                return 'swap-horizontal';
            default:
                return 'wallet';
        }
    };

    const getPaymentStatusStyles = (status?: string) => {
        if (status === 'paid') return { bg: 'bg-green-100', text: 'text-green-700', label: 'Lunas' };
        if (status === 'cancelled') return { bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan' };
        if (status === 'return') return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Return' };
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu' };
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TouchableOpacity
            onPress={() => router.push(`/transaction/details?id=${item.id}`)}
            className="bg-white mb-3 mx-4 rounded-lg shadow-sm border border-gray-200 p-4"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800 mb-1">
                        {item.transaction_number}
                    </Text>
                    {item.customer_name && (
                        <Text className="text-xs text-gray-600 mb-1">
                            {item.customer_name}
                        </Text>
                    )}
                    <Text className="text-xs text-gray-500">
                        {formatDateTime(item.created_at)}
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                    <Text className="text-xs font-medium capitalize">
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <View className="flex-row items-center gap-2">
                    <Ionicons
                        name={getPaymentMethodIcon(item.payment_method) as any}
                        size={16}
                        color="#6b7280"
                    />
                    <Text className="text-xs text-gray-600 capitalize">
                        {item.payment_method}
                    </Text>
                    {(() => {
                        const s = getPaymentStatusStyles(item.payment_status as any);
                        return (
                            <View className={`px-2 py-0.5 rounded ${s.bg}`}>
                                <Text className={`text-[10px] font-semibold ${s.text}`}>{s.label}</Text>
                            </View>
                        );
                    })()}
                </View>
                <Text className="text-base font-bold text-gray-900">
                    {formatIDR(item.total)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-500">Memuat transaksi...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {transactions.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
                    <Text className="text-gray-500 text-center mt-4 text-base">
                        Belum ada transaksi
                    </Text>
                    <Text className="text-gray-400 text-center mt-2 text-sm">
                        Transaksi yang telah dibuat akan muncul di sini
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3b82f6']}
                        />
                    }
                    ListHeaderComponent={
                        <View className="px-4 mb-4">
                            <Text className="text-lg font-bold text-gray-800">
                                Semua Transaksi
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1">
                                {transactions.length} transaksi ditemukan
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
