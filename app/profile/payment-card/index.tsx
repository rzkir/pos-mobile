import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';

import { useEffect, useState, useCallback } from 'react';

import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { PaymentCardService } from '@/services/paymentCard';

export default function PaymentCardList() {
    const [cards, setCards] = useState<PaymentCard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const loadCards = useCallback(async () => {
        setLoading(true);
        try {
            const fetched = await PaymentCardService.getAll();
            setCards(fetched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCards();
    }, [loadCards]);

    const handleAdd = () => {
        router.push('/profile/payment-card/new');
    };

    const handleEdit = (id: number) => {
        router.push(`/profile/payment-card/${id}`);
    };

    const handleDelete = (id: number) => {
        Alert.alert('Hapus', 'Yakin hapus metode pembayaran ini?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Hapus', style: 'destructive', onPress: async () => {
                    await PaymentCardService.delete(id);
                    loadCards();
                }
            }
        ]);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

            <LinearGradient
                colors={['#1e40af', '#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-8 px-6"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-white mb-2">Metode Pembayaran</Text>
                        <Text className="text-blue-100 text-base">Kelola bank, e-wallet, dan QRIS</Text>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-4 mt-4">
                    {loading ? (
                        <Text className="text-gray-500">Memuat...</Text>
                    ) : cards.length === 0 ? (
                        <View className="bg-white rounded-2xl p-6 items-center">
                            <Text className="text-gray-600">Belum ada metode pembayaran</Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap gap-4">
                            {cards.map((card) => (
                                <View key={card.id} className="bg-white rounded-2xl p-4" style={{ width: '48%' }}>
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-900 mb-1">{card.method.toUpperCase()}</Text>
                                        {card.bank ? <Text className="text-gray-600">Bank: {card.bank.toUpperCase()}</Text> : null}
                                        {card.account_number ? <Text className="text-gray-600">No: {card.account_number}</Text> : null}
                                        {card.holder_name ? <Text className="text-gray-600">Nama: {card.holder_name}</Text> : null}
                                        <Text className="text-gray-500 text-xs mt-1">{card.is_active ? 'Aktif' : 'Nonaktif'}</Text>
                                    </View>

                                    <View className="flex-row items-center mt-2">
                                        <TouchableOpacity className="mr-3" onPress={() => handleEdit(card.id)}>
                                            <Ionicons name="create-outline" size={22} color="#1f2937" />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => handleDelete(card.id)}>
                                            <Ionicons name="trash-outline" size={22} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                onPress={handleAdd}
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ position: 'absolute', bottom: 24, right: 24, backgroundColor: '#3b82f6', elevation: 6 }}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}