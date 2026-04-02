import { NextResponse } from "next/server";
import { getCandidate } from "@/lib/ashby";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing candidate id" }, { status: 400 });
    }
    const data = await getCandidate(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get candidate:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate" },
      { status: 500 }
    );
  }
}
