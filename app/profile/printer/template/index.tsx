import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImageManipulator from 'expo-image-manipulator';

import { formatIDR as formatIDRHelper } from '@/helper/lib/FormatIdr';

import { formatDate as formatDateHelper } from '@/helper/lib/FormatDate';

import { PaymentCardService } from '@/services/paymentCard';

const STORAGE_KEY = process.env.EXPO_PUBLIC_PRINTER_CUSTUM as string;

const APP_SETTINGS_STORAGE_KEY = process.env.EXPO_PUBLIC_APP_SETTINGS as string;

/**
 * Load app settings from storage
 */
export const loadAppSettings = async (): Promise<{ dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"; decimalPlaces: number }> => {
  try {
    const stored = await AsyncStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsedSettings = JSON.parse(stored);
      return {
        dateFormat: parsedSettings.dateFormat || "DD/MM/YYYY",
        decimalPlaces: parsedSettings.decimalPlaces ?? 2,
      };
    }
    return { dateFormat: "DD/MM/YYYY", decimalPlaces: 2 };
  } catch (error) {
    console.error('Error loading app settings:', error);
    return { dateFormat: "DD/MM/YYYY", decimalPlaces: 2 };
  }
};

/**
 * Default template settings
 */
export const DEFAULT_TEMPLATE: TemplateSettings = {
  storeName: "TOKO KASIR",
  storeAddress: "",
  storePhone: "",
  storeWebsite: "",
  footerMessage: "Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan",
  showFooter: true,
  logoUrl: "",
  showLogo: false,
  logoWidth: 200,
  logoHeight: 80,
};

/**
 * Load template settings from storage
 */
export const loadTemplateSettings = async (): Promise<TemplateSettings | null> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading template settings:', error);
    return null;
  }
};

/**
 * Convert base64 image to 1-bit bitmap array
 * @param imageUri URI atau base64 image
 * @param targetWidth Target width dalam dots (default 384 untuk 80mm printer)
 * @returns Object dengan width, height, dan bitmap data array
 */
