import { Image, Text, TouchableOpacity, View, Switch } from 'react-native';

import { Picker } from '@react-native-picker/picker';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { BarcodeScanner } from '@/components/BarcodeScanner';

import Input from '@/components/ui/input';

import Select from '@/components/ui/select';

import { BarcodeVisual } from '@/components/ui/BarcodeVisual';

import HeaderGradient from '@/components/ui/HeaderGradient';

import { useStateCreateProducts } from '@/components/products/create/lib/useStateCreateProducts';

export default function EditProduct() {
    const {
        router,
        isEdit,
        showScanner,
        setShowScanner,
        barcodeAction,
        setBarcodeAction,
        formData,
        setFormData,
        nameRef,
        priceRef,
        modalRef,
        stockRef,
        barcodeRef,
        descriptionRef,
        minStockRef,
        discountRef,
        isDecimalUnit,
        handleInputChange,
        handlePriceChange,
        handleModalChange,
        handleBarcodeScan,
        handleBarcodeGenerate,
        handleStockChange,
        handleMinStockChange,
        handleCategorySelect,
        handleSizeSelect,
        handleSupplierSelect,
        handleUnitSelect,
        handlePickImage,
        incrementStock,
        decrementStock,
        incrementDiscount,
        decrementDiscount,
        handleDiscountChange,
        handleSave,
        categoryOptions,
        sizeOptions,
        supplierOptions,
        unitOptions,
    } = useStateCreateProducts();

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <HeaderGradient
                title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
                colors={['#FF9228', '#FF9228']}
            >
                <View className='flex-row items-center justify-between w-full'>
                    <TouchableOpacity onPress={() => router.back()} className="px-3 py-2">
                        <Text className="text-white text-base font-semibold">Batal</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-white">
                        {isEdit ? 'Edit Produk' : 'Tambah Produk'}
                    </Text>
                    <TouchableOpacity onPress={handleSave} className="bg-white px-4 py-2 rounded-full">
                        <Text className="text-orange-600 text-base font-semibold">Simpan</Text>
                    </TouchableOpacity>
                </View>
            </HeaderGradient>

            <KeyboardAwareScrollView
                className="flex-1"
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
                        <Text className="text-gray-900 font-semibold mb-3 text-center">Gambar Produk</Text>
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

                        <View className="flex-row gap-2 mt-2">
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
                        <View className='mb-3'>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-gray-700 font-medium">Best Seller</Text>
                                <Switch
                                    value={formData.best_seller}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, best_seller: val }))}
                                />
                            </View>
                        </View>

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
                                    {categoryOptions.map((option: { label: string; value: number }) => (
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
                                    {sizeOptions.map((option: { label: string; value: number }) => (
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
                                    {supplierOptions.map((option: { label: string; value: number }) => (
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
                                    onChangeText={handleDiscountChange}
                                    placeholder="0"
                                    keyboardType="decimal-pad"
                                    returnKeyType="next"
                                    onSubmitEditing={() => { }}
                                    rightIcon={
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity
                                                onPress={decrementDiscount}
                                                style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 6 }}
                                            >
                                                <Text style={{ fontSize: 16, color: '#374151' }}>-</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={incrementDiscount}
                                                style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 8 }}
                                            >
                                                <Text style={{ fontSize: 16, color: '#374151' }}>+</Text>
                                            </TouchableOpacity>
                                            <Text style={{ fontSize: 14, color: '#6B7280' }}>%</Text>
                                        </View>
                                    }
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