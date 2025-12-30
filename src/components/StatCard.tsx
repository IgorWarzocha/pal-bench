/**
 * src/components/StatCard.tsx
 * Displays a single statistic value with label and optional subtext.
 * Used on the StatsPage for key metrics like total submissions, votes, etc.
 */
import type { ReactNode } from "react";
import { Card } from "./ui/card";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  valueClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  valueClassName = "",
}: StatCardProps) {
  return (
    <Card className="p-4 gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
