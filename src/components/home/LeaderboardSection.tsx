/**
 * src/components/home/LeaderboardSection.tsx
 * Dual-view leaderboard displaying either top-rated pals or model rankings.
 * Toggleable between "Best Pals" and "Best Models" views.
 */
"use client";

import { Trophy } from "lucide-react";
import { Link } from "wouter";
import type { Doc } from "../../../convex/_generated/dataModel";
import { LeaderboardRow } from "../LeaderboardRow";
import { ModelStatsTable, type ModelStats } from "../ModelStatsTable";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface LeaderboardSectionProps {
  type: "pals" | "models";
  onTypeChange: (type: "pals" | "models") => void;
  leaderboard: Doc<"submissions">[] | undefined;
  modelStats: ModelStats[] | undefined;
  canToggle: boolean;
  canNavigate: boolean;
}

export function LeaderboardSection({
  type,
  onTypeChange,
  leaderboard,
  modelStats,
  canToggle,
  canNavigate,
}: LeaderboardSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Leaderboard</h2>
        </div>

        {canToggle ? (
          <Tabs value={type} onValueChange={(v) => onTypeChange(v as "pals" | "models")}>
            <TabsList className="h-9">
              <TabsTrigger value="pals" className="text-sm">
                Best Pals
              </TabsTrigger>
              <TabsTrigger value="models" className="text-sm">
                Best Models
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          <div className="text-sm font-medium text-muted-foreground">Best Models</div>
        )}

        <Link href="/browse">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canNavigate}
            className={!canNavigate ? "opacity-50" : ""}
          >
            View all
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {type === "pals" ? (
          <PalsLeaderboard submissions={leaderboard} />
        ) : (
          <ModelsLeaderboard stats={modelStats} />
        )}
      </div>
    </section>
  );
}

function PalsLeaderboard({ submissions }: { submissions: Doc<"submissions">[] | undefined }) {
  if (submissions === undefined) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No submissions yet.</div>;
  }

  return (
    <div className="divide-y">
      {submissions.map((submission, index) => (
        <LeaderboardRow key={submission._id} submission={submission} rank={index + 1} />
      ))}
    </div>
  );
}

function ModelsLeaderboard({ stats }: { stats: ModelStats[] | undefined }) {
  if (stats === undefined) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <ModelStatsTable stats={stats} />;
}
