"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Utensils,
  MessageSquare,
  Search,
  ArrowRight,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats, getRecentClients, getRecentMessages } from "@/lib/data";
import type { DashboardStats, Client, WhatsAppMessage } from "@/types";

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentMessages, setRecentMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [, startTransition] = useTransition();

  const loadData = () => {
    setIsLoading(true);
    setHasError(false);
    startTransition(async () => {
      try {
        const [statsData, clientsData, messagesData] = await Promise.all([
          getDashboardStats(),
          getRecentClients(5),
          getRecentMessages(5),
        ]);
        setStats(statsData);
        setRecentClients(clientsData);
        setRecentMessages(messagesData);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Clinical Overview"
        description="Caseload pulse, diet plan assignments, and WhatsApp delivery dispatch metrics."
      >
        <div className="flex items-center gap-2">
          <Link href="/clients">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Search className="h-4 w-4" />
              <span>Find Client</span>
            </Button>
          </Link>
          <Link href="/clients?action=add">
            <Button size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              <span>Add Client</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {hasError ? (
        <ErrorState onRetry={loadData} />
      ) : (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <section aria-label="Key caseload metrics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Clients"
                value={stats?.totalClients ?? "—"}
                subtext={stats?.totalClientsDelta}
                icon={Users}
                isLoading={isLoading}
              />
              <StatCard
                title="New Clients This Month"
                value={stats?.newClientsThisMonth ?? "—"}
                subtext={stats?.newClientsDelta}
                icon={UserPlus}
                isLoading={isLoading}
              />
              <StatCard
                title="Assigned Diet Plans"
                value={stats?.assignedDietPlans ?? "—"}
                subtext={stats?.assignedDietPlansDelta}
                icon={Utensils}
                isLoading={isLoading}
              />
              <StatCard
                title="WhatsApp Deliveries"
                value={stats?.successfulWhatsAppDeliveries ?? "—"}
                subtext={stats?.successfulWhatsAppRate}
                icon={MessageSquare}
                isLoading={isLoading}
              />
            </div>
          </section>

          {/* Quick Actions Row */}
          <section aria-label="Quick operations">
            <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Clinical Actions
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link
                  href="/clients?action=add"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-foreground">
                      Enroll New Client
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Intake & demographic profile
                    </span>
                  </div>
                </Link>

                <Link
                  href="/diet-plans"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-foreground">
                      Upload Diet Plan
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Stage PDF & dispatch message
                    </span>
                  </div>
                </Link>

                <Link
                  href="/whatsapp"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-foreground">
                      Delivery History
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Review sent & read statuses
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Two-Column Activity Feeds */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Clients List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Recent Client Registrations
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Latest patients enrolled in care
                  </p>
                </div>
                <Link href="/clients">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <span>View all</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-3 divide-y p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : recentClients.length === 0 ? (
                  <EmptyState
                    title="No recent activity."
                    className="rounded-none border-0 py-8"
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {recentClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="space-y-0.5">
                          <span className="block text-sm font-semibold text-foreground hover:underline">
                            {client.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {client.phone} • Enrolled {client.registrationDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={client.dietPlanStatus} size="sm" />
                          <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Message Activity List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Recent WhatsApp Activity
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Outbound templates and PDF deliveries
                  </p>
                </div>
                <Link href="/whatsapp">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <span>View all</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-3 divide-y p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : recentMessages.length === 0 ? (
                  <EmptyState
                    title="No recent activity."
                    className="rounded-none border-0 py-8"
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {recentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="space-y-0.5">
                          <span className="block text-sm font-semibold text-foreground">
                            {msg.clientName}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {msg.documentName ||
                              msg.templateName ||
                              "WhatsApp Notification"}{" "}
                            • {msg.timestamp}
                          </span>
                        </div>
                        <StatusBadge status={msg.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
