"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotesInputProps {
  onStructure: (notes: string) => void;
  structuring: boolean;
}

export function NotesInput({ onStructure, structuring }: NotesInputProps) {
  const [notes, setNotes] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Granola Notes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste your Granola meeting notes below, then let Claude structure them.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Paste your Granola notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="font-mono text-sm h-32 resize-none"
        />
        <Button
          onClick={() => onStructure(notes)}
          disabled={!notes.trim() || structuring}
          className="w-full"
        >
          {structuring ? "Structuring with Claude..." : "Structure Notes with Claude"}
        </Button>
      </CardContent>
    </Card>
  );
}
