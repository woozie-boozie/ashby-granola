"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InterviewSelector } from "@/components/interview-selector";
import { CandidateCard } from "@/components/candidate-card";
import { CvViewer } from "@/components/cv-viewer";
import { NotesInput } from "@/components/notes-input";
import { StructuredNotes } from "@/components/structured-notes";
import { FeedbackForm } from "@/components/feedback-form";
import { SubmitPanel } from "@/components/submit-panel";
import { UserMenu } from "@/components/user-menu";
import { CalendarInterviews } from "@/components/calendar-interviews";
import type { FeedbackData } from "@/components/feedback-form";
import type {
  AshbyCandidate,
  AshbyApplication,
  AshbyInterview,
} from "@/lib/ashby";

import { Suspense } from "react";
import { useSession, signIn } from "next-auth/react";

type Phase = "select" | "interview";

const ALLOWED_DOMAIN = "primamente.com";
const ALLOWED_EMAILS = ["akhil1189@gmail.com"];

// Wrapper to provide Suspense boundary for useSearchParams
export default function Page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not signed in — show sign-in page
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold">Interview Agent</h1>
          <p className="text-muted-foreground">
            Sign in with your Prima Mente Google account to access the interview dashboard.
          </p>
          <Button onClick={() => signIn("google")} size="lg">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  // Signed in but wrong domain
  const email = session.user?.email || "";
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`) && !ALLOWED_EMAILS.includes(email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            Only @{ALLOWED_DOMAIN} accounts can access this tool.
          </p>
          <p className="text-sm text-muted-foreground">
            Signed in as: {email}
          </p>
          <Button variant="outline" onClick={() => signIn("google")}>
            Sign in with a different account
          </Button>
        </div>
      </div>
    );
  }

  // Signed in with correct domain — render the app
  return <AuthenticatedHome />;
}

function AuthenticatedHome() {
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

  const searchParams = useSearchParams();
  const meetCode = searchParams.get("meet");
  const directCandidateId = searchParams.get("candidateId");
  const meetHandled = useRef(false);
  const directHandled = useRef(false);

  // If ?candidateId= is provided, load that candidate instantly (no waiting for full list)
  useEffect(() => {
    if (!directCandidateId || directHandled.current) return;
    directHandled.current = true;

    async function loadDirect() {
      try {
        const res = await fetch(`/api/ashby/candidate?id=${directCandidateId}`);
        const data = await res.json();
        if (data.results) {
          const candidate = data.results;
          setSelectedCandidate(candidate);
          setPhase("interview");

          // Also load application
          if (candidate.applicationIds?.length > 0) {
            const appRes = await fetch(`/api/ashby/application?id=${candidate.applicationIds[0]}`);
            const appData = await appRes.json();
            if (appData.results) setApplication(appData.results);
          }
        }
      } catch (err) {
        console.error("Failed to load candidate directly:", err);
      }
    }
    loadDirect();
  }, [directCandidateId]);

  // Load candidates and interview definitions on mount (in background)
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

  // Auto-select candidate from ?candidateId= query parameter (direct/test)
  useEffect(() => {
    if (!directCandidateId || directHandled.current || candidates.length === 0) return;
    directHandled.current = true;

    const candidate = candidates.find((c) => c.id === directCandidateId);
    if (candidate) {
      handleSelectCandidate(candidate);
    }
  }, [directCandidateId, candidates, handleSelectCandidate]);

  // Auto-select candidate from ?meet= query parameter (Chrome extension)
  // Fetches calendar independently — does NOT wait for the candidates list
  useEffect(() => {
    if (!meetCode || meetHandled.current) return;
    meetHandled.current = true;

    fetch("/api/google/calendar")
      .then((res) => res.json())
      .then((data) => {
        const events = data.events || [];
        const matched = events.find(
          (e: { meetLink: string | null; matchedCandidate: AshbyCandidate | null }) =>
            e.meetLink?.includes(meetCode) && e.matchedCandidate
        );
        if (matched?.matchedCandidate) {
          const candidate = matched.matchedCandidate;
          setSelectedCandidate(candidate);
          setPhase("interview");

          // Also load application
          if (candidate.applicationIds?.length > 0) {
            fetch(`/api/ashby/application?id=${candidate.applicationIds[0]}`)
              .then((r) => r.json())
              .then((appData) => {
                if (appData.results) setApplication(appData.results);
              })
              .catch(console.error);
          }
        }
      })
      .catch(console.error);
  }, [meetCode]);

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
            <h1
              className="text-lg font-bold cursor-pointer hover:text-primary transition-colors"
              onClick={handleReset}
            >
              Interview Agent
            </h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <UserMenu />
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

        {/* Phase 2: Interview + Feedback (single page) */}
        {phase === "interview" && selectedCandidate && (
          <div className="grid gap-4 h-[calc(100vh-100px)]" style={{ gridTemplateColumns: "60% 1fr" }}>
            {/* Left: Candidate info + CV */}
            <div className="flex flex-col gap-4 min-h-0">
              <CandidateCard
                candidate={selectedCandidate}
                application={application}
              />
              <div className="flex-1 min-h-0">
                <CvViewer candidate={selectedCandidate} />
              </div>
            </div>
            {/* Right: Notes + Feedback */}
            <div className="overflow-auto space-y-4">
              <NotesInput
                onStructure={handleStructureNotes}
                structuring={structuring}
              />
              {structuredNotes && (
                <StructuredNotes markdown={structuredNotes} />
              )}
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
