"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/src/types/chat";
import { useAuth } from "@/src/contexts/auth-context";

interface ChatProps {
  sessionId: string;
  messages: ChatMessage[];
  viewerCount: number;
  isConnected: boolean;
  error: string | null;
  onSendMessage: (message: string) => boolean;
}

export const Chat: React.FC<ChatProps> = ({
  sessionId,
  messages,
  viewerCount,
  isConnected,
  error,
  onSendMessage,
}) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    if (!user) {
      alert("Please log in to send messages");
      return;
    }

    const sent = onSendMessage(inputMessage);
    if (sent) {
      setInputMessage("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#0a0a0a",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #2a2a2a",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #2a2a2a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: "600",
              color: "#ffffff",
            }}
          >
            Live Chat
          </h3>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginTop: "0.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: isConnected ? "#10b981" : "#ef4444",
                borderRadius: "50%",
                boxShadow: isConnected
                  ? "0 0 8px rgba(16, 185, 129, 0.5)"
                  : "0 0 8px rgba(239, 68, 68, 0.5)",
              }}
            />
            <span style={{ color: isConnected ? "#10b981" : "#ef4444" }}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: "0.875rem",
            color: "#9ca3af",
            backgroundColor: "#2a2a2a",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
          }}
        >
          👥 {viewerCount} {viewerCount === 1 ? "viewer" : "viewers"}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#7f1d1d",
            color: "#fca5a5",
            fontSize: "0.875rem",
            borderBottom: "1px solid #991b1b",
          }}
        >
          {error}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          backgroundColor: "#0a0a0a",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              padding: "2rem",
              fontSize: "0.875rem",
            }}
          >
            No messages yet. Be the first to say hi! 👋
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                padding: "0.75rem",
                backgroundColor: "#1a1a1a",
                borderRadius: "6px",
                border: "1px solid #2a2a2a",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    color: "#3b82f6",
                  }}
                >
                  {msg.userName}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#e5e7eb",
                  wordWrap: "break-word",
                }}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "1rem",
          backgroundColor: "#1a1a1a",
          borderTop: "1px solid #2a2a2a",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={user ? "Send a message..." : "Login to chat"}
            disabled={!user || !isConnected}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #3a3a3a",
              borderRadius: "6px",
              fontSize: "0.875rem",
              outline: "none",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
            }}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!user || !isConnected || !inputMessage.trim()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor:
                !user || !isConnected || !inputMessage.trim()
                  ? "#374151"
                  : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor:
                !user || !isConnected || !inputMessage.trim()
                  ? "not-allowed"
                  : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            Send
          </button>
        </div>
        {!user && (
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            Please log in to participate in chat
          </div>
        )}
      </form>
    </div>
  );
};
