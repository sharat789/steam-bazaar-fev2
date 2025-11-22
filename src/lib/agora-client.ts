import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";

// Create Agora client instance
export const createAgoraClient = (): IAgoraRTCClient => {
  return AgoraRTC.createClient({
    mode: "live", // Use "live" mode for live streaming
    codec: "vp8", // Use VP8 codec for better browser compatibility
  });
};

// Set client role (host can publish, audience can only subscribe)
export const setClientRole = async (
  client: IAgoraRTCClient,
  role: "host" | "audience"
) => {
  await client.setClientRole(role);
};

export default AgoraRTC;
