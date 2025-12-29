/**
 * src/components/StatCard.tsx
 * Displays a single statistic value with label and optional subtext.
 * Used on the StatsPage for key metrics like total submissions, votes, etc.
 */
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold ${valueClassName}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
