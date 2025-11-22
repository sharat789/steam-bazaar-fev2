"use client";
import { productService } from "@/src/services/product.service";
import { Product } from "@/src/types/product";
import { useEffect, useState } from "react";
import Modal from "@/src/components/modal";
import { FormField, FormButtons } from "@/src/components/form";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addProductModal, setAddProductModal] = useState(false);
  const [editProductModal, setEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getAll();
        setProducts(response);
      } catch (error) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productService.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newProduct = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      inStock: formData.get("inStock") === "on",
      imageUrl: formData.get("imageUrl") as string,
    };

    try {
      const createdProduct = await productService.create(newProduct);
      setProducts([...products, createdProduct]);
      setAddProductModal(false);
      form.reset();
    } catch (err) {
      console.error("Failed to create product:", err);
      alert("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const updatedProduct = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      inStock: formData.get("inStock") === "on",
      imageUrl: formData.get("imageUrl") as string,
    };

    try {
      const savedProduct = await productService.update(
        selectedProduct.id,
        updatedProduct
      );
      setProducts(
        products.map((p) => (p.id === selectedProduct.id ? savedProduct : p))
      );
      setEditProductModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Products</h1>

      <div style={{ marginBottom: "1rem", marginTop: "2rem" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Clothing">Clothing</option>
        </select>
        <button
          onClick={() => setAddProductModal(true)}
          style={{ padding: "0.5rem 1rem" }}
        >
          Add Product
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {filteredProducts.map((product) => (
            <li key={product.id} style={{ marginBottom: "1rem" }}>
              <strong>{product.name}</strong> - ${product.price}{" "}
              {product.category && <em>({product.category})</em>}
              <button
                onClick={() => openEditModal(product)}
                style={{ marginLeft: "1rem", color: "blue" }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                style={{ marginLeft: "1rem", color: "red" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={addProductModal}
        onClose={() => !isSubmitting && setAddProductModal(false)}
        title="Add New Product"
        size="md"
      >
        <form onSubmit={handleSaveProduct}>
          <FormField
            label="Name"
            name="name"
            type="text"
            required
            placeholder="Enter product name"
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            required
            placeholder="Describe your product..."
          />
          <FormField
            label="Price"
            name="price"
            type="number"
            required
            step="0.01"
            placeholder="0.00"
          />
          <FormField
            label="Category"
            name="category"
            type="text"
            placeholder="e.g., Electronics, Books, Clothing"
          />
          <FormField
            label="Image URL"
            name="imageUrl"
            type="text"
            placeholder="https://example.com/image.jpg"
          />
          <FormField
            label="In Stock"
            name="inStock"
            type="checkbox"
            defaultValue={true}
          />
          <FormButtons
            onCancel={() => setAddProductModal(false)}
            submitText="Save Product"
            isSubmitting={isSubmitting}
          />
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={editProductModal}
        onClose={() => !isSubmitting && setEditProductModal(false)}
        title="Edit Product"
        size="md"
      >
        {selectedProduct && (
          <form onSubmit={handleEditProduct}>
            <FormField
              label="Name"
              name="name"
              type="text"
              required
              defaultValue={selectedProduct.name}
            />
            <FormField
              label="Description"
              name="description"
              type="textarea"
              required
              defaultValue={selectedProduct.description}
            />
            <FormField
              label="Price"
              name="price"
              type="number"
              required
              step="0.01"
              defaultValue={selectedProduct.price}
            />
            <FormField
              label="Category"
              name="category"
              type="text"
              defaultValue={selectedProduct.category || ""}
            />
            <FormField
              label="Image URL"
              name="imageUrl"
              type="text"
              defaultValue={selectedProduct.imageUrl || ""}
            />
            <FormField
              label="In Stock"
              name="inStock"
              type="checkbox"
              defaultValue={selectedProduct.inStock}
            />
            <FormButtons
              onCancel={() => {
                setEditProductModal(false);
                setSelectedProduct(null);
              }}
              submitText="Update Product"
              isSubmitting={isSubmitting}
            />
          </form>
        )}
      </Modal>
    </div>
  );
}
