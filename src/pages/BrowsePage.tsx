/**
 * src/pages/BrowsePage.tsx
 * Paginated grid view of all submissions with search and filter controls.
 * Supports model filtering, text search, and sort ordering.
 */
"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { Search } from "lucide-react";
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

type SortOption = "newest" | "oldest" | "most_upvoted";

export function BrowsePage() {
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.queries.listSubmissions,
    { model: selectedModel, sortBy },
    { initialNumItems: 20 },
  );

  const searchResults = useQuery(
    api.queries.searchSubmissions,
    searchQuery ? { searchQuery, model: selectedModel } : "skip",
  );

  const activeSubmissions = searchQuery ? searchResults : results;
  const isSearchLoading = searchQuery ? searchResults === undefined : false;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Browse Submissions
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Pokemon..."
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
