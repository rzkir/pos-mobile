import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = process.env.EXPO_PUBLIC_PRINTER_CUSTUM as string;

/**
 * Default template settings
 */
export const DEFAULT_TEMPLATE: TemplateSettings = {
  storeName: "TOKO KASIR",
  storeAddress: "",
  storePhone: "",
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
 * Convert base64 image to ESC/POS bitmap (untuk printer RPP02N)
 * Catatan: Implementasi ini adalah placeholder. Untuk mencetak logo,
 * diperlukan library image processing untuk konversi ke format ESC/POS bitmap.
 * 
 * Format ESC/POS untuk bitmap:
 * - ESC * m nL nH d1...dk (Raster bitmap)
 * - GS v 0 m xL xH yL yH d1...dk (Print raster bitmap)
 * 
 * Untuk implementasi penuh, diperlukan:
 * 1. Decode base64 image (data:image/png;base64,...)
 * 2. Load image dan resize ke lebar printer (384 dots untuk 80mm)
 * 3. Convert ke grayscale lalu 1-bit bitmap (black/white)
 * 4. Convert bitmap pixels ke byte array
 * 5. Generate ESC/POS commands dengan format yang benar
 * 
 * Rekomendasi library: jimp, sharp, atau canvas untuk image processing
 */
const convertImageToESCPOS = (base64Image: string, logoWidth?: number, logoHeight?: number): string => {
  try {
    // Extract base64 data (remove data:image/...;base64, prefix)
    // Note: base64Data akan digunakan saat implementasi penuh
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const base64Data = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    // Logo dimensions akan digunakan saat implementasi bitmap
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _width = logoWidth || 200;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _height = logoHeight || 80;

    // Untuk sekarang, kita skip image printing karena memerlukan
    // image processing library yang kompleks
    // Logo akan tetap muncul di HTML/PDF version

    // Placeholder: return blank line atau text indicator
    // Jika ingin implementasi penuh, uncomment dan lengkapi bagian berikut:

    /*
    // TODO: Implementasi penuh memerlukan:
    // 1. Import library image processing (jimp/sharp/canvas)
    // 2. Decode base64Data ke Image buffer
    // 3. Resize menggunakan _width dan _height ke 384x(auto) untuk 80mm printer
    // 4. Convert ke 1-bit bitmap
    // 5. Generate ESC/POS bitmap commands:
    
    const ESC = '\x1B';
    const GS = '\x1D';
    // ESC * m nL nH d1...dk
    // m = mode (0=normal, 32=double-width, 33=double-height+width)
    // nL, nH = low and high bytes of bitmap width in dots
    // d1...dk = bitmap data
    
    const printerWidth = 384; // 80mm printer = 384 dots
    // const bitmapData = ... (hasil konversi image dari base64Data)
    // return ESC + '*' + mode + nL + nH + bitmapData;
    */

    // Placeholder: return blank lines untuk spacing
    return '\n\n'; // Spacing untuk logo (akan diganti dengan bitmap command jika diimplementasikan)

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

  const {
    transaction,
    items,
    storeName = customSettings?.storeName || props.storeName || 'TOKO KASIR',
    storeAddress = customSettings?.storeAddress || props.storeAddress,
    storePhone = customSettings?.storePhone || props.storePhone,
    footerMessage = customSettings?.footerMessage || props.footerMessage,
    showFooter = customSettings?.showFooter !== undefined ? customSettings.showFooter : (props.showFooter !== undefined ? props.showFooter : true),
    logoUrl = customSettings?.logoUrl || props.logoUrl,
    showLogo = customSettings?.showLogo !== undefined ? customSettings.showLogo : (props.showLogo !== undefined ? props.showLogo : false),
    logoWidth = customSettings?.logoWidth || props.logoWidth || 200,
    logoHeight = customSettings?.logoHeight || props.logoHeight || 80,
  } = props;

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
      // Convert image to ESC/POS format (placeholder untuk sekarang)
      // Pass logoWidth dan logoHeight untuk implementasi penuh nanti
      const logoCommand = convertImageToESCPOS(logoUrl, logoWidth, logoHeight);
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

  transactionInfo += `Tgl: ${date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}\n` +
    `Jam: ${date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })}\n` +
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
    const price = `Rp.${item.subtotal.toLocaleString('id-ID')}`;

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
  const discount = transaction.discount || 0;
  const tax = transaction.tax || 0;
  const total = transaction.total || 0;

  // Summary with totals - disesuaikan untuk 80mm (32 karakter)
  receiptParts.push(
    [
      '================================\n', // 32 karakter
      BOLD_ON, // Bold on
      `SUBTOTAL   : Rp ${subtotal.toLocaleString('id-ID')}\n`,
      discount > 0 ? `DISKON     : Rp ${discount.toLocaleString('id-ID')}\n` : '',
      tax > 0 ? `PAJAK      : Rp ${tax.toLocaleString('id-ID')}\n` : '',
      `TOTAL      : Rp ${total.toLocaleString('id-ID')}\n`,
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

  const {
    transaction,
    items,
    storeName = customSettings?.storeName || 'TOKO KASIR',
    storeAddress = customSettings?.storeAddress,
    storePhone = customSettings?.storePhone,
    footerMessage = customSettings?.footerMessage,
    showFooter = customSettings?.showFooter !== false,
    logoUrl = customSettings?.logoUrl,
    showLogo = customSettings?.showLogo !== false,
    logoWidth = customSettings?.logoWidth || 200,
    logoHeight = customSettings?.logoHeight || 80,
  } = props;

  const date = new Date(transaction.created_at || Date.now());
  const formattedDate = date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentMethodLabel =
    transaction.payment_method === 'cash'
      ? 'Tunai'
      : transaction.payment_method === 'card'
        ? 'Kartu'
        : 'Transfer';

  const statusLabel =
    transaction.payment_status === 'paid'
      ? 'LUNAS'
      : transaction.payment_status === 'pending'
        ? 'MENUNGGU'
        : 'DIBATALKAN';

  // Calculate totals
  const subtotal = transaction.subtotal || 0;
  const discount = transaction.discount || 0;
  const tax = transaction.tax || 0;
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
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-paid {
          background: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${showLogo && logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: ${logoWidth}px; height: ${logoHeight}px; max-width: 100%; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; object-fit: contain;" />` : ''}
        <h1>${storeName}</h1>
        ${storeAddress ? `<div class="address">${storeAddress}</div>` : ''}
        ${storePhone ? `<div class="phone">Telp: ${storePhone}</div>` : ''}
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
              <td>Rp.${item.subtotal.toLocaleString('id-ID')}</td>
            </tr>
          `
      )
      .join('')}
        </tbody>
      </table>
      
      <div class="divider-thick"></div>
      
      <div class="summary-row" style="font-weight: bold;">
        <span class="summary-label">SUBTOTAL:</span>
        <span class="summary-value">Rp ${subtotal.toLocaleString('id-ID')}</span>
      </div>
      ${discount > 0 ? `
      <div class="summary-row" style="font-weight: bold;">
        <span class="summary-label">DISKON:</span>
        <span class="summary-value">Rp ${discount.toLocaleString('id-ID')}</span>
      </div>
      ` : ''}
      ${tax > 0 ? `
      <div class="summary-row" style="font-weight: bold;">
        <span class="summary-label">PAJAK:</span>
        <span class="summary-value">Rp ${tax.toLocaleString('id-ID')}</span>
      </div>
      ` : ''}
      <div class="summary-row total-row">
        <span>TOTAL:</span>
        <span>Rp ${total.toLocaleString('id-ID')}</span>
      </div>
      
      <div class="divider-thick"></div>
      
      <div class="info-row">
        <span class="label">Metode Pembayaran:</span>
        <span class="value">${paymentMethodLabel}</span>
      </div>
      <div class="info-row">
        <span class="label">Status:</span>
        <span class="value">
          <span class="status-badge status-${transaction.payment_status}">
            ${statusLabel}
          </span>
        </span>
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

