/**
 * src/components/LeaderboardRow.tsx
 * Single row in the leaderboard displaying submission rank, preview, and score.
 * Used by HomePage to render the top submissions table.
 */
"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import { Badge } from "./ui/badge";

interface LeaderboardRowProps {
  submission: Doc<"submissions">;
  rank: number;
}

function formatRank(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `#${rank}`;
}

export function LeaderboardRow({
  submission,
  rank,
  hideImage = false,
}: LeaderboardRowProps & { hideImage?: boolean }) {
  const netScore = submission.upvotes_image - submission.downvotes_image;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
      <div className="w-10 text-center text-lg font-bold">
        {formatRank(rank)}
      </div>
      <div className="w-12 h-12 rounded-md border bg-muted/20 flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
        {!hideImage && (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html: submission.svgCode.slice(0, 5000),
            }}
          />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize truncate">
            {submission.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {submission.model}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={`text-lg font-bold ${
            netScore > 0
              ? "text-green-600"
              : netScore < 0
                ? "text-red-600"
                : "text-muted-foreground"
          }`}
        >
          {netScore > 0 ? "+" : ""}
          {netScore}
        </span>
        <span className="text-xs text-muted-foreground">score</span>
      </div>
    </div>
  );
}
