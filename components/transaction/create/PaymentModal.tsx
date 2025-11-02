import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import BottomSheet from '@/helper/bottomsheets/BottomSheet';

export default function PaymentModal({
    visible,
    onClose,
    transaction,
    paymentMethod,
    selectedPaymentCardId,
    paymentCards,
    amountPaid,
    formatIDR,
    formatIdrNumber,
    getAmountPaidValue,
    getSuggestedAmounts,
    isAmountInsufficient,
    getPaymentMethodLabel,
    onPaymentMethodChange,
    onPaymentCardSelect,
    onAmountPaidChange,
    onSavePaymentInfo,
}: PaymentModalProps) {
    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="Pembayaran"
            footer={
                <TouchableOpacity
                    onPress={onSavePaymentInfo}
                    className="bg-orange-500 rounded-xl py-4 items-center ml-3 mr-3"
                >
                    <Text className="text-white font-semibold text-base">Konfirmasi Pembayaran</Text>
                </TouchableOpacity>
            }
        >
            <View className="pb-4 px-3">
                {/* Summary in Modal */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <Text className="text-sm font-bold text-gray-900 mb-3">Total Pembayaran</Text>
                    <Text className="text-lg font-bold text-orange-500">{formatIDR(transaction?.total || 0)}</Text>
                </View>

                {/* Payment Method */}
                <View className="mb-4 flex-col gap-2">
                    <Text className="text-sm text-secondary-50 mb-2 font-semibold">Metode Pembayaran</Text>

                    {/* Cash Option */}
                    <TouchableOpacity
                        onPress={() => {
                            onPaymentMethodChange('cash');
                            onPaymentCardSelect(null);
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
                            <Text
                                className={`ml-2 text-sm font-semibold ${paymentMethod === 'cash' && !selectedPaymentCardId ? 'text-white' : 'text-gray-700'
                                    }`}
                            >
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
                                    onPress={() => onPaymentCardSelect(card.id)}
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
                                                <Text
                                                    className={`text-sm font-semibold ${selectedPaymentCardId === card.id ? 'text-white' : 'text-gray-700'
                                                        }`}
                                                >
                                                    {getPaymentMethodLabel(card.method)}
                                                </Text>
                                                {card.bank && (
                                                    <Text
                                                        className={`text-xs ${selectedPaymentCardId === card.id ? 'text-white/80' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {card.bank.toUpperCase()}
                                                    </Text>
                                                )}
                                                {card.account_number && (
                                                    <Text
                                                        className={`text-xs ${selectedPaymentCardId === card.id ? 'text-white/80' : 'text-gray-500'
                                                            }`}
                                                    >
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
                {paymentMethod === 'cash' && selectedPaymentCardId === null && (
                    <View className="flex-col gap-2 mb-4">
                        <Text className="text-sm text-gray-300 mb-1 font-semibold">Jumlah Dibayar</Text>

                        <TextInput
                            className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border ${isAmountInsufficient() ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                }`}
                            placeholder="Masukkan jumlah yang dibayar"
                            value={amountPaid}
                            onChangeText={onAmountPaidChange}
                            keyboardType="numeric"
                        />

                        {/* Quick Price Selection Buttons */}
                        <View className="mt-2">
                            <Text className="text-xs text-gray-500 mb-2">Pilihan Cepat</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {getSuggestedAmounts().map((amount) => {
                                    const isExactTotal = amount === transaction?.total;
                                    return (
                                        <TouchableOpacity
                                            key={amount}
                                            onPress={() => onAmountPaidChange(formatIdrNumber(amount.toString()))}
                                            className={`px-4 py-2 rounded-lg border ${isExactTotal ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-semibold ${isExactTotal ? 'text-blue-700' : 'text-gray-700'}`}
                                            >
                                                {isExactTotal ? 'Total' : formatIDR(amount)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {isAmountInsufficient() && (
                            <View className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                    <Text className="ml-2 text-sm font-semibold text-red-700">
                                        Jumlah Pembayaran Kurang
                                    </Text>
                                </View>
                                <Text className="text-xs text-red-600 mt-1">
                                    Jumlah yang dibayar ({formatIDR(getAmountPaidValue())}) kurang dari total pembayaran (
                                    {formatIDR(transaction?.total || 0)}).
                                </Text>
                                <Text className="text-xs font-semibold text-red-700 mt-1">
                                    Kekurangan: {formatIDR((transaction?.total || 0) - getAmountPaidValue())}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </BottomSheet>
    );
}

