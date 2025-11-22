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
    return (
      <div style={{ padding: "2rem", color: "#9ca3af" }}>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          backgroundColor: "#7f1d1d",
          color: "#fca5a5",
          borderRadius: "8px",
          margin: "2rem",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>Products</h1>
        <p style={{ color: "#9ca3af" }}>
          Manage your product catalog for live streaming sessions
        </p>
      </div>

      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "0.75rem",
            backgroundColor: "#2a2a2a",
            border: "1px solid #3a3a3a",
            borderRadius: "6px",
            color: "#ffffff",
            fontSize: "0.875rem",
            outline: "none",
            minWidth: "250px",
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "0.75rem",
            backgroundColor: "#2a2a2a",
            border: "1px solid #3a3a3a",
            borderRadius: "6px",
            color: "#ffffff",
            fontSize: "0.875rem",
            outline: "none",
          }}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Clothing">Clothing</option>
        </select>
        <button
          onClick={() => setAddProductModal(true)}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          + Add Product
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <h2 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>
            No Products Found
          </h2>
          <p style={{ color: "#9ca3af" }}>
            {searchQuery || filterCategory !== "All"
              ? "Try adjusting your search or filters"
              : "Add your first product to get started"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#ffffff",
                    fontSize: "1.125rem",
                  }}
                >
                  {product.name}
                </h3>
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                  }}
                >
                  {product.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      color: "#10b981",
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                    }}
                  >
                    ${Number(product.price).toFixed(2)}
                  </span>
                  {product.category && (
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#2a2a2a",
                        border: "1px solid #3a3a3a",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        color: "#e5e7eb",
                      }}
                    >
                      {product.category}
                    </span>
                  )}
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: product.inStock ? "#065f46" : "#7f1d1d",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      color: "#ffffff",
                    }}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}
              >
                <button
                  onClick={() => openEditModal(product)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    backgroundColor: "#374151",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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
