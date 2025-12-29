/**
 * src/components/PokemonCard.tsx
 * Card component displaying a Pokemon submission with voting controls.
 * Supports both immediate voting and pending (batch) mode for efficiency.
 */
"use client";

import { useMutation } from "convex/react";
import DOMPurify from "dompurify";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { getFingerprint } from "../lib/fingerprint";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { VoteButtons, type VoteValue } from "./VoteButtons";

export interface PokemonCardProps {
  submission: Doc<"submissions">;
  userVotes?: {
    imageVote: VoteValue | null;
    dataVote: VoteValue | null;
  };
  pendingMode?: boolean;
  onVote?: (value: VoteValue) => void;
}

export function PokemonCard({
  submission,
  userVotes,
  pendingMode = false,
  onVote,
}: PokemonCardProps) {
  const castVote = useMutation(api.voting.castVote);
  const removeVote = useMutation(api.voting.removeVote);
  const clientId = useMemo(() => getFingerprint(), []);

  const handleVote = (type: "image" | "data", value: VoteValue) => {
    if (pendingMode && type === "image" && onVote) {
      onVote(value);
      return;
    }

    const currentVote =
      type === "image" ? userVotes?.imageVote : userVotes?.dataVote;

    if (currentVote === value) {
      void removeVote({ submissionId: submission._id, clientId, type });
    } else {
      void castVote({ submissionId: submission._id, clientId, type, value });
    }
  };

  const cleanSvg = useMemo(
    () => DOMPurify.sanitize(submission.svgCode),
    [submission.svgCode],
  );

  const imageScore = submission.upvotes_image - submission.downvotes_image;
  const dataScore = submission.upvotes_data - submission.downvotes_data;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl capitalize">
              {submission.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              #{submission.pokedexNumber}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline">{submission.model}</Badge>
            {submission.isHallucination && (
              <HallucinationBadge reason={submission.hallucinationReason} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-grow flex flex-col gap-4">
        <div className="aspect-square w-full flex items-center justify-center bg-muted/20 rounded-lg border overflow-hidden p-2">
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: cleanSvg }}
          />
        </div>

        <VoteButtons
          label="Visual Quality"
          currentVote={userVotes?.imageVote}
          score={pendingMode ? null : imageScore}
          onVote={(value) => handleVote("image", value)}
        />

        {!pendingMode && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground line-clamp-3">
              {submission.description}
            </div>
            <VoteButtons
              label="Data Accuracy"
              currentVote={userVotes?.dataVote}
              score={dataScore}
              onVote={(value) => handleVote("data", value)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface HallucinationBadgeProps {
  reason: string | undefined;
}

function HallucinationBadge({ reason }: HallucinationBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="destructive"
          className="flex items-center gap-1 cursor-help"
        >
          <AlertTriangle className="h-3 w-3" />
          Hallucination
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{reason || "Flagged as hallucination"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
