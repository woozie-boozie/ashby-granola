import { NextResponse } from "next/server";
import { listApplicationFeedback } from "@/lib/ashby";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId" },
        { status: 400 }
      );
    }
    const data = await listApplicationFeedback(applicationId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to list feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
