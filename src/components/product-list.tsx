"use client";

import { Product } from "@/src/types/product";
import { ProductConversionStats, TrendingProduct } from "@/src/types/analytics";

interface ProductListProps {
  products: Product[];
  activeProductId?: string | null;
  showShowcaseControls?: boolean;
  onShowcase?: (productId: string) => void;
  onClearShowcase?: () => void;
  // Conversion tracking
  isCreator?: boolean;
  conversionStats?: ProductConversionStats[];
  trendingProducts?: TrendingProduct[];
  onProductClick?: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  activeProductId,
  showShowcaseControls = false,
  onShowcase,
  onClearShowcase,
  isCreator = false,
  conversionStats = [],
  trendingProducts = [],
  onProductClick,
}) => {
  // Helper: Get conversion stats for a specific product
  const getProductStats = (productId: string): ProductConversionStats | undefined => {
    const stats = conversionStats.find((stat) => stat.productId === productId);
    if (stats) {
      console.log("Product stats for", productId, ":", stats);
    }
    return stats;
  };

  // Helper: Get trending rank for a product
  const getTrendingRank = (productId: string): number | null => {
    const trending = trendingProducts.find((t) => t.productId === productId);
    return trending ? trending.rank : null;
  };

  // Helper: Handle product click
  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };
  if (!products || products.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          color: "#6b7280",
        }}
      >
        <div style={{ fontSize: "3rem" }}>🛍️</div>
        <div style={{ fontSize: "1.125rem", fontWeight: "600" }}>
          No Products Featured
        </div>
        <div style={{ fontSize: "0.875rem", textAlign: "center" }}>
          Products will appear here during the stream
        </div>
      </div>
    );
  }

  const activeProduct = products.find((p) => p.id === activeProductId);
  const otherProducts = products.filter((p) => p.id !== activeProductId);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Active Product Section */}
      {activeProduct && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#1a1a1a",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "#ef4444",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Now Showcasing
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#2a2a2a",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid #ef4444",
            }}
          >
            {activeProduct.imageUrl && (
              <div
                style={{
                  width: "100%",
                  height: "150px",
                  backgroundColor: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={activeProduct.imageUrl}
                  alt={activeProduct.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <div style={{ padding: "1rem" }}>
              <h4
                style={{
                  margin: 0,
                  marginBottom: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {activeProduct.name}
              </h4>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#10b981",
                  marginBottom: "0.5rem",
                }}
              >
                ${Number(activeProduct.price).toFixed(2)}
              </div>
              {activeProduct.description && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                    lineHeight: "1.4",
                    marginBottom: "0.75rem",
                  }}
                >
                  {activeProduct.description}
                </p>
              )}

              {/* Conversion Stats (Creator Only) */}
              {isCreator && (() => {
                const stats = getProductStats(activeProduct.id);
                if (stats) {
                  const uniqueClicks = stats.uniqueClicks ?? 0;
                  const conversionRate = typeof stats.conversionRate === 'number'
                    ? stats.conversionRate
                    : parseFloat(stats.conversionRate as any) || 0;

                  return (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem",
                        backgroundColor: "#0a0a0a",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                      }}
                    >
                      <div style={{ marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: "600" }}>
                          {uniqueClicks} click{uniqueClicks !== 1 ? "s" : ""}
                        </span>
                        {" • "}
                        <span style={{ color: "#10b981", fontWeight: "600" }}>
                          {conversionRate.toFixed(1)}% conversion
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Visit Store Button */}
              {onProductClick && (
                <button
                  onClick={() => handleProductClick(activeProduct.id)}
                  style={{
                    width: "100%",
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#10b981";
                  }}
                >
                  🛒 Visit Store
                </button>
              )}
            </div>
          </div>

          {showShowcaseControls && onClearShowcase && (
            <button
              onClick={onClearShowcase}
              style={{
                width: "100%",
                marginTop: "0.75rem",
                padding: "0.5rem",
                backgroundColor: "#374151",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              Clear Showcase
            </button>
          )}
        </div>
      )}

      {/* All Products List */}
      <div
        style={{
          padding: "1rem",
          flex: 1,
        }}
      >
        <h4
          style={{
            margin: 0,
            marginBottom: "0.75rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {activeProduct ? "All Featured Products" : "Featured Products"}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {(activeProduct ? otherProducts : products).map((product) => {
            const stats = getProductStats(product.id);
            const trendingRank = getTrendingRank(product.id);
            const isTrending = trendingRank !== null && trendingRank <= 3;

            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: isTrending ? "1px solid #fbbf24" : "1px solid #2a2a2a",
                  transition: "border-color 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isTrending) {
                    e.currentTarget.style.borderColor = "#3a3a3a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTrending) {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                  }
                }}
              >
                {/* Trending Badge (Viewer Only) */}
                {!isCreator && isTrending && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      backgroundColor: "#fbbf24",
                      color: "#000000",
                      fontSize: "0.625rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      zIndex: 1,
                    }}
                  >
                    🔥 Trending #{trendingRank}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    padding: "0.75rem",
                    gap: "0.75rem",
                  }}
                >
                  {product.imageUrl && (
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "#0a0a0a",
                        borderRadius: "6px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#ffffff",
                        marginBottom: "0.25rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "700",
                        color: "#10b981",
                        marginBottom: "0.25rem",
                      }}
                    >
                      ${Number(product.price).toFixed(2)}
                    </div>

                    {/* Conversion Stats (Creator Only) */}
                    {isCreator && stats && (() => {
                      const uniqueClicks = stats.uniqueClicks ?? 0;
                      const conversionRate = typeof stats.conversionRate === 'number'
                        ? stats.conversionRate
                        : parseFloat(stats.conversionRate as any) || 0;

                      return (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#6b7280",
                            marginTop: "0.25rem",
                          }}
                        >
                          <span style={{ fontWeight: "600" }}>
                            {uniqueClicks} click{uniqueClicks !== 1 ? "s" : ""}
                          </span>
                          {" • "}
                          <span style={{ color: "#10b981" }}>
                            {conversionRate.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Visit Store Button */}
                {onProductClick && (
                  <button
                    onClick={() => handleProductClick(product.id)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      borderTop: "1px solid #2a2a2a",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#10b981";
                    }}
                  >
                    🛒 Visit Store
                  </button>
                )}

                {/* Showcase Controls (Creator Only) */}
                {showShowcaseControls && onShowcase && (
                  <button
                    onClick={() => onShowcase(product.id)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      border: "none",
                      borderTop: "1px solid #2a2a2a",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#3b82f6";
                    }}
                  >
                    Showcase Now
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
