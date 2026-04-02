import { NextResponse } from "next/server";
import { listAllCandidates } from "@/lib/ashby";

export async function GET() {
  try {
    const candidates = await listAllCandidates();
    return NextResponse.json({ success: true, results: candidates });
  } catch (error) {
    console.error("Failed to list candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
