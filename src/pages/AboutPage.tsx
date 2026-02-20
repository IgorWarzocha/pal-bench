/**
 * src/pages/AboutPage.tsx
 * Simple informational page about the project.
 */
export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">About Pal-Bench</h1>
      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pal-Bench is an independent research initiative benchmarking generic LLMs on their
          semantic understanding of cultural concepts.
        </p>

        <div className="prose dark:prose-invert space-y-5 max-w-none text-sm">
          <h2 className="text-base font-medium">Methodology</h2>
          <p className="text-muted-foreground leading-relaxed">
            We evaluate the <strong>zero-shot visual generation capabilities</strong> of various
            Large Language Models (LLMs) by asking them to write raw SVG code. Unlike diffusion
            models (like Midjourney or DALL-E) which generate pixels, our benchmark tests an LLM's
            ability to:
          </p>
          <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
            <li>
              <strong>Recall</strong> detailed visual features of specific entities from their
              training data.
            </li>
            <li>
              <strong>Translate</strong> that semantic knowledge into valid vector graphics code.
            </li>
            <li>
              <strong>Avoid Hallucinations</strong> (generating incorrect or unrelated visual
              features).
            </li>
          </ul>

          <h2 className="text-base font-medium pt-2">Why SVG?</h2>
          <p className="text-muted-foreground leading-relaxed">
            By restricting output to code-based SVG, we isolate the model's "mental image" and
            coding ability from the noise of pixel-based generation. This provides a clearer signal
            of a model's multimodal understanding and data accuracy.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            By removing explicit model names during the voting phase, we ensure unbiased evaluation
            based purely on visual quality and accuracy to the subject matter.
          </p>

          <div className="bg-muted/20 p-4 rounded-lg border text-xs text-muted-foreground mt-6 leading-relaxed">
            <strong className="font-medium">Legal Disclaimer:</strong> This project is a
            non-commercial research benchmark. It is not affiliated with, endorsed, sponsored, or
            specifically approved by Nintendo, or any AI model provider. All trademarks are the
            property of their respective owners and are used here for comparative analytical
            purposes only.
          </div>
        </div>
      </div>
    </div>
  );
}
