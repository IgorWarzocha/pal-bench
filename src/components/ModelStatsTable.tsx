/**
 * src/components/ModelStatsTable.tsx
 * Detailed breakdown table showing per-model statistics.
 * Displays submission count, scores, and hallucination rates.
 */

export interface ModelStats {
  model: string;
  submissionCount: number;
  avgNetScoreImage: number;
  hallucinationRate: number;
  hallucinationCount: number;
}

interface ModelStatsTableProps {
  stats: ModelStats[];
}

export function ModelStatsTable({ stats }: ModelStatsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Model
            </th>
            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
              Submissions
            </th>
            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
              Score
            </th>
            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
              Hallucinations
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map((model, index) => (
            <tr
              key={model.model}
              className={`border-b transition-colors duration-150 hover:bg-muted/20 ${
                index % 2 === 0 ? "bg-background" : "bg-muted/10"
              }`}
            >
              <td className="p-3 align-middle font-medium">{model.model}</td>
              <td className="p-3 align-middle text-right text-muted-foreground">
                {model.submissionCount}
              </td>
              <td className="p-3 align-middle text-right font-semibold text-foreground">
                {model.avgNetScoreImage.toFixed(1)}
              </td>
              <td className="p-3 align-middle text-right font-medium text-destructive/80">
                {model.hallucinationRate.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
