import Anthropic from "@anthropic-ai/sdk";

const getClient = () => {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");
  return new Anthropic({ apiKey });
};

export async function structureNotes({
  rawNotes,
  candidateName,
  interviewType,
  interviewRubric,
}: {
  rawNotes: string;
  candidateName: string;
  interviewType?: string;
  interviewRubric?: string;
}): Promise<string> {
  const client = getClient();

  const systemPrompt = `You are an expert recruitment assistant helping structure interview notes into a clear, actionable format for an ATS (Applicant Tracking System).

Your output should be well-structured markdown that a hiring manager can quickly scan. Be concise but thorough. Preserve all substantive details from the raw notes — do not lose information.

Structure the notes into these sections:
## Key Discussion Points
Bullet points of the main topics covered.

## Strengths
What stood out positively about the candidate.

## Concerns
Any red flags, gaps, or areas of concern.

${interviewRubric ? `## Assessment Against Interview Criteria
Map the notes against the specific interview rubric provided below. For each criterion, note what evidence was observed.

Interview Rubric:
${interviewRubric}
` : ""}
## Summary
2-3 sentence overall impression.

Keep the language professional but natural — this is for internal use by the interviewing team.`;

  const userMessage = `Please structure these interview notes for candidate **${candidateName}**${interviewType ? ` from a **${interviewType}** interview` : ""}.

Raw notes from the interview:
---
${rawNotes}
---`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "Failed to structure notes.";
}
