export interface GuestCartItem {
  productId: string;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image?: string;
  stock: number;
}

export interface GuestWishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image?: string;
  stock: number;
}

export type ProductSnapshot = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  stock: number;
};
