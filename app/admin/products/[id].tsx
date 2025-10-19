import { useLocalSearchParams, useRouter } from 'expo-router';

import { useEffect, useRef, useState } from 'react';

import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { BarcodeScanner } from '@/components/BarcodeScanner';

import Input from '@/components/ui/input';

import Select from '@/components/ui/select';

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

    // Refs for focus management
    const nameRef = useRef<TextInput>(null);
    const priceRef = useRef<TextInput>(null);
    const modalRef = useRef<TextInput>(null);
    const stockRef = useRef<TextInput>(null);
    const unitRef = useRef<TextInput>(null);
    const barcodeRef = useRef<TextInput>(null);
    const descriptionRef = useRef<TextInput>(null);
    const minStockRef = useRef<TextInput>(null);
    const discountRef = useRef<TextInput>(null);
    const taxRef = useRef<TextInput>(null);


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

            }
        }
    }, [isEdit, id, products]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePriceChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            price: value
        }));
    };

    const handleModalChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            modal: value
        }));
    };

    const handleBarcodeScan = (barcode: string) => {
        setFormData(prev => ({
            ...prev,
            barcode: barcode
        }));
        setShowScanner(false);
    };

    const handleCategorySelect = (value: string | number) => {
        setFormData(prev => ({
            ...prev,
            category_id: value.toString()
        }));
    };

    const handleSizeSelect = (value: string | number) => {
        setFormData(prev => ({
            ...prev,
            size_id: value.toString()
        }));
    };

    const handleSupplierSelect = (value: string | number) => {
        setFormData(prev => ({
            ...prev,
            supplier_id: value.toString()
        }));
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
                created_by: 'admins'
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


    // Format options for Select component
    const categoryOptions = categories.map((cat: any) => ({
        label: cat.name,
        value: cat.id
    }));

    const sizeOptions = sizes.map((size: any) => ({
        label: size.name,
        value: size.id
    }));

    const supplierOptions = suppliers.map((supplier: any) => ({
        label: supplier.name,
        value: supplier.id
    }));

    return (
        <View className="flex-1 bg-white">
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

            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                keyboardShouldPersistTaps="always"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={50}
                extraHeight={100}
                showsVerticalScrollIndicator={false}
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={true}
            >
                {/* Barcode Scanner */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Barcode</Text>
                    <View className="flex-row items-center">
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Input
                                ref={barcodeRef}
                                defaultValue={formData.barcode}
                                onChangeText={(text: string) => handleInputChange('barcode', text)}
                                placeholder="Masukkan barcode atau scan"
                                keyboardType="default"
                                returnKeyType="next"
                                onSubmitEditing={() => nameRef.current?.focus()}
                                containerStyle={{ marginBottom: 0 }}
                            />
                        </View>
                        <TouchableOpacity
                            className="bg-blue-600 px-4 py-3 rounded-lg"
                            onPress={() => setShowScanner(true)}
                        >
                            <Text className="text-white font-medium">Scan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Basic Info */}
                <Input
                    ref={nameRef}
                    label="Nama Produk *"
                    defaultValue={formData.name}
                    onChangeText={(text: string) => handleInputChange('name', text)}
                    placeholder="Masukkan nama produk"
                    returnKeyType="next"
                    onSubmitEditing={() => priceRef.current?.focus()}
                />

                <View className="flex-row space-x-2">
                    <View className="flex-1">
                        <Input
                            ref={priceRef}
                            label="Harga Jual *"
                            defaultValue={formData.price}
                            onChangeText={handlePriceChange}
                            placeholder="0"
                            keyboardType="numeric"
                            returnKeyType="next"
                            onSubmitEditing={() => modalRef.current?.focus()}
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            ref={modalRef}
                            label="Harga Modal"
                            value={formData.modal}
                            onChangeText={handleModalChange}
                            placeholder="0"
                            keyboardType="numeric"
                            returnKeyType="next"
                            onSubmitEditing={() => stockRef.current?.focus()}
                        />
                    </View>
                </View>

                <View className="flex-row space-x-2">
                    <View className="flex-1">
                        <Input
                            ref={stockRef}
                            label="Stok *"
                            value={formData.stock}
                            onChangeText={(text) => handleInputChange('stock', text)}
                            placeholder="0"
                            keyboardType="numeric"
                            returnKeyType="next"
                            onSubmitEditing={() => unitRef.current?.focus()}
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            ref={unitRef}
                            label="Unit"
                            value={formData.unit}
                            onChangeText={(text) => handleInputChange('unit', text)}
                            placeholder="pcs"
                            returnKeyType="next"
                            onSubmitEditing={() => descriptionRef.current?.focus()}
                        />
                    </View>
                </View>

                {/* Categories and Sizes */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Kategori</Text>
                    <Select
                        options={categoryOptions}
                        value={formData.category_id ? parseInt(formData.category_id) : undefined}
                        onSelect={handleCategorySelect}
                        placeholder="Pilih kategori"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Ukuran</Text>
                    <Select
                        options={sizeOptions}
                        value={formData.size_id ? parseInt(formData.size_id) : undefined}
                        onSelect={handleSizeSelect}
                        placeholder="Pilih ukuran"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Supplier</Text>
                    <Select
                        options={supplierOptions}
                        value={formData.supplier_id ? parseInt(formData.supplier_id) : undefined}
                        onSelect={handleSupplierSelect}
                        placeholder="Pilih supplier"
                    />
                </View>

                {/* Additional Info */}
                <Input
                    ref={descriptionRef}
                    label="Deskripsi"
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    placeholder="Masukkan deskripsi produk"
                    returnKeyType="next"
                    onSubmitEditing={() => minStockRef.current?.focus()}
                />

                <View className="flex-row space-x-2">
                    <View className="flex-1">
                        <Input
                            ref={minStockRef}
                            label="Stok Minimum"
                            value={formData.min_stock}
                            onChangeText={(text) => handleInputChange('min_stock', text)}
                            placeholder="0"
                            keyboardType="numeric"
                            returnKeyType="next"
                            onSubmitEditing={() => discountRef.current?.focus()}
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            ref={discountRef}
                            label="Diskon (%)"
                            value={formData.discount}
                            onChangeText={(text) => handleInputChange('discount', text)}
                            placeholder="0"
                            keyboardType="numeric"
                            returnKeyType="next"
                            onSubmitEditing={() => taxRef.current?.focus()}
                        />
                    </View>
                </View>

                <Input
                    ref={taxRef}
                    label="Pajak (%)"
                    value={formData.tax}
                    onChangeText={(text) => handleInputChange('tax', text)}
                    placeholder="0"
                    keyboardType="numeric"
                    returnKeyType="done"
                />
            </KeyboardAwareScrollView>

            {/* Barcode Scanner Modal */}
            <BarcodeScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleBarcodeScan}
            />
        </View>
    );
}