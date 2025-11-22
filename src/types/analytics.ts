/**
 * Analytics and Conversion Tracking Types
 */

export interface ProductClick {
  productId: string;
  userId: number;
  sessionId: string;
  timestamp: Date;
}

export interface ProductConversionStats {
  productId: string;
  productName: string;
  uniqueClicks: number;
  totalClicks: number;
  conversionRate: number; // (uniqueClicks / totalViewers) × 100
}

export interface SessionConversionStats {
  sessionId: string;
  totalViewers: number;
  productStats: ProductConversionStats[];
  updatedAt: Date;
}

export interface TrendingProduct {
  productId: string;
  productName: string;
  clickCount: number;
  rank: number; // 1 = most clicked, 2 = second most, etc.
}

export interface TrendingProductsData {
  sessionId: string;
  trending: TrendingProduct[];
  totalViewers: number;
}

/**
 * Global Analytics Types (Creator Dashboard)
 */

export interface SessionSummary {
  total: number;
  byStatus: {
    live: number;
    ended: number;
    scheduled: number;
    paused: number;
  };
}

export interface ViewerMetrics {
  totalUnique: number;
  averagePerSession: number;
  peakConcurrent: number;
}

export interface ReactionBreakdown {
  [key: string]: number; // e.g., { heart: 2100, like: 1800, fire: 900, clap: 630 }
}

export interface ReactionMetrics {
  total: number;
  breakdown: ReactionBreakdown;
}

export interface ProductMetrics {
  totalClicks: number;
  uniqueUsers: number;
  averageCTR: number; // Click-through rate
}

export interface GlobalAnalytics {
  creatorId: number;
  sessions: SessionSummary;
  viewers: ViewerMetrics;
  reactions: ReactionMetrics;
  products: ProductMetrics;
}
