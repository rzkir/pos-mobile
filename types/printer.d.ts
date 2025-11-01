interface PrintTemplateProps {
  transaction: Transaction;
  items: (TransactionItem & { product?: any })[];
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  footerMessage?: string;
  showFooter?: boolean;
  logoUrl?: string;
  showLogo?: boolean;
  logoWidth?: number;
  logoHeight?: number;
}

interface TemplateSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  footerMessage: string;
  showFooter: boolean;
  logoUrl?: string;
  showLogo?: boolean;
  logoWidth?: number;
  logoHeight?: number;
}

interface TemplateSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  footerMessage: string;
  showFooter: boolean;
  logoUrl?: string;
  showLogo?: boolean;
  logoWidth?: number;
  logoHeight?: number;
}
