export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category?: string;
  inStock?: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
