export type AdminTab = "beranda" | "transaction" | "products" | "profil";

export const adminTabs: AdminTab[] = [
  "beranda",
  "transaction",
  "products",
  "profil",
];

export const adminTabConfigs = {
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
  profil: {
    name: "Profil",
    icon: "person",
    iconType: "ionicons" as const,
  },
};
