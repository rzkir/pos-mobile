import { View, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const StatCard = ({
    title,
    value,
    icon,
    color = '#3b82f6',
    subtitle,
}: {
    title: string;
    value: string | number;
    icon: string;
    color?: string;
    subtitle?: string;
}) => (
    <View className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">{title}</Text>
            <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        {subtitle && <Text className="text-xs text-gray-500 mt-1">{subtitle}</Text>}
    </View>
);

export default function NonChart({
    totalTransactions,
    totalRevenue,
    formatIDR,
    completedTransactions,
    cancelledTransactions,
    draftTransactions,
    returnTransactions,
    totalSubtotal,
    totalDiscount,
    totalTax,
    cashRevenue,
    cardRevenue,
    transferRevenue,
    cashTransactions,
    cardTransactions,
    transferTransactions,
}: NonChartProps) {
    return (
        <>
            {/* Overview Stats */}
            <StatCard title="Total Transaksi" value={totalTransactions} icon="receipt" color="#3b82f6" />

            <StatCard title="Total Pendapatan" value={formatIDR(totalRevenue)} icon="cash" color="#10b981" />

            {/* Transaction Status */}
            <View className="px-4 mb-2 mt-2">
                <Text className="text-base font-semibold text-gray-800 mb-3">Status Transaksi</Text>
            </View>

            <StatCard
                title="Selesai"
                value={completedTransactions}
                icon="checkmark-circle"
                color="#10b981"
                subtitle={`${totalTransactions > 0 ? ((completedTransactions / totalTransactions) * 100).toFixed(1) : 0}% dari total`}
            />

            <StatCard
                title="Dibatalkan"
                value={cancelledTransactions}
                icon="close-circle"
                color="#ef4444"
                subtitle={`${totalTransactions > 0 ? ((cancelledTransactions / totalTransactions) * 100).toFixed(1) : 0}% dari total`}
            />

            <StatCard
                title="Pending"
                value={draftTransactions}
                icon="time"
                color="#f59e0b"
                subtitle={`${totalTransactions > 0 ? ((draftTransactions / totalTransactions) * 100).toFixed(1) : 0}% dari total`}
            />

            <StatCard
                title="Return"
                value={returnTransactions}
                icon="refresh"
                color="#3b82f6"
                subtitle={`${totalTransactions > 0 ? ((returnTransactions / totalTransactions) * 100).toFixed(1) : 0}% dari total`}
            />

            {/* Financial Breakdown */}
            <View className="px-4 mb-2 mt-2">
                <Text className="text-base font-semibold text-gray-800 mb-3">Rincian Keuangan</Text>
            </View>

            <View className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-200">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Subtotal</Text>
                    <Text className="text-base font-semibold text-gray-900">{formatIDR(totalSubtotal)}</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Diskon</Text>
                    <Text className="text-base font-semibold text-red-600">-{formatIDR(totalDiscount)}</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Pajak</Text>
                    <Text className="text-base font-semibold text-gray-900">{formatIDR(totalTax)}</Text>
                </View>
                <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between items-center">
                    <Text className="text-base font-bold text-gray-800">Total Pendapatan</Text>
                    <Text className="text-lg font-bold text-green-600">{formatIDR(totalRevenue)}</Text>
                </View>
            </View>

            {/* Payment Method Breakdown */}
            <View className="px-4 mb-2 mt-2">
                <Text className="text-base font-semibold text-gray-800 mb-3">Metode Pembayaran</Text>
            </View>

            <View className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-200">
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="cash" size={20} color="#10b981" />
                        <Text className="text-sm text-gray-700">Tunai</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-base font-semibold text-gray-900">{formatIDR(cashRevenue)}</Text>
                        <Text className="text-xs text-gray-500">{cashTransactions} transaksi</Text>
                    </View>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="card" size={20} color="#3b82f6" />
                        <Text className="text-sm text-gray-700">Kartu</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-base font-semibold text-gray-900">{formatIDR(cardRevenue)}</Text>
                        <Text className="text-xs text-gray-500">{cardTransactions} transaksi</Text>
                    </View>
                </View>
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="swap-horizontal" size={20} color="#8b5cf6" />
                        <Text className="text-sm text-gray-700">Transfer</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-base font-semibold text-gray-900">{formatIDR(transferRevenue)}</Text>
                        <Text className="text-xs text-gray-500">{transferTransactions} transaksi</Text>
                    </View>
                </View>
            </View>
        </>
    );
}


