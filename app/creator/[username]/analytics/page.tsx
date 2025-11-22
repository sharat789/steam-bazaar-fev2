"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { analyticsService } from "@/src/services/analytics.service";
import { GlobalAnalytics } from "@/src/types/analytics";

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated and owns this profile
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    if (user.username !== username) {
      setError("You can only view your own analytics");
      setLoading(false);
      return;
    }

    fetchAnalytics();
  }, [user, isAuthenticated, username]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getCreatorAnalytics(Number(user.id));
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>No analytics data available</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  // Get top 3 reaction types
  const topReactions = Object.entries(analytics.reactions.breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => router.push(`/creator/${username}`)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2d2e2f",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ margin: 0, marginBottom: "0.5rem" }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Overview of all your streaming sessions
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Sessions Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#3b82f6",
                borderRadius: "8px",
              }}
            >
              📹
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#9ca3af" }}>
                Total Sessions
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {analytics.sessions.total}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              fontSize: "0.75rem",
            }}
          >
            <span
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
              }}
            >
              Live: {analytics.sessions.byStatus.live}
            </span>
            <span
              style={{
                backgroundColor: "#6b7280",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
              }}
            >
              Ended: {analytics.sessions.byStatus.ended}
            </span>
            <span
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
              }}
            >
              Scheduled: {analytics.sessions.byStatus.scheduled}
            </span>
            <span
              style={{
                backgroundColor: "#f59e0b",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
              }}
            >
              Paused: {analytics.sessions.byStatus.paused}
            </span>
          </div>
        </div>

        {/* Viewers Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#10b981",
                borderRadius: "8px",
              }}
            >
              👥
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#9ca3af" }}>
                Total Viewers
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {analytics.viewers.totalUnique.toLocaleString()}
              </p>
            </div>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
            <p style={{ margin: "0.25rem 0" }}>
              Avg per session: {Math.round(analytics.viewers.averagePerSession)}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              Peak concurrent: {analytics.viewers.peakConcurrent}
            </p>
          </div>
        </div>

        {/* Reactions Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f59e0b",
                borderRadius: "8px",
              }}
            >
              ❤️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#9ca3af" }}>
                Total Reactions
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {analytics.reactions.total.toLocaleString()}
              </p>
            </div>
          </div>
          {topReactions.length > 0 && (
            <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
              <p style={{ margin: "0.25rem 0", fontWeight: "600" }}>
                Top reactions:
              </p>
              {topReactions.map(([type, count]) => (
                <p key={type} style={{ margin: "0.25rem 0" }}>
                  {type}: {count.toLocaleString()}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Products Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#8b5cf6",
                borderRadius: "8px",
              }}
            >
              🛍️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#9ca3af" }}>
                Product Clicks
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {analytics.products.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
            <p style={{ margin: "0.25rem 0" }}>
              Unique users: {analytics.products.uniqueUsers}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              Avg CTR: {analytics.products.averageCTR.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>
          Quick Links
        </h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push(`/creator/${username}/sessions`)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            View All Sessions
          </button>
          <button
            onClick={() => router.push(`/creator/${username}/products`)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Manage Products
          </button>
        </div>
      </div>
    </div>
  );
}
