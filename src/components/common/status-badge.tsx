import React from "react";
import {
  Clock,
  ArrowUpRight,
  Check,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import type { DeliveryStatus, DietPlanStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: DeliveryStatus | DietPlanStatus | "active" | "archived" | "draft";
  className?: string;
  size?: "sm" | "default";
}

/**
 * Accessible status badge that conveys meaning through BOTH icon and text (WCAG AA).
 */
export function StatusBadge({ status, className, size = "default" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  switch (status) {
    // WhatsApp delivery statuses
    case "pending":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 font-medium text-amber-800 dark:text-amber-300",
            sizeClasses,
            className
          )}
        >
          <Clock
            className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <span>Pending</span>
        </span>
      );

    case "sent":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 font-medium text-blue-800 dark:text-blue-300",
            sizeClasses,
            className
          )}
        >
          <ArrowUpRight
            className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <span>Sent</span>
        </span>
      );

    case "delivered":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 font-medium text-sky-800 dark:text-sky-300",
            sizeClasses,
            className
          )}
        >
          <Check
            className="h-3 w-3 shrink-0 text-sky-600 dark:text-sky-400"
            aria-hidden="true"
          />
          <span>Delivered</span>
        </span>
      );

    case "read":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-medium text-emerald-800 dark:text-emerald-300",
            sizeClasses,
            className
          )}
        >
          <CheckCheck
            className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span>Read</span>
        </span>
      );

    case "failed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 font-medium text-rose-800 dark:text-rose-300",
            sizeClasses,
            className
          )}
        >
          <AlertCircle
            className="h-3 w-3 shrink-0 text-rose-600 dark:text-rose-400"
            aria-hidden="true"
          />
          <span>Failed</span>
        </span>
      );

    // Diet plan statuses
    case "assigned":
    case "active":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-medium text-emerald-800 dark:text-emerald-300",
            sizeClasses,
            className
          )}
        >
          <CheckCircle2
            className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span>{status === "active" ? "Active" : "Assigned"}</span>
        </span>
      );

    case "none":
    case "archived":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-slate-500/30 bg-slate-500/10 font-medium text-slate-700 dark:text-slate-300",
            sizeClasses,
            className
          )}
        >
          <MinusCircle
            className="h-3 w-3 shrink-0 text-slate-500 dark:text-slate-400"
            aria-hidden="true"
          />
          <span>{status === "archived" ? "Archived" : "None"}</span>
        </span>
      );

    case "draft":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 font-medium text-purple-800 dark:text-purple-300",
            sizeClasses,
            className
          )}
        >
          <Clock
            className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400"
            aria-hidden="true"
          />
          <span>Draft</span>
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-muted bg-muted px-2 py-0.5 text-xs text-muted-foreground",
            className
          )}
        >
          <span>{String(status)}</span>
        </span>
      );
  }
}
