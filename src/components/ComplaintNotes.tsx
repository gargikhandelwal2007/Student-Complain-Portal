import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { getComplaint, addComplaintNote } from "@/lib/complaints.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const complaintQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["complaint", id],
    queryFn: () => getComplaint({ data: { id } }),
  });

interface ComplaintNotesProps {
  complaintId: string;
  isAdmin: boolean;
}

export function ComplaintNotes({ complaintId, isAdmin }: ComplaintNotesProps) {
  const { data, refetch } = useSuspenseQuery(complaintQueryOptions(complaintId));
  const [note, setNote] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notes = data.notes ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);
    try {
      await addComplaintNote({
        data: {
          complaintId,
          note: note.trim(),
          isInternal,
        },
      });
      setNote("");
      setIsInternal(false);
      toast.success("Note added");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Updates & Notes</h2>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((noteItem) => (
                <div key={noteItem.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {(noteItem.profiles?.full_name ?? "A").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {noteItem.profiles?.full_name ?? "Admin"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(noteItem.created_at).toLocaleString()}
                      </span>
                      {noteItem.is_internal && isAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                          <ShieldAlert className="h-3 w-3" />
                          Internal
                        </span>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                      {noteItem.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="note">Add a note</Label>
                <Textarea
                  id="note"
                  rows={3}
                  placeholder="Write an update for the student..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="internal"
                  checked={isInternal}
                  onCheckedChange={(checked) => setIsInternal(checked === true)}
                />
                <Label htmlFor="internal" className="text-sm font-normal">
                  Internal note (not visible to students)
                </Label>
              </div>
              <Button type="submit" disabled={isSubmitting || !note.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Add note"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
