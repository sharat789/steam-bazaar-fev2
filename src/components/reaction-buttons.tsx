"use client";

import { ReactionType } from "@/src/types/chat";
import { REACTION_CONFIGS } from "@/src/lib/reactions";

interface ReactionButtonsProps {
  onSendReaction: (type: ReactionType) => void;
  disabled?: boolean;
}

export const ReactionButtons = ({
  onSendReaction,
  disabled = false,
}: ReactionButtonsProps) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        padding: "0.75rem",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ width: "100%", marginBottom: "0.25rem" }}>
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#6b7280",
          }}
        >
          React:
        </span>
      </div>
      {REACTION_CONFIGS.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => onSendReaction(reaction.type)}
          disabled={disabled}
          title={reaction.label}
          style={{
            padding: "0.5rem 0.75rem",
            fontSize: "1.5rem",
            backgroundColor: "white",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: disabled ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.backgroundColor = "#eff6ff";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.backgroundColor = "white";
            }
          }}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
};
