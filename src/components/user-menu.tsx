"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Popover } from "@base-ui/react/popover";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="size-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!session) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("google")}
      >
        Sign in with Google
      </Button>
    );
  }

  const initials = getInitials(session.user?.name);
  const displayName = session.user?.name || "User";
  const email = session.user?.email || "";
  const org = email.includes("@primamente.com") ? "Primamente" : "";

  return (
    <Popover.Root>
      <Popover.Trigger
        className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label="User menu"
      >
        {initials}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} side="bottom" align="end">
          <Popover.Popup className="z-50 w-56 rounded-lg border border-border bg-card shadow-lg">
            {/* User info */}
            <div className="border-b border-border px-3 py-3">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              {org && (
                <p className="text-xs text-muted-foreground">{org}</p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{email}</p>
            </div>

            {/* Menu items */}
            <div className="p-1">
              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                onClick={() => {
                  // Settings placeholder
                }}
              >
                <Settings className="size-4 text-muted-foreground" />
                Settings
              </button>

              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                onClick={() => signOut()}
              >
                <LogOut className="size-4 text-muted-foreground" />
                Sign out
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
