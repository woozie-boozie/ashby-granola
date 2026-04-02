"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StructuredNotesProps {
  markdown: string;
}

export function StructuredNotes({ markdown }: StructuredNotesProps) {
  // Simple markdown-to-html: headings, bullets, bold
  const html = markdown
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-sm mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-semibold text-base mt-4 mb-2">$1</h3>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 text-sm">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Structured Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none max-h-48 overflow-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </CardContent>
    </Card>
  );
}
