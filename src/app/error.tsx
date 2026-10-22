"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error without revealing PHI
    console.error("[RootError caught]", error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md border-destructive/30 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Application Encountered an Error</CardTitle>
          <CardDescription>
            An unexpected error occurred during execution. Clinical data remains secured
            and unaffected.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-xs text-muted-foreground">
          {error.digest
            ? `Reference ID: ${error.digest}`
            : "Please try reloading the page."}
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button onClick={() => reset()} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
