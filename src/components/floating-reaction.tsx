"use client";

import { useEffect, useState } from "react";
import { getReactionEmoji } from "@/src/lib/reactions";

interface FloatingReactionProps {
  type: string;
  id: string;
  onComplete: (id: string) => void;
}

export const FloatingReaction = ({
  type,
  id,
  onComplete,
}: FloatingReactionProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animation duration (3 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  if (!isVisible) return null;

  // Random horizontal position (0-80%)
  const left = Math.random() * 80;
  // Random slight horizontal drift (-20 to 20 pixels)
  const drift = (Math.random() - 0.5) * 40;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: `${left}%`,
        fontSize: "2rem",
        pointerEvents: "none",
        animation: "float-up 3s ease-out forwards",
        zIndex: 1000,
        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
        // @ts-ignore - CSS custom property
        "--drift": `${drift}px`,
      }}
    >
      {getReactionEmoji(type)}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-150px) translateX(var(--drift)) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-300px) translateX(var(--drift)) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
