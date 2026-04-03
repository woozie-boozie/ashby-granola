"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AshbyCandidate,
  AshbyApplication,
} from "@/lib/ashby";

interface CandidateCardProps {
  candidate: AshbyCandidate;
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

export function CandidateCard({ candidate, application }: CandidateCardProps) {
  const initials = getInitials(candidate.name);
  const color = getColorForName(candidate.name);

  return (
    <Card>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`${color} w-10 h-10 xl:w-14 xl:h-14 rounded-full flex items-center justify-center text-white text-sm xl:text-lg font-bold shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base xl:text-xl">{candidate.name}</CardTitle>
            {candidate.position && (
              <p className="text-sm text-muted-foreground truncate">
                {candidate.position}
                {candidate.company ? ` at ${candidate.company}` : ""}
              </p>
            )}
            {candidate.school && (
              <p className="text-xs xl:text-sm text-muted-foreground truncate">{candidate.school}</p>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="shrink-0"
            onClick={() => window.open(candidate.profileUrl, "_blank")}
          >
            Open in Ashby
          </Button>
        </div>
      </CardHeader>

      {/* Application */}
      {application && (
        <CardContent className="space-y-3">
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

          {/* Hiring Team */}
          {application.hiringTeam.length > 0 && (
            <div>
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
            <div className="flex gap-1 flex-wrap">
              {candidate.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">{tag.title}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
