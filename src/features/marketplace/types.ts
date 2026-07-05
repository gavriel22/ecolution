export type ProductStatus = "AVAILABLE" | "OUT_OF_STOCK" | "INACTIVE";
export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export interface ProductImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProductMerchant {
  id: string;
  businessName: string;
  logoUrl: string | null;
  status: string;
  ownerId: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  imageThumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  merchant?: ProductMerchant;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    imageThumbnail: string | null;
    merchant?: {
      id: string;
      businessName: string;
    };
  };
}

export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: OrderStatus;
  note: string | null;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  merchantId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateProductPayload {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageThumbnail?: string | null;
  images?: string[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  imageThumbnail?: string | null;
  images?: string[];
  status?: ProductStatus;
}

export interface CheckoutPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
  note?: string | null;
  voucherRedemptionId?: string | null;
}
