import { NextResponse } from "next/server";
import { listActiveCandidates } from "@/lib/ashby";

export async function GET() {
  try {
    const candidates = await listActiveCandidates();
    return NextResponse.json({ success: true, results: candidates });
  } catch (error) {
    console.error("Failed to list candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
