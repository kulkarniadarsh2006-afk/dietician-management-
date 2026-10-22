import React from "react";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SampleDataBadgeProps {
  className?: string;
  label?: string;
}

/**
 * Visual indicator marking mock/placeholder data in accordance with prompt guidelines.
 */
export function SampleDataBadge({
  className,
  label = "Sample data",
}: SampleDataBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300",
        className
      )}
      title="This record or metric is simulated mock data for UI testing"
    >
      <FlaskConical className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>{label}</span>
    </Badge>
  );
}
