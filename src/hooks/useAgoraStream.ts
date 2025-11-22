"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { AgoraStreamToken } from "@/src/types/session";

interface UseAgoraStreamOptions {
  onUserJoined?: (uid: number) => void;
  onUserLeft?: (uid: number) => void;
}

export const useAgoraStream = (options?: UseAgoraStreamOptions) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agoraRTC, setAgoraRTC] = useState<
    typeof import("agora-rtc-sdk-ng").default | null
  >(null);

  // Initialize Agora client (client-side only)
  useEffect(() => {
    let agoraClient: IAgoraRTCClient | null = null;

    const initAgora = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        setAgoraRTC(AgoraRTC);

        const { createAgoraClient, setClientRole } = await import(
          "@/src/lib/agora-client"
        );
        agoraClient = createAgoraClient();
        setClient(agoraClient);

        // Set up event listeners
        if (options?.onUserJoined) {
          agoraClient.on("user-joined", (user) => {
            options.onUserJoined?.(user.uid as number);
          });
        }

        if (options?.onUserLeft) {
          agoraClient.on("user-left", (user) => {
            options.onUserLeft?.(user.uid as number);
          });
        }
      } catch (err) {
        console.error("Error initializing Agora:", err);
        setError("Failed to initialize Agora SDK");
      }
    };

    initAgora();

    return () => {
      // Cleanup on unmount
      agoraClient?.removeAllListeners();
      if (agoraClient && (isJoined || isPublishing)) {
        leaveChannel();
      }
    };
  }, []);

  // Join channel as host (publisher)
  const joinAsHost = useCallback(
    async (tokenData: AgoraStreamToken) => {
      if (!client) {
        setError("Agora client not initialized");
        return;
      }

      try {
        setError(null);

        console.log("Setting client role to host...");
        // Set client role to host
        const { setClientRole } = await import("@/src/lib/agora-client");
        await setClientRole(client, "host");

        console.log("Joining channel with:", {
          appId: tokenData.appId,
          channelName: tokenData.channelName,
          uid: tokenData.uid,
        });

        // Join the channel
        await client.join(
          tokenData.appId,
          tokenData.channelName,
          tokenData.token,
          tokenData.uid
        );

        console.log(
          "Successfully joined channel. Connection state:",
          client.connectionState
        );
        setIsJoined(true);
      } catch (err) {
        console.error("Error joining channel as host:", err);
        setError(err instanceof Error ? err.message : "Failed to join channel");
        throw err;
      }
    },
    [client]
  );

  // Create and publish local tracks
  const startPublishing = useCallback(async () => {
    if (!client || !agoraRTC) {
      setError("Agora client not initialized");
      return;
    }

    // Check actual connection state instead of relying on state
    if (client.connectionState !== "CONNECTED") {
      console.error("Client connection state:", client.connectionState);
      setError(
        "Must join channel before publishing. Connection state: " +
          client.connectionState
      );
      return;
    }

    try {
      setError(null);

      console.log("Creating camera and microphone tracks...");
      // Create camera and microphone tracks
      const [videoTrack, audioTrack] = await Promise.all([
        agoraRTC.createCameraVideoTrack(),
        agoraRTC.createMicrophoneAudioTrack(),
      ]);

      console.log("Tracks created successfully");
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      // Publish tracks to the channel
      console.log("Publishing tracks to channel...");
      await client.publish([videoTrack, audioTrack]);
      setIsPublishing(true);

      console.log("Successfully publishing video and audio");
    } catch (err) {
      console.error("Error starting publishing:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start publishing"
      );
      throw err;
    }
  }, [client, agoraRTC]);

  // Stop publishing (mute/pause)
  const stopPublishing = useCallback(async () => {
    if (!client || !isPublishing) return;

    try {
      // Unpublish tracks
      if (localVideoTrack && localAudioTrack) {
        await client.unpublish([localVideoTrack, localAudioTrack]);
      }

      // Close tracks
      localVideoTrack?.close();
      localAudioTrack?.close();

      setLocalVideoTrack(null);
      setLocalAudioTrack(null);
      setIsPublishing(false);

      console.log("Stopped publishing");
    } catch (err) {
      console.error("Error stopping publishing:", err);
      setError(
        err instanceof Error ? err.message : "Failed to stop publishing"
      );
    }
  }, [client, isPublishing, localVideoTrack, localAudioTrack]);

  // Leave channel
  const leaveChannel = useCallback(async () => {
    if (!client) return;

    try {
      // Stop publishing first if we're publishing
      if (isPublishing) {
        await stopPublishing();
      }

      // Leave the channel
      if (isJoined) {
        await client.leave();
        setIsJoined(false);
      }

      console.log("Left channel");
    } catch (err) {
      console.error("Error leaving channel:", err);
      setError(err instanceof Error ? err.message : "Failed to leave channel");
    }
  }, [client, isJoined, isPublishing, stopPublishing]);

  // Mute/unmute audio
  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!localAudioTrack.enabled);
    }
  }, [localAudioTrack]);

  // Mute/unmute video
  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!localVideoTrack.enabled);
    }
  }, [localVideoTrack]);

  return {
    client,
    localVideoTrack,
    localAudioTrack,
    isJoined,
    isPublishing,
    error,
    joinAsHost,
    startPublishing,
    stopPublishing,
    leaveChannel,
    toggleAudio,
    toggleVideo,
  };
};
