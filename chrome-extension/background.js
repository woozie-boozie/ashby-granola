const COCKPIT_BASE = "https://prima-rho.vercel.app";

// Track which meet codes we've already opened the cockpit for
// so we don't open multiple tabs for the same meeting
const openedMeetings = new Set();

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes("meet.google.com/")) {
    const url = new URL(changeInfo.url);
    // Extract meeting code from path (e.g., /abc-defg-hij)
    const meetCode = url.pathname.replace("/", "").split("?")[0];

    // Skip if not a valid meeting code or already opened
    if (!meetCode || meetCode.length < 3 || openedMeetings.has(meetCode)) {
      return;
    }

    openedMeetings.add(meetCode);

    // Clean up after 2 hours (so the same meeting can be reopened later)
    setTimeout(() => openedMeetings.delete(meetCode), 2 * 60 * 60 * 1000);

    const cockpitUrl = `${COCKPIT_BASE}?meet=${encodeURIComponent(meetCode)}`;

    // Check if cockpit is already open in a window
    chrome.tabs.query({ url: `${COCKPIT_BASE}/*` }, (tabs) => {
      if (tabs.length > 0) {
        // Update existing cockpit tab and focus its window
        chrome.tabs.update(tabs[0].id, { url: cockpitUrl, active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        // Open a new popup window for the cockpit
        chrome.windows.create({
          url: cockpitUrl,
          type: "popup",
          width: 1200,
          height: 900,
        });
      }
    });
  }
});
