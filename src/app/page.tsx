"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { InterviewSelector } from "@/components/interview-selector";
import { CandidateCard } from "@/components/candidate-card";
import { CvViewer } from "@/components/cv-viewer";
import { NotesInput } from "@/components/notes-input";
import { StructuredNotes } from "@/components/structured-notes";
import { FeedbackForm } from "@/components/feedback-form";
import { SubmitPanel } from "@/components/submit-panel";
import { GoogleSignIn } from "@/components/google-sign-in";
import { CalendarInterviews } from "@/components/calendar-interviews";
import type { FeedbackData } from "@/components/feedback-form";
import type {
  AshbyCandidate,
  AshbyApplication,
  AshbyInterview,
} from "@/lib/ashby";

type Phase = "select" | "interview" | "feedback";

export default function Home() {
  // Global state
  const [phase, setPhase] = useState<Phase>("select");
  const [candidates, setCandidates] = useState<AshbyCandidate[]>([]);
  const [interviews, setInterviews] = useState<AshbyInterview[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // Selected candidate state
  const [selectedCandidate, setSelectedCandidate] =
    useState<AshbyCandidate | null>(null);
  const [application, setApplication] = useState<AshbyApplication | null>(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    null
  );

  // Feedback state
  const [structuredNotes, setStructuredNotes] = useState("");
  const [structuring, setStructuring] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    recommendation: "",
    adjectives: [],
    additionalThoughts: "",
  });

  // Load candidates and interview definitions on mount
  useEffect(() => {
    async function load() {
      try {
        const [candidatesRes, interviewsRes] = await Promise.all([
          fetch("/api/ashby/candidates"),
          fetch("/api/ashby/interviews?type=definitions"),
        ]);
        const candidatesData = await candidatesRes.json();
        const interviewsData = await interviewsRes.json();
        setCandidates(candidatesData.results || []);
        setInterviews(interviewsData.results || []);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoadingCandidates(false);
      }
    }
    load();
  }, []);

  // When a candidate is selected, fetch their first application
  const handleSelectCandidate = useCallback(
    async (candidate: AshbyCandidate) => {
      setSelectedCandidate(candidate);
      setPhase("interview");
      setApplication(null);

      if (candidate.applicationIds.length > 0) {
        try {
          const res = await fetch(
            `/api/ashby/application?id=${candidate.applicationIds[0]}`
          );
          const data = await res.json();
          if (data.results) {
            setApplication(data.results);
          }
        } catch (err) {
          console.error("Failed to load application:", err);
        }
      }
    },
    []
  );

  // Structure notes with Claude
  const handleStructureNotes = useCallback(
    async (rawNotes: string) => {
      if (!selectedCandidate) return;
      setStructuring(true);

      const selectedInterview = interviews.find(
        (i) => i.id === selectedInterviewId
      );

      try {
        const res = await fetch("/api/structure-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawNotes,
            candidateName: selectedCandidate.name,
            interviewType: selectedInterview?.title,
            interviewRubric: selectedInterview?.instructionsPlain,
          }),
        });
        const data = await res.json();
        if (data.structured) {
          setStructuredNotes(data.structured);
        }
      } catch (err) {
        console.error("Failed to structure notes:", err);
      } finally {
        setStructuring(false);
      }
    },
    [selectedCandidate, interviews, selectedInterviewId]
  );

  // Reset to start
  const handleReset = () => {
    setPhase("select");
    setSelectedCandidate(null);
    setApplication(null);
    setSelectedInterviewId(null);
    setStructuredNotes("");
    setFeedback({
      recommendation: "",
      adjectives: [],
      additionalThoughts: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            {phase === "interview" && (
              <Button onClick={handleReset} variant="ghost" size="sm" className="gap-1">
                ← Candidates
              </Button>
            )}
            {phase === "feedback" && (
              <Button onClick={() => setPhase("interview")} variant="ghost" size="sm" className="gap-1">
                ← Candidate
              </Button>
            )}
            <h1
              className="text-lg font-bold cursor-pointer hover:text-primary transition-colors"
              onClick={handleReset}
            >
              Interview Cockpit
            </h1>
            {selectedCandidate && (
              <span className="text-sm text-muted-foreground">
                — {selectedCandidate.name}
              </span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {phase === "interview" && (
              <Button
                onClick={() => setPhase("feedback")}
                variant="default"
                size="sm"
              >
                Submit Feedback →
              </Button>
            )}
            <GoogleSignIn />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Phase 1: Select Candidate */}
        {phase === "select" && (
          <div className="space-y-6">
            <CalendarInterviews onSelectCandidate={handleSelectCandidate} />
            <InterviewSelector
              candidates={candidates}
              loading={loadingCandidates}
              onSelect={handleSelectCandidate}
            />
          </div>
        )}

        {/* Phase 2: During Interview */}
        {phase === "interview" && selectedCandidate && (
          <div className="grid gap-4 h-[calc(100vh-100px)]" style={{ gridTemplateColumns: "30% 1fr" }}>
            <div className="overflow-auto">
              <CandidateCard
                candidate={selectedCandidate}
                application={application}
                interviews={interviews}
              />
            </div>
            <CvViewer candidate={selectedCandidate} />
          </div>
        )}

        {/* Phase 3: Post-Interview Feedback */}
        {phase === "feedback" && selectedCandidate && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column: Notes + Structured output */}
            <div className="space-y-6">
              <NotesInput
                onStructure={handleStructureNotes}
                structuring={structuring}
              />
              {structuredNotes && (
                <StructuredNotes markdown={structuredNotes} />
              )}
            </div>

            {/* Right column: Feedback form + Submit */}
            <div className="space-y-6">
              <FeedbackForm
                feedback={feedback}
                onFeedbackChange={setFeedback}
              />
              <SubmitPanel
                structuredNotes={structuredNotes}
                feedback={feedback}
                candidateName={selectedCandidate.name}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
