/**
 * src/components/VoteButtons.tsx
 * Reusable upvote/downvote button group with score display.
 * Handles both immediate server voting and pending (batch) mode.
 */
"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";

export type VoteValue = "up" | "down";

interface VoteButtonsProps {
  label?: string;
  currentVote: VoteValue | null | undefined;
  score: number | null;
  onVote: (value: VoteValue) => void;
  className?: string;
}

export function VoteButtons({ label, currentVote, score, onVote, className }: VoteButtonsProps) {
  const scoreColor =
    score === null ? "" : score > 0 ? "text-green-600" : score < 0 ? "text-red-600" : "";

  return (
    <div
      className={`flex items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-lg transition-colors ${
        className || ""
      }`}
    >
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className={`flex items-center gap-1.5 ${!label ? "flex-1 justify-center" : ""}`}>
        <Button
          variant={currentVote === "down" ? "destructive" : "ghost"}
          size="icon-sm"
          className="h-7 w-7 transition-all duration-150"
          onClick={() => onVote("down")}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
        <span
          className={`text-sm font-semibold min-w-[1.5ch] text-center tabular-nums ${
            scoreColor || "text-foreground"
          }`}
        >
          {score === null ? "-" : score}
        </span>
        <Button
          variant={currentVote === "up" ? "default" : "ghost"}
          size="icon-sm"
          className="h-7 w-7 transition-all duration-150"
          onClick={() => onVote("up")}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
