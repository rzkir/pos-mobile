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
  sku: string;
  min_stock: number;
  discount: number;
  description?: string;
  category_id?: number;
  size_id?: number;
  supplier_id?: number;
  expiration_date?: string;
  tax: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductSize {
  id: number;
  name: string;
  description?: string;
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
