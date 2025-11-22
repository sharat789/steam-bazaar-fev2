"use client";

import { sessionService } from "@/src/services/session.service";
import { productService } from "@/src/services/product.service";
import { Session } from "@/src/types/session";
import { Product } from "@/src/types/product";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { FormField, FormButtons } from "@/src/components/form";
import Modal from "@/src/components/modal";

export default function SessionsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // Unwrap params Promise for Next.js 15+
  const { username: paramsUsername } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionService.getAll();
      // Ensure response is an array
      setSessions(Array.isArray(response) ? response : []);
    } catch (error) {
      setError("Failed to fetch sessions");
      console.error("Error fetching sessions:", error);
      setSessions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getAll();
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openCreateModal = () => {
    setCreateModal(true);
    setSelectedProductIds([]);
    fetchProducts();
  };

  const closeCreateModal = () => {
    setCreateModal(false);
    setSelectedProductIds([]);
  };

  // Safely filter sessions with null check
  const filteredSessions = Array.isArray(sessions)
    ? sessions.filter((session) => {
        if (filterStatus === "all") return true;
        return session.status === filterStatus;
      })
    : [];

  const handleCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const newSession: any = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      tags: (formData.get("tags") as string)
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };

    // Only add productIds if there are selected products
    if (selectedProductIds.length > 0) {
      // Ensure productIds are clean strings (not objects or nested arrays)
      newSession.productIds = selectedProductIds.map(id => String(id).trim());
    }

    console.log("Creating session with data:", JSON.stringify(newSession, null, 2));
    console.log("Selected product IDs:", selectedProductIds);
    console.log("Product IDs type check:", selectedProductIds.map(id => typeof id));

    try {
      const createdSession = await sessionService.create(newSession);
      console.log("Created session:", createdSession);

      // Check if session has an ID
      if (!createdSession || !createdSession.id) {
        console.error("Session created but no ID returned:", createdSession);
        alert(
          "Session created but couldn't navigate to it. Please refresh the page."
        );
        await fetchSessions(); // Refresh the list
        closeCreateModal();
        form.reset();
        return;
      }

      setSessions([createdSession, ...sessions]);
      closeCreateModal();
      form.reset();

      // Navigate to the session control page using the logged-in user's username
      const username = user?.username || paramsUsername;
      console.log(
        "Navigating to:",
        `/creator/${username}/sessions/${createdSession.id}`
      );
      router.push(`/creator/${username}/sessions/${createdSession.id}`);
    } catch (err: any) {
      console.error("Failed to create session:", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to create session: ${err.message || "Unknown error"}`);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      await sessionService.delete(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete session:", err);
      alert("Failed to delete session. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "#ef4444"; // red
      case "scheduled":
        return "#3b82f6"; // blue
      case "paused":
        return "#f59e0b"; // orange
      case "ended":
        return "#6b7280"; // gray
      default:
        return "#000";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Check if user is authenticated
  if (!isAuthenticated && !loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Authentication Required</h2>
        <p>Please log in to manage your sessions.</p>
        <button
          onClick={() => router.push("/login")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading sessions...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        {error}
        <button onClick={fetchSessions} style={{ marginLeft: "1rem" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Live Sessions</h1>
        <button
          onClick={openCreateModal}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Create New Session
        </button>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ marginRight: "1rem" }}>Filter by status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="all">All Sessions</option>
          <option value="live">Live</option>
          <option value="scheduled">Scheduled</option>
          <option value="paused">Paused</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      {filteredSessions.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontSize: "1.125rem", color: "#9ca3af" }}>
            {filterStatus === "all"
              ? "No sessions yet. Create your first session to get started!"
              : `No ${filterStatus} sessions found.`}
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
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              style={{
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                padding: "1.5rem",
                backgroundColor: "#1a1a1a",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 6px rgba(0, 0, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => {
                const username = user?.username || paramsUsername;
                router.push(`/creator/${username}/sessions/${session.id}`);
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "0.75rem",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#ffffff" }}>
                  {session.title}
                </h3>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: getStatusColor(session.status),
                  }}
                >
                  {getStatusLabel(session.status)}
                </span>
              </div>

              {session.description && (
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "0.875rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {session.description.length > 100
                    ? session.description.substring(0, 100) + "..."
                    : session.description}
                </p>
              )}

              {session.category && (
                <div style={{ marginBottom: "0.75rem" }}>
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
                    {session.category}
                  </span>
                </div>
              )}

              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e5e7eb",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                }}
              >
                <div>
                  Created: {new Date(session.createdAt).toLocaleDateString()}
                </div>
                {session.startedAt && (
                  <div>
                    Started: {new Date(session.startedAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    const username = user?.username || paramsUsername;
                    router.push(`/creator/${username}/sessions/${session.id}`);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  {session.status === "live" ? "Go Live" : "Manage"}
                </button>
                {session.status !== "live" && (
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={createModal}
        onClose={closeCreateModal}
        title="Create New Session"
        size="md"
      >
        <form onSubmit={handleCreateSession}>
          <FormField
            label="Title"
            name="title"
            type="text"
            required
            placeholder="Enter session title"
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            placeholder="Describe what your session is about..."
          />
          <FormField
            label="Category"
            name="category"
            type="text"
            placeholder="e.g., Gaming, Fashion, Tech, Cooking"
          />
          <FormField
            label="Tags (comma-separated)"
            name="tags"
            type="text"
            placeholder="e.g., live, shopping, deals"
          />

          {/* Product Selection */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Featured Products (Optional)
            </label>
            {loadingProducts ? (
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading products...</p>
            ) : products.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                No products available. <a href={`/creator/${user?.username}/products`} style={{ color: "#3b82f6" }}>Create products</a> first.
              </p>
            ) : (
              <div style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "0.5rem"
              }}>
                {products.map((product) => (
                  <label
                    key={product.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderRadius: "4px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds([...selectedProductIds, product.id]);
                        } else {
                          setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                        }
                      }}
                      style={{ marginRight: "0.75rem" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500", fontSize: "0.875rem" }}>{product.name}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>${product.price}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.5rem" }}>
              Selected: {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          <FormButtons
            onCancel={closeCreateModal}
            submitText="Create Session"
          />
        </form>
      </Modal>
    </div>
  );
}
