const ASHBY_API_BASE = "https://api.ashbyhq.com";

function getAuthHeader(): string {
  const apiKey = process.env.ASHBY_API_KEY;
  if (!apiKey) throw new Error("ASHBY_API_KEY not set");
  return "Basic " + Buffer.from(apiKey + ":").toString("base64");
}

export async function ashbyRequest<T>(
  endpoint: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(`${ASHBY_API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ashby API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`Ashby API returned success=false: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function listInterviewSchedules() {
  return ashbyRequest<{
    success: boolean;
    results: AshbyInterviewSchedule[];
  }>("interviewSchedule.list");
}

export async function listCandidates(cursor?: string) {
  return ashbyRequest<{
    success: boolean;
    results: AshbyCandidate[];
    moreDataAvailable: boolean;
    nextCursor?: string;
  }>("candidate.list", { limit: 50, ...(cursor ? { cursor } : {}) });
}

export async function listAllCandidates(maxPages = 30): Promise<AshbyCandidate[]> {
  const all: AshbyCandidate[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const data = await listCandidates(cursor);
    all.push(...data.results);
    if (!data.moreDataAvailable || !data.nextCursor) break;
    cursor = data.nextCursor;
  }
  return all;
}

export async function listActiveCandidates(): Promise<AshbyCandidate[]> {
  // Step 1: Get all unique candidate IDs from active applications
  const candidateIds = new Set<string>();
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const data = await ashbyRequest<{
      success: boolean;
      results: { candidate: { id: string } }[];
      moreDataAvailable: boolean;
      nextCursor?: string;
    }>("application.list", {
      status: "Active",
      limit: 100,
      ...(cursor ? { cursor } : {}),
    });
    for (const app of data.results) {
      candidateIds.add(app.candidate.id);
    }
    if (!data.moreDataAvailable || !data.nextCursor) break;
    cursor = data.nextCursor;
  }

  // Step 2: Fetch full candidate details in parallel batches
  const ids = Array.from(candidateIds);
  const batchSize = 20;
  const candidates: AshbyCandidate[] = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((id) => getCandidate(id).then((d) => d.results).catch(() => null))
    );
    for (const c of results) {
      if (c) candidates.push(c);
    }
  }
  return candidates;
}

export async function getCandidate(candidateId: string) {
  return ashbyRequest<{
    success: boolean;
    results: AshbyCandidate;
  }>("candidate.info", { id: candidateId });
}

export async function getApplication(applicationId: string) {
  return ashbyRequest<{
    success: boolean;
    results: AshbyApplication;
  }>("application.info", { applicationId });
}

export async function listInterviews() {
  return ashbyRequest<{
    success: boolean;
    results: AshbyInterview[];
  }>("interview.list");
}

export async function listFeedbackForms() {
  return ashbyRequest<{
    success: boolean;
    results: AshbyFeedbackFormDefinition[];
  }>("feedbackFormDefinition.list");
}

export async function getFileUrl(fileHandle: string) {
  return ashbyRequest<{
    success: boolean;
    results: { url: string };
  }>("file.info", { fileHandle });
}

export async function listApplicationFeedback(applicationId: string) {
  return ashbyRequest<{
    success: boolean;
    results: AshbyApplicationFeedback[];
  }>("applicationFeedback.list", { applicationId });
}

// --- Types ---

export interface AshbyInterviewSchedule {
  id: string;
  status: string;
  applicationId: string;
  interviewStageId: string;
  scheduledBy: AshbyUser | null;
  createdAt: string;
  updatedAt: string;
  interviewEvents: AshbyInterviewEvent[];
}

export interface AshbyInterviewEvent {
  id: string;
  interviewId: string;
  interviewScheduleId: string;
  interviewerUserIds: string[];
  interviewers: AshbyUser[];
  createdAt: string;
  updatedAt: string;
  startTime: string;
  endTime: string;
  feedbackLink: string;
  hasSubmittedFeedback: boolean;
}

export interface AshbyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  globalRole: string;
  isEnabled: boolean;
  updatedAt: string;
}

export interface AshbyCandidate {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  primaryEmailAddress: { value: string; type: string; isPrimary: boolean } | null;
  emailAddresses: { value: string; type: string; isPrimary: boolean }[];
  primaryPhoneNumber: { value: string; type: string; isPrimary: boolean } | null;
  phoneNumbers: { value: string; type: string; isPrimary: boolean }[];
  socialLinks: { type: string; url: string }[];
  tags: { id: string; title: string }[];
  position: string | null;
  company: string | null;
  school?: string | null;
  applicationIds: string[];
  resumeFileHandle: { id: string; name: string; handle: string } | null;
  fileHandles: { id: string; name: string; handle: string }[];
  customFields: { id: string; title: string; value: unknown }[];
  profileUrl: string;
  source: {
    id: string;
    title: string;
    isArchived: boolean;
    sourceType: { id: string; title: string; isArchived: boolean };
  } | null;
  location?: {
    locationSummary: string;
  } | null;
}

export interface AshbyApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  candidate: { id: string; name: string };
  status: string;
  customFields: { id: string; title: string; value: unknown }[];
  currentInterviewStage: {
    id: string;
    title: string;
    type: string;
    orderInInterviewPlan: number;
  } | null;
  source: {
    id: string;
    title: string;
    sourceType: { id: string; title: string };
  } | null;
  job: {
    id: string;
    title: string;
  } | null;
  applicationHistory: {
    id: string;
    stageId: string;
    title: string;
    stageNumber: number;
    enteredStageAt: string;
    leftStageAt: string | null;
  }[];
  hiringTeam: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }[];
  archiveReason: {
    id: string;
    text: string;
    reasonType: string;
  } | null;
}

export interface AshbyInterview {
  id: string;
  title: string;
  externalTitle: string;
  isArchived: boolean;
  isDebrief: boolean;
  instructionsHtml: string | null;
  instructionsPlain: string | null;
  feedbackFormDefinitionId: string | null;
}

export interface AshbyFeedbackFormDefinition {
  id: string;
  title: string;
  isArchived: boolean;
  formDefinition: {
    sections: {
      fields: {
        isRequired: boolean;
        field: {
          id: string;
          type: string;
          path: string;
          title: string;
          isNullable: boolean;
          selectableValues?: { label: string; value: string }[];
        };
        descriptionHtml?: string;
        descriptionPlain?: string;
      }[];
    }[];
  };
  interviewId: string | null;
}

export interface AshbyApplicationFeedback {
  id: string;
  submittedValues: Record<string, string>;
  submittedByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  submittedAt: string;
  formDefinition: {
    sections: {
      fields: {
        isRequired: boolean;
        field: {
          id: string;
          type: string;
          path: string;
          title: string;
          selectableValues?: { label: string; value: string }[];
        };
      }[];
    }[];
  };
}
