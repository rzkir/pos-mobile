import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCallback, useEffect, useState } from 'react';

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { BarcodeScanner } from '@/components/BarcodeScanner';

import { formatIdrInput } from '@/components/helper/FormatIdr';

import { useCategories } from '@/hooks/useCategories';

import { useProducts } from '@/hooks/useProducts';

import { useSizes } from '@/hooks/useSizes';

import { useSuppliers } from '@/hooks/useSuppliers';

export default function EditProduct() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const isEdit = id !== 'new';

    const {
        products,
        createProduct,
        updateProduct
    } = useProducts();

    const { categories } = useCategories();
    const { sizes } = useSizes();
    const { suppliers } = useSuppliers();

    const [showScanner, setShowScanner] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        modal: '',
        stock: '',
        unit: 'pcs',
        barcode: '',
        category_id: '',
        size_id: '',
        supplier_id: '',
        description: '',
        min_stock: '',
        discount: '',
        tax: ''
    });

    const [priceDisplay, setPriceDisplay] = useState('');
    const [modalDisplay, setModalDisplay] = useState('');

    useEffect(() => {
        if (isEdit && products.length > 0) {
            const product = products.find((p: any) => p.id === parseInt(id as string));
            if (product) {
                const priceValue = product.price?.toString() || '';
                const modalValue = product.modal?.toString() || '';

                setFormData({
                    name: product.name || '',
                    price: priceValue,
                    modal: modalValue,
                    stock: product.stock?.toString() || '',
                    unit: product.unit || 'pcs',
                    barcode: product.barcode || '',
                    category_id: product.category_id?.toString() || '',
                    size_id: product.size_id?.toString() || '',
                    supplier_id: product.supplier_id?.toString() || '',
                    description: product.description || '',
                    min_stock: product.min_stock?.toString() || '',
                    discount: product.discount?.toString() || '',
                    tax: product.tax?.toString() || ''
                });

                setPriceDisplay(priceValue ? formatIdrInput(priceValue) : '');
                setModalDisplay(modalValue ? formatIdrInput(modalValue) : '');
            }
        }
    }, [isEdit, id, products]);

    const handleInputChange = useCallback((field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handlePriceChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, '');
        const formattedValue = formatIdrInput(value);

        setPriceDisplay(formattedValue);
        setFormData(prev => ({
            ...prev,
            price: numericValue
        }));
    };

    const handleModalChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, '');
        const formattedValue = formatIdrInput(value);

        setModalDisplay(formattedValue);
        setFormData(prev => ({
            ...prev,
            modal: numericValue
        }));
    };

    const handleBarcodeScan = (barcode: string) => {
        setFormData(prev => ({
            ...prev,
            barcode: barcode
        }));
        setShowScanner(false);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Nama produk harus diisi');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Harga harus diisi dan lebih dari 0');
            return false;
        }
        if (!formData.stock || parseInt(formData.stock) < 0) {
            Alert.alert('Error', 'Stok harus diisi dan tidak boleh negatif');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const productData = {
                uid: `PROD${Date.now()}`,
                name: formData.name,
                price: parseFloat(formData.price),
                modal: parseFloat(formData.modal) || 0,
                stock: parseInt(formData.stock),
                sold: 0,
                unit: formData.unit,
                image_url: '',
                barcode: formData.barcode || `BC${Date.now()}`,
                is_active: true,
                sku: `SKU${Date.now()}`,
                category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
                size_id: formData.size_id ? parseInt(formData.size_id) : undefined,
                supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : undefined,
                description: formData.description,
                min_stock: parseInt(formData.min_stock) || 0,
                discount: parseFloat(formData.discount) || 0,
                tax: parseFloat(formData.tax) || 0,
                expiration_date: '',
                created_by: 'admin'
            };

            if (isEdit) {
                await updateProduct(parseInt(id as string), productData);
                Alert.alert('Sukses', 'Produk berhasil diperbarui');
            } else {
                await createProduct(productData);
                Alert.alert('Sukses', 'Produk berhasil ditambahkan');
            }

            router.back();
        } catch (error) {
            Alert.alert('Error', 'Gagal menyimpan produk');
            console.error('Error saving product:', error);
        }
    };

    const InputField = ({ label, field, value, placeholder, keyboardType = 'default' }: any) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">{label}</Text>
            <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                value={value}
                onChangeText={(text) => handleInputChange(field, text)}
                placeholder={placeholder}
                keyboardType={keyboardType}
            />
        </View>
    );

    const CurrencyInputField = ({ label, value, placeholder, onChangeText }: any) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">{label}</Text>
            <View className="relative">
                <Text className="absolute left-4 top-3 text-gray-500 z-10">Rp</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 pl-12"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType="numeric"
                />
            </View>
        </View>
    );

    const SelectField = ({ label, field, value, options, placeholder }: any) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">{label}</Text>
            <View className="border border-gray-300 rounded-lg px-4 py-3">
                <Text className="text-gray-800">
                    {options.find((opt: any) => opt.id.toString() === value)?.name || placeholder}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-blue-600 text-lg">Batal</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-800">
                        {isEdit ? 'Edit Produk' : 'Tambah Produk'}
                    </Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text className="text-blue-600 text-lg font-semibold">Simpan</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Barcode Scanner */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Barcode</Text>
                        <View className="flex-row items-center">
                            <TextInput
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 mr-2"
                                value={formData.barcode}
                                onChangeText={(text) => handleInputChange('barcode', text)}
                                placeholder="Masukkan barcode atau scan"
                            />
                            <TouchableOpacity
                                className="bg-blue-600 px-4 py-3 rounded-lg"
                                onPress={() => setShowScanner(true)}
                            >
                                <Text className="text-white font-medium">Scan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Basic Info */}
                    <InputField
                        label="Nama Produk *"
                        field="name"
                        value={formData.name}
                        placeholder="Masukkan nama produk"
                    />

                    <View className="flex-row space-x-2">
                        <View className="flex-1">
                            <CurrencyInputField
                                label="Harga Jual *"
                                value={priceDisplay}
                                placeholder="0"
                                onChangeText={handlePriceChange}
                            />
                        </View>
                        <View className="flex-1">
                            <CurrencyInputField
                                label="Harga Modal"
                                value={modalDisplay}
                                placeholder="0"
                                onChangeText={handleModalChange}
                            />
                        </View>
                    </View>

                    <View className="flex-row space-x-2">
                        <View className="flex-1">
                            <InputField
                                label="Stok *"
                                field="stock"
                                value={formData.stock}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <InputField
                                label="Unit"
                                field="unit"
                                value={formData.unit}
                                placeholder="pcs"
                            />
                        </View>
                    </View>

                    {/* Categories and Sizes */}
                    <SelectField
                        label="Kategori"
                        field="category_id"
                        value={formData.category_id}
                        options={categories}
                        placeholder="Pilih kategori"
                    />

                    <SelectField
                        label="Ukuran"
                        field="size_id"
                        value={formData.size_id}
                        options={sizes}
                        placeholder="Pilih ukuran"
                    />

                    <SelectField
                        label="Supplier"
                        field="supplier_id"
                        value={formData.supplier_id}
                        options={suppliers}
                        placeholder="Pilih supplier"
                    />

                    {/* Additional Info */}
                    <InputField
                        label="Deskripsi"
                        field="description"
                        value={formData.description}
                        placeholder="Masukkan deskripsi produk"
                    />

                    <View className="flex-row space-x-2">
                        <View className="flex-1">
                            <InputField
                                label="Stok Minimum"
                                field="min_stock"
                                value={formData.min_stock}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <InputField
                                label="Diskon (%)"
                                field="discount"
                                value={formData.discount}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <InputField
                        label="Pajak (%)"
                        field="tax"
                        value={formData.tax}
                        placeholder="0"
                        keyboardType="numeric"
                    />
                </ScrollView>

                {/* Barcode Scanner Modal */}
                <BarcodeScanner
                    visible={showScanner}
                    onClose={() => setShowScanner(false)}
                    onScan={handleBarcodeScan}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
