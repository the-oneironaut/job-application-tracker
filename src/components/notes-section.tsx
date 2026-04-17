"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addNote, deleteNote } from "@/app/(dashboard)/applications/actions";
import type { Note } from "@/db/schema";
import { Bell, Trash2, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface NotesSectionProps {
  applicationId: string;
  notes: Note[];
}

export function NotesSection({ applicationId, notes }: NotesSectionProps) {
  const [content, setContent] = useState("");
  const [isReminder, setIsReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAddNote() {
    if (!content.trim()) return;
    startTransition(async () => {
      await addNote(
        applicationId,
        content,
        isReminder,
        isReminder ? reminderDate || null : null
      );
      setContent("");
      setIsReminder(false);
      setReminderDate("");
    });
  }

  function handleDeleteNote(noteId: string) {
    startTransition(() => {
      deleteNote(noteId, applicationId);
    });
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <div className="space-y-3">
        <Textarea
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="reminder"
                checked={isReminder}
                onCheckedChange={setIsReminder}
              />
              <Label htmlFor="reminder" className="text-sm">
                Set as reminder
              </Label>
            </div>
            {isReminder && (
              <Input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-auto"
              />
            )}
          </div>
          <Button
            onClick={handleAddNote}
            disabled={isPending || !content.trim()}
            size="sm"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="mr-2 h-4 w-4" />
            )}
            Add Note
          </Button>
        </div>
      </div>

      {notes.length > 0 && <Separator />}

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group flex items-start gap-3 rounded-lg border p-3"
          >
            <div className="flex-1 space-y-1">
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
                {note.isReminder && (
                  <Badge
                    variant="outline"
                    className="gap-1 text-xs text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800"
                  >
                    <Bell className="h-3 w-3" />
                    {note.reminderDate
                      ? format(new Date(note.reminderDate), "MMM d, yyyy")
                      : "Reminder"}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteNote(note.id)}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
