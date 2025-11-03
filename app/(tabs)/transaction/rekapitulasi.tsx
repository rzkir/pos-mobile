import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Chart from '@/app/transaction/rekapitulasi/Chart';

import NonChart from '@/app/transaction/rekapitulasi/NonChart';

import HeaderGradient from '@/components/ui/HeaderGradient';

import BottomSheet from '@/helper/bottomsheets/BottomSheet';

import useStateRekapitulasi from '@/app/transaction/rekapitulasi/lib/useStateRekapitulasi';

import { useAppSettingsContext } from "@/context/AppSettingsContext";

export default function Rekapitulasi() {
    const { formatIDR } = useAppSettingsContext();
    const {
        loading,
        refreshing,
        showCharts,
        optionSheetVisible,
        setShowCharts,
        setOptionSheetVisible,
        onRefresh,
        totalTransactions,
        completedTransactions,
        cancelledTransactions,
        draftTransactions,
        returnTransactions,
        totalRevenue,
        totalSubtotal,
        totalDiscount,
        totalTax,
        cashTransactions,
        cardTransactions,
        transferTransactions,
        cashRevenue,
        cardRevenue,
        transferRevenue,
        statusChartData,
        paymentChartData,
        dailyRevenueData,
        financialBarData,
        paymentCountPie,
        chartWidth,
        paymentBarWidth,
        paymentBarSpacing,
        paymentChartContentWidth,
    } = useStateRekapitulasi();

    // UI helpers

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-500">Memuat rekapitulasi...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#FF9228']}
                />
            }
        >
            <View>
                <HeaderGradient
                    title="Rekapitulasi Transaksi"
                    subtitle="Ringkasan keseluruhan transaksi"
                    colors={['#FF9228', '#FF9228']}
                >
                    <View className="flex-row items-center justify-between w-full">
                        <View>
                            <Text className="text-white font-bold">Rekapitulasi Transaksi</Text>
                            <Text className="text-white/80 text-xs">Ringkasan keseluruhan transaksi</Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setOptionSheetVisible(true)}
                            className="bg-white/90 rounded-lg w-9 h-9 items-center justify-center"
                        >
                            <Ionicons name="settings-outline" size={18} color="#111827" />
                        </TouchableOpacity>
                    </View>
                </HeaderGradient>
                {!showCharts && (
                    <NonChart
                        totalTransactions={totalTransactions}
                        totalRevenue={totalRevenue}
                        formatIDR={formatIDR}
                        completedTransactions={completedTransactions}
                        cancelledTransactions={cancelledTransactions}
                        draftTransactions={draftTransactions}
                        returnTransactions={returnTransactions}
                        totalSubtotal={totalSubtotal}
                        totalDiscount={totalDiscount}
                        totalTax={totalTax}
                        cashRevenue={cashRevenue}
                        cardRevenue={cardRevenue}
                        transferRevenue={transferRevenue}
                        cashTransactions={cashTransactions}
                        cardTransactions={cardTransactions}
                        transferTransactions={transferTransactions}
                    />
                )}

                {/* Charts */}
                {showCharts && (
                    <Chart
                        chartWidth={chartWidth}
                        statusChartData={statusChartData}
                        totalTransactions={totalTransactions}
                        dailyRevenueData={dailyRevenueData}
                        formatIDR={formatIDR}
                        paymentChartData={paymentChartData}
                        paymentBarWidth={paymentBarWidth}
                        paymentBarSpacing={paymentBarSpacing}
                        paymentChartContentWidth={paymentChartContentWidth}
                        paymentCountPie={paymentCountPie}
                        financialBarData={financialBarData}
                    />
                )}
            </View>

            <BottomSheet
                visible={optionSheetVisible}
                title="Opsi tampilan"
                onClose={() => setOptionSheetVisible(false)}
                maxHeightPercent={0.45}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        setShowCharts(true);
                        setOptionSheetVisible(false);
                    }}
                    className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 mb-3 border border-gray-200"
                >
                    <Text className="text-gray-800">Tampilkan semua sebagai chart</Text>
                    <Text className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: showCharts ? '#bfdbfe' : '#e5e7eb', color: showCharts ? '#1d4ed8' : '#374151' }}>
                        {showCharts ? 'Aktif' : 'Nonaktif'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        setShowCharts(false);
                        setOptionSheetVisible(false);
                    }}
                    className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-200"
                >
                    <Text className="text-gray-800">Tampilkan ringkasan teks</Text>
                    <Text className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: !showCharts ? '#bfdbfe' : '#e5e7eb', color: !showCharts ? '#1d4ed8' : '#374151' }}>
                        {!showCharts ? 'Aktif' : 'Nonaktif'}
                    </Text>
                </TouchableOpacity>
            </BottomSheet>
        </ScrollView>
    );
}

