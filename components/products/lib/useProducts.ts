import { useRouter } from "expo-router";

import { useEffect, useMemo, useState } from "react";

import { useProducts as useCoreProducts } from "@/hooks/useProducts";

import { useCategories } from "@/hooks/useCategories";

import { useSizes } from "@/hooks/useSizes";

import { useSuppliers } from "@/hooks/useSuppliers";

import { Alert } from "react-native";

import Toast from "react-native-toast-message";

export function useProducts() {
  const router = useRouter();

  const { products, loading, deleteProduct, refreshData } = useCoreProducts();

  const { categories, refreshCategories } = useCategories();
  const { sizes, refreshSizes } = useSizes();
  const { suppliers, refreshSuppliers } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshCategories();
    refreshSizes();
    refreshSuppliers();
  }, [refreshCategories, refreshSizes, refreshSuppliers]);

  const filteredProducts = useMemo(() => {
    const getTime = (p: any) => {
      const updated = p?.updated_at ? new Date(p.updated_at).getTime() : 0;
      const created = p?.created_at ? new Date(p.created_at).getTime() : 0;
      return Math.max(updated, created);
    };

    const baseList = !searchTerm
      ? products
      : products.filter(
          (product: any) =>
            product?.name?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
            product?.barcode?.toLowerCase?.().includes(searchTerm.toLowerCase())
        );

    return [...baseList]
      .sort((a: any, b: any) => getTime(b) - getTime(a))
      .slice(0, 10);
  }, [products, searchTerm]);

  // handlers
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsView(true);
  };

  const closeDetailsView = () => {
    setShowDetailsView(false);
    setSelectedProduct(null);
  };

  const handleEdit = (product: any) => {
    router.push(`/products/${product.id}`);
  };

  const handleAdd = () => {
    router.push("/products/new");
  };

  const handleNavigateToCategory = () => {
    router.push("/products/category");
  };

  const handleNavigateToSize = () => {
    router.push("/products/size");
  };

  const handleNavigateToSupplier = () => {
    router.push("/products/supplier");
  };

  const handleNavigateAllProducts = () => {
    router.push("/products/all-products");
  };

  const handleDelete = (product: any) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus produk "${product.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Toast.show({ type: "success", text1: "Produk berhasil dihapus" });
            } catch {
              Toast.show({ type: "error", text1: "Gagal menghapus produk" });
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshData(),
        refreshCategories(),
        refreshSizes(),
        refreshSuppliers(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    // data
    products,
    categories,
    sizes,
    suppliers,
    loading,

    // actions
    deleteProduct,
    refreshData,
    onRefresh,
    refreshCategories,
    refreshSizes,
    refreshSuppliers,
    handleEdit,
    handleAdd,
    handleNavigateToCategory,
    handleNavigateToSize,
    handleNavigateToSupplier,
    handleDelete,
    handleNavigateAllProducts,

    // view state
    searchTerm,
    setSearchTerm,
    filteredProducts,
    showDetailsView,
    selectedProduct,
    refreshing,
    handleViewDetails,
    closeDetailsView,
  };
}
