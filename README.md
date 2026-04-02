# Interview Cockpit

A recruitment workflow tool that pulls candidate data from Ashby, structures interview notes with AI, and auto-opens candidate profiles when you join Google Meet calls.

**Live app**: [prima-rho.vercel.app](https://prima-rho.vercel.app)

---

## Setup Guide (5 minutes)

### Step 1: Open the app

Go to **[prima-rho.vercel.app](https://prima-rho.vercel.app)** in Google Chrome.

Sign in with your **@primamente.com** Google account.

### Step 2: Install the Chrome Extension

The extension auto-opens the candidate dashboard when you join a Google Meet interview.

1. Go to [github.com/woozie-boozie/ashby-granola](https://github.com/woozie-boozie/ashby-granola)
2. Click the green **Code** button, then **Download ZIP**
3. Unzip the downloaded file
4. In Chrome, go to `chrome://extensions`
5. Toggle **Developer mode** ON (top right corner)
6. Click **Load unpacked**
7. Select the **`chrome-extension`** folder from inside the unzipped repo
8. You should see "Interview Cockpit" appear in your extensions list

### Step 3: You're done

That's it. Here's how it works:

---

## How to Use

### Before an interview
- Open the app and browse/search candidates
- Click a candidate to see their full profile: contact info, application details, CV, prior feedback, and pipeline history

### When you join an interview
- Click **"Join"** on a Google Calendar meeting as you normally do
- Google Meet opens in one tab
- The **Interview Cockpit automatically opens** in another tab with the candidate's profile loaded (matched by attendee email)

### After an interview
1. Click **"Submit Feedback"** in the top right
2. **Paste your Granola notes** into the text box
3. Click **"Structure Notes with Claude"** — AI organizes your notes into Key Points, Strengths, Concerns, and Summary
4. Select your **Overall Recommendation** (Strong Yes / Yes / No / Strong No)
5. Add **adjective tags** (e.g., articulate, high-agency, collaborative)
6. Add any **additional thoughts**
7. Click **"Copy to Clipboard"** and paste into Ashby

---

## Features

| Feature | Status |
|---------|--------|
| Candidate search + filters (1500+ candidates) | Working |
| Candidate profile with contact, application, hiring team | Working |
| Embedded CV/resume viewer | Working |
| Prior interview feedback from other interviewers | Working |
| Pipeline history | Working |
| Google Calendar integration (meeting matching) | Working |
| Chrome extension (auto-open on Google Meet join) | Working |
| AI-powered note structuring (Claude) | Working |
| Feedback form (score + adjectives + notes) | Working |
| Copy to clipboard | Working |
| Google sign-in (restricted to @primamente.com) | Working |
| Direct submit to Ashby | Coming soon (needs write API key) |
| Granola API integration | Coming soon (needs Business plan) |

---

## Troubleshooting

**"Access Denied" after signing in**
You need to sign in with a @primamente.com Google account.

**Chrome extension not opening the cockpit**
Make sure the extension is enabled at `chrome://extensions`. The extension icon should be visible in your Chrome toolbar.

**Candidate not auto-detected from meeting**
The extension matches by attendee email. If the candidate's email in Ashby doesn't match the email in the Google Calendar invite, the match won't work. You can still search for the candidate manually.

**CV not loading**
Some older candidate files may not be available. Try clicking "Open in New Tab" or "Open in Ashby" to view directly.
