import { NextResponse } from "next/server";
import { listInterviewSchedules, listInterviews } from "@/lib/ashby";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "schedules";

    if (type === "definitions") {
      const data = await listInterviews();
      return NextResponse.json(data);
    }

    const data = await listInterviewSchedules();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to list interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}
