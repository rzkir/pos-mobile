interface Product {
  id: number;
  uid: string;
  name: string;
  price: number;
  modal: number;
  stock: number;
  sold: number;
  unit: string;
  image_url?: string;
  barcode: string;
  is_active: boolean;
  min_stock: number;
  discount: number;
  description?: string;
  category_id?: number;
  size_id?: number;
  supplier_id?: number;
  expiration_date?: string;
  created_at: string;
  updated_at: string;
}

type ProductWithRelations = Product & {
  product_categories?: ProductCategory | null;
  product_sizes?: ProductSize | null;
  suppliers?: Supplier | null;
};

interface ProductCategory {
  id: number;
  uid: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductSize {
  id: number;
  uid: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductDetailsViewKaryawanProps {
  product: Product;
  categories: ProductCategory[];
  sizes: ProductSize[];
  suppliers: Supplier[];
  onClose: () => void;
}

interface ProductDetailsViewProps {
  product: Product;
  categories: ProductCategory[];
  sizes: ProductSize[];
  suppliers: Supplier[];
  onClose: () => void;
  onEdit: (product: Product) => void;
}

type ManagementSectionProps = {
  categoryCount: number;
  sizeCount: number;
  supplierCount: number;
  productCount: number;
  onNavigateToCategory: () => void;
  onNavigateToSize: () => void;
  onNavigateToSupplier: () => void;
};
