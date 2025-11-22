"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionService } from "@/src/services/session.service";
import { SessionWithCreator, AgoraStreamToken } from "@/src/types/session";
import { useAgoraStream } from "@/src/hooks/useAgoraStream";
import { VideoPlayer } from "@/src/components/video-player";
import { SessionSidebar } from "@/src/components/session-sidebar";
import { useReactionOverlay } from "@/src/components/reaction-overlay";
import { FloatingReaction } from "@/src/components/floating-reaction";
import { useWebSocket } from "@/src/hooks/useWebSocket";
import { useAuth } from "@/src/contexts/auth-context";
import { Reaction, ReactionStats as ReactionStatsType, ChatMessage } from "@/src/types/chat";
import { SessionConversionStats } from "@/src/types/analytics";

export default function SessionControlPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  // Unwrap params Promise for Next.js 15+
  const { username, id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionWithCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamToken, setStreamToken] = useState<AgoraStreamToken | null>(null);
  const [isStartingStream, setIsStartingStream] = useState(false);
  const [reactionStats, setReactionStats] = useState<ReactionStatsType | null>(
    null
  );
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [conversionStats, setConversionStats] = useState<SessionConversionStats | null>(null);
  const { reactions, addReaction, removeReaction} = useReactionOverlay();

  const {
    localVideoTrack,
    localAudioTrack,
    isJoined,
    isPublishing,
    error: agoraError,
    joinAsHost,
    startPublishing,
    stopPublishing,
    leaveChannel,
    toggleAudio,
    toggleVideo,
  } = useAgoraStream();

  const {
    isConnected: wsConnected,
    error: wsError,
    sendMessage,
    sendShowcase,
    sendProductClick,
  } = useWebSocket({
    sessionId: id,
    userId: user?.id ? Number(user.id) : undefined,
    userName: user?.username,
    onMessage: (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    },
    onViewerCount: (count: number) => {
      setViewerCount(count);
    },
    onReaction: (reaction: Reaction) => {
      addReaction(reaction);
    },
    onReactionStats: (stats: ReactionStatsType) => {
      setReactionStats(stats);
    },
    onProductShowcased: (data) => {
      console.log("Product showcased:", data);
      setActiveProductId(data.productId);
    },
    onShowcaseCleared: () => {
      console.log("Showcase cleared");
      setActiveProductId(null);
    },
    onProductClickStats: (stats: SessionConversionStats) => {
      console.log("Received product click stats:", stats);
      setConversionStats(stats);
    },
  });

  useEffect(() => {
    console.log("SessionControlPage mounted");
    console.log("Session ID:", id);
    console.log("Username:", username);

    if (id) {
      fetchSession();
    } else {
      console.error("No session ID in params!");
      setError("No session ID provided");
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (isPublishing || isJoined) {
        handleEndStream();
      }
    };
  }, [id]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching session with ID:", id);
      const data = await sessionService.getById(id);
      console.log("Fetched session data:", data);
      setSession(data);
      // Initialize activeProductId from session data
      if (data.activeProductId) {
        setActiveProductId(data.activeProductId);
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleShowcaseProduct = async (productId: string) => {
    if (!session) return;

    try {
      // Send via WebSocket for real-time broadcast
      const success = sendShowcase(productId);
      if (success) {
        // Optimistically update local state
        setActiveProductId(productId);
      }
    } catch (err) {
      console.error("Error showcasing product:", err);
      setError("Failed to showcase product");
    }
  };

  const handleClearShowcase = async () => {
    if (!session) return;

    try {
      // Send via WebSocket for real-time broadcast
      const success = sendShowcase(null);
      if (success) {
        // Optimistically update local state
        setActiveProductId(null);
      }
    } catch (err) {
      console.error("Error clearing showcase:", err);
      setError("Failed to clear showcase");
    }
  };

  const handleStartStream = async () => {
    if (!session) return;

    try {
      setIsStartingStream(true);
      setError(null);

      console.log("Starting stream for session:", session.id);

      // Get Agora token from backend
      const token = await sessionService.startStream(session.id);
      console.log("Received Agora token from backend:", {
        sessionId: token.sessionId,
        channelName: token.channelName,
        uid: token.uid,
        appId: token.appId,
        role: token.role,
        hasToken: !!token.token,
      });
      setStreamToken(token);

      // Join Agora channel as host
      console.log("Joining Agora channel as host...");
      await joinAsHost(token);
      console.log("Successfully joined channel");

      // Wait a bit to ensure connection is fully established
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Start publishing video and audio
      console.log("Starting to publish...");
      await startPublishing();
      console.log("Publishing started successfully");

      // Refresh session to get updated status
      await fetchSession();

      console.log("Stream started successfully!");
    } catch (err) {
      console.error("Error starting stream:", err);
      setError(err instanceof Error ? err.message : "Failed to start stream");
    } finally {
      setIsStartingStream(false);
    }
  };

  const handlePauseStream = async () => {
    try {
      await stopPublishing();
      if (session) {
        await sessionService.updateStatus(session.id, { status: "paused" });
        await fetchSession();
      }
    } catch (err) {
      console.error("Error pausing stream:", err);
      setError("Failed to pause stream");
    }
  };

  const handleResumeStream = async () => {
    try {
      await startPublishing();
      if (session) {
        await sessionService.updateStatus(session.id, { status: "live" });
        await fetchSession();
      }
    } catch (err) {
      console.error("Error resuming stream:", err);
      setError("Failed to resume stream");
    }
  };

  const handleEndStream = async () => {
    if (!session) return;

    if (
      !confirm(
        "Are you sure you want to end this stream? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Stop publishing and leave channel
      await stopPublishing();
      await leaveChannel();

      // Notify backend to end stream
      await sessionService.endStream(session.id);

      // Refresh session
      await fetchSession();

      setStreamToken(null);
      console.log("Stream ended successfully!");
    } catch (err) {
      console.error("Error ending stream:", err);
      setError("Failed to end stream");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Session not found</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  const isLive = session.status === "live";
  const isPaused = session.status === "paused";
  const isEnded = session.status === "ended";

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => router.push(`/creator/${username}/sessions`)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2d2e2fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          ← Back to Sessions
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div>
            <h1 style={{ margin: 0, marginBottom: "0.5rem" }}>
              {session.title}
            </h1>
            {session.description && (
              <p style={{ color: "#6b7280", margin: 0 }}>
                {session.description}
              </p>
            )}
          </div>
          <div
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: "bold",
              backgroundColor: isLive
                ? "#ef4444"
                : isPaused
                ? "#f59e0b"
                : isEnded
                ? "#6b7280"
                : "#3b82f6",
              color: "white",
            }}
          >
            {isLive ? "🔴 LIVE" : session.status.toUpperCase()}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            marginBottom: "1rem",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {agoraError && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            marginBottom: "1rem",
            color: "#991b1b",
          }}
        >
          Agora Error: {agoraError}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "7fr 3fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Video Preview and Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <h2>Video Preview</h2>
          <div
            style={{
              backgroundColor: "#000",
              borderRadius: "8px",
              overflow: "hidden",
              aspectRatio: "16/9",
              position: "relative",
            }}
          >
            {localVideoTrack ? (
              <>
                <VideoPlayer
                  videoTrack={localVideoTrack}
                  style={{ width: "100%", height: "100%" }}
                />
                {/* Floating Reactions Overlay */}
                {isLive && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "100%",
                      pointerEvents: "none",
                      overflow: "hidden",
                    }}
                  >
                    {reactions.map((reaction) => (
                      <FloatingReaction
                        key={reaction.id}
                        id={reaction.id}
                        type={reaction.type}
                        onComplete={removeReaction}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "white",
                  fontSize: "1.25rem",
                }}
              >
                {isEnded ? "Stream has ended" : "Click 'Start Stream' to begin"}
              </div>
            )}
          </div>

          {/* Stream Controls */}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {!isLive && !isPaused && !isEnded && (
              <button
                onClick={handleStartStream}
                disabled={isStartingStream || isPublishing}
                style={{
                  padding: "0.75rem 2rem",
                  backgroundColor: isStartingStream ? "#9ca3af" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isStartingStream ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                {isStartingStream ? "Starting..." : "🔴 Start Stream"}
              </button>
            )}

            {isLive && (
              <>
                <button
                  onClick={handlePauseStream}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ⏸ Pause Stream
                </button>
                <button
                  onClick={handleEndStream}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ⏹ End Stream
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  onClick={handleResumeStream}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ▶ Resume Stream
                </button>
                <button
                  onClick={handleEndStream}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ⏹ End Stream
                </button>
              </>
            )}

            {isEnded && (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  width: "100%",
                }}
              >
                <p style={{ margin: 0, color: "#6b7280" }}>
                  This session has ended. Create a new session to go live again.
                </p>
              </div>
            )}
          </div>

          {/* Media Controls */}
          {(isLive || isPaused) && (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={toggleAudio}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: localAudioTrack?.enabled
                    ? "#3b82f6"
                    : "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {localAudioTrack?.enabled ? "🎤 Mute" : "🔇 Unmute"}
              </button>
              <button
                onClick={toggleVideo}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: localVideoTrack?.enabled
                    ? "#3b82f6"
                    : "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {localVideoTrack?.enabled ? "📹 Stop Video" : "📷 Start Video"}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar with Chat, Products, and Stats */}
        <div style={{ height: "calc(100vh - 250px)", minHeight: "600px" }}>
          <SessionSidebar
            sessionId={id}
            isLive={isLive}
            isPaused={isPaused}
            reactionStats={reactionStats}
            products={session?.products || []}
            activeProductId={activeProductId}
            showShowcaseControls={true}
            onShowcase={handleShowcaseProduct}
            onClearShowcase={handleClearShowcase}
            messages={messages}
            viewerCount={viewerCount}
            isConnected={wsConnected}
            wsError={wsError}
            onSendMessage={sendMessage}
            isCreator={true}
            conversionStats={conversionStats}
            onProductClick={sendProductClick}
          />
        </div>
      </div>
    </div>
  );
}
