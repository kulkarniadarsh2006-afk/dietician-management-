"use client";

import React from "react";
import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="w-full max-w-md space-y-4 rounded-xl border bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900">Critical System Error</h2>
          <p className="text-sm text-gray-600">
            A critical application fault occurred. The session has been isolated to
            protect healthcare data.
          </p>
          <button
            onClick={() => reset()}
            className="w-full rounded-lg bg-teal-700 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-800"
          >
            Attempt Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
