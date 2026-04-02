"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeedbackFormProps {
  onFeedbackChange: (feedback: FeedbackData) => void;
  feedback: FeedbackData;
}

export interface FeedbackData {
  recommendation: string;
  adjectives: string[];
  additionalThoughts: string;
}

const RECOMMENDATION_OPTIONS = [
  { value: "4", label: "4 - Strong Yes", color: "bg-green-600" },
  { value: "3", label: "3 - Yes", color: "bg-green-400" },
  { value: "2", label: "2 - No", color: "bg-red-400" },
  { value: "1", label: "1 - Strong No", color: "bg-red-600" },
];

export function FeedbackForm({ onFeedbackChange, feedback }: FeedbackFormProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !feedback.adjectives.includes(tag)) {
      const updated = {
        ...feedback,
        adjectives: [...feedback.adjectives, tag],
      };
      onFeedbackChange(updated);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onFeedbackChange({
      ...feedback,
      adjectives: feedback.adjectives.filter((t) => t !== tag),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Recommendation */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Overall Recommendation</h4>
          <div className="grid grid-cols-2 gap-2">
            {RECOMMENDATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  onFeedbackChange({ ...feedback, recommendation: opt.value })
                }
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  feedback.recommendation === opt.value
                    ? `${opt.color} text-white border-transparent scale-105`
                    : "bg-secondary text-secondary-foreground border-transparent hover:border-primary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Adjective Tags */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">
            Adjectives / Labels
            <span className="font-normal text-muted-foreground ml-1">
              (e.g., articulate, high-agency, collaborative)
            </span>
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Add an adjective..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1"
            />
            <Button variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
              Add
            </Button>
          </div>
          {feedback.adjectives.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {feedback.adjectives.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Additional Thoughts */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Additional Thoughts</h4>
          <Textarea
            placeholder="Any additional observations, context, or notes..."
            value={feedback.additionalThoughts}
            onChange={(e) =>
              onFeedbackChange({
                ...feedback,
                additionalThoughts: e.target.value,
              })
            }
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
