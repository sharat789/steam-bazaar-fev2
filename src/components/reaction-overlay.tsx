"use client";

import { useState, useCallback } from "react";
import { Reaction } from "@/src/types/chat";
import { FloatingReaction } from "./floating-reaction";

interface FloatingReactionItem {
  id: string;
  type: string;
  timestamp: number;
}

export const ReactionOverlay = () => {
  const [reactions, setReactions] = useState<FloatingReactionItem[]>([]);

  const addReaction = useCallback((reaction: Reaction) => {
    const newReaction: FloatingReactionItem = {
      id: `${reaction.type}-${Date.now()}-${Math.random()}`,
      type: reaction.type,
      timestamp: Date.now(),
    };

    setReactions((prev) => [...prev, newReaction]);
  }, []);

  const removeReaction = useCallback((id: string) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <>
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
  );
};

// Export the type and function to be used by parent components
export type { FloatingReactionItem };
export { useReactionOverlay };

// Custom hook to be used by parent components
function useReactionOverlay() {
  const [reactions, setReactions] = useState<FloatingReactionItem[]>([]);

  const addReaction = useCallback((reaction: Reaction) => {
    const newReaction: FloatingReactionItem = {
      id: `${reaction.type}-${Date.now()}-${Math.random()}`,
      type: reaction.type,
      timestamp: Date.now(),
    };

    setReactions((prev) => [...prev, newReaction]);
  }, []);

  const removeReaction = useCallback((id: string) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { reactions, addReaction, removeReaction };
}
