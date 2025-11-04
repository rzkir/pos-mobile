import { View, Text, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

type Props = {
    item: DailyTransaction;
    formatIDR: (value: number) => string;
    getStatusColor: (status: string) => string;
};

export default function DailyTrasactionCard({ item, formatIDR, getStatusColor }: Props) {
    const router = useRouter();

    return (
        <View className="mt-4">
            <View className="bg-white mx-4 mb-2 px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-800">
                            {/* Parent passes formatted date string; keep raw here */}
                            {item.date}
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

            {item.transactions.map((transaction) => (
                <TouchableOpacity
                    key={transaction.id}
                    onPress={() => router.push(`/transaction/details?id=${transaction.id}`)}
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
                        <View className={`px-2 py-1 rounded ${getStatusColor(transaction.status).split(' ')[0]}`}>
                            <Text className={`text-xs font-medium capitalize ${getStatusColor(transaction.status).split(' ')[1]}`}>
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
}


