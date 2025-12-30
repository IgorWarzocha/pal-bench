/**
 * src/pages/StatsPage.tsx
 * Statistics dashboard with overall metrics and per-model performance charts.
 * Displays submission counts, vote totals, coverage, and hallucination rates.
 */
"use client";

import { useQuery } from "convex/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../convex/_generated/api";
import { ModelStatsTable } from "../components/ModelStatsTable";
import { StatCard } from "../components/StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export function StatsPage() {
  const stats = useQuery(api.queries.getStats);

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-40 bg-muted rounded-lg" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const coveragePercent = Math.round(
    (stats.speciesCoverage.unique / stats.speciesCoverage.total) * 100,
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Leaderboard & Statistics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions.toLocaleString()}
        />
        <StatCard
          title="Total Votes"
          value={stats.totalVotes.toLocaleString()}
        />
        <StatCard
          title="Coverage"
          value={`${coveragePercent}%`}
          subtitle={`${stats.speciesCoverage.unique} / ${stats.speciesCoverage.total} valid & unique entries`}
        />
        <StatCard
          title="Hallucination Rate"
          value={`${stats.hallucinationRate.toFixed(1)}%`}
          subtitle="flagged outputs"
          valueClassName="text-red-600"
        />
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Model Performance{" "}
              <span className="text-muted-foreground font-normal text-base">
                (average net upvotes per submission)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.modelStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend />
                <Bar
                  dataKey="avgNetScoreImage"
                  name="Score"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detailed Model Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <ModelStatsTable stats={stats.modelStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
