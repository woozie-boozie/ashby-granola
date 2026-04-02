"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  );
}
