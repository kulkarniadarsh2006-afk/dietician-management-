import React from "react";
import Link from "next/link";
import { HeartPulse, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight">NutriCare Clinical</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Encrypted Session</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">{children}</main>
    </div>
  );
}
