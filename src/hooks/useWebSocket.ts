"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage, Reaction, ReactionStats, WebSocketEvents } from "@/src/types/chat";
import { Product } from "@/src/types/product";
import { SessionConversionStats, TrendingProductsData } from "@/src/types/analytics";

interface UseWebSocketOptions {
  sessionId: string;
  userId?: number;
  userName?: string;
  onMessage?: (message: ChatMessage) => void;
  onReaction?: (reaction: Reaction) => void;
  onReactionStats?: (stats: ReactionStats) => void;
  onViewerCount?: (count: number) => void;
  onProductShowcased?: (data: { productId: string; product: Product }) => void;
  onShowcaseCleared?: () => void;
  onProductClickStats?: (stats: SessionConversionStats) => void;
  onTrendingProducts?: (data: TrendingProductsData) => void;
}

export const useWebSocket = ({
  sessionId,
  userId,
  userName,
  onMessage,
  onReaction,
  onReactionStats,
  onViewerCount,
  onProductShowcased,
  onShowcaseCleared,
  onProductClickStats,
  onTrendingProducts,
}: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Store callbacks in refs to prevent unnecessary reconnections
  const onMessageRef = useRef(onMessage);
  const onReactionRef = useRef(onReaction);
  const onReactionStatsRef = useRef(onReactionStats);
  const onViewerCountRef = useRef(onViewerCount);
  const onProductShowcasedRef = useRef(onProductShowcased);
  const onShowcaseClearedRef = useRef(onShowcaseCleared);
  const onProductClickStatsRef = useRef(onProductClickStats);
  const onTrendingProductsRef = useRef(onTrendingProducts);

  // Update refs when callbacks change (doesn't trigger reconnection)
  useEffect(() => {
    onMessageRef.current = onMessage;
    onReactionRef.current = onReaction;
    onReactionStatsRef.current = onReactionStats;
    onViewerCountRef.current = onViewerCount;
    onProductShowcasedRef.current = onProductShowcased;
    onShowcaseClearedRef.current = onShowcaseCleared;
    onProductClickStatsRef.current = onProductClickStats;
    onTrendingProductsRef.current = onTrendingProducts;
  }, [onMessage, onReaction, onReactionStats, onViewerCount, onProductShowcased, onShowcaseCleared, onProductClickStats, onTrendingProducts]);

  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3000";

    console.log("Connecting to WebSocket:", wsUrl);

    // Create socket connection
    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setError(null);

      // Join the session room
      console.log("Joining session:", sessionId);
      socket.emit("join-session", { sessionId, userId });
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setError("Failed to connect to chat server");
    });

    // Listen for messages
    socket.on("new-message", (message: ChatMessage) => {
      console.log("Received message:", message);
      onMessageRef.current?.(message);
    });

    // Listen for reactions
    socket.on("new-reaction", (reaction: Reaction) => {
      console.log("Received reaction:", reaction);
      onReactionRef.current?.(reaction);
    });

    // Listen for reaction stats
    socket.on("reaction-stats", (stats: ReactionStats) => {
      console.log("Received reaction stats:", stats);
      onReactionStatsRef.current?.(stats);
    });

    // Listen for viewer count updates
    socket.on("viewer-count", (count: number) => {
      console.log("Viewer count:", count);
      onViewerCountRef.current?.(count);
    });

    // Listen for product showcase events
    socket.on("product-showcased", (data: { sessionId: string; productId: string; product: Product }) => {
      console.log("Product showcased:", data);
      onProductShowcasedRef.current?.({ productId: data.productId, product: data.product });
    });

    socket.on("showcase-cleared", (data: { sessionId: string }) => {
      console.log("Showcase cleared:", data);
      onShowcaseClearedRef.current?.();
    });

    // Listen for product click stats (creator only)
    socket.on("product-click-stats", (stats: SessionConversionStats) => {
      console.log("Received product click stats:", stats);
      onProductClickStatsRef.current?.(stats);
    });

    // Listen for trending products (viewer)
    socket.on("trending-products", (data: TrendingProductsData) => {
      console.log("Received trending products:", data);
      onTrendingProductsRef.current?.(data);
    });

    // Cleanup on unmount
    return () => {
      console.log("Leaving session:", sessionId);
      socket.emit("leave-session", sessionId);
      socket.disconnect();
    };
  }, [sessionId, userId]);

  // Handle page unload/refresh for cleaner session cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-session", sessionId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionId]);

  // Send a chat message
  const sendMessage = useCallback(
    (message: string) => {
      if (!socketRef.current || !isConnected) {
        console.warn("WebSocket not connected");
        return false;
      }

      if (!message.trim()) {
        console.warn("Cannot send empty message");
        return false;
      }

      if (!userId || !userName) {
        console.warn("User ID and name required to send messages");
        return false;
      }

      console.log("Sending message:", message);
      socketRef.current.emit("send-message", {
        sessionId,
        message: message.trim(),
        userId,
        userName,
      });

      return true;
    },
    [isConnected, sessionId, userId, userName]
  );

  // Send a reaction
  const sendReaction = useCallback(
    (type: string) => {
      if (!socketRef.current || !isConnected) {
        console.warn("WebSocket not connected");
        return false;
      }

      console.log("Sending reaction:", type);
      socketRef.current.emit("send-reaction", {
        sessionId,
        type,
      });

      return true;
    },
    [isConnected, sessionId]
  );

  // Showcase a product
  const sendShowcase = useCallback(
    (productId: string | null) => {
      if (!socketRef.current || !isConnected) {
        console.warn("WebSocket not connected");
        return false;
      }

      console.log("Showcasing product:", productId);
      socketRef.current.emit("showcase-product", {
        sessionId,
        productId,
      });

      return true;
    },
    [isConnected, sessionId]
  );

  // Track product click
  const sendProductClick = useCallback(
    (productId: string) => {
      if (!socketRef.current || !isConnected) {
        console.warn("WebSocket not connected");
        return false;
      }

      if (!userId) {
        console.warn("User ID required to track product clicks");
        return false;
      }

      console.log("Tracking product click:", { productId, userId });
      socketRef.current.emit("track-product-click", {
        sessionId,
        productId,
        userId,
      });

      return true;
    },
    [isConnected, sessionId, userId]
  );

  return {
    isConnected,
    error,
    sendMessage,
    sendReaction,
    sendShowcase,
    sendProductClick,
  };
};
