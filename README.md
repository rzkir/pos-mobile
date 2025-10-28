# POS Mobile App

Aplikasi Point of Sale (POS) mobile yang dibangun dengan React Native dan Expo.

## Fitur Utama

- **Manajemen Produk**: Tambah, edit, dan hapus produk dengan kategori, ukuran, dan supplier
- **Scan Barcode**: Scan barcode produk untuk pencarian cepat
- **Transaksi**: Proses penjualan dengan printer thermal Bluetooth
- **Manajemen User**: Sistem login dengan role admin dan karyawan
- **Printer Integration**: Koneksi printer thermal RPP02N via Bluetooth

## Teknologi yang Digunakan

- **React Native** dengan **Expo SDK 54**
- **Expo Router** untuk navigasi
- **NativeWind** untuk styling (Tailwind CSS)
- **TypeScript** untuk type safety
- **Expo Camera** untuk scan barcode
- **React Native Bluetooth ESC/POS Printer** untuk printer thermal
- **Expo Media Library** untuk akses galeri foto

## Instalasi dan Setup

### Prerequisites

- Node.js (versi 18 atau lebih baru)
- npm atau yarn
- Expo CLI
- Android Studio (untuk Android development)
- Xcode (untuk iOS development, hanya macOS)

### Instalasi Dependencies

```bash
npm install
```

### Menjalankan Aplikasi

#### Untuk Development (Expo Go - Terbatas)

```bash
npm start
```

**Catatan**: Beberapa fitur seperti Bluetooth printer tidak akan berfungsi di Expo Go karena memerlukan native modules.

#### Untuk Development Build (Direkomendasikan)

Untuk menggunakan semua fitur termasuk Bluetooth printer, Anda perlu membuat development build:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login ke Expo
eas login

# Build development client untuk Android
eas build --profile development --platform android

# Atau untuk iOS
eas build --profile development --platform ios
```

Setelah build selesai, install APK/IPA yang dihasilkan di perangkat Anda, kemudian jalankan:

```bash
npm start
```

Dan pilih "Open on development build" di Expo Dev Tools.

## Konfigurasi Permissions

Aplikasi ini memerlukan beberapa permissions:

### Android Permissions

- `CAMERA` - untuk scan barcode
- `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN` - untuk printer thermal
- `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` - diperlukan untuk Bluetooth scanning
- `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO` - untuk akses media
- `WRITE_EXTERNAL_STORAGE` - untuk menyimpan file
- `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` - untuk fitur audio

### iOS Permissions

- Camera usage description
- Bluetooth usage description
- Location usage description
- Photo library usage description

## Struktur Project

```
pos-mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── admin/         # Admin pages
│   │   └── karyawan/      # Employee pages
│   ├── auth/              # Authentication pages
│   └── admin/             # Admin-specific pages
├── components/             # Reusable components
├── context/               # React Context providers
├── hooks/                 # Custom hooks
├── services/              # API services
├── types/                 # TypeScript type definitions
└── helper/                # Utility functions
```

## Troubleshooting

### Error: RNPermissions TurboModule not found

Error ini terjadi karena `react-native-permissions` memerlukan native code compilation. Solusi:

1. Gunakan development build instead of Expo Go
2. Atau gunakan Expo permissions API sebagai fallback (sudah diimplementasi)

### Error: AUDIO permission not declared

Error ini terjadi karena `expo-media-library` memerlukan konfigurasi permission yang tepat. Sudah diperbaiki dengan menambahkan plugin configuration di `app.json`.

### Bluetooth Printer tidak terdeteksi

1. Pastikan printer dalam mode pairing
2. Pastikan aplikasi memiliki permission Bluetooth dan Location
3. Restart aplikasi setelah memberikan permissions
4. Pastikan menggunakan development build, bukan Expo Go

## Build untuk Production

```bash
# Build APK untuk Android
eas build --profile production --platform android

# Build IPA untuk iOS
eas build --profile production --platform ios
```

## Kontribusi

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.
