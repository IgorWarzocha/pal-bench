"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { DisclaimerOverlay, LeaderboardSection, VotingSection } from "../components/home";
import { Button } from "../components/ui/button";
import { useDisclaimer } from "../lib/DisclaimerContext";
import { getFingerprint } from "../lib/fingerprint";
import { addVotedIds, getVotedIds } from "../lib/votedStorage";
import type { VoteValue } from "../components/VoteButtons";

interface PendingVote {
  submissionId: Id<"submissions">;
  value: VoteValue;
}

export function HomePage() {
  const [clientId] = useState(() => getFingerprint());
  const { hasAcceptedDisclaimer, acceptDisclaimer } = useDisclaimer();

  const [view, setView] = useState<"voting" | "results">("voting");
  const [batchKey, setBatchKey] = useState(0);
  const [pendingVotes, setPendingVotes] = useState<Map<string, VoteValue>>(new Map());

  // Track user preference for leaderboard type
  const [preferredLeaderboardType, setPreferredLeaderboardType] = useState<"pals" | "models">(
    "pals",
  );

  // Derived state: if disclaimer not accepted, force "models"
  const leaderboardType = hasAcceptedDisclaimer ? preferredLeaderboardType : "models";

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const excludeIds = useMemo(() => {
    void batchKey; // Ensure dependency on batchKey to refresh voted IDs
    return getVotedIds() as Id<"submissions">[];
  }, [batchKey]);

  const randomSubmissions = useQuery(
    api.queries.getRandomUnvotedSubmissions,
    hasAcceptedDisclaimer ? { excludeIds, limit: 5 } : "skip",
  );

  const leaderboard = useQuery(api.queries.getLeaderboard, { limit: 10 });
  const stats = useQuery(api.queries.getStats, {});
  const castVotesBatch = useMutation(api.voting.castVotesBatch);

  const currentSubmissions = randomSubmissions ?? [];

  const handleSubmitBatch = useCallback(
    (finalVotes: Map<string, VoteValue>) => {
      if (finalVotes.size === 0) return;

      const votes: PendingVote[] = [];
      finalVotes.forEach((value, submissionId) => {
        votes.push({ submissionId: submissionId as Id<"submissions">, value });
      });

      void castVotesBatch({ votes, clientId, type: "image" });
      setView("results");
      setTimeRemaining(3);
    },
    [castVotesBatch, clientId],
  );

  const handleContinue = useCallback(() => {
    const ids = Array.from(pendingVotes.keys()) as Id<"submissions">[];
    addVotedIds(ids);

    setPendingVotes(new Map());
    setBatchKey((k) => k + 1);
    setView("voting");
    setTimeRemaining(null);
  }, [pendingVotes]);

  const handleLocalVote = useCallback(
    (submissionId: string, value: VoteValue) => {
      const nextVotes = new Map(pendingVotes);
      nextVotes.set(submissionId, value);

      setPendingVotes(nextVotes);

      if (currentSubmissions.length > 0 && nextVotes.size === currentSubmissions.length) {
        handleSubmitBatch(nextVotes);
      }
    },
    [pendingVotes, currentSubmissions.length, handleSubmitBatch],
  );

  useEffect(() => {
    if (view !== "results") return;

    // Timer is initialized in handleSubmitBatch, so we just handle the countdown
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      handleContinue();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [view, handleContinue]);

  const isOutOfSubmissions =
    view === "voting" &&
    randomSubmissions !== undefined &&
    currentSubmissions.length === 0 &&
    excludeIds.length > 0;

  return (
    <div className="container mx-auto px-4 py-10 space-y-12">
      <div className="relative">
        {!hasAcceptedDisclaimer && <DisclaimerOverlay onAccept={acceptDisclaimer} />}
        <VotingSection
          submissions={currentSubmissions}
          pendingVotes={pendingVotes}
          view={view}
          timeRemaining={timeRemaining}
          isOutOfSubmissions={isOutOfSubmissions}
          isLoading={currentSubmissions.length === 0 && !isOutOfSubmissions}
          onVote={handleLocalVote}
        />
      </div>

      <LeaderboardSection
        type={leaderboardType}
        onTypeChange={setPreferredLeaderboardType}
        leaderboard={leaderboard}
        modelStats={stats?.modelStats}
        canToggle={hasAcceptedDisclaimer}
        canNavigate={hasAcceptedDisclaimer}
      />

      <section className="text-center space-y-4 py-6">
        <h2 className="text-lg font-medium text-muted-foreground">Explore More</h2>
        <div className="flex justify-center gap-3">
          <Link href="/browse">
            <Button size="sm" disabled={!hasAcceptedDisclaimer}>
              Browse All
            </Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" size="sm">
              View Stats
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
