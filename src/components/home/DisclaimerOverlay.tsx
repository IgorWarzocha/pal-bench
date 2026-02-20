/**
 * src/components/home/DisclaimerOverlay.tsx
 * Modal overlay requiring users to accept research disclaimer before voting.
 * Blocks interaction with voting UI until acknowledged.
 */
import { Link } from "wouter";
import { Button } from "../ui/button";

interface DisclaimerOverlayProps {
  onAccept: () => void;
}

export function DisclaimerOverlay({ onAccept }: DisclaimerOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-background/60 rounded-xl">
      <div className="max-w-md w-full p-6 border rounded-xl bg-card shadow-lg text-left space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Research Disclaimer</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Pal-Bench is an independent research initiative benchmarking generic LLMs on semantic
            recall and code generation. We validate multimodal understanding and hallucination rates
            via pure SVG output, without using image-generation models.
          </p>
          <p>
            You may recognize names used as research prompts. These trademarks serve solely as{" "}
            <strong>comparative benchmarks</strong> for model evaluation. This project is a
            non-commercial study of AI capabilities and is not affiliated with or endorsed by
            Nintendo or any rights holders. See{" "}
            <Link href="/about" className="underline hover:text-primary transition-colors">
              About
            </Link>{" "}
            for our methodology.
          </p>
        </div>
        <Button onClick={onAccept} className="w-full" size="sm">
          I Understand
        </Button>
      </div>
    </div>
  );
}
