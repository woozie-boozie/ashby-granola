import { NextResponse } from "next/server";
import { structureNotes } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawNotes, candidateName, interviewType, interviewRubric } = body;

    if (!rawNotes || !candidateName) {
      return NextResponse.json(
        { error: "Missing rawNotes or candidateName" },
        { status: 400 }
      );
    }

    const structured = await structureNotes({
      rawNotes,
      candidateName,
      interviewType,
      interviewRubric,
    });

    return NextResponse.json({ success: true, structured });
  } catch (error) {
    console.error("Failed to structure notes:", error);
    return NextResponse.json(
      { error: "Failed to structure notes" },
      { status: 500 }
    );
  }
}
