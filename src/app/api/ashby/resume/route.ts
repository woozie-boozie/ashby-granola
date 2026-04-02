import { NextResponse } from "next/server";
import { getFileUrl } from "@/lib/ashby";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    if (!handle) {
      return NextResponse.json({ error: "Missing file handle" }, { status: 400 });
    }
    const data = await getFileUrl(handle);
    return NextResponse.json({ url: data.results.url });
  } catch (error) {
    console.error("Failed to get resume URL:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume URL" },
      { status: 500 }
    );
  }
}
