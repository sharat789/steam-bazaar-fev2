"use client";

import { useState, useEffect, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { createAgoraClient, setClientRole } from "@/src/lib/agora-client";
import { AgoraStreamToken } from "@/src/types/session";

export const useAgoraViewer = () => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<IRemoteVideoTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<IRemoteAudioTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Agora client
  useEffect(() => {
    const agoraClient = createAgoraClient();
    setClient(agoraClient);

    // Set up event listeners for remote users
    agoraClient.on("user-published", async (user, mediaType) => {
      console.log("User published:", user.uid, "Media type:", mediaType);

      // Subscribe to the remote user
      await agoraClient.subscribe(user, mediaType);
      console.log("Subscribed to user:", user.uid, mediaType);

      // If it's video, set the video track
      if (mediaType === "video") {
        setRemoteVideoTrack(user.videoTrack || null);
      }

      // If it's audio, set and play the audio track
      if (mediaType === "audio") {
        const audioTrack = user.audioTrack;
        setRemoteAudioTrack(audioTrack || null);
        if (audioTrack) {
          audioTrack.play();
        }
      }

      // Update remote users list
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid);
        if (exists) {
          return prev.map((u) => (u.uid === user.uid ? user : u));
        }
        return [...prev, user];
      });
    });

    agoraClient.on("user-unpublished", (user, mediaType) => {
      console.log("User unpublished:", user.uid, mediaType);

      if (mediaType === "video") {
        setRemoteVideoTrack(null);
      }

      if (mediaType === "audio") {
        setRemoteAudioTrack(null);
      }
    });

    agoraClient.on("user-left", (user) => {
      console.log("User left:", user.uid);
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      setRemoteVideoTrack(null);
      setRemoteAudioTrack(null);
    });

    return () => {
      agoraClient.removeAllListeners();
      leaveChannel();
    };
  }, []);

  // Join channel as audience (subscriber)
  const joinAsAudience = useCallback(
    async (tokenData: AgoraStreamToken) => {
      if (!client) {
        setError("Agora client not initialized");
        return;
      }

      try {
        setError(null);

        console.log("Setting client role to audience...");
        // Set client role to audience (viewer)
        await setClientRole(client, "audience");

        console.log("Joining channel as audience:", {
          appId: tokenData.appId,
          channelName: tokenData.channelName,
          uid: tokenData.uid,
        });

        // Join the channel
        await client.join(
          tokenData.appId,
          tokenData.channelName,
          tokenData.token,
          tokenData.uid || 0 // Use 0 for anonymous viewers
        );

        console.log(
          "Successfully joined channel as audience. Connection state:",
          client.connectionState
        );
        setIsJoined(true);
      } catch (err) {
        console.error("Error joining channel as audience:", err);
        setError(
          err instanceof Error ? err.message : "Failed to join channel"
        );
        throw err;
      }
    },
    [client]
  );

  // Leave channel
  const leaveChannel = useCallback(async () => {
    if (!client) return;

    try {
      if (isJoined) {
        // Stop playing remote audio
        if (remoteAudioTrack) {
          remoteAudioTrack.stop();
        }

        await client.leave();
        setIsJoined(false);
        setRemoteUsers([]);
        setRemoteVideoTrack(null);
        setRemoteAudioTrack(null);
        console.log("Left channel");
      }
    } catch (err) {
      console.error("Error leaving channel:", err);
      setError(err instanceof Error ? err.message : "Failed to leave channel");
    }
  }, [client, isJoined, remoteAudioTrack]);

  return {
    client,
    remoteUsers,
    remoteVideoTrack,
    remoteAudioTrack,
    isJoined,
    error,
    joinAsAudience,
    leaveChannel,
  };
};
