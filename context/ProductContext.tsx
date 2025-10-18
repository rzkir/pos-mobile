import React, { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ProductCategoryService } from '../services/productCategoryService';
import { ProductService } from '../services/productService';
import { ProductSizeService } from '../services/productSizeService';
import { SupplierService } from '../services/supplierService';

interface ProductContextType {
    // Products
    products: Products[];
    productsWithRelations: ProductWithRelations[];
    loading: boolean;
    error: string | null;

    // Categories
    categories: ProductCategories[];

    // Sizes
    sizes: ProductSizes[];

    // Suppliers
    suppliers: Supplier[];

    // Product Actions
    createProduct: (productData: Omit<Products, 'id' | 'created_at' | 'updated_at'>) => Promise<Products>;
    updateProduct: (id: number, productData: Partial<Products>) => Promise<Products | null>;
    deleteProduct: (id: number) => Promise<boolean>;
    getProductById: (id: number) => Promise<Products | null>;
    searchProducts: (name: string) => Promise<Products[]>;
    getProductsByCategory: (categoryId: number) => Promise<Products[]>;
    getLowStockProducts: () => Promise<Products[]>;
    updateProductStock: (id: number, newStock: number) => Promise<Products | null>;
    updateProductSold: (id: number, soldQuantity: number) => Promise<Products | null>;

