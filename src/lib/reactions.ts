import { ReactionConfig, ReactionType } from "@/src/types/chat";

export const REACTION_CONFIGS: ReactionConfig[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "heart", emoji: "❤️", label: "Heart" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "clap", emoji: "👏", label: "Clap" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "love", emoji: "😍", label: "Love" },
];

export const getReactionEmoji = (type: string): string => {
  const config = REACTION_CONFIGS.find((r) => r.type === type);
  return config?.emoji || "👍";
};

export const getReactionLabel = (type: string): string => {
  const config = REACTION_CONFIGS.find((r) => r.type === type);
  return config?.label || type;
};
