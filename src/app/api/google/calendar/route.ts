import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { listActiveCandidates } from "@/lib/ashby";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Google" },
        { status: 401 }
      );
    }

    // Set up Google Calendar client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    // Fetch today's events
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const eventsRes = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const events = eventsRes.data.items || [];

    // Filter to events with attendees (likely interviews)
    const interviewEvents = events
      .filter((e) => e.attendees && e.attendees.length > 0)
      .map((e) => ({
        id: e.id,
        summary: e.summary || "Untitled",
        start: e.start?.dateTime || e.start?.date || "",
        end: e.end?.dateTime || e.end?.date || "",
        meetLink:
          e.hangoutLink ||
          e.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")
            ?.uri ||
          null,
        attendees: (e.attendees || [])
          .filter((a) => !a.self)
          .map((a) => ({
            email: a.email || "",
            name: a.displayName || "",
            responseStatus: a.responseStatus || "",
          })),
        htmlLink: e.htmlLink || "",
      }));

    // Fetch Ashby candidates to match
    let matchedEvents;
    try {
      const candidates = await listActiveCandidates();

      // Build email → candidate lookup
      const emailMap = new Map<string, (typeof candidates)[0]>();
      for (const c of candidates) {
        for (const email of c.emailAddresses) {
          emailMap.set(email.value.toLowerCase(), c);
        }
      }

      // Match events to candidates
      matchedEvents = interviewEvents.map((event) => {
        let matchedCandidate = null;
        for (const attendee of event.attendees) {
          const candidate = emailMap.get(attendee.email.toLowerCase());
          if (candidate) {
            matchedCandidate = candidate;
            break;
          }
        }

        const isNow =
          new Date(event.start) <= now && new Date(event.end) >= now;
        const minutesUntil = Math.round(
          (new Date(event.start).getTime() - now.getTime()) / 60000
        );

        return {
          ...event,
          matchedCandidate,
          isNow,
          minutesUntil,
        };
      });
    } catch {
      // If Ashby fails, still return events without matching
      matchedEvents = interviewEvents.map((event) => ({
        ...event,
        matchedCandidate: null,
        isNow:
          new Date(event.start) <= now && new Date(event.end) >= now,
        minutesUntil: Math.round(
          (new Date(event.start).getTime() - now.getTime()) / 60000
        ),
      }));
    }

    return NextResponse.json({ events: matchedEvents });
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
