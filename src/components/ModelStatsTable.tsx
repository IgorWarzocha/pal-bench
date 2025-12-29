/**
 * src/components/ModelStatsTable.tsx
 * Detailed breakdown table showing per-model statistics.
 * Displays submission count, scores, and hallucination rates.
 */

interface ModelStat {
  model: string;
  submissionCount: number;
  avgNetScoreImage: number;
  avgNetScoreData: number;
  hallucinationRate: number;
  hallucinationCount: number;
}

interface ModelStatsTableProps {
  stats: ModelStat[];
}

export function ModelStatsTable({ stats }: ModelStatsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
              Model
            </th>
            <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
              Submissions
            </th>
            <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
              Image Score
            </th>
            <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
              Data Score
            </th>
            <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
              Hallucinations
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map((model) => (
            <tr
              key={model.model}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td className="p-2 align-middle font-medium">{model.model}</td>
              <td className="p-2 align-middle text-right">
                {model.submissionCount}
              </td>
              <td className="p-2 align-middle text-right text-purple-600 font-bold">
                {model.avgNetScoreImage.toFixed(1)}
              </td>
              <td className="p-2 align-middle text-right text-green-600 font-bold">
                {model.avgNetScoreData.toFixed(1)}
              </td>
              <td className="p-2 align-middle text-right text-red-600 font-bold">
                {model.hallucinationRate.toFixed(1)}%
                <span className="text-xs text-muted-foreground ml-1 font-normal">
                  ({model.hallucinationCount})
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
