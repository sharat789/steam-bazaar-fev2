"use client";
import { userService } from "@/src/services/user.service";
import { LiveUser } from "@/src/types/user";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchLiveUsers();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getLiveUsers();
      setLiveUsers(response);
    } catch (error) {
      setError("Failed to fetch live users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = category
    ? liveUsers.filter((user) => user.liveSession?.category === category)
    : liveUsers;

  const uniqueCategories = Array.from(
    new Set(
      liveUsers
        .map((u) => u.liveSession?.category)
        .filter((c): c is string => !!c)
    )
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          🔴 Live Now
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>
          Watch live streams from creators around the world
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setCategory("")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: category === "" ? "#3b82f6" : "#2a2a2a",
            color: "#ffffff",
            border: category === "" ? "none" : "1px solid #3a3a3a",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          All
        </button>
        {uniqueCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: category === cat ? "#3b82f6" : "#2a2a2a",
              color: "#ffffff",
              border: category === cat ? "none" : "1px solid #3a3a3a",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && liveUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p>Loading live streams...</p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#fee2e2",
            borderRadius: "8px",
            color: "#991b1b",
          }}
        >
          {error}
          <button
            onClick={fetchLiveUsers}
            style={{
              marginLeft: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📺</div>
          <h2 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>
            No Live Streams
          </h2>
          <p style={{ color: "#9ca3af" }}>
            {category
              ? `No streams in "${category}" category right now`
              : "No one is streaming right now. Check back later!"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() =>
                user.liveSession && router.push(`/watch/${user.liveSession.id}`)
              }
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  backgroundColor: "#000",
                  aspectRatio: "16/9",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  LIVE
                </div>
                <div
                  style={{
                    fontSize: "4rem",
                    opacity: 0.3,
                  }}
                >
                  🎥
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "1rem" }}>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#ffffff",
                  }}
                >
                  {user.liveSession?.title || "Live Stream"}
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: "#e5e7eb", fontWeight: "500" }}>
                    {user.username}
                  </span>
                </div>

                {user.liveSession?.category && (
                  <div>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#2a2a2a",
                        border: "1px solid #3a3a3a",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        color: "#e5e7eb",
                        fontWeight: "500",
                      }}
                    >
                      {user.liveSession.category}
                    </span>
                  </div>
                )}

                {user.liveSession?.description && (
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      marginTop: "0.75rem",
                      marginBottom: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {user.liveSession.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
