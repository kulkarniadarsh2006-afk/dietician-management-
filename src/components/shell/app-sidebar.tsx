"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { navigationItems } from "./nav-items";
import { NavIcon } from "./nav-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden w-64 shrink-0 flex-col border-r bg-card/60 backdrop-blur-md transition-all duration-300 md:flex"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <HeartPulse className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <span className="block text-base font-bold tracking-tight text-foreground">
            NutriCare
          </span>
          <span className="-mt-0.5 block text-xs text-muted-foreground">
            Dietitian Platform
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Main menu" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Clinical Management
        </div>
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <NavIcon
                  name={item.icon}
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="h-4 px-1.5 py-0 text-[10px] uppercase tracking-wider"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Security & System Info Footer */}
      <div className="space-y-3 border-t bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck
            className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span className="font-semibold text-foreground">HIPAA/PHI Compliant</span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Zero-PHI logging active. UI-only simulation mode enabled.
        </p>
      </div>
    </aside>
  );
}
