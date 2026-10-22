"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // In foundation scaffolding, demonstrate form structure
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 600);
  };

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Clinician Portal
        </CardTitle>
        <CardDescription>
          Sign in to access your dietitian caseload and clinical records.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Clinical Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="practitioner@clinic.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <span className="font-semibold text-foreground">Foundation Notice: </span>
              Supabase Auth client wrappers are scaffolded. Click sign in to test the
              authenticated app shell.
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign In to Clinic Shell"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Link
            href="/dashboard"
            className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Or proceed directly to Shell Demo
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
