import { NextResponse } from "next/server";
import { listActiveCandidates } from "@/lib/ashby";

// Cache for 15 minutes, serve stale while revalidating
export const revalidate = 900;

export async function GET() {
  try {
    const candidates = await listActiveCandidates();
    return NextResponse.json(
      { success: true, results: candidates },
      {
        headers: {
          "Cache-Control": "s-maxage=900, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Failed to list candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
