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

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-amber-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors duration-150">
      <div className={`w-8 text-center text-sm font-semibold ${getRankStyle(rank)}`}>
        {formatRank(rank)}
      </div>
      <div className="w-11 h-11 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden flex-shrink-0">
        {!hideImage && (
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain p-1"
            dangerouslySetInnerHTML={{
              __html: submission.svgCode.slice(0, 5000),
            }}
          />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize truncate text-sm">{submission.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
            {submission.model}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={`text-base font-semibold ${
            netScore > 0
              ? "text-emerald-600 dark:text-emerald-500"
              : netScore < 0
                ? "text-red-600 dark:text-red-500"
                : "text-muted-foreground"
          }`}
        >
          {netScore > 0 ? "+" : ""}
          {netScore}
        </span>
        <span className="text-[10px] text-muted-foreground">score</span>
      </div>
    </div>
  );
}
