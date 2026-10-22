"use client";

import React, { useState, useEffect } from "react";
import { User, Globe, Key, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getStaffProfile, getAppPreferences } from "@/lib/data";
import type { StaffProfile, AppPreferences } from "@/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const [prof, pref] = await Promise.all([getStaffProfile(), getAppPreferences()]);
      setProfile(prof);
      setPreferences(pref);
    }
    loadSettings();
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Practitioner Settings"
        description="Manage clinical staff credentials, communication preferences, and application parameters."
      />

      {savedNotice && (
        <div
          role="status"
          aria-live="polite"
          className="animate-in fade-in flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Settings preferences updated successfully.</span>
        </div>
      )}

      {/* Staff Profile Form */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2.5">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">
              Staff Practitioner Profile
            </CardTitle>
          </div>
          <CardDescription>
            Clinical credentials displayed on exported diet plan PDFs and WhatsApp
            headers.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSubmit}>
          <CardContent className="space-y-4 pt-5 text-xs">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="staff-name"
                  className="font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Full Practitioner Name
                </label>
                <Input
                  id="staff-name"
                  value={profile?.name || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="staff-title"
                  className="font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Clinical Title / Designation
                </label>
                <Input
                  id="staff-title"
                  value={profile?.title || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="staff-email"
                  className="font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Clinical Email Address
                </label>
                <Input
                  id="staff-email"
                  type="email"
                  value={profile?.email || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, email: e.target.value } : null
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="staff-phone"
                  className="font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Direct Clinic Phone
                </label>
                <Input
                  id="staff-phone"
                  value={profile?.phone || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, phone: e.target.value } : null
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="staff-license"
                  className="font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  State Dietetic License Number
                </label>
                <Input
                  id="staff-license"
                  value={profile?.licenseNumber || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, licenseNumber: e.target.value } : null
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="staff-clinic"
                  className="font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Practice / Clinic Name
                </label>
                <Input
                  id="staff-clinic"
                  value={profile?.clinicName || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, clinicName: e.target.value } : null
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" size="sm">
              Save Profile Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Application Preferences Form */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">
              Application Preferences
            </CardTitle>
          </div>
          <CardDescription>
            Regional formatting, calendar timezones, and clinical alerts.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePreferencesSubmit}>
          <CardContent className="space-y-4 pt-5 text-xs">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Select
                  id="pref-timezone"
                  label="Clinical Timezone"
                  value={preferences?.timezone || "America/New_York (UTC-4)"}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, timezone: e.target.value } : null
                    )
                  }
                >
                  <option value="America/New_York (UTC-4)">
                    America/New_York (UTC-4)
                  </option>
                  <option value="America/Chicago (UTC-5)">America/Chicago (UTC-5)</option>
                  <option value="America/Denver (UTC-6)">America/Denver (UTC-6)</option>
                  <option value="America/Los_Angeles (UTC-7)">
                    America/Los_Angeles (UTC-7)
                  </option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </Select>
              </div>

              <div>
                <Select
                  id="pref-dateformat"
                  label="Display Date Format"
                  value={preferences?.dateFormat || "YYYY-MM-DD"}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev
                        ? {
                            ...prev,
                            dateFormat: e.target.value as AppPreferences["dateFormat"],
                          }
                        : null
                    )
                  }
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (UK/Commonwealth)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US format)</option>
                </Select>
              </div>
            </div>

            <div className="space-y-3 border-t pt-3">
              <span className="mb-2 block font-semibold uppercase tracking-wider text-muted-foreground">
                Notification Toggles
              </span>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences?.emailNotifications ?? true}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, emailNotifications: e.target.checked } : null
                    )
                  }
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <div>
                  <span className="block font-medium text-foreground">
                    Email Ingestion Summaries
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Receive daily intake form summary emails from Google Forms.
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences?.whatsappAlerts ?? true}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, whatsappAlerts: e.target.checked } : null
                    )
                  }
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <div>
                  <span className="block font-medium text-foreground">
                    WhatsApp Delivery Failure Alerts
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Flag failed PDF dispatches immediately in the top navigation bar.
                  </span>
                </div>
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" size="sm">
              Save Preferences
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Account Settings & Sign Out Placeholders */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base font-semibold">Account & Security</CardTitle>
          </div>
          <CardDescription>
            Authentication security controls and session lifecycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5 text-xs">
          <div className="flex flex-col justify-between gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center">
            <div>
              <span className="block font-semibold text-foreground">
                Password Management
              </span>
              <span className="block text-muted-foreground">
                Managed through Supabase Auth.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="cursor-not-allowed opacity-70"
              title="Auth backend integration required"
            >
              Change Password
            </Button>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 sm:flex-row sm:items-center">
            <div>
              <span className="block font-semibold text-destructive">
                Session Termination
              </span>
              <span className="block text-muted-foreground">
                Terminates the current clinical session and clears authentication cookies.
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                alert("Authentication service will be connected in subsequent phase.")
              }
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
