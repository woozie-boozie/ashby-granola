"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FeedbackData } from "@/components/feedback-form";

interface SubmitPanelProps {
  structuredNotes: string;
  feedback: FeedbackData;
  candidateName: string;
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  "4": "4 - Strong Yes",
  "3": "3 - Yes",
  "2": "2 - No",
  "1": "1 - Strong No",
};

export function SubmitPanel({
  structuredNotes,
  feedback,
  candidateName,
}: SubmitPanelProps) {
  const [copied, setCopied] = useState(false);

  const buildOutput = () => {
    let output = `# Interview Feedback: ${candidateName}\n\n`;

    if (feedback.recommendation) {
      output += `**Overall Recommendation:** ${RECOMMENDATION_LABELS[feedback.recommendation] || feedback.recommendation}\n\n`;
    }

    if (feedback.adjectives.length > 0) {
      output += `**Key Adjectives:** ${feedback.adjectives.join(", ")}\n\n`;
    }

    if (structuredNotes) {
      output += `---\n\n${structuredNotes}\n\n`;
    }

    if (feedback.additionalThoughts) {
      output += `---\n\n**Additional Thoughts:**\n${feedback.additionalThoughts}\n`;
    }

    return output;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isReady = feedback.recommendation && structuredNotes;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review & Submit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
          <h4 className="font-semibold">Preview</h4>
          {feedback.recommendation && (
            <p>
              <strong>Recommendation:</strong>{" "}
              {RECOMMENDATION_LABELS[feedback.recommendation]}
            </p>
          )}
          {feedback.adjectives.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {feedback.adjectives.map((adj) => (
                <Badge key={adj} variant="outline" className="text-xs">
                  {adj}
                </Badge>
              ))}
            </div>
          )}
          {structuredNotes && (
            <div className="mt-2 border-t pt-2">
              <p className="text-muted-foreground text-xs">Structured notes included</p>
            </div>
          )}
          {feedback.additionalThoughts && (
            <div className="border-t pt-2">
              <p className="text-muted-foreground text-xs">
                + Additional thoughts included
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleCopy} disabled={!isReady} className="flex-1">
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button
            disabled
            variant="outline"
            className="flex-1 opacity-50"
            title="Requires Ashby write access — coming soon"
          >
            Save to Ashby (coming soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
