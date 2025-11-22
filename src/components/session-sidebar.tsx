"use client";

import { useState } from "react";
import { Chat } from "./chat";
import { ReactionStats } from "./reaction-stats";
import { ProductList } from "./product-list";
import { ReactionStats as ReactionStatsType, ChatMessage } from "@/src/types/chat";
import { Product } from "@/src/types/product";
import { SessionConversionStats, TrendingProductsData } from "@/src/types/analytics";

interface SessionSidebarProps {
  sessionId: string;
  isLive: boolean;
  isPaused: boolean;
  reactionStats?: ReactionStatsType | null;
  showStats?: boolean; // Optional, defaults to true for creator
  products?: Product[];
  activeProductId?: string | null;
  showShowcaseControls?: boolean;
  onShowcase?: (productId: string) => void;
  onClearShowcase?: () => void;
  // WebSocket state and methods
  messages: ChatMessage[];
  viewerCount: number;
  isConnected: boolean;
  wsError: string | null;
  onSendMessage: (message: string) => boolean;
  // Conversion tracking
  isCreator?: boolean;
  conversionStats?: SessionConversionStats | null;
  trendingProducts?: TrendingProductsData | null;
  onProductClick?: (productId: string) => void;
}

type TabType = "chat" | "products" | "stats";

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessionId,
  isLive,
  isPaused,
  reactionStats,
  showStats = true,
  products = [],
  activeProductId,
  showShowcaseControls = false,
  onShowcase,
  onClearShowcase,
  messages,
  viewerCount,
  isConnected,
  wsError,
  onSendMessage,
  isCreator = false,
  conversionStats,
  trendingProducts,
  onProductClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  // Only show sidebar when stream is live or paused
  if (!isLive && !isPaused) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "products", label: "Products", icon: "🛍️" },
    ...(showStats ? [{ id: "stats" as TabType, label: "Stats", icon: "📊" }] : []),
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#0a0a0a",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #2a2a2a",
      }}
    >
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: activeTab === tab.id ? "#2a2a2a" : "transparent",
              color: activeTab === tab.id ? "#ffffff" : "#9ca3af",
              border: "none",
              borderBottom:
                activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: activeTab === tab.id ? "600" : "400",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "chat" && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Chat
              sessionId={sessionId}
              messages={messages}
              viewerCount={viewerCount}
              isConnected={isConnected}
              error={wsError}
              onSendMessage={onSendMessage}
            />
          </div>
        )}

        {activeTab === "products" && (
          <ProductList
            products={products}
            activeProductId={activeProductId}
            showShowcaseControls={showShowcaseControls}
            onShowcase={onShowcase}
            onClearShowcase={onClearShowcase}
            isCreator={isCreator}
            conversionStats={conversionStats?.productStats || []}
            trendingProducts={trendingProducts?.trending || []}
            onProductClick={onProductClick}
          />
        )}

        {activeTab === "stats" && showStats && (
          <div
            style={{
              flex: 1,
              padding: "1.5rem",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: "1rem",
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Live Reactions
            </h3>
            <ReactionStats stats={reactionStats ?? null} />
          </div>
        )}
      </div>
    </div>
  );
};
