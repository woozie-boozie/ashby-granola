import { NextResponse } from "next/server";
import { getApplication } from "@/lib/ashby";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }
    const data = await getApplication(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
