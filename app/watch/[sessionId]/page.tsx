"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionService } from "@/src/services/session.service";
import { SessionWithCreator, AgoraStreamToken } from "@/src/types/session";
import { useAgoraViewer } from "@/src/hooks/useAgoraViewer";
import { RemoteVideoPlayer } from "@/src/components/remote-video-player";
import { SessionSidebar } from "@/src/components/session-sidebar";
import { useReactionOverlay } from "@/src/components/reaction-overlay";
import { FloatingReaction } from "@/src/components/floating-reaction";
import { ReactionButtons } from "@/src/components/reaction-buttons";
import { useWebSocket } from "@/src/hooks/useWebSocket";
import { useAuth } from "@/src/contexts/auth-context";
import { Reaction, ReactionType, ChatMessage } from "@/src/types/chat";
import { TrendingProductsData } from "@/src/types/analytics";

export default function WatchPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionWithCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamToken, setStreamToken] = useState<AgoraStreamToken | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProductsData | null>(null);
  const { reactions, addReaction, removeReaction } = useReactionOverlay();

  const {
    remoteVideoTrack,
    remoteAudioTrack,
    isJoined,
    error: agoraError,
    joinAsAudience,
    leaveChannel,
  } = useAgoraViewer();

  const {
    sendReaction,
    sendMessage,
    sendProductClick,
    isConnected: wsConnected,
    error: wsError
  } = useWebSocket({
    sessionId,
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
    onProductShowcased: (data) => {
      console.log("Product showcased:", data);
      setActiveProductId(data.productId);
    },
    onShowcaseCleared: () => {
      console.log("Showcase cleared");
      setActiveProductId(null);
    },
    onTrendingProducts: (data: TrendingProductsData) => {
      console.log("Received trending products:", data);
      setTrendingProducts(data);
    },
  });

  const handleSendReaction = (type: ReactionType) => {
    const success = sendReaction(type);
    if (success) {
      // Optimistically show own reaction
      addReaction({ type, timestamp: new Date(), userId: user?.id ? Number(user.id) : undefined });
    }
  };

  useEffect(() => {
    fetchSession();

    // Cleanup on unmount
    return () => {
      if (isJoined) {
        leaveChannel();
      }
    };
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching session:", sessionId);
      const data = await sessionService.getById(sessionId);
      console.log("Session data:", data);
      setSession(data);

      // Initialize activeProductId from session data
      if (data.activeProductId) {
        setActiveProductId(data.activeProductId);
      }

      // Auto-join if session is live
      if (data.status === "live") {
        await handleJoinStream();
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinStream = async () => {
    if (!session && !sessionId) return;

    try {
      setIsJoining(true);
      setError(null);

      console.log("Getting stream token for viewer...");
      // Get viewer token from backend
      const token = await sessionService.getStreamToken(sessionId);
      console.log("Received viewer token:", {
        sessionId: token.sessionId,
        channelName: token.channelName,
        uid: token.uid,
        appId: token.appId,
        role: token.role,
      });
      setStreamToken(token);

      // Join as audience
      console.log("Joining as audience...");
      await joinAsAudience(token);
      console.log("Successfully joined as audience");
    } catch (err) {
      console.error("Error joining stream:", err);
      setError(err instanceof Error ? err.message : "Failed to join stream");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Loading stream...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => router.push("/")}>Back to Home</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Session not found</p>
        <button onClick={() => router.push("/")}>Back to Home</button>
      </div>
    );
  }

  const isLive = session.status === "live";
  const isEnded = session.status === "ended";

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#e5e7eb",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          ← Back to Home
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
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
              Hosted by: <strong>{session.creator.username}</strong>
            </p>
          </div>
          <div
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: "bold",
              backgroundColor: isLive ? "#ef4444" : "#6b7280",
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
        {/* Video Player and Reactions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#000",
              borderRadius: "8px",
              overflow: "hidden",
              aspectRatio: "16/9",
              position: "relative",
            }}
          >
            {isLive && remoteVideoTrack ? (
              <>
                <RemoteVideoPlayer
                  videoTrack={remoteVideoTrack}
                  style={{ width: "100%", height: "100%" }}
                />
                {/* Floating Reactions Overlay */}
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
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {isEnded ? (
                  <p>Stream has ended</p>
                ) : isLive ? (
                  <>
                    <p>Connecting to stream...</p>
                    {!isJoined && !isJoining && (
                      <button
                        onClick={handleJoinStream}
                        style={{
                          padding: "0.75rem 1.5rem",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                      >
                        Join Stream
                      </button>
                    )}
                  </>
                ) : (
                  <p>Stream not started yet</p>
                )}
              </div>
            )}
          </div>

          {/* Stream Info */}
          {isLive && isJoined && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f0fdf4",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#22c55e",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ color: "#166534", fontWeight: "500" }}>
                Connected to live stream
              </span>
            </div>
          )}

          {/* Reaction Buttons */}
          {isLive && (
            <ReactionButtons
              onSendReaction={handleSendReaction}
              disabled={!wsConnected}
            />
          )}
        </div>

        {/* Sidebar with Chat and Products */}
        <div style={{ height: "calc(100vh - 250px)", minHeight: "600px" }}>
          <SessionSidebar
            sessionId={sessionId}
            isLive={isLive}
            isPaused={false}
            showStats={false}
            products={session?.products || []}
            activeProductId={activeProductId}
            showShowcaseControls={false}
            messages={messages}
            viewerCount={viewerCount}
            isConnected={wsConnected}
            wsError={wsError}
            onSendMessage={sendMessage}
            isCreator={false}
            trendingProducts={trendingProducts}
            onProductClick={sendProductClick}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
