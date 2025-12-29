/**
 * src/pages/HomePage.tsx
 * Main landing page with "Rate 5 Pokemon" batch voting and leaderboard.
 * Uses localStorage to track voted IDs and batch mutations for efficiency.
 */
"use client";

import { useMutation, useQuery } from "convex/react";
import { RefreshCw, Trophy } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "wouter";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { LeaderboardRow } from "../components/LeaderboardRow";
import { PokemonCard } from "../components/PokemonCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { getFingerprint } from "../lib/fingerprint";
import { addVotedIds, getVotedIds } from "../lib/votedStorage";
import type { VoteValue } from "../components/VoteButtons";

interface PendingVote {
  submissionId: Id<"submissions">;
  value: VoteValue;
}

export function HomePage() {
  const clientId = useMemo(() => getFingerprint(), []);
  const [batchKey, setBatchKey] = useState(0);
  const [pendingVotes, setPendingVotes] = useState<Map<string, VoteValue>>(
    new Map(),
  );

  const excludeIds = useMemo(() => {
    void batchKey;
    return getVotedIds() as Id<"submissions">[];
  }, [batchKey]);

  const randomSubmissions = useQuery(api.queries.getRandomUnvotedSubmissions, {
    excludeIds,
    limit: 5,
  });

  const leaderboard = useQuery(api.queries.getLeaderboard, { limit: 10 });
  const castVotesBatch = useMutation(api.voting.castVotesBatch);

  const votedCount = pendingVotes.size;
  const allVoted = votedCount === 5 && randomSubmissions?.length === 5;

  const handleNextBatch = useCallback(() => {
    if (pendingVotes.size === 0) {
      setBatchKey((k) => k + 1);
      return;
    }

    const votes: PendingVote[] = [];
    pendingVotes.forEach((value, submissionId) => {
      votes.push({
        submissionId: submissionId as Id<"submissions">,
        value,
      });
    });

    void castVotesBatch({ votes, clientId, type: "image" });
    addVotedIds(votes.map((v) => v.submissionId));
    setPendingVotes(new Map());
    setBatchKey((k) => k + 1);
  }, [pendingVotes, castVotesBatch, clientId]);

  const handleLocalVote = useCallback(
    (submissionId: string, value: VoteValue) => {
      setPendingVotes((prev) => {
        const next = new Map(prev);
        next.set(submissionId, value);
        return next;
      });
    },
    [],
  );

  const userVotesFromPending = useMemo(() => {
    const result: Record<
      string,
      { imageVote: VoteValue | null; dataVote: VoteValue | null }
    > = {};
    pendingVotes.forEach((value, id) => {
      result[id] = { imageVote: value, dataVote: null };
    });
    return result;
  }, [pendingVotes]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Rate 5 Random Pokemon
          </h1>
          <p className="text-lg text-muted-foreground">
            Help evaluate AI-generated Pokemon art. Vote on visual quality for
            each submission below, then submit all votes at once.
          </p>
          {randomSubmissions && randomSubmissions.length === 0 && (
            <p className="text-muted-foreground">
              You've voted on all submissions! Check back later for more.
            </p>
          )}
        </div>

        {randomSubmissions && randomSubmissions.length > 0 && (
          <ProgressBar
            votedCount={votedCount}
            allVoted={allVoted}
            onSubmit={handleNextBatch}
          />
        )}

        <div
          key={batchKey}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {randomSubmissions === undefined
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : randomSubmissions.map((submission) => (
                <PokemonCard
                  key={submission._id}
                  submission={submission}
                  userVotes={userVotesFromPending[submission._id as string]}
                  onVote={(value) =>
                    handleLocalVote(submission._id as string, value)
                  }
                  pendingMode
                />
              ))}
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Leaderboard
            </h2>
          </div>
          <Link href="/browse">
            <Button variant="ghost">View all submissions</Button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card">
          {leaderboard === undefined ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No submissions yet. Be the first to contribute!
            </div>
          ) : (
            <div className="divide-y">
              {leaderboard.map((submission, index) => (
                <LeaderboardRow
                  key={submission._id}
                  submission={submission}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-semibold">Explore More</h2>
        <div className="flex justify-center gap-4">
          <Link href="/browse">
            <Button size="lg">Browse All Submissions</Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" size="lg">
              View Statistics
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

interface ProgressBarProps {
  votedCount: number;
  allVoted: boolean;
  onSubmit: () => void;
}

function ProgressBar({ votedCount, allVoted, onSubmit }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Progress:</span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < votedCount
                  ? "bg-primary"
                  : "bg-muted border border-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{votedCount}/5</span>
      </div>
      <Button
        onClick={onSubmit}
        variant={allVoted ? "default" : "outline"}
        size="sm"
        disabled={votedCount === 0}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        {allVoted ? "Submit & Load More" : `Submit ${votedCount} Votes`}
      </Button>
    </div>
  );
}
