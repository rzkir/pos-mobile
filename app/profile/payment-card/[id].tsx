import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Switch, Alert, Image } from 'react-native';

import { useEffect, useMemo, useState } from 'react';

import { useLocalSearchParams, router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { PaymentCardService } from '@/services/paymentCard';

import * as ImagePicker from 'expo-image-picker';

export default function PaymentCardForm() {
    const params = useLocalSearchParams();
    const idParam = params.id as string | undefined;
    const isNew = idParam === 'new' || !idParam;

    const [method, setMethod] = useState<PaymentMethodOption>('qris');
    const [bank, setBank] = useState<BankName | undefined>(undefined);
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [holderName, setHolderName] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [image, setImage] = useState<PaymentCardImage | undefined>(undefined);

    const needsBank = useMemo(() => method === 'debit_card' || method === 'credit_card' || method === 'bank_transfer', [method]);

    useEffect(() => {
        if (!isNew && idParam) {
            (async () => {
                setLoading(true);
                try {
                    const existing = await PaymentCardService.getById(Number(idParam));
                    if (existing) {
                        setMethod(existing.method);
                        setBank(existing.bank);
                        setAccountNumber(existing.account_number ?? '');
                        setHolderName(existing.holder_name ?? '');
                        setIsActive(existing.is_active);
                        setImage(existing.image); // tambahkan ini
                    }
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isNew, idParam]);

    const save = async () => {
        try {
            if (needsBank && !bank) {
                Alert.alert('Validasi', 'Pilih bank untuk metode ini');
                return;
            }
            setLoading(true);
            const now = new Date().toISOString();
            if (isNew) {
                await PaymentCardService.create({
                    method,
                    bank,
                    account_number: accountNumber || undefined,
                    holder_name: holderName || undefined,
                    is_active: isActive,
                    image: image,
                });
            } else if (idParam) {
                await PaymentCardService.update(Number(idParam), {
                    method,
                    bank,
                    account_number: accountNumber || undefined,
                    holder_name: holderName || undefined,
                    is_active: isActive,
                    updated_at: now,
                    image: image,
                });
            }
            router.back();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin galeri diperlukan', 'Silakan izinkan akses galeri untuk memilih gambar QRIS');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setImage({ url: uri });
            }
        } catch {
            Alert.alert('Gagal memilih gambar');
        }
    };

    const Methods: PaymentMethodOption[] = ['qris', 'gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'debit_card', 'credit_card', 'bank_transfer'];
    const Banks: BankName[] = ['bca', 'bri', 'mandiri', 'bni', 'cimb', 'permata', 'danamon', 'other'];

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
            <LinearGradient colors={['#1e40af', '#3b82f6', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="pt-12 pb-8 px-6">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-white mb-2">{isNew ? 'Tambah' : 'Edit'} Metode</Text>
                        <Text className="text-blue-100 text-base">Atur bank, e-wallet, atau QRIS</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center" onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 -mt-4" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="px-6 mt-6 space-y-4">
                    {/* Method */}
                    <View className="bg-white rounded-2xl p-4">
                        <Text className="text-gray-800 font-semibold mb-2">Metode</Text>
                        <View className="flex-row flex-wrap">
                            {Methods.map(m => (
                                <TouchableOpacity key={m} onPress={() => setMethod(m)} className={`px-3 py-2 mr-2 mb-2 rounded-xl ${method === m ? 'bg-blue-600' : 'bg-gray-100'}`}>
                                    <Text className={`text-sm ${method === m ? 'text-white' : 'text-gray-800'}`}>{m.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Bank (conditional) */}
                    {needsBank ? (
                        <View className="bg-white rounded-2xl p-4">
                            <Text className="text-gray-800 font-semibold mb-2">Bank</Text>
                            <View className="flex-row flex-wrap">
                                {Banks.map(b => (
                                    <TouchableOpacity key={b} onPress={() => setBank(b)} className={`px-3 py-2 mr-2 mb-2 rounded-xl ${bank === b ? 'bg-blue-600' : 'bg-gray-100'}`}>
                                        <Text className={`text-sm ${bank === b ? 'text-white' : 'text-gray-800'}`}>{b.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : null}

                    {/* Account number */}
                    {method !== 'qris' && (
                        <View className="bg-white rounded-2xl p-4">
                            <Text className="text-gray-800 font-semibold mb-2">Nomor Akun/VA/QR</Text>
                            <TextInput
                                className="border border-gray-200 rounded-xl px-3 py-2"
                                placeholder="cth: 1234567890 / ID merchant / VA"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                keyboardType="default"
                            />
                        </View>
                    )}

                    {/* Holder name */}
                    <View className="bg-white rounded-2xl p-4">
                        <Text className="text-gray-800 font-semibold mb-2">Nama Pemilik/Outlet</Text>
                        <TextInput
                            className="border border-gray-200 rounded-xl px-3 py-2"
                            placeholder="cth: Toko Maju Jaya"
                            value={holderName}
                            onChangeText={setHolderName}
                        />
                    </View>

                    {/* Active */}
                    <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
                        <Text className="text-gray-800 font-semibold">Aktif</Text>
                        <Switch value={isActive} onValueChange={setIsActive} />
                    </View>

                    {method === 'qris' && (
                        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mt-4">
                            <Text className="text-gray-900 font-semibold mb-3">Gambar QRIS</Text>
                            <View style={{ alignItems: 'center' }}>
                                {image?.url ? (
                                    <Image source={{ uri: image.url }} style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 12 }} />
                                ) : (
                                    <View style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#9CA3AF' }}>Belum ada QR</Text>
                                    </View>
                                )}
                                <TouchableOpacity onPress={handlePickImage} style={{ backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Pilih Gambar QRIS</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity onPress={save} disabled={loading} className="bg-blue-600 rounded-2xl p-4 items-center">
                        <Text className="text-white font-bold">Simpan</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}