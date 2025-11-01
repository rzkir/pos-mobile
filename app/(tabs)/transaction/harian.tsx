import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TransactionService } from '@/services/transactionService';
import { formatIDR } from '@/helper/lib/FormatIdr';

interface DailyTransaction {
    date: string;
    transactions: Transaction[];
    totalRevenue: number;
    totalCount: number;
}

export default function Harian() {
    const router = useRouter();
    const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadTransactions = async () => {
        try {
            const allTransactions = await TransactionService.getAll();

            // Group transactions by date
            const grouped: { [key: string]: Transaction[] } = {};

            allTransactions.forEach(transaction => {
                const date = new Date(transaction.created_at);
                const dateKey = date.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });

                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(transaction);
            });

            // Convert to array and calculate totals
            const daily: DailyTransaction[] = Object.keys(grouped)
                .map(dateKey => {
                    const transactions = grouped[dateKey]
                        .filter(t => t.status === 'completed')
                        .sort((a, b) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        );

                    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

                    return {
                        date: dateKey,
                        transactions,
                        totalRevenue,
                        totalCount: transactions.length
                    };
                })
                .filter(day => day.transactions.length > 0)
                .sort((a, b) => {
                    // Sort by date descending (newest first)
                    return new Date(b.date.split('/').reverse().join('-')).getTime() -
                        new Date(a.date.split('/').reverse().join('-')).getTime();
                });

            setDailyTransactions(daily);
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

    const formatDateLabel = (dateString: string) => {
        const [day, month, year] = dateString.split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });

        // Format: "Senin, 01 Januari 2024"
        const fullDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return `${dayName}, ${fullDate}`;
    };

    const renderDaySection = ({ item }: { item: DailyTransaction }) => (
        <View className="mb-6">
            {/* Day Header */}
            <View className="bg-white mx-4 mb-2 px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-800">
                            {formatDateLabel(item.date)}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                            {item.totalCount} transaksi
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-lg font-bold text-green-600">
                            {formatIDR(item.totalRevenue)}
                        </Text>
                        <Text className="text-xs text-gray-500">Total</Text>
                    </View>
                </View>
            </View>

            {/* Transactions for this day */}
            {item.transactions.map((transaction) => (
                <TouchableOpacity
                    key={transaction.id}
                    onPress={() => router.push(`/transaction/${transaction.id}`)}
                    className="bg-white mb-2 mx-4 rounded-lg shadow-sm border border-gray-200 p-4"
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-800 mb-1">
                                {transaction.transaction_number}
                            </Text>
                            {transaction.customer_name && (
                                <Text className="text-xs text-gray-600 mb-1">
                                    {transaction.customer_name}
                                </Text>
                            )}
                            <Text className="text-xs text-gray-500">
                                {new Date(transaction.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                        <View className="bg-green-100 px-2 py-1 rounded">
                            <Text className="text-xs font-medium text-green-800 capitalize">
                                {transaction.status}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <View className="flex-row items-center gap-2">
                            <Ionicons
                                name={
                                    transaction.payment_method === 'cash' ? 'cash' :
                                        transaction.payment_method === 'card' ? 'card' :
                                            'swap-horizontal'
                                }
                                size={16}
                                color="#6b7280"
                            />
                            <Text className="text-xs text-gray-600 capitalize">
                                {transaction.payment_method}
                            </Text>
                        </View>
                        <Text className="text-base font-bold text-gray-900">
                            {formatIDR(transaction.total)}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-500">Memuat transaksi harian...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {dailyTransactions.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
                    <Text className="text-gray-500 text-center mt-4 text-base">
                        Belum ada transaksi harian
                    </Text>
                    <Text className="text-gray-400 text-center mt-2 text-sm">
                        Transaksi yang telah diselesaikan akan muncul di sini
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={dailyTransactions}
                    renderItem={renderDaySection}
                    keyExtractor={(item) => item.date}
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
                                Transaksi Harian
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1">
                                Transaksi yang dikelompokkan per hari
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

