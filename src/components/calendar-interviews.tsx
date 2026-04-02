"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AshbyCandidate } from "@/lib/ashby";

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  meetLink: string | null;
  attendees: { email: string; name: string; responseStatus: string }[];
  htmlLink: string;
  matchedCandidate: AshbyCandidate | null;
  isNow: boolean;
  minutesUntil: number;
}

interface CalendarInterviewsProps {
  onSelectCandidate: (candidate: AshbyCandidate) => void;
}

export function CalendarInterviews({
  onSelectCandidate,
}: CalendarInterviewsProps) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    setLoading(true);
    fetch("/api/google/calendar")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setEvents(data.events || []);
          // Auto-select if a meeting is happening right now
          const liveEvent = (data.events || []).find(
            (e: CalendarEvent) => e.isNow && e.matchedCandidate
          );
          if (liveEvent?.matchedCandidate) {
            onSelectCandidate(liveEvent.matchedCandidate);
          }
        }
      })
      .catch(() => setError("Failed to load calendar"))
      .finally(() => setLoading(false));
  }, [session, onSelectCandidate]);

  if (!session) return null;

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Loading calendar events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-2">Calendar: {error}</div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No upcoming meetings today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Today&apos;s Meetings</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const startTime = new Date(event.start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <Card
              key={event.id}
              className={`cursor-pointer transition-colors ${
                event.isNow
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : event.matchedCandidate
                    ? "hover:border-primary/50"
                    : "opacity-60"
              }`}
              onClick={() => {
                if (event.matchedCandidate) {
                  onSelectCandidate(event.matchedCandidate);
                }
              }}
            >
              <CardContent className="pt-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {startTime}
                  </span>
                  {event.isNow && (
                    <Badge className="bg-green-600 text-white text-xs">
                      LIVE NOW
                    </Badge>
                  )}
                  {!event.isNow && event.minutesUntil > 0 && event.minutesUntil <= 60 && (
                    <Badge variant="outline" className="text-xs">
                      in {event.minutesUntil}m
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{event.summary}</p>
                {event.matchedCandidate ? (
                  <div className="flex items-center gap-1">
                    <Badge variant="default" className="text-xs">
                      Candidate match
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {event.matchedCandidate.name}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {event.attendees
                      .slice(0, 2)
                      .map((a) => a.name || a.email)
                      .join(", ")}
                    {event.attendees.length > 2 &&
                      ` +${event.attendees.length - 2}`}
                  </p>
                )}
                {event.meetLink && (
                  <p className="text-xs text-blue-600">Google Meet</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
