import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";

import { listComplaints, getMyProfile, getMyRole } from "@/lib/complaints.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComplaintCard } from "@/components/ComplaintCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const complaintsQueryOptions = queryOptions({
  queryKey: ["complaints"],
  queryFn: () => listComplaints(),
});

const profileQueryOptions = queryOptions({
  queryKey: ["my-profile"],
  queryFn: () => getMyProfile(),
});

const roleQueryOptions = queryOptions({
  queryKey: ["my-role"],
  queryFn: () => getMyRole(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Student Complaint Portal" },
      { name: "description", content: "View and manage your complaints." },
      { property: "og:title", content: "Dashboard — Student Complaint Portal" },
      { property: "og:description", content: "View and manage your complaints." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(complaintsQueryOptions);
    context.queryClient.ensureQueryData(profileQueryOptions);
    context.queryClient.ensureQueryData(roleQueryOptions);
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data: complaintsData } = useSuspenseQuery(complaintsQueryOptions);
  const { data: profile } = useSuspenseQuery(profileQueryOptions);
  const { data: role } = useSuspenseQuery(roleQueryOptions);

  const complaints = complaintsData?.complaints ?? [];
  const isAdmin = role === "admin";

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categories = Array.from(new Set(complaints.map((c) => c.category)));

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      (c.profiles?.student_id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.profiles?.full_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const counts = {
    open: complaints.filter((c) => c.status === "open").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage all complaints and keep students updated."
              : `Welcome back, ${profile?.full_name ?? "Student"}. Track your complaints below.`}
          </p>
        </div>
        <Button asChild>
          <Link to="/complaints/new">
            <Plus className="mr-2 h-4 w-4" />
            Submit complaint
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={counts.open} color="status-open" />
        <StatCard label="In Progress" value={counts.inProgress} color="status-in-progress" />
        <StatCard label="Resolved" value={counts.resolved} color="status-resolved" />
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isAdmin ? "Search by title, student, or ID..." : "Search complaints..."}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <h3 className="text-lg font-semibold">No complaints found</h3>
          <p className="mt-1 text-muted-foreground">
            {isAdmin
              ? "There are no complaints matching your filters."
              : "You haven't submitted any complaints yet."}
          </p>
          {!isAdmin && (
            <Button className="mt-4" asChild>
              <Link to="/complaints/new">Submit your first complaint</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className={`text-3xl font-bold text-${color}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
