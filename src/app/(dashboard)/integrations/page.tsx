import React from "react";
import {
  FileSpreadsheet,
  Database,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
  Lock,
  Boxes,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIntegrations } from "@/lib/data";

export default async function IntegrationsPage() {
  const integrations = await getIntegrations();

  const getIcon = (id: string) => {
    switch (id) {
      case "google-forms":
      case "google-sheets":
        return (
          <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        );
      case "supabase":
        return <Database className="h-6 w-6 text-primary" />;
      case "whatsapp":
        return <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      default:
        return <Boxes className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="External Clinical Integrations"
        description="Official cloud wrappers for Google Forms & Sheets, Supabase HIPAA storage, and Meta WhatsApp Cloud API."
      />

      {/* Mandatory Architecture Notice */}
      <div className="space-y-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
        <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Foundation Scaffolding Integrity Rule</span>
        </div>
        <p className="leading-relaxed text-amber-800 dark:text-amber-300">
          All client wrappers, configuration schemas, and route stubs are compiled in
          code. In accordance with integrity guidelines, all integrations strictly display{" "}
          <strong>&quot;Not configured&quot;</strong> until verified live production
          credentials are provided in <code>.env.local</code>.
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {integrations.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col justify-between border-border/80 shadow-sm"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
                  {getIcon(item.id)}
                </div>
                {/* STRICT REQUIREMENT: Status must display "Not configured" */}
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 border-muted-foreground/30 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  <Lock className="h-3 w-3" />
                  <span>{item.status}</span>
                </Badge>
              </div>
              <CardTitle className="mt-3 text-base font-semibold">{item.title}</CardTitle>
              <span className="-mt-1 block font-mono text-[11px] text-muted-foreground">
                Provider: {item.provider}
              </span>
              <CardDescription className="mt-2 text-xs leading-relaxed">
                {item.description}
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex items-center justify-between border-t pt-4 text-xs">
              <span className="font-medium text-muted-foreground">
                Category: {item.category}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 cursor-not-allowed text-xs opacity-60"
                  title="Configure in .env.local"
                >
                  Configure (Placeholder)
                </Button>
                <a
                  href={item.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Open API documentation for ${item.title}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
