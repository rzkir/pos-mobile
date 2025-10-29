import { useLocalSearchParams, useRouter } from 'expo-router';

import { useEffect, useRef, useState } from 'react';

import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Picker } from '@react-native-picker/picker';

import Toast from 'react-native-toast-message';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { BarcodeScanner } from '@/components/BarcodeScanner';

import Input from '@/components/ui/input';

import Select from '@/components/ui/select';

import { BarcodeVisual } from '@/components/ui/BarcodeVisual';

import { useCategories } from '@/hooks/useCategories';

import { useProducts } from '@/hooks/useProducts';

import { useSizes } from '@/hooks/useSizes';

import { useSuppliers } from '@/hooks/useSuppliers';

import * as ImagePicker from 'expo-image-picker';

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
    const [barcodeAction, setBarcodeAction] = useState<string>('generate');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        modal: '',
        stock: '',
        unit: '',
        barcode: '',
        category_id: '',
        size_id: '',
        supplier_id: '',
        description: '',
        min_stock: '',
        discount: '',
        image_url: ''
    });

    const nameRef = useRef<TextInput>(null);
    const priceRef = useRef<TextInput>(null);
    const modalRef = useRef<TextInput>(null);
    const stockRef = useRef<TextInput>(null);
    const barcodeRef = useRef<TextInput>(null);
    const descriptionRef = useRef<TextInput>(null);
    const minStockRef = useRef<TextInput>(null);
    const discountRef = useRef<TextInput>(null);


    // Helpers untuk format angka IDR (tanpa simbol), contoh: 10000 => 10.000
    const formatIdrNumber = (raw: string) => {
        if (!raw) return '';
        const digitsOnly = raw.replace(/[^0-9]/g, '');
        if (!digitsOnly) return '';
        // Gunakan Intl agar sesuai lokal id-ID
        return new Intl.NumberFormat('id-ID').format(Number(digitsOnly));
    };

    const unformatIdrNumber = (formatted: string) => {
        if (!formatted) return '';
        return formatted.replace(/\./g, '');
    };

    useEffect(() => {
        if (isEdit && products.length > 0) {
            const product = products.find((p: any) => p.id === parseInt(id as string));
            if (product) {
                const priceValue = formatIdrNumber(product.price?.toString() || '');
                const modalValue = formatIdrNumber(product.modal?.toString() || '');

                setFormData({
                    name: product.name || '',
                    price: priceValue,
                    modal: modalValue,
                    stock: formatIdrNumber(product.stock?.toString() || ''),
                    unit: product.unit || '',
                    barcode: product.barcode || '',
                    category_id: product.category_id?.toString() || '',
                    size_id: product.size_id?.toString() || '',
                    supplier_id: product.supplier_id?.toString() || '',
                    description: product.description || '',
                    min_stock: product.min_stock?.toString() || '',
                    discount: product.discount?.toString() || '',
                    image_url: product.image_url || ''
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
            price: formatIdrNumber(value)
        }));
    };

    const handleModalChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            modal: formatIdrNumber(value)
        }));
    };

    const handleBarcodeScan = (barcode: string) => {
        setFormData(prev => ({
            ...prev,
            barcode: barcode
        }));
        setShowScanner(false);
    };

    const isDecimalUnit = (unit: string) => ['kg', 'liter', 'meter'].includes(unit);

    const sanitizeDecimalInput = (value: string, maxDecimals: number = 3) => {
        // Izinkan angka dan satu titik desimal
        let sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
        const [intPart, decPart] = sanitized.split('.');
        if (decPart !== undefined) {
            return intPart + '.' + decPart.slice(0, maxDecimals);
        }
        return intPart;
    };

    const handleStockChange = (value: string) => {
        if (isDecimalUnit(formData.unit)) {
            const cleaned = sanitizeDecimalInput(value);
            const newStockNumber = parseFloat(cleaned || '0');
            const currentMinStockNumber = parseFloat((formData.min_stock || '0').replace(',', '.'));

            if (!Number.isNaN(currentMinStockNumber) && currentMinStockNumber > newStockNumber) {
                Toast.show({ type: 'error', text1: 'Stok minimum tidak boleh melebihi stok aktual' });
                setFormData(prev => ({
                    ...prev,
                    stock: cleaned,
                    min_stock: String(newStockNumber)
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                stock: cleaned
            }));
            return;
        }

        const formattedStock = formatIdrNumber(value);
        const newStockNumber = parseInt(unformatIdrNumber(formattedStock) || '0', 10);
        const currentMinStockNumber = parseInt(formData.min_stock || '0', 10);

        if (!Number.isNaN(currentMinStockNumber) && currentMinStockNumber > newStockNumber) {
            Toast.show({ type: 'error', text1: 'Stok minimum tidak boleh melebihi stok aktual' });
            setFormData(prev => ({
                ...prev,
                stock: formattedStock,
                min_stock: String(newStockNumber)
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            stock: formattedStock
        }));
    };

    const handleMinStockChange = (value: string) => {
        if (isDecimalUnit(formData.unit)) {
            const cleaned = sanitizeDecimalInput(value);
            const inputMin = parseFloat(cleaned || '0');
            const stockNumber = parseFloat((formData.stock ? (isDecimalUnit(formData.unit) ? formData.stock : unformatIdrNumber(formData.stock)) : '0').toString().replace(',', '.'));

            if (inputMin > stockNumber) {
                Toast.show({ type: 'error', text1: 'Stok minimum tidak boleh melebihi stok aktual' });
                setFormData(prev => ({
                    ...prev,
                    min_stock: String(stockNumber)
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                min_stock: cleaned
            }));
            return;
        }

        const digitsOnly = value.replace(/[^0-9]/g, '');
        const inputMin = parseInt(digitsOnly || '0', 10);
        const stockNumber = parseInt(unformatIdrNumber(formData.stock) || '0', 10);

        if (inputMin > stockNumber) {
            Toast.show({ type: 'error', text1: 'Stok minimum tidak boleh melebihi stok aktual' });
            setFormData(prev => ({
                ...prev,
                min_stock: String(stockNumber)
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            min_stock: digitsOnly
        }));
    };

    const generateEAN13 = () => {
        let base = '';
        for (let i = 0; i < 12; i++) {
            base += Math.floor(Math.random() * 10).toString();
        }

        const digits = base.split('').map((d) => parseInt(d, 10));
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            const positionFromRight = digits.length - i;
            const weight = positionFromRight % 2 === 0 ? 3 : 1;
            sum += digits[i] * weight;
        }
        const checksum = (10 - (sum % 10)) % 10;
        return base + checksum.toString();
    };

    const handleBarcodeGenerate = () => {
        const code = generateEAN13();
        setFormData((prev) => ({ ...prev, barcode: code }));
    };

    useEffect(() => {
        if (barcodeAction === 'generate' && !isEdit && !formData.barcode) {
            const code = generateEAN13();
            setFormData((prev) => ({ ...prev, barcode: code }));
        }
    }, [barcodeAction, isEdit, formData.barcode]);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ type: 'error', text1: 'Izin galeri diperlukan untuk memilih gambar' });
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
                setFormData(prev => ({ ...prev, image_url: uri }));
            }
        } catch {
            Toast.show({ type: 'error', text1: 'Gagal memilih gambar' });
        }
    };

    const handleCategorySelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            category_id: value
        }));
    };

    const handleSizeSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            size_id: value
        }));
    };

    const handleSupplierSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            supplier_id: value
        }));
    };

    const handleUnitSelect = (value: string) => {
        // Saat ganti satuan, tetap pertahankan nilai, validasi akan jalan di handler lain
        setFormData(prev => ({
            ...prev,
            unit: value
        }));
    };

    const stepForUnit = (unit: string) => (isDecimalUnit(unit) ? 0.1 : 1);

    const parseStockNumber = (raw: string, unit: string) => {
        return isDecimalUnit(unit)
            ? parseFloat((raw || '0').toString().replace(',', '.'))
            : parseInt(unformatIdrNumber(raw) || '0', 10);
    };

    const formatStockString = (num: number, unit: string) => {
        if (isDecimalUnit(unit)) {
            const fixed = Number(num.toFixed(3));
            return String(fixed);
        }
        return formatIdrNumber(String(Math.floor(num)));
    };

    const incrementStock = (target: 'stock' | 'min_stock') => {
        const unit = formData.unit || 'pcs';
        const step = stepForUnit(unit);
        const current = target === 'stock' ? formData.stock : formData.min_stock;
        const currentNum = parseStockNumber(current, unit);
        const nextNum = currentNum + step;
        const nextStr = formatStockString(nextNum, unit);
        if (target === 'stock') {
            handleStockChange(nextStr);
        } else {
            handleMinStockChange(nextStr);
        }
    };

    const decrementStock = (target: 'stock' | 'min_stock') => {
        const unit = formData.unit || 'pcs';
        const step = stepForUnit(unit);
        const current = target === 'stock' ? formData.stock : formData.min_stock;
        const currentNum = parseStockNumber(current, unit);
        const nextNum = Math.max(0, currentNum - step);
        const nextStr = formatStockString(nextNum, unit);
        if (target === 'stock') {
            handleStockChange(nextStr);
        } else {
            handleMinStockChange(nextStr);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            Toast.show({ type: 'error', text1: 'Nama produk harus diisi' });
            return false;
        }
        if (!formData.price || parseFloat(unformatIdrNumber(formData.price)) <= 0) {
            Toast.show({ type: 'error', text1: 'Harga harus diisi dan lebih dari 0' });
            return false;
        }
        const stockNumber = isDecimalUnit(formData.unit)
            ? parseFloat((formData.stock || '0').toString().replace(',', '.'))
            : parseInt(unformatIdrNumber(formData.stock) || '0', 10);
        if (!formData.stock || Number.isNaN(stockNumber) || stockNumber < 0) {
            Toast.show({ type: 'error', text1: 'Stok harus diisi dan tidak boleh negatif' });
            return false;
        }
        // Validasi stok minimum
        const minStockNumber = isDecimalUnit(formData.unit)
            ? parseFloat((formData.min_stock || '0').toString().replace(',', '.'))
            : parseInt(formData.min_stock || '0', 10);
        if (minStockNumber < 0) {
            Toast.show({ type: 'error', text1: 'Stok minimum tidak boleh negatif' });
            return false;
        }
        if (minStockNumber > stockNumber) {
            Toast.show({ type: 'error', text1: 'Stok minimum tidak boleh melebihi stok aktual' });
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
                price: parseFloat(unformatIdrNumber(formData.price)),
                modal: parseFloat(unformatIdrNumber(formData.modal)) || 0,
                stock: isDecimalUnit(formData.unit)
                    ? parseFloat((formData.stock || '0').toString().replace(',', '.'))
                    : parseInt(unformatIdrNumber(formData.stock)),
                sold: 0,
                unit: formData.unit || 'pcs',
                image_url: formData.image_url || '',
                barcode: formData.barcode || `BC${Date.now()}`,
                is_active: true,
                category_id: formData.category_id && formData.category_id !== '' ? parseInt(formData.category_id) : undefined,
                size_id: formData.size_id && formData.size_id !== '' ? parseInt(formData.size_id) : undefined,
                supplier_id: formData.supplier_id && formData.supplier_id !== '' ? parseInt(formData.supplier_id) : undefined,
                description: formData.description,
                min_stock: isDecimalUnit(formData.unit)
                    ? parseFloat((formData.min_stock || '0').toString().replace(',', '.')) || 0
                    : parseInt(formData.min_stock) || 0,
                discount: parseFloat(formData.discount) || 0,
                expiration_date: '',
                created_by: 'admins'
            };

            if (isEdit) {
                await updateProduct(parseInt(id as string), productData);
                Toast.show({ type: 'success', text1: 'Produk berhasil diperbarui' });
            } else {
                await createProduct(productData);
                Toast.show({ type: 'success', text1: 'Produk berhasil ditambahkan' });
            }

            router.back();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Gagal menyimpan produk' });
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

    const unitOptions = [
        { label: 'Pcs (Satuan)', value: 'pcs' },
        { label: 'Kg (Kilogram)', value: 'kg' },
        { label: 'Liter', value: 'liter' },
        { label: 'Meter', value: 'meter' },
        { label: 'Box (Kotak)', value: 'box' },
        { label: 'Pack (Paket)', value: 'pack' },
        { label: 'Botol', value: 'botol' },
        { label: 'Gram', value: 'gram' },
        { label: 'Dus', value: 'dus' },
        { label: 'Roll', value: 'roll' }
    ];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-xs">
                <TouchableOpacity onPress={() => router.back()} className="px-3 py-2">
                    <Text className="text-blue-600 text-base">Batal</Text>
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-900">
                    {isEdit ? 'Edit Produk' : 'Tambah Produk'}
                </Text>
                <TouchableOpacity onPress={handleSave} className="bg-blue-600 px-4 py-2 rounded-full">
                    <Text className="text-white text-base font-semibold">Simpan</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                keyboardShouldPersistTaps="always"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={50}
                extraHeight={100}
                showsVerticalScrollIndicator={false}
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={true}
            >
                <View className="flex-col gap-6">
                    {/* Image Picker */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <Text className="text-gray-900 font-semibold mb-3">Gambar Produk</Text>
                        <View className="items-center">
                            {formData.image_url ? (
                                <Image
                                    source={{ uri: formData.image_url }}
                                    style={{ width: 160, height: 160, borderRadius: 16, marginBottom: 12 }}
                                />
                            ) : (
                                <View className="mb-3 items-center justify-center rounded-2xl bg-gray-100" style={{ width: 160, height: 160 }}>
                                    <Text className="text-gray-400">Tidak ada gambar</Text>
                                </View>
                            )}
                            <TouchableOpacity onPress={handlePickImage} className="bg-blue-600 px-4 py-2 rounded-lg">
                                <Text className="text-white font-medium">Pilih Gambar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Barcode */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <Text className="text-gray-900 font-semibold mb-3">Barcode</Text>
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
                            <View style={{ width: 180 }}>
                                <Select
                                    options={[
                                        { label: 'Scan', value: 'scan' },
                                        { label: 'Generate Otomatis', value: 'generate' },
                                    ]}
                                    value={barcodeAction}
                                    onSelect={(val) => {
                                        const v = String(val);
                                        setBarcodeAction(v);
                                        if (v === 'scan') {
                                            setShowScanner(true);
                                        } else if (v === 'generate') {
                                            handleBarcodeGenerate();
                                        }
                                    }}
                                    placeholder="Pilih tindakan"
                                />
                            </View>
                        </View>
                        {formData.barcode ? (
                            <View className="mt-3 items-center rounded-xl border border-gray-100 bg-gray-50 py-3">
                                <BarcodeVisual barcode={formData.barcode} width={280} height={60} />
                            </View>
                        ) : null}
                    </View>

                    {/* Informasi Dasar */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <Text className="text-gray-900 font-semibold mb-3">Informasi Dasar</Text>
                        <Input
                            ref={nameRef}
                            label="Nama Produk *"
                            defaultValue={formData.name}
                            onChangeText={(text: string) => handleInputChange('name', text)}
                            placeholder="Masukkan nama produk"
                            returnKeyType="next"
                            onSubmitEditing={() => priceRef.current?.focus()}
                        />

                        <View className="flex-row space-x-2 mt-2">
                            <View className="flex-1">
                                <Input
                                    ref={priceRef}
                                    label="Harga Jual *"
                                    value={formData.price}
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

                        <View className="mt-2">
                            <Input
                                ref={stockRef}
                                label="Stok *"
                                value={formData.stock}
                                onChangeText={handleStockChange}
                                placeholder={isDecimalUnit(formData.unit) ? 'contoh: 1.5' : 'contoh: 10'}
                                keyboardType={isDecimalUnit(formData.unit) ? 'decimal-pad' : 'numeric'}
                                returnKeyType="next"
                                onSubmitEditing={() => descriptionRef.current?.focus()}
                                rightIcon={(
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => decrementStock('stock')} style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 6 }}>
                                            <Text style={{ fontSize: 16, color: '#374151' }}>-</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => incrementStock('stock')} style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 8 }}>
                                            <Text style={{ fontSize: 16, color: '#374151' }}>+</Text>
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 14, color: '#6B7280' }}>{formData.unit || 'pcs'}</Text>
                                    </View>
                                )}
                            />
                            <Text className="text-gray-500 mt-1">Masukkan stok dalam {isDecimalUnit(formData.unit) ? 'angka desimal' : 'bilangan bulat'} sesuai satuan.</Text>
                        </View>
                    </View>

                    {/* Klasifikasi */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <Text className="text-gray-900 font-semibold mb-3">Klasifikasi</Text>
                        <View className="mb-3">
                            <Text className="text-gray-700 font-medium mb-2">Unit</Text>
                            <View className="border border-gray-300 rounded-lg bg-white">
                                <Picker
                                    selectedValue={formData.unit}
                                    onValueChange={handleUnitSelect}
                                    style={{ height: 50 }}
                                >
                                    <Picker.Item label="Pilih satuan" value="" />
                                    {unitOptions.map((option) => (
                                        <Picker.Item key={option.value} label={option.label} value={option.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View className="mb-3">
                            <Text className="text-gray-700 font-medium mb-2">Kategori</Text>
                            <View className="border border-gray-300 rounded-lg bg-white">
                                <Picker
                                    selectedValue={formData.category_id}
                                    onValueChange={handleCategorySelect}
                                    style={{ height: 50 }}
                                >
                                    <Picker.Item label="Pilih kategori" value="" />
                                    {categoryOptions.map((option) => (
                                        <Picker.Item key={option.value} label={option.label} value={option.value.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View className="mb-3">
                            <Text className="text-gray-700 font-medium mb-2">Ukuran</Text>
                            <View className="border border-gray-300 rounded-lg bg-white">
                                <Picker
                                    selectedValue={formData.size_id}
                                    onValueChange={handleSizeSelect}
                                    style={{ height: 50 }}
                                >
                                    <Picker.Item label="Pilih ukuran" value="" />
                                    {sizeOptions.map((option) => (
                                        <Picker.Item key={option.value} label={option.label} value={option.value.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View>
                            <Text className="text-gray-700 font-medium mb-2">Supplier</Text>
                            <View className="border border-gray-300 rounded-lg bg-white">
                                <Picker
                                    selectedValue={formData.supplier_id}
                                    onValueChange={handleSupplierSelect}
                                    style={{ height: 50 }}
                                >
                                    <Picker.Item label="Pilih supplier" value="" />
                                    {supplierOptions.map((option) => (
                                        <Picker.Item key={option.value} label={option.label} value={option.value.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Informasi Tambahan */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <Text className="text-gray-900 font-semibold mb-3">Informasi Tambahan</Text>
                        <Input
                            ref={descriptionRef}
                            label="Deskripsi"
                            value={formData.description}
                            onChangeText={(text) => handleInputChange('description', text)}
                            placeholder="Masukkan deskripsi produk"
                            returnKeyType="next"
                            onSubmitEditing={() => minStockRef.current?.focus()}
                        />

                        <View className="flex-col space-x-2 mt-2">
                            <View className="flex-1 mb-5">
                                <Input
                                    ref={minStockRef}
                                    label="Stok Minimum"
                                    value={formData.min_stock}
                                    onChangeText={handleMinStockChange}
                                    placeholder={isDecimalUnit(formData.unit) ? 'contoh: 0.5' : 'contoh: 2'}
                                    keyboardType={isDecimalUnit(formData.unit) ? 'decimal-pad' : 'numeric'}
                                    returnKeyType="next"
                                    onSubmitEditing={() => discountRef.current?.focus()}
                                    rightIcon={(
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => decrementStock('min_stock')} style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 6 }}>
                                                <Text style={{ fontSize: 16, color: '#374151' }}>-</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => incrementStock('min_stock')} style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 8 }}>
                                                <Text style={{ fontSize: 16, color: '#374151' }}>+</Text>
                                            </TouchableOpacity>
                                            <Text style={{ fontSize: 14, color: '#6B7280' }}>{formData.unit || 'pcs'}</Text>
                                        </View>
                                    )}
                                />
                                <Text className="text-gray-500">Stok minimum akan memberi peringatan saat stok turun di bawah nilai ini.</Text>
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
                                    onSubmitEditing={() => { }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
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