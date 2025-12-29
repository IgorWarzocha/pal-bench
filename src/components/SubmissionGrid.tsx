/**
 * src/components/SubmissionGrid.tsx
 * Responsive grid layout for displaying Pokemon submissions with vote controls.
 * Fetches user votes for all visible submissions in a single batch query.
 */
"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { getFingerprint } from "../lib/fingerprint";
import { PokemonCard } from "./PokemonCard";

interface SubmissionGridProps {
  submissions: Doc<"submissions">[];
  isLoading?: boolean;
}

export function SubmissionGrid({
  submissions,
  isLoading,
}: SubmissionGridProps) {
  const clientId = useMemo(() => getFingerprint(), []);

  const submissionIds = useMemo(
    () => submissions.map((s) => s._id),
    [submissions],
  );

  const votes = useQuery(api.voting.getClientVotesBatch, {
    submissionIds,
    clientId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[400px] bg-muted/20 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No submissions found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {submissions.map((submission) => (
        <PokemonCard
          key={submission._id}
          submission={submission}
          userVotes={votes ? votes[submission._id] : undefined}
        />
      ))}
    </div>
  );
}
