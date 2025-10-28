export type KaryawanTab = "beranda" | "transaction" | "products";

export const karyawanTabs: KaryawanTab[] = [
  "beranda",
  "transaction",
  "products",
];

export const karyawanTabConfigs = {
  beranda: {
    name: "Beranda",
    icon: "home",
    iconType: "ionicons" as const,
  },
  transaction: {
    name: "Transaksi",
    icon: "swap",
    iconType: "antdesign" as const,
  },
  products: {
    name: "Produk",
    icon: "appstore",
    iconType: "antdesign" as const,
  },
};
