/**
 * src/components/StatCard.tsx
 * Displays a single statistic value with label and optional subtext.
 * Used on the StatsPage for key metrics like total submissions, votes, etc.
 */
import type { ReactNode } from "react";
import { BarChart3, CheckCircle2, AlertTriangle, Trophy } from "lucide-react";
import { Card } from "./ui/card";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  valueClassName?: string;
  type?: "default" | "votes" | "coverage" | "hallucination" | "score";
}

const icons = {
  default: Trophy,
  votes: BarChart3,
  coverage: CheckCircle2,
  hallucination: AlertTriangle,
  score: Trophy,
};

export function StatCard({
  title,
  value,
  subtitle,
  valueClassName = "",
  type = "default",
}: StatCardProps) {
  const Icon = icons[type];

  return (
    <Card className="p-5 gap-3 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <div className={`text-2xl font-semibold ${valueClassName}`}>{value}</div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">{subtitle}</p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}
