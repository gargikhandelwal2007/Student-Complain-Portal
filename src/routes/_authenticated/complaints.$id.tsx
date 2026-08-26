import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User, AlertCircle } from "lucide-react";

import { getComplaint, getMyRole } from "@/lib/complaints.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ComplaintNotes } from "@/components/ComplaintNotes";
import { AdminActions } from "@/components/AdminActions";

const complaintQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["complaint", id],
    queryFn: () => getComplaint({ data: { id } }),
  });

const roleQueryOptions = queryOptions({
  queryKey: ["my-role"],
  queryFn: () => getMyRole(),
});

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({
    meta: [
      { title: "Complaint Details — Student Complaint Portal" },
      { name: "description", content: "View complaint details and updates." },
      { property: "og:title", content: "Complaint Details — Student Complaint Portal" },
      { property: "og:description", content: "View complaint details and updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(complaintQueryOptions(params.id));
    context.queryClient.ensureQueryData(roleQueryOptions);
  },
  component: ComplaintDetailPage,
});

function ComplaintDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(complaintQueryOptions(id));
  const { data: role } = useSuspenseQuery(roleQueryOptions);
  const isAdmin = role === "admin";

  const complaint = data.complaint;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{complaint.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(complaint.created_at).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {complaint.category}
            </span>
            {isAdmin && (
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {complaint.profiles?.full_name ?? "Unknown"}
                {complaint.profiles?.student_id && ` (${complaint.profiles.student_id})`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground">{complaint.description}</p>
        </CardContent>
      </Card>

      {isAdmin && (
        <AdminActions
          complaint={complaint}
          categories={[]}
          onUpdated={() => {
            navigate({ to: "/dashboard" });
          }}
        />
      )}

      <ComplaintNotes complaintId={complaint.id} isAdmin={isAdmin} />
    </div>
  );
}
