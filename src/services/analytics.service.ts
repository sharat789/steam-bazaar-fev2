import apiClient from "../lib/api-client";
import { GlobalAnalytics } from "../types/analytics";

export const analyticsService = {
  // Get global analytics for a creator
  getCreatorAnalytics: async (creatorId: number): Promise<GlobalAnalytics> => {
    const response = await apiClient.get(`/analytics/creator/${creatorId}`);
    return response.data.data || response.data;
  },
};
