import React from "react";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { Badge } from "@/components/ui/badge";
import { User, Activity } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
            Clinical Workspace
          </span>
          <span className="hidden text-muted-foreground/40 sm:inline">/</span>
          <Badge variant="outline" className="text-xs font-normal">
            Foundation Scaffolding Mode
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
          <span className="hidden md:inline">API Status:</span>
          <span className="font-medium text-foreground">Operational</span>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-full border bg-card p-1.5 pr-3 text-xs font-medium transition-colors hover:bg-muted"
          aria-label="User Account"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline">Dr. Practitioner</span>
        </Link>
      </div>
    </header>
  );
}
