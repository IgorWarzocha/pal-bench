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

export function VoteButtons({
  label,
  currentVote,
  score,
  onVote,
  className,
}: VoteButtonsProps) {
  const scoreColor =
    score === null
      ? ""
      : score > 0
        ? "text-green-600"
        : score < 0
          ? "text-red-600"
          : "";

  return (
    <div
      className={`flex items-center justify-between bg-muted/30 p-2 rounded-md ${
        className || ""
      }`}
    >
      {label && <span className="text-sm font-medium">{label}</span>}
      <div
        className={`flex items-center gap-1 ${!label ? "w-full justify-center" : ""}`}
      >
        <Button
          variant={currentVote === "down" ? "destructive" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onVote("down")}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <span
          className={`text-sm font-bold min-w-[2ch] text-center ${scoreColor}`}
        >
          {score === null ? "-" : score}
        </span>
        <Button
          variant={currentVote === "up" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onVote("up")}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
