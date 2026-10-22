import React from "react";
import { SampleDataBadge } from "./sample-data-badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  showSampleDataBadge?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  showSampleDataBadge = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {showSampleDataBadge && <SampleDataBadge />}
        </div>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">{children}</div>
      )}
    </div>
  );
}
