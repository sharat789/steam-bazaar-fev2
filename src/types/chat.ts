export interface ChatMessage {
  id: string;
  message: string;
  userId: number;
  userName: string;
  sessionId: string;
  createdAt: string | Date;
}

export interface Reaction {
  type: string;
  timestamp: Date;
  userId?: number;
}

export type ReactionType = "like" | "love" | "fire" | "clap" | "heart" | "wow";

export interface ReactionStats {
  sessionId: string;
  percentages: Record<ReactionType, number>;
  total: number;
}

export interface ReactionConfig {
  type: ReactionType;
  emoji: string;
  label: string;
}

export interface WebSocketEvents {
  // Client to Server
  "join-session": {
    sessionId: string;
    userId?: number;
  };
  "leave-session": string; // sessionId
  "send-message": {
    sessionId: string;
    message: string;
    userId: number;
    userName: string;
  };
  "send-reaction": {
    sessionId: string;
    type: ReactionType;
  };
  "track-product-click": {
    sessionId: string;
    productId: string;
    userId: number;
  };

  // Server to Client
  "viewer-count": number;
  "new-message": ChatMessage;
  "new-reaction": Reaction;
  "reaction-stats": ReactionStats;
  "product-click-stats": import("./analytics").SessionConversionStats;
  "trending-products": import("./analytics").TrendingProductsData;
}
