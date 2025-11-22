import apiClient from "../lib/api-client";
import {
  Session,
  SessionWithCreator,
  CreateSessionDto,
  UpdateSessionDto,
  UpdateSessionStatusDto,
  StartStreamResponse,
  AgoraStreamToken,
} from "../types/session";

export const sessionService = {
  // Get all sessions
  getAll: async (creatorId?: string): Promise<Session[]> => {
    const url = creatorId ? `/sessions?creatorId=${creatorId}` : "/sessions";
    const response = await apiClient.get(url);
    return response.data.data || []; // Extract data array from response
  },

  // Get session by ID
  getById: async (id: string): Promise<SessionWithCreator> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data.data || response.data; // Handle both response formats
  },

  // Create new session
  create: async (data: CreateSessionDto): Promise<Session> => {
    try {
      console.log("Sending session create request with data:", JSON.stringify(data, null, 2));
      const response = await apiClient.post("/sessions", data);
      console.log("Session create full response:", response);
      console.log("Session create response.data:", response.data);

      // Handle different response formats
      if (response.data.data) {
        console.log("Using response.data.data format");
        return response.data.data;
      } else if (response.data.success && response.data.session) {
        console.log("Using response.data.session format");
        return response.data.session;
      } else if (response.data.id) {
        console.log("Using response.data format (direct session)");
        return response.data;
      } else {
        console.error("Unexpected session create response format:", response.data);
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("Error creating session:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  // Update session
  update: async (id: string, data: UpdateSessionDto): Promise<Session> => {
    const response = await apiClient.put(`/sessions/${id}`, data);
    return response.data.data || response.data; // Handle both response formats
  },

  // Update session status
  updateStatus: async (
    id: string,
    data: UpdateSessionStatusDto
  ): Promise<Session> => {
    const response = await apiClient.patch(`/sessions/${id}/status`, data);
    return response.data.data || response.data; // Handle both response formats
  },

  // Delete session
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sessions/${id}`);
  },

  // Start live stream (get Agora token for publisher)
  startStream: async (id: string): Promise<AgoraStreamToken> => {
    const response = await apiClient.post<StartStreamResponse>(
      `/sessions/${id}/start-stream`
    );
    return response.data.data;
  },

  // End live stream
  endStream: async (id: string): Promise<void> => {
    await apiClient.post(`/sessions/${id}/end-stream`);
  },

  // Get stream token for viewers (subscriber)
  getStreamToken: async (id: string): Promise<AgoraStreamToken> => {
    const response = await apiClient.get(`/sessions/${id}/stream-token`);
    return response.data.data;
  },
};
