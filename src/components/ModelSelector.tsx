/**
 * src/components/ModelSelector.tsx
 * Dropdown select for filtering submissions by AI model.
 * Fetches available models from the backend.
 */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ModelSelectorProps {
  selectedModel?: string;
  onSelectModel: (model: string | undefined) => void;
  className?: string;
}

export function ModelSelector({ selectedModel, onSelectModel, className }: ModelSelectorProps) {
  const models = useQuery(api.queries.getModels);

  return (
    <div className={className}>
      <Select
        value={selectedModel ?? "all"}
        onValueChange={(value) => onSelectModel(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Models</SelectItem>
          {models?.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
