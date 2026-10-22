"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { StaffAvatarMenu } from "@/components/ui/dropdown-menu";
import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { Activity } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();

  // Resolve active section name for top bar breadcrumb
  const getSectionTitle = () => {
    if (pathname === "/" || pathname === "/dashboard") return "Overview";
    if (pathname.startsWith("/clients/")) return "Client Profile";
    if (pathname.startsWith("/clients")) return "Clients Directory";
    if (pathname.startsWith("/diet-plans")) return "Diet Plans";
    if (pathname.startsWith("/whatsapp")) return "WhatsApp Delivery";
    if (pathname.startsWith("/integrations")) return "Integrations";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Clinical Portal";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
            Caseload Management
          </span>
          <span className="hidden text-muted-foreground/40 sm:inline">/</span>
          <span className="text-sm font-semibold text-foreground">
            {getSectionTitle()}
          </span>
          <div className="ml-2 hidden lg:inline-flex">
            <SampleDataBadge label="UI Simulation" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground sm:flex">
          <Activity
            className="h-3 w-3 animate-pulse text-emerald-500"
            aria-hidden="true"
          />
          <span>System:</span>
          <span className="font-semibold text-foreground">Healthy</span>
        </div>

        {/* Staff Avatar Menu */}
        <StaffAvatarMenu />
      </div>
    </header>
  );
}
