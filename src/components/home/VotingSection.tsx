/**
 * src/components/home/VotingSection.tsx
 * Displays a batch of submissions for blind voting with auto-submit behavior.
 * Reveals model info and scores only after all votes are cast.
 */
"use client";

import { RefreshCw, Trophy } from "lucide-react";
import { Link } from "wouter";
import type { Doc } from "../../../convex/_generated/dataModel";
import { PalCard } from "../PalCard";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import type { VoteValue } from "../VoteButtons";

interface VotingSectionProps {
  submissions: Doc<"submissions">[];
  pendingVotes: Map<string, VoteValue>;
  view: "voting" | "results";
  timeRemaining: number | null;
  isOutOfSubmissions: boolean;
  isLoading: boolean;
  onVote: (submissionId: string, value: VoteValue) => void;
}

export function VotingSection({
  submissions,
  pendingVotes,
  view,
  timeRemaining,
  isOutOfSubmissions,
  isLoading,
  onVote,
}: VotingSectionProps) {
  const votedCount = pendingVotes.size;
  const remaining = Math.max(0, submissions.length - votedCount);

  return (
    <section className="space-y-6 relative">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {isOutOfSubmissions
            ? "All Caught Up!"
            : view === "voting"
              ? "Rate Random Pals"
              : "Batch Complete!"}
        </h1>
        <p className="text-lg text-muted-foreground min-h-[1.75rem] flex items-center justify-center">
          {isOutOfSubmissions ? (
            "You've voted on all available submissions."
          ) : view === "voting" ? (
            <span>
              Vote on{" "}
              <span className="font-semibold text-foreground">{remaining}</span>{" "}
              more to reveal
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 animate-pulse">
              Next batch in{" "}
              <span className="font-semibold text-foreground">
                {timeRemaining}
              </span>
              ...
              <RefreshCw className="w-4 h-4 animate-spin" />
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isOutOfSubmissions ? (
          <EmptyState />
        ) : isLoading ? (
          <LoadingSkeletons />
        ) : (
          submissions.map((submission) => (
            <PalCard
              key={submission._id}
              submission={submission}
              userVote={pendingVotes.get(submission._id)}
              onVote={
                view === "voting"
                  ? (value) => onVote(submission._id as string, value)
                  : undefined
              }
              hideDetails={view === "voting"}
            />
          ))
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4 border rounded-lg bg-muted/10">
      <Trophy className="w-12 h-12 text-muted-foreground" />
      <p className="text-xl font-medium">No more Pals to rate!</p>
      <div className="flex gap-4">
        <Link href="/browse">
          <Button>Browse All</Button>
        </Link>
        <Link href="/stats">
          <Button variant="outline">View Stats</Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </>
  );
}