const convertImageToBitmap = async (
  imageUri: string,
  targetWidth: number = 384
): Promise<{ widthBytes: number; height: number; data: number[] } | null> => {
  try {
    let processedUri = imageUri;

    // Jika base64, simpan ke temporary file dulu
    if (imageUri.startsWith('data:') || imageUri.startsWith('base64:')) {
      // Extract base64 data
      const base64Data = imageUri.includes(',') ? imageUri.split(',')[1] : imageUri.replace(/^base64:/, '');

      // Simpan ke temporary file
      const FileSystem = await import('expo-file-system' as any);
      const FS = FileSystem.default || FileSystem;
      const baseDir = FS.documentDirectory || FS.cacheDirectory;
      if (!baseDir) {
        throw new Error('FileSystem directory tidak tersedia');
      }
      const tempFileName = `${baseDir}temp_logo_${Date.now()}.jpg`;
      await FS.writeAsStringAsync(tempFileName, base64Data, {
        encoding: 'base64',
      });
      processedUri = tempFileName;
    }

    // Resize dan convert ke grayscale menggunakan ImageManipulator
    // Target width: 384 dots untuk 80mm printer
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      processedUri,
      [
        {
          resize: {
            width: targetWidth,
            // Height akan dihitung secara proporsional
          },
        },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    // Cleanup temporary file jika dibuat
    try {
      const FileSystem = await import('expo-file-system' as any);
      const FS = FileSystem.default || FileSystem;
      const baseDir = FS.documentDirectory || FS.cacheDirectory;
      if (baseDir && processedUri.startsWith(baseDir)) {
        try {
          await FS.deleteAsync(processedUri, { idempotent: true });
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch {
      // Ignore jika FileSystem tidak tersedia
    }

    if (!manipulatedImage.base64 || !manipulatedImage.width || !manipulatedImage.height) {
      console.warn('Failed to process image');
      return null;
    }

    try {
      const base64Data = manipulatedImage.base64;

      // base64 -> Uint8Array (JPEG binary)
      const base64ToUint8Array = (b64: string): Uint8Array => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let outputLength = (b64.length / 4) * 3;
        if (b64.endsWith('==')) outputLength -= 2;
        else if (b64.endsWith('=')) outputLength -= 1;
        const bytes = new Uint8Array(outputLength);
        let byteIndex = 0;
        let buffer = 0;
        let bitsCollected = 0;
        for (let i = 0; i < b64.length; i++) {
          const c = b64.charAt(i);
          if (c === '=') break;
          const v = chars.indexOf(c);
          if (v < 0) continue;
          buffer = (buffer << 6) | v;
          bitsCollected += 6;
          if (bitsCollected >= 8) {
            bitsCollected -= 8;
            bytes[byteIndex++] = (buffer >> bitsCollected) & 0xff;
          }
        }
        return bytes;
      };

      const jpegData = base64ToUint8Array(base64Data);
      const jpegMod: any = await import('jpeg-js' as any);
      const jpegLib = jpegMod.default || jpegMod;
      const decoded = jpegLib.decode(jpegData, { useTArray: true });
      const width = decoded.width;
      const height = decoded.height;
      const rgba: Uint8Array = decoded.data;

      // Threshold to monochrome 1-bit and pack 8 pixels per byte (MSB first)
      const widthBytes = Math.ceil(width / 8);
      const out = new Array<number>(widthBytes * height).fill(0);
      const threshold = 170; // 0..255, lower = darker
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = rgba[idx];
          const g = rgba[idx + 1];
          const b = rgba[idx + 2];
          const a = rgba[idx + 3];
          const gray = a === 0 ? 255 : (0.299 * r + 0.587 * g + 0.114 * b);
          const bit = gray < threshold ? 1 : 0; // 1 = black
          const byteIndex = y * widthBytes + (x >> 3);
          const bitPos = 7 - (x & 7);
          if (bit) out[byteIndex] |= (1 << bitPos);
        }
      }

      return { widthBytes, height, data: out };

    } catch (decodeError) {
      console.warn('Failed to decode pixel data:', decodeError);
      return null;
    }

  } catch {
    console.warn('Failed to convert image to bitmap');
    return null;
  }
};

/**
 * Convert bitmap data ke ESC/POS format
 * @param width Width dalam dots
 * @param height Height dalam dots
 * @param bitmap Bitmap data array (1-bit per pixel)
 * @returns ESC/POS command string
 */
const bitmapToESCPOS = (widthBytes: number, height: number, data: number[]): string => {
  const GS = '\x1D';

  // ESC/POS format: GS v 0 m xL xH yL yH d1...dk
  // m = 0 (normal mode)
  // xL, xH = low and high bytes of width
  // yL, yH = low and high bytes of height
  // d1...dk = bitmap data

  const xL = widthBytes & 0xFF;
  const xH = (widthBytes >> 8) & 0xFF;
  const yL = height & 0xFF;
  const yH = (height >> 8) & 0xFF;
  const mode = 0; // Normal mode

  // Convert bitmap array ke byte string
  const bitmapBytes = data.map((byte) => String.fromCharCode(byte)).join('');

  // Generate ESC/POS command
  return GS + 'v' + String.fromCharCode(0) + String.fromCharCode(mode) +
    String.fromCharCode(xL) + String.fromCharCode(xH) +
    String.fromCharCode(yL) + String.fromCharCode(yH) +
    bitmapBytes;
};

/**
 * Convert base64 image to ESC/POS bitmap (untuk printer RPP02N)
 * 
 * Proses:
 * 1. Decode base64 image (data:image/png;base64,...)
 * 2. Load image dan resize ke lebar printer (384 dots untuk 80mm)
 * 3. Convert ke grayscale lalu 1-bit bitmap (black/white)
 * 4. Convert bitmap pixels ke byte array
 * 5. Generate ESC/POS commands dengan format yang benar
 * 
 * Format ESC/POS untuk bitmap:
 * - ESC * m nL nH d1...dk (Raster bitmap)
 * - GS v 0 m xL xH yL yH d1...dk (Print raster bitmap)
 */
const convertImageToESCPOS = async (
  base64Image: string,
  logoWidth?: number,
  logoHeight?: number
): Promise<string> => {
  try {
    // Printer width untuk 80mm printer = 384 dots
    const printerWidth = 384;
    const targetWidth = Math.min(logoWidth || printerWidth, printerWidth);

    // Convert image ke bitmap
    // Normalisasi input:
    // - data URL ("data:") atau "base64:" -> gunakan apa adanya
    // - file:// atau http(s):// -> gunakan apa adanya
    // - string tanpa skema dan panjang (dugaan base64 mentah) -> tambahkan prefix "base64:"
    let imageInput = base64Image?.trim() || '';
    const lower = imageInput.toLowerCase();
    const isDataOrPrefixedBase64 = lower.startsWith('data:') || lower.startsWith('base64:');
    const isFileOrRemote = lower.startsWith('file:') || lower.startsWith('http://') || lower.startsWith('https://');
    if (!isDataOrPrefixedBase64 && !isFileOrRemote) {
      // Heuristik sederhana: jika string cukup panjang dan hanya berisi karakter base64 yang valid
      const looksLikeBase64 = /^[a-z0-9+/=]+$/i.test(imageInput) && imageInput.length > 100;
      if (looksLikeBase64) {
        imageInput = `base64:${imageInput}`;
      }
    }

    const bitmapResult = await convertImageToBitmap(imageInput, targetWidth);

    if (!bitmapResult || !bitmapResult.data) {
      // Jika konversi gagal atau tidak tersedia, skip logo printing
      // Logo tetap akan muncul di HTML/PDF version
      console.warn('Bitmap conversion tidak tersedia, skip logo printing');
      return '\n'; // Return blank line jika tidak bisa convert
    }

    // Convert bitmap ke ESC/POS format
    const escPosCommand = bitmapToESCPOS(
      bitmapResult.widthBytes,
      bitmapResult.height,
      bitmapResult.data
    );

    return escPosCommand + '\n';

  } catch (error) {
    console.warn('Failed to convert image to ESC/POS:', error);
    return '\n'; // Fallback to blank line
  }
};

/**
 * Generate ESC/POS receipt text for printer
 * @param props Transaction data and items
 * @returns ESC/POS formatted string
 */
export const generateReceiptText = async (props: PrintTemplateProps): Promise<string> => {
  // Load custom settings or use defaults
  const customSettings = await loadTemplateSettings();
  // Load app settings for formatting
  const appSettings = await loadAppSettings();

  const {
    transaction,
    items,
    storeName = customSettings?.storeName || props.storeName || 'TOKO KASIR',
    storeAddress = customSettings?.storeAddress || props.storeAddress,
    storePhone = customSettings?.storePhone || props.storePhone,
    storeWebsite = customSettings?.storeWebsite || props.storeWebsite,
    footerMessage = customSettings?.footerMessage || props.footerMessage,
    showFooter = customSettings?.showFooter !== undefined ? customSettings.showFooter : (props.showFooter !== undefined ? props.showFooter : true),
    logoUrl = customSettings?.logoUrl || props.logoUrl,
    showLogo = customSettings?.showLogo !== undefined ? customSettings.showLogo : (props.showLogo !== undefined ? props.showLogo : false),
    logoWidth = customSettings?.logoWidth || props.logoWidth || 200,
    logoHeight = customSettings?.logoHeight || props.logoHeight || 80,
  } = props;

  // Format functions using app settings
  const formatIDR = (amount: number) => formatIDRHelper(amount, appSettings?.decimalPlaces ?? 2);
  const formatDate = (dateInput: string | number | Date) => formatDateHelper(dateInput, appSettings?.dateFormat || "DD/MM/YYYY");
  const formatTime = (dateInput: string | number | Date) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ESC/POS Commands
  const ESC = '\x1B';
  const INIT = `${ESC}@`; // Initialize printer
  const ALIGN_LEFT = `${ESC}\x61\x00`; // Left align
  const ALIGN_CENTER = `${ESC}\x61\x01`; // Center align
  const BOLD_ON = `${ESC}\x45\x01`; // Bold on
  const BOLD_OFF = `${ESC}\x45\x00`; // Bold off
  const LARGER_TEXT = `${ESC}\x21\x30`; // Larger text (double height + double width)
  const NORMAL_TEXT = `${ESC}\x21\x00`; // Normal text
  const DOUBLE_WIDTH = `${ESC}\x21\x10`; // Double width
  const CUT = '\x1D\x56\x41\x03'; // Cut paper

  const receiptParts: string[] = [];

  // Initialize printer
  receiptParts.push(INIT);

  // Add logo if enabled and available
  if (showLogo && logoUrl) {
    try {
      receiptParts.push(ALIGN_CENTER); // Center align untuk logo
      // Convert image to ESC/POS format dengan decode dan convert ke grayscale
      // Pass logoWidth dan logoHeight untuk resize
      const logoCommand = await convertImageToESCPOS(logoUrl, logoWidth, logoHeight);
      receiptParts.push(logoCommand);
      receiptParts.push('\n'); // Extra line after logo
    } catch (error) {
      console.warn('Failed to add logo to receipt:', error);
      // Continue without logo if conversion fails
    }
  }

  // Header with store info
  receiptParts.push(
    [
      ALIGN_CENTER,
      LARGER_TEXT, // Larger text (double height + double width)
      `${storeName}\n`,
      NORMAL_TEXT, // Normal text
      storeAddress ? `${storeAddress}\n` : '',
      storePhone ? `Telp: ${storePhone}\n` : '',
      storeWebsite ? `${storeWebsite}\n` : '',
      '\n',
      '================================\n', // 32 karakter untuk 80mm (disesuaikan)
      DOUBLE_WIDTH, // Double width
      'STRUK PEMBELIAN\n',
      NORMAL_TEXT, // Normal text
      ALIGN_LEFT, // Left alignment
    ].filter(Boolean).join('')
  );

  // Transaction Info
  const date = new Date(transaction.created_at || Date.now());
  let transactionInfo = `No.: ${transaction.transaction_number || 'N/A'}\n`;

  // Customer Info (if exists)
  if (transaction.customer_name) {
    transactionInfo += `Pelanggan: ${transaction.customer_name}\n`;
  }

  transactionInfo += `Tgl: ${formatDate(date)}\n` +
    `Jam: ${formatTime(date)}\n` +
    '================================\n'; // 32 karakter

  receiptParts.push(transactionInfo);

  // Items Header - disesuaikan untuk 80mm (32 karakter efektif, lebih kompak)
  receiptParts.push(
    'Nama Barang      Qty   Harga\n' + // Lebih kompak
    '================================\n' // 32 karakter
  );

  // Items - disesuaikan untuk 80mm, lebih kompak
  items.forEach((item) => {
    const itemName = item.product?.name || 'Produk';
    const quantity = item.quantity.toString();
    // Format price using app settings - remove "Rp " prefix and adjust for receipt format
    const formattedPrice = formatIDR(item.subtotal).replace('Rp ', '');
    const price = `Rp.${formattedPrice}`;

    let itemLines = '';
    // Untuk 80mm, nama barang lebih kompak (16 karakter)
    if (itemName.length > 16) {
      itemLines += `${itemName.slice(0, 16)}\n`;
      itemLines += `${itemName.slice(16).padEnd(16)}`;
    } else {
      itemLines += itemName.padEnd(16);
    }
    itemLines += `${quantity.padStart(3)} `; // Kurang 1 spasi
    itemLines += `${price.padStart(10)}\n`; // Lebih kompak untuk harga (10 karakter)

    receiptParts.push(itemLines);
  });

  // Calculate totals
  const subtotal = transaction.subtotal || 0;
  const transactionDiscount = transaction.discount || 0; // Discount tambahan di level transaksi

  // Calculate total discount from all items (percentage per item)
  const totalItemsDiscount = items.reduce((sum, item) => {
    const basePrice = item.price || 0;
    const qty = item.quantity || 0;
    // Get discount from product if available, otherwise use item discount
    const productDiscount = item.product?.discount ?? item.discount ?? 0;
    const discountPercent = Number(productDiscount) || 0;
    const discountAmountPerUnit = (basePrice * discountPercent) / 100;
    return sum + discountAmountPerUnit * qty;
  }, 0);

  // Total discount = discount from items + transaction level discount
  const totalDiscount = totalItemsDiscount + transactionDiscount;
  const total = transaction.total || 0;

  // Summary with totals - disesuaikan untuk 80mm (32 karakter)
  // Format prices using app settings - remove "Rp " prefix for receipt format
  const formattedSubtotal = formatIDR(subtotal).replace('Rp ', '');
  const formattedDiscount = formatIDR(totalDiscount).replace('Rp ', '');
  const formattedTotal = formatIDR(total).replace('Rp ', '');

  receiptParts.push(
    [
      '================================\n', // 32 karakter
      BOLD_ON, // Bold on
      `SUBTOTAL   : Rp ${formattedSubtotal}\n`,
      totalDiscount > 0 ? `DISKON     : Rp ${formattedDiscount}\n` : '',
      `TOTAL      : Rp ${formattedTotal}\n`,
      BOLD_OFF, // Bold off
      '================================\n', // 32 karakter
    ].filter(Boolean).join('')
  );

  // Footer - menggunakan custom settings
  if (showFooter) {
    receiptParts.push(ALIGN_CENTER); // Center alignment
    receiptParts.push('\n');

    if (footerMessage) {
      // Split footer message by newline (support both \n and actual newlines)
      const footerLines = footerMessage.replace(/\\n/g, '\n').split('\n');
      footerLines.forEach((line) => {
        if (line.trim()) {
          receiptParts.push(`${line.trim()}\n`);
        }
      });
    } else {
      // Default footer jika tidak ada custom message
      receiptParts.push('Terima kasih atas kunjungan Anda\n');
      receiptParts.push('SELAMAT BERBELANJA KEMBALI\n');
      receiptParts.push('\n');
      receiptParts.push('* Barang yang sudah dibeli *\n');
      receiptParts.push('* tidak dapat ditukar/dikembalikan *\n');
    }
  }

  // Paper feed and cut
  receiptParts.push('\n\n\n'); // Paper feed
  receiptParts.push(CUT); // Cut paper

  // Combine all parts
  const receipt = receiptParts.join('');

  // Log ke console untuk debugging (dalam development mode)
  if (__DEV__) {
    console.log('\n========================================');
    console.log('📄 RECEIPT OUTPUT (Generated)');
    console.log('========================================\n');
    console.log(receipt);
    console.log('\n========================================\n');
  }

  return receipt;
};

/**
 * Generate HTML receipt for PDF export
 * @param props Transaction data and items
 * @returns HTML string for PDF generation
 */
export const generateReceiptHTML = async (props: PrintTemplateProps): Promise<string> => {
  // Load custom settings or use defaults
  const customSettings = await loadTemplateSettings();
  // Load app settings for formatting
  const appSettings = await loadAppSettings();

  const {
    transaction,
    items,
    storeName = customSettings?.storeName || 'TOKO KASIR',
    storeAddress = customSettings?.storeAddress,
    storePhone = customSettings?.storePhone,
    storeWebsite = customSettings?.storeWebsite,
    footerMessage = customSettings?.footerMessage,
    showFooter = customSettings?.showFooter !== false,
    logoUrl = customSettings?.logoUrl,
    showLogo = customSettings?.showLogo !== false,
    logoWidth = customSettings?.logoWidth || 200,
    logoHeight = customSettings?.logoHeight || 80,
  } = props;

  // Format functions using app settings
  const formatIDR = (amount: number) => formatIDRHelper(amount, appSettings?.decimalPlaces ?? 2);
  const formatDate = (dateInput: string | number | Date) => formatDateHelper(dateInput, appSettings?.dateFormat || "DD/MM/YYYY");
  const formatTime = (dateInput: string | number | Date) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const date = new Date(transaction.created_at || Date.now());
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(date);

  // Get payment method label sesuai dengan paymentCard
  const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      'cash': 'Tunai',
      'gopay': 'GoPay',
      'ovo': 'OVO',
      'dana': 'DANA',
      'shopeepay': 'ShopeePay',
      'linkaja': 'LinkAja',
      'qris': 'QRIS',
      'debit_card': 'Kartu Debit',
      'credit_card': 'Kartu Kredit',
      'bank_transfer': 'Transfer Bank',
      'card': 'Kartu',
      'transfer': 'Transfer',
    };
    return labels[method] || method;
  };

  // Ambil payment card jika ada payment_card_id
  let paymentMethodLabel = 'Tunai'; // default
  if (transaction.payment_card_id) {
    try {
      const paymentCard = await PaymentCardService.getById(transaction.payment_card_id);
      if (paymentCard) {
        paymentMethodLabel = getPaymentMethodLabel(paymentCard.method);
      } else {
        // Fallback ke payment_method jika payment card tidak ditemukan
        paymentMethodLabel = getPaymentMethodLabel(transaction.payment_method || 'cash');
      }
    } catch (error) {
      console.error('Error loading payment card:', error);
      // Fallback ke payment_method jika error
      paymentMethodLabel = getPaymentMethodLabel(transaction.payment_method || 'cash');
    }
  } else {
    // Jika tidak ada payment_card_id, gunakan payment_method
    paymentMethodLabel = getPaymentMethodLabel(transaction.payment_method || 'cash');
  }

  // Calculate totals
  const subtotal = transaction.subtotal || 0;
  const transactionDiscount = transaction.discount || 0; // Discount tambahan di level transaksi

  // Calculate total discount from all items (percentage per item)
  const totalItemsDiscount = items.reduce((sum, item) => {
    const basePrice = item.price || 0;
    const qty = item.quantity || 0;
    // Get discount from product if available, otherwise use item discount
    const productDiscount = item.product?.discount ?? item.discount ?? 0;
    const discountPercent = Number(productDiscount) || 0;
    const discountAmountPerUnit = (basePrice * discountPercent) / 100;
    return sum + discountAmountPerUnit * qty;
  }, 0);

  // Total discount = discount from items + transaction level discount
  const totalDiscount = totalItemsDiscount + transactionDiscount;
  const total = transaction.total || 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
          background: #fff;
          color: #111827;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 8px;
        }
        .header .address {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .header .phone {
          font-size: 12px;
          color: #6b7280;
        }
        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 15px 0;
        }
        .divider-thick {
          border-top: 2px solid #e5e7eb;
          margin: 15px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .label {
          color: #6b7280;
          font-weight: normal;
        }
        .value {
          font-weight: 600;
          color: #111827;
          text-align: right;
        }
        .items-table {
          width: 100%;
          margin: 20px 0;
          border-collapse: collapse;
        }
        .items-table thead {
          border-bottom: 2px solid #e5e7eb;
        }
        .items-table th {
          text-align: left;
          padding: 10px 0;
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }
        .items-table th:first-child {
          width: 57%;
        }
        .items-table th:nth-child(2) {
          text-align: center;
          width: 8%;
        }
        .items-table th:last-child {
          text-align: right;
          width: 35%;
        }
        .items-table td {
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }
        .items-table td:first-child {
          color: #111827;
          font-weight: 500;
        }
        .items-table td:nth-child(2) {
          text-align: center;
          color: #6b7280;
        }
        .items-table td:last-child {
          text-align: right;
          color: #111827;
          font-weight: 600;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .summary-label {
          color: #6b7280;
        }
        .summary-value {
          font-weight: 600;
          color: #111827;
        }
        .total-row {
          font-size: 18px;
          font-weight: bold;
          color: #059669;
          margin-top: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${showLogo && logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: ${logoWidth}px; height: ${logoHeight}px; max-width: 100%; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; object-fit: contain;" />` : ''}
        <h1>${storeName}</h1>
        ${storeAddress ? `<div class="address">${storeAddress}</div>` : ''}
        ${storePhone ? `<div class="phone">Telp: ${storePhone}</div>` : ''}
        ${storeWebsite ? `<div class="phone">${storeWebsite}</div>` : ''}
      </div>
      
      <div class="divider-thick"></div>
      <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 15px 0;">
        STRUK PEMBELIAN
      </div>
      <div class="divider-thick"></div>
      
      <div class="info-row">
        <span class="label">No.:</span>
        <span class="value">${transaction.transaction_number || 'N/A'}</span>
      </div>
      ${transaction.customer_name ? `
      <div class="info-row">
        <span class="label">Pelanggan:</span>
        <span class="value">${transaction.customer_name}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="label">Tgl:</span>
        <span class="value">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="label">Jam:</span>
        <span class="value">${formattedTime}</span>
      </div>
      
      <div class="divider-thick"></div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Nama Barang</th>
            <th>Qty</th>
            <th>Harga</th>
          </tr>
        </thead>
        <tbody>
          ${items
      .map(
        (item) => `
            <tr>
              <td>${item.product?.name || 'Produk'}</td>
              <td>${item.quantity}</td>
              <td>${formatIDR(item.subtotal).replace('Rp ', 'Rp.')}</td>
            </tr>
          `
      )
      .join('')}
        </tbody>
      </table>
      
      <div class="divider-thick"></div>
      
      <div class="summary-row" style="font-weight: bold;">
        <span class="summary-label">SUBTOTAL:</span>
        <span class="summary-value">${formatIDR(subtotal)}</span>
      </div>
      ${totalDiscount > 0 ? `
      <div class="summary-row" style="font-weight: bold;">
        <span class="summary-label">DISKON:</span>
        <span class="summary-value">${formatIDR(totalDiscount)}</span>
      </div>
      ` : ''}
      
      <div class="summary-row total-row">
        <span>TOTAL:</span>
        <span>${formatIDR(total)}</span>
      </div>
      
      <div class="divider-thick"></div>
      
      <div class="info-row">
        <span class="label">Metode Pembayaran:</span>
        <span class="value">${paymentMethodLabel}</span>
      </div>
      
      <div class="divider-thick"></div>
      
      ${showFooter ? `
      <div class="footer">
        ${footerMessage ? footerMessage.replace(/\\n/g, '\n').split('\n').filter(line => line.trim()).map(line => `<p>${line.trim()}</p>`).join('') : `
        <p>Terima kasih atas kunjungan Anda</p>
        <p><strong>SELAMAT BERBELANJA KEMBALI</strong></p>
        <p>* Barang yang sudah dibeli *</p>
        <p>* tidak dapat ditukar/dikembalikan *</p>
        `}
      </div>
      ` : ''}
    </body>
    </html>
  `;
};

/**
 * Test function untuk melihat hasil struk di console
 * Panggil fungsi ini untuk melihat output struk
 * Menggunakan data dari custom settings yang sudah disimpan
 */
export const testReceiptOutput = async () => {
  // Load custom settings dari storage
  const customSettings = await loadTemplateSettings();

  // Sample transaction data
  const mockTransaction: Transaction = {
    id: 1,
    transaction_number: 'TXN-2024-001',
    customer_name: 'John Doe',
    customer_phone: '081234567890',
    subtotal: 50000,
    discount: 5000,
    tax: 2500,
    total: 47500,
    payment_method: 'cash',
    payment_status: 'paid',
    status: 'completed',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Sample items
  const mockItems: (TransactionItem & { product?: any })[] = [
    {
      id: 1,
      transaction_id: 1,
      product_id: 1,
      quantity: 2,
      price: 15000,
      discount: 0,
      subtotal: 30000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product: {
        id: 1,
        name: 'Nasi Goreng Spesial',
        price: 15000,
      },
    },
    {
      id: 2,
      transaction_id: 1,
      product_id: 2,
      quantity: 1,
      price: 20000,
      discount: 0,
      subtotal: 20000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product: {
        id: 2,
        name: 'Es Teh Manis',
        price: 20000,
      },
    },
  ];

  // Gunakan custom settings jika ada, jika tidak gunakan default
  const testProps: PrintTemplateProps = {
    transaction: mockTransaction,
    items: mockItems,
    storeName: customSettings?.storeName || DEFAULT_TEMPLATE.storeName,
    storeAddress: customSettings?.storeAddress || DEFAULT_TEMPLATE.storeAddress,
    storePhone: customSettings?.storePhone || DEFAULT_TEMPLATE.storePhone,
    storeWebsite: customSettings?.storeWebsite || DEFAULT_TEMPLATE.storeWebsite,
    footerMessage: customSettings?.footerMessage || DEFAULT_TEMPLATE.footerMessage,
    showFooter: customSettings?.showFooter !== undefined ? customSettings.showFooter : DEFAULT_TEMPLATE.showFooter,
  };

  try {
    console.log('\n========================================');
    console.log('📄 TEST RECEIPT OUTPUT');
    console.log('========================================\n');

    // Tampilkan informasi custom settings yang digunakan
    console.log('📋 Custom Settings yang digunakan:');
    console.log('   - Nama Toko:', testProps.storeName);
    console.log('   - Alamat:', testProps.storeAddress || '(kosong)');
    console.log('   - Telepon:', testProps.storePhone || '(kosong)');
    console.log('   - Website:', testProps.storeWebsite || '(kosong)');
    console.log('   - Show Footer:', testProps.showFooter);
    if (testProps.footerMessage) {
      console.log('   - Footer Message:', testProps.footerMessage.substring(0, 50) + '...');
    }
    console.log('   - Custom Settings Found:', customSettings ? 'Ya' : 'Tidak (menggunakan default)');
    console.log('\n');

    const receiptText = await generateReceiptText(testProps);

    // Tampilkan hasil di console
    console.log(receiptText);

    console.log('\n========================================');
    console.log('✅ END OF RECEIPT');
    console.log('========================================\n');

    // Tampilkan juga dengan escape sequence yang visible (untuk debugging)
    console.log('\n--- 🔍 Receipt dengan escape sequences (untuk debugging) ---\n');
    const visibleReceipt = receiptText
      .replace(/\x1B/g, '[ESC]')
      .replace(/\x1D/g, '[GS]')
      .replace(/\x0A/g, '[LF]\n')
      .replace(/\x0D/g, '[CR]');
    console.log(visibleReceipt);

    console.log('\n========================================\n');

    return receiptText;
  } catch (error) {
    console.error('❌ Error generating receipt:', error);
    throw error;
  }
};

/**
 * Default export for convenience
 */
export default {
  generateReceiptText,
  generateReceiptHTML,
  testReceiptOutput,
};

