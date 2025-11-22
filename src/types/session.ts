import { Product } from "./product";

export type SessionStatus = "scheduled" | "live" | "paused" | "ended";

export interface Session {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: SessionStatus;
  creatorId: string;
  agoraChannelName?: string;
  streamUrl?: string;
  streamKey?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
  activeProductId?: string | null;
  activeProduct?: Product | null;
}

export interface SessionWithCreator extends Session {
  creator: {
    id: string;
    username: string;
    email: string;
  };
}

export interface AgoraStreamToken {
  sessionId: string;
  channelName: string;
  token: string;
  uid: number;
  appId: string;
  expiresAt: string;
  role: "publisher" | "subscriber";
}

export interface StartStreamResponse {
  success: boolean;
  message: string;
  data: AgoraStreamToken;
}

export interface CreateSessionDto {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  productIds?: string[];
}

export interface UpdateSessionDto {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateSessionStatusDto {
  status: SessionStatus;
}