    // Category Actions
    createCategory: (categoryData: Omit<ProductCategories, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductCategories>;
    updateCategory: (id: number, categoryData: Partial<ProductCategories>) => Promise<ProductCategories | null>;
    deleteCategory: (id: number) => Promise<boolean>;
    searchCategories: (name: string) => Promise<ProductCategories[]>;

    // Size Actions
    createSize: (sizeData: Omit<ProductSizes, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductSizes>;
    updateSize: (id: number, sizeData: Partial<ProductSizes>) => Promise<ProductSizes | null>;
    deleteSize: (id: number) => Promise<boolean>;
    searchSizes: (name: string) => Promise<ProductSizes[]>;

    // Supplier Actions
    createSupplier: (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<Supplier>;
    updateSupplier: (id: number, supplierData: Partial<Supplier>) => Promise<Supplier | null>;
    deleteSupplier: (id: number) => Promise<boolean>;
    searchSuppliers: (name: string) => Promise<Supplier[]>;


    // Utility
    refreshData: () => Promise<void>;
    clearError: () => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};

interface ProductProviderProps {
    children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
    const [products, setProducts] = useState<Products[]>([]);
    const [productsWithRelations, setProductsWithRelations] = useState<ProductWithRelations[]>([]);
    const [categories, setCategories] = useState<ProductCategories[]>([]);
    const [sizes, setSizes] = useState<ProductSizes[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                productsData,
                productsWithRelationsData,
                categoriesData,
                sizesData,
                suppliersData
            ] = await Promise.all([
                ProductService.getAll(),
                ProductService.getAllWithRelations(),
                ProductCategoryService.getAll(),
                ProductSizeService.getAll(),
                SupplierService.getAll()
            ]);

            setProducts(productsData);
            setProductsWithRelations(productsWithRelationsData);
            setCategories(categoriesData);
            setSizes(sizesData);
            setSuppliers(suppliersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load all data on mount
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const clearError = () => setError(null);

    // Product Actions
    const createProduct = async (productData: Omit<Products, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const newProduct = await ProductService.create(productData);
            await refreshData();
            return newProduct;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product');
            throw err;
        }
    };

    const updateProduct = async (id: number, productData: Partial<Products>) => {
        try {
            const updatedProduct = await ProductService.update(id, productData);
            if (updatedProduct) {
                await refreshData();
            }
            return updatedProduct;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product');
            throw err;
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            const result = await ProductService.delete(id);
            if (result) {
                await refreshData();
            }
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product');
            throw err;
        }
    };

    const getProductById = async (id: number) => {
        try {
            return await ProductService.getById(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get product');
            throw err;
        }
    };

    const searchProducts = async (name: string) => {
        try {
            return await ProductService.searchByName(name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search products');
            throw err;
        }
    };

    const getProductsByCategory = async (categoryId: number) => {
        try {
            return await ProductService.getByCategory(categoryId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get products by category');
            throw err;
        }
    };

    const getLowStockProducts = async () => {
        try {
            return await ProductService.getLowStock();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get low stock products');
            throw err;
        }
    };

    const updateProductStock = async (id: number, newStock: number) => {
        try {
            const updatedProduct = await ProductService.updateStock(id, newStock);
            if (updatedProduct) {
                await refreshData();
            }
            return updatedProduct;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product stock');
            throw err;
        }
    };

    const updateProductSold = async (id: number, soldQuantity: number) => {
        try {
            const updatedProduct = await ProductService.updateSold(id, soldQuantity);
            if (updatedProduct) {
                await refreshData();
            }
            return updatedProduct;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product sold');
            throw err;
        }
    };

    // Category Actions
    const createCategory = async (categoryData: Omit<ProductCategories, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const newCategory = await ProductCategoryService.create(categoryData);
            await refreshData();
            return newCategory;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create category');
            throw err;
        }
    };

    const updateCategory = async (id: number, categoryData: Partial<ProductCategories>) => {
        try {
            const updatedCategory = await ProductCategoryService.update(id, categoryData);
            if (updatedCategory) {
                await refreshData();
            }
            return updatedCategory;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update category');
            throw err;
        }
    };

    const deleteCategory = async (id: number) => {
        try {
            const result = await ProductCategoryService.delete(id);
            if (result) {
                await refreshData();
            }
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete category');
            throw err;
        }
    };

    const searchCategories = async (name: string) => {
        try {
            return await ProductCategoryService.searchByName(name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search categories');
            throw err;
        }
    };

    // Size Actions
    const createSize = async (sizeData: Omit<ProductSizes, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const newSize = await ProductSizeService.create(sizeData);
            await refreshData();
            return newSize;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create size');
            throw err;
        }
    };

    const updateSize = async (id: number, sizeData: Partial<ProductSizes>) => {
        try {
            const updatedSize = await ProductSizeService.update(id, sizeData);
            if (updatedSize) {
                await refreshData();
            }
            return updatedSize;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update size');
            throw err;
        }
    };

    const deleteSize = async (id: number) => {
        try {
            const result = await ProductSizeService.delete(id);
            if (result) {
                await refreshData();
            }
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete size');
            throw err;
        }
    };

    const searchSizes = async (name: string) => {
        try {
            return await ProductSizeService.searchByName(name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search sizes');
            throw err;
        }
    };

    // Supplier Actions
    const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const newSupplier = await SupplierService.create(supplierData);
            await refreshData();
            return newSupplier;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create supplier');
            throw err;
        }
    };

    const updateSupplier = async (id: number, supplierData: Partial<Supplier>) => {
        try {
            const updatedSupplier = await SupplierService.update(id, supplierData);
            if (updatedSupplier) {
                await refreshData();
            }
            return updatedSupplier;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update supplier');
            throw err;
        }
    };

    const deleteSupplier = async (id: number) => {
        try {
            const result = await SupplierService.delete(id);
            if (result) {
                await refreshData();
            }
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete supplier');
            throw err;
        }
    };

    const searchSuppliers = async (name: string) => {
        try {
            return await SupplierService.searchByName(name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search suppliers');
            throw err;
        }
    };


    const value: ProductContextType = {
        // State
        products,
        productsWithRelations,
        categories,
        sizes,
        suppliers,
        loading,
        error,

        // Product Actions
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        searchProducts,
        getProductsByCategory,
        getLowStockProducts,
        updateProductStock,
        updateProductSold,

        // Category Actions
        createCategory,
        updateCategory,
        deleteCategory,
        searchCategories,

        // Size Actions
        createSize,
        updateSize,
        deleteSize,
        searchSizes,

        // Supplier Actions
        createSupplier,
        updateSupplier,
        deleteSupplier,
        searchSuppliers,


        // Utility
        refreshData,
        clearError,
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
