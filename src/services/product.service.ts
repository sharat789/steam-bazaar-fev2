import apiClient from "../lib/api-client";
import { Product } from "../types/product";

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  originalPrice?: number;
  inStock?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  inStock?: boolean;
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get("/products");
    console.log("Fetched products:", response.data);
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post("/products", data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
