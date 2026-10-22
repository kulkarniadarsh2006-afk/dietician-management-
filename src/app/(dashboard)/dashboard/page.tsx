import React from "react";
import { Users, Utensils, Calendar, MessageSquare, ShieldCheck } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const cards = [
    {
      title: "Patient Caseload",
      count: "0 (Scaffolded)",
      description: "Postgres schema ready for patient directory",
      icon: Users,
    },
    {
      title: "Diet Plans",
      count: "0 (Scaffolded)",
      description: "Templates & private storage buckets scaffolded",
      icon: Utensils,
    },
    {
      title: "Appointments",
      count: "0 (Scaffolded)",
      description: "Scheduling schema & timezone handlers ready",
      icon: Calendar,
    },
    {
      title: "WhatsApp Dispatch",
      count: "Ready for keys",
      description: "Official Meta Cloud API wrapper compiled",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Overview</h1>
          <p className="mt-1 text-muted-foreground">
            Foundation app shell operational. Ready for domain feature integration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Environment: {process.env.NODE_ENV || "development"}
          </Badge>
          <Badge variant="success" className="px-3 py-1 text-xs">
            Shell: Active
          </Badge>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.count}</div>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integration Verification Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Integration Foundation Status</CardTitle>
              <CardDescription>
                State of infrastructure wrappers across external clinical dependencies.
              </CardDescription>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y text-sm">
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="font-medium">Supabase Database & Auth</span>
                <p className="text-xs text-muted-foreground">
                  Cookie SSR handler, RLS blueprint, repository pattern
                </p>
              </div>
              <Badge variant="secondary">scaffolded, not configured or tested</Badge>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="font-medium">Google Forms & Sheets</span>
                <p className="text-xs text-muted-foreground">
                  JWT Service Account client wrapper, range appender
                </p>
              </div>
              <Badge variant="secondary">scaffolded, not configured or tested</Badge>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="font-medium">Meta WhatsApp Cloud API</span>
                <p className="text-xs text-muted-foreground">
                  Official v20.0 Graph endpoint wrapper, HMAC-SHA256 signature verifier
                </p>
              </div>
              <Badge variant="secondary">scaffolded, not configured or tested</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
