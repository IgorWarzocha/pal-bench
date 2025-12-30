/**
 * src/components/PalCard.tsx
 * Card component displaying a Pal submission with voting controls.
 * Supports "blind" voting (hiding details) and compact layout.
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

export interface PalCardProps {
  submission: Doc<"submissions">;
  userVote?: VoteValue | null;
  onVote?: (value: VoteValue) => void;
  hideDetails?: boolean;
  readOnly?: boolean;
}

export function PalCard({
  submission,
  userVote,
  onVote,
  hideDetails = false,
  readOnly = false,
}: PalCardProps) {
  const castVote = useMutation(api.voting.castVote);
  const removeVote = useMutation(api.voting.removeVote);
  const clientId = useMemo(() => getFingerprint(), []);

  const handleVote = (value: VoteValue) => {
    if (readOnly) return;
    if (onVote) {
      onVote(value);
      return;
    }

    if (userVote === value) {
      void removeVote({
        submissionId: submission._id,
        clientId,
        type: "image",
      });
    } else {
      void castVote({
        submissionId: submission._id,
        clientId,
        type: "image",
        value,
      });
    }
  };

  const cleanSvg = useMemo(
    () => DOMPurify.sanitize(submission.svgCode),
    [submission.svgCode],
  );

  const imageScore = submission.upvotes_image - submission.downvotes_image;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-200 gap-0 p-0">
      <CardHeader className="p-2 pb-0 space-y-0">
        <div className="flex justify-between items-center h-8">
          <CardTitle className="text-base capitalize truncate pr-2">
            {submission.name}
          </CardTitle>
          {!hideDetails && (
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary" className="text-[10px] px-1 h-4">
                {submission.model}
              </Badge>
              {submission.isHallucination && (
                <HallucinationBadge reason={submission.hallucinationReason} />
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2 flex-grow flex flex-col gap-2">
        <div className="aspect-square w-full flex items-center justify-center bg-muted/20 rounded-md border overflow-hidden p-2">
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: cleanSvg }}
          />
        </div>

        {submission.description && (
          <div className="text-[10px] text-muted-foreground line-clamp-2 px-1 min-h-[2.5em] leading-tight">
            {submission.description}
          </div>
        )}

        {!readOnly && (
          <VoteButtons
            currentVote={userVote}
            score={hideDetails ? null : imageScore}
            onVote={handleVote}
            className="w-full"
          />
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
        <div className="text-destructive cursor-help">
          <AlertTriangle className="h-4 w-4" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{reason || "Flagged as hallucination"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
