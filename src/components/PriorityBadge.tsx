import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priorityVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      priority: {
        low: "bg-priority-low/15 text-priority-low",
        medium: "bg-priority-medium/15 text-priority-medium",
        high: "bg-priority-high/15 text-priority-high",
      },
    },
    defaultVariants: {
      priority: "medium",
    },
  },
);

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn(priorityVariants({ priority: priority as any }), className)}>
      {priorityLabels[priority] ?? priority}
    </span>
  );
}

