"use client";

import { ReactionStats as ReactionStatsType } from "@/src/types/chat";
import { getReactionEmoji } from "@/src/lib/reactions";

interface ReactionStatsProps {
  stats: ReactionStatsType | null;
}

// Color mapping for different reaction types
const getReactionColor = (type: string): string => {
  const colors: Record<string, string> = {
    like: "#3b82f6", // blue
    heart: "#ef4444", // red
    love: "#ec4899", // pink
    fire: "#f97316", // orange
    clap: "#fbbf24", // yellow
    wow: "#8b5cf6", // purple
  };
  return colors[type] || "#3b82f6";
};

export const ReactionStats = ({ stats }: ReactionStatsProps) => {
  if (!stats || stats.total === 0) {
    return (
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          textAlign: "center",
          color: "#6b7280",
          border: "1px solid #2a2a2a",
        }}
      >
        No reactions yet. Reactions will appear here during the stream.
      </div>
    );
  }

  // Sort reactions by percentage (highest first)
  // percentages are already calculated by backend (e.g., { wow: 42, love: 17, ... })
  const sortedReactions = Object.entries(stats.percentages)
    .sort(([, a], [, b]) => b - a)
    .filter(([, percentage]) => percentage > 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Header with total count */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #2a2a2a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
          Total Reactions
        </span>
        <span
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#ffffff",
          }}
        >
          {stats.total}
        </span>
      </div>

      {/* Reaction breakdown */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #2a2a2a",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {sortedReactions.map(([type, percentage]) => {
            const color = getReactionColor(type);
            return (
              <div
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {/* Emoji */}
                <span
                  style={{
                    fontSize: "1.5rem",
                    width: "32px",
                    textAlign: "center",
                  }}
                >
                  {getReactionEmoji(type)}
                </span>

                {/* Progress bar and info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        textTransform: "capitalize",
                        color: "#e5e7eb",
                      }}
                    >
                      {type}
                    </span>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#9ca3af",
                        fontWeight: "600",
                      }}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#2a2a2a",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: color,
                        borderRadius: "4px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend/Info */}
      <div
        style={{
          padding: "0.75rem",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #2a2a2a",
          fontSize: "0.75rem",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Percentages update in real-time as viewers react
      </div>
    </div>
  );
};
