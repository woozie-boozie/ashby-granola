"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AshbyCandidate } from "@/lib/ashby";

interface CvViewerProps {
  candidate: AshbyCandidate;
}

export function CvViewer({ candidate }: CvViewerProps) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (candidate.resumeFileHandle) {
      setLoading(true);
      setResumeUrl(null);
      fetch(
        `/api/ashby/resume?handle=${encodeURIComponent(candidate.resumeFileHandle.handle)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.url) setResumeUrl(data.url);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [candidate.resumeFileHandle]);

  if (!candidate.resumeFileHandle) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">No CV on file.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">
          {candidate.resumeFileHandle.name}
        </CardTitle>
        {resumeUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(resumeUrl, "_blank")}
          >
            Open in New Tab
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading CV...</p>
          </div>
        ) : resumeUrl ? (
          <iframe
            src={resumeUrl}
            className="w-full h-full rounded-b-lg"
            style={{ minHeight: "calc(100vh - 140px)" }}
            title={`Resume - ${candidate.name}`}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Failed to load CV.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
