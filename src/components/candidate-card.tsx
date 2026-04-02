"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type {
  AshbyCandidate,
  AshbyApplication,
  AshbyApplicationFeedback,
  AshbyInterview,
} from "@/lib/ashby";

interface CandidateCardProps {
  candidate: AshbyCandidate;
  interviews?: AshbyInterview[];
  application: AshbyApplication | null;
}

const AVATAR_COLORS = [
  "bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600",
  "bg-rose-600", "bg-cyan-600", "bg-indigo-600", "bg-orange-600",
  "bg-teal-600", "bg-pink-600", "bg-lime-600", "bg-fuchsia-600",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  "4": "4 - Strong Yes",
  "3": "3 - Yes",
  "2": "2 - No",
  "1": "1 - Strong No",
};

const RECOMMENDATION_COLORS: Record<string, string> = {
  "4": "bg-green-600 text-white",
  "3": "bg-green-400 text-white",
  "2": "bg-red-400 text-white",
  "1": "bg-red-600 text-white",
};

export function CandidateCard({ candidate, application, interviews }: CandidateCardProps) {
  const [feedbackList, setFeedbackList] = useState<AshbyApplicationFeedback[]>([]);

  const initials = getInitials(candidate.name);
  const color = getColorForName(candidate.name);

  // Auto-load feedback on mount
  useEffect(() => {
    if (application) {
      fetch(`/api/ashby/feedback?applicationId=${application.id}`)
        .then((res) => res.json())
        .then((data) => { if (data.results) setFeedbackList(data.results); })
        .catch(console.error);
    }
  }, [application]);

  return (
    <Card className="h-full overflow-auto">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className={`${color} w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{candidate.name}</CardTitle>
            {candidate.position && (
              <p className="text-muted-foreground">
                {candidate.position}
                {candidate.company ? ` at ${candidate.company}` : ""}
              </p>
            )}
            {candidate.school && (
              <p className="text-sm text-muted-foreground">{candidate.school}</p>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open(candidate.profileUrl, "_blank")}
          >
            Open in Ashby
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Contact */}
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {candidate.primaryEmailAddress && (
              <a href={`mailto:${candidate.primaryEmailAddress.value}`} className="text-blue-600 hover:underline">
                {candidate.primaryEmailAddress.value}
              </a>
            )}
            {candidate.primaryPhoneNumber && (
              <a href={`tel:${candidate.primaryPhoneNumber.value}`} className="text-blue-600 hover:underline">
                {candidate.primaryPhoneNumber.value}
              </a>
            )}
            {candidate.location && (
              <span className="text-muted-foreground">{candidate.location.locationSummary}</span>
            )}
          </div>
          {candidate.socialLinks.length > 0 && (
            <div className="flex gap-3 mt-1">
              {candidate.socialLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                  {link.type}
                </a>
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* Application */}
        {application && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Application</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {application.job && (
                <div>
                  <span className="text-muted-foreground">Role: </span>
                  <span className="font-medium">{application.job.title}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={application.status === "Active" ? "default" : "secondary"} className="text-xs">
                  {application.status}
                </Badge>
              </div>
              {application.currentInterviewStage && (
                <div>
                  <span className="text-muted-foreground">Stage: </span>
                  <span>{application.currentInterviewStage.title}</span>
                </div>
              )}
              {application.source && (
                <div>
                  <span className="text-muted-foreground">Source: </span>
                  <span>{application.source.title}</span>
                </div>
              )}
            </div>

            {application.archiveReason && (
              <p className="text-sm mt-2 text-red-600">
                Archived: {application.archiveReason.text}
              </p>
            )}

            {/* Hiring Team */}
            {application.hiringTeam.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-muted-foreground">Hiring Team: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.hiringTeam.map((m) => (
                    <Badge key={m.userId} variant="outline" className="text-xs">
                      {m.firstName} {m.lastName} ({m.role})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {candidate.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2">
                {candidate.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">{tag.title}</Badge>
                ))}
              </div>
            )}
          </section>
        )}

        <Separator />

        {/* Prior Feedback */}
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Prior Feedback</h4>
          {feedbackList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No prior feedback.</p>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((fb) => {
                const rec = fb.submittedValues.overall_recommendation;
                return (
                  <div key={fb.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {fb.submittedByUser.firstName} {fb.submittedByUser.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(fb.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rec && (
                        <Badge className={`text-xs ${RECOMMENDATION_COLORS[rec] || ""}`}>
                          {RECOMMENDATION_LABELS[rec] || rec}
                        </Badge>
                      )}
                    </div>
                    {fb.submittedValues.feedback && (
                      <p className="text-sm whitespace-pre-wrap bg-muted rounded p-2 text-xs leading-relaxed">
                        {fb.submittedValues.feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <Separator />

        {/* Pipeline History */}
        {application && application.applicationHistory.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Pipeline History</h4>
            <div className="space-y-1">
              {application.applicationHistory.map((stage) => (
                <div key={stage.id} className="text-xs flex items-center gap-2">
                  <span className="text-muted-foreground w-4 text-right">{stage.stageNumber}.</span>
                  <span className="font-medium">{stage.title}</span>
                  <span className="text-muted-foreground">
                    {new Date(stage.enteredStageAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interview Guide (collapsible) */}
        {interviews && interviews.filter((i) => !i.isArchived && !i.isDebrief && i.instructionsHtml).length > 0 && (
          <>
            <Separator />
            <details className="group">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform">&#9654;</span>
                Interview Guides
              </summary>
              <div className="mt-3 space-y-3">
                {interviews
                  .filter((i) => !i.isArchived && !i.isDebrief && i.instructionsHtml)
                  .map((interview) => (
                    <details key={interview.id} className="rounded-lg border p-3">
                      <summary className="cursor-pointer text-sm font-medium hover:text-primary transition-colors list-none flex items-center gap-1">
                        <span className="group-open:rotate-90 transition-transform text-xs">&#9654;</span>
                        {interview.title}
                      </summary>
                      <div
                        className="mt-2 prose prose-sm max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: interview.instructionsHtml! }}
                      />
                    </details>
                  ))}
              </div>
            </details>
          </>
        )}
      </CardContent>
    </Card>
  );
}
