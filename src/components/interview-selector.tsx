"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { AshbyCandidate } from "@/lib/ashby";

interface InterviewSelectorProps {
  candidates: AshbyCandidate[];
  loading: boolean;
  onSelect: (candidate: AshbyCandidate) => void;
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-orange-600",
  "bg-teal-600",
  "bg-pink-600",
  "bg-lime-600",
  "bg-fuchsia-600",
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

export function InterviewSelector({
  candidates,
  loading,
  onSelect,
}: InterviewSelectorProps) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  // Get unique sources for filter
  const sources = useMemo(() => {
    const s = new Set<string>();
    candidates.forEach((c) => {
      if (c.source?.title) s.add(c.source.title);
    });
    return Array.from(s).sort();
  }, [candidates]);

  const filtered = candidates.filter((c) => {
    // Text search
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.position?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.company?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.primaryEmailAddress?.value
        .toLowerCase()
        .includes(search.toLowerCase()) ?? false);

    // Source filter
    const matchesSource =
      !sourceFilter || c.source?.title === sourceFilter;

    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Interview Cockpit</h2>
        <p className="text-muted-foreground">
          Select a candidate to start your interview session
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <Input
          placeholder="Search candidates by name, role, company, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {/* Source filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSourceFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !sourceFilter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All Sources
          </button>
          {sources.map((source) => (
            <button
              key={source}
              onClick={() =>
                setSourceFilter(sourceFilter === source ? null : source)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sourceFilter === source
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {source}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {candidates.length} candidates
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground py-8 text-center">
          Loading candidates from Ashby...
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((candidate) => {
            const initials = getInitials(candidate.name);
            const color = getColorForName(candidate.name);

            return (
              <Card
                key={candidate.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onSelect(candidate)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`${color} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">
                        {candidate.name}
                      </CardTitle>
                      {candidate.position && (
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.position}
                          {candidate.company ? ` at ${candidate.company}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm pt-0">
                  {candidate.primaryEmailAddress && (
                    <p className="text-muted-foreground text-xs truncate">
                      {candidate.primaryEmailAddress.value}
                    </p>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {candidate.source && (
                      <Badge variant="secondary" className="text-xs">
                        {candidate.source.title}
                      </Badge>
                    )}
                    {candidate.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.title}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && !loading && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No candidates found
              {search ? ` matching "${search}"` : ""}
              {sourceFilter ? ` from ${sourceFilter}` : ""}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
