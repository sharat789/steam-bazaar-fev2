export interface User {
  id: string;
  username: string;
  email: string;
  role: "viewer" | "creator";
  createdAt: string;
  updatedAt: string;
}

export interface LiveUser extends User {
  liveSession: {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    status: "live";
    startedAt: string;
    agoraChannelName: string;
  } | null;
}

export interface LiveUsersResponse {
  success: boolean;
  data: LiveUser[];
  count: number;
}
