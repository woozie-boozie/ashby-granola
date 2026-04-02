import { NextResponse } from "next/server";
import { listFeedbackForms } from "@/lib/ashby";

export async function GET() {
  try {
    const data = await listFeedbackForms();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to list feedback forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback forms" },
      { status: 500 }
    );
  }
}
