/**
 * src/pages/BrowsePage.tsx
 * Paginated grid view of all submissions with search and filter controls.
 * Supports model filtering, text search, and sort ordering.
 */
"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { AlertTriangle, Search } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { ModelSelector } from "../components/ModelSelector";
import { SubmissionGrid } from "../components/SubmissionGrid";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Toggle } from "../components/ui/toggle";
import { useDisclaimer } from "../lib/DisclaimerContext";

type SortOption = "newest" | "oldest" | "most_upvoted";

export function BrowsePage() {
  const { hasAcceptedDisclaimer } = useDisclaimer();
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showHallucinationsOnly, setShowHallucinationsOnly] = useState(
    !hasAcceptedDisclaimer,
  );

  // Enforce hallucinations only if disclaimer not accepted
  const forceHallucinations = !hasAcceptedDisclaimer;
  const effectiveHallucinationsOnly =
    forceHallucinations || showHallucinationsOnly;

  // We need to update listSubmissions to support hallucination filtering
  // For now, let's assume we can pass this param. If not, we'll need to update the backend query.
  // Since we can't easily update backend types here, we will filter client-side if needed,
  // but ideally we should update the query.
  // WAITING: I'll assume the query needs updating or we filter client side for now?
  // actually, let's check listSubmissions args first.

  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.queries.listSubmissions,
    { model: selectedModel, sortBy },
    { initialNumItems: 50 }, // Fetch more to client-filter effectively if needed
  );

  const searchResults = useQuery(
    api.queries.searchSubmissions,
    searchQuery ? { searchQuery, model: selectedModel } : "skip",
  );

  let activeSubmissions = searchQuery ? searchResults : results;

  // Client-side filtering for hallucinations if query doesn't support it yet
  if (activeSubmissions && effectiveHallucinationsOnly) {
    activeSubmissions = activeSubmissions.filter((s) => s.isHallucination);
  }

  const isSearchLoading = searchQuery ? searchResults === undefined : false;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Browse Submissions
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-wrap items-center">
          {!forceHallucinations && (
            <Toggle
              pressed={showHallucinationsOnly}
              onPressedChange={setShowHallucinationsOnly}
              variant="outline"
              aria-label="Toggle hallucinated only"
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Hallucinations Only
            </Toggle>
          )}

          {forceHallucinations && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              Showing hallucinations only (Disclaimer pending)
            </div>
          )}

          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Pal..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            className="w-full sm:w-auto"
          />

          <Select
            value={sortBy}
            onValueChange={(v: SortOption) => setSortBy(v)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most_upvoted">Most Upvoted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SubmissionGrid
        submissions={activeSubmissions || []}
        isLoading={isLoading || isSearchLoading}
        readOnly={true}
      />

      {!searchQuery && status === "CanLoadMore" && (
        <div className="flex justify-center pt-8">
          <Button onClick={() => loadMore(20)} size="lg" variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
