"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AshbyInterview } from "@/lib/ashby";

interface InterviewGuideProps {
  interviews: AshbyInterview[];
  selectedInterviewId: string | null;
  onSelectInterview: (id: string) => void;
}

export function InterviewGuide({
  interviews,
  selectedInterviewId,
  onSelectInterview,
}: InterviewGuideProps) {
  const activeInterviews = interviews.filter((i) => !i.isArchived && !i.isDebrief);
  const selected = interviews.find((i) => i.id === selectedInterviewId);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Interview Guide</CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          {activeInterviews.map((interview) => (
            <button
              key={interview.id}
              onClick={() => onSelectInterview(interview.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedInterviewId === interview.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {interview.title}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {selected ? (
          <div className="space-y-3">
            <h3 className="font-semibold">{selected.title}</h3>
            {selected.instructionsHtml ? (
              <div
                className="prose prose-sm max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: selected.instructionsHtml }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No interview guide available for this interview type.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select an interview type above to see the guide and rubric.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
