"use client";

import * as React from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffAvatarMenuProps {
  className?: string;
}

export function StaffAvatarMenu({ className }: StaffAvatarMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Staff profile and account menu"
        className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pr-2.5 text-xs font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          <User className="h-4 w-4" />
        </div>
        <div className="hidden text-left sm:block">
          <span className="block font-semibold leading-tight text-foreground">
            Dr. Elena Vance
          </span>
          <span className="block text-[10px] text-muted-foreground">
            Clinical Dietitian
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border bg-card p-1.5 text-card-foreground shadow-xl ring-1 ring-black/5"
        >
          <div className="border-b px-3 py-2 text-xs">
            <p className="font-semibold text-foreground">Dr. Elena Vance, RD</p>
            <p className="text-[11px] text-muted-foreground">elena.vance@nutricare.org</p>
          </div>

          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              role="menuitem"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Practitioner Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              role="menuitem"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <span>App Preferences</span>
            </Link>
          </div>

          <div className="border-t pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                alert(
                  "Sign out placeholder (Auth backend to be connected in subsequent phase)."
                );
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              role="menuitem"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out (Placeholder)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
