import { Link } from "@tanstack/react-router";
import { Calendar, MessageSquare } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ComplaintCardProps {
  complaint: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    profiles?: { full_name?: string | null; student_id?: string | null } | null;
  };
  isAdmin?: boolean;
}

export function ComplaintCard({ complaint, isAdmin }: ComplaintCardProps) {
  return (
    <Link to="/complaints/$id" params={{ id: complaint.id }}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{complaint.title}</h3>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{complaint.description}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <span className="text-xs text-muted-foreground">{complaint.category}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(complaint.created_at).toLocaleDateString()}
            </span>
            {isAdmin && complaint.profiles && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {complaint.profiles.full_name ?? complaint.profiles.student_id ?? "Unknown"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
