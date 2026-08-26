import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { updateComplaint } from "@/lib/complaints.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const adminActionSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  priority: z.enum(["low", "medium", "high"]),
});

interface AdminActionsProps {
  complaint: {
    id: string;
    status: string;
    priority: string;
    category: string;
  };
  categories: { id: string; name: string }[];
  onUpdated?: () => void;
}

export function AdminActions({ complaint, onUpdated }: AdminActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(adminActionSchema),
    defaultValues: {
      status: complaint.status as "open" | "in_progress" | "resolved" | "closed",
      priority: complaint.priority as "low" | "medium" | "high",
    },
  });

  async function onSubmit(values: z.infer<typeof adminActionSchema>) {
    setIsSubmitting(true);
    try {
      await updateComplaint({
        data: {
          id: complaint.id,
          status: values.status,
          priority: values.priority,
        },
      });
      toast.success("Complaint updated");
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update complaint");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin actions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value as "open" | "in_progress" | "resolved" | "closed")
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) =>
                  form.setValue("priority", value as "low" | "medium" | "high")
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
