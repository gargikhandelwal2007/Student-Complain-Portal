import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        open: "bg-status-open/15 text-status-open",
        "in-progress": "bg-status-in-progress/15 text-status-in-progress",
        resolved: "bg-status-resolved/15 text-status-resolved",
        closed: "bg-status-closed/15 text-status-closed",
      },
    },
    defaultVariants: {
      status: "open",
    },
  },
);

const statusLabels: Record<string, string> = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusVariants({ status: status as any }), className)}>
      {statusLabels[status] ?? status}
    </span>
  );
}

