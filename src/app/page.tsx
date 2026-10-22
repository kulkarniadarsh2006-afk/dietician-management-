import Link from "next/link";
import {
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  Lock,
  Database,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight">NutriCare</span>
              <span className="-mt-1 block text-xs text-muted-foreground">
                Clinical Dietitian Platform
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Clinician Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Enter App Shell <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto max-w-6xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-24">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs">
            Foundation Scaffolding Phase
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Production-Minded Infrastructure for{" "}
            <span className="text-primary">Clinical Dietetics</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Built from first principles for Protected Health Information (PHI). Featuring
            strict Row Level Security, zero-PHI logging, verified integration clients, and
            server-side boundaries.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-11 px-6 shadow-md">
                Launch Authenticated Shell <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/api/health" target="_blank">
              <Button variant="outline" size="lg" className="h-11 px-6">
                Inspect /api/health
              </Button>
            </Link>
          </div>
        </section>

        {/* Architectural Highlights Grid */}
        <section className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle>Health Data Protection</CardTitle>
                <CardDescription>
                  Enforcing zero-PHI logging rules, TLS 1.3 transit, CSP headers, and
                  strict server-only secret barriers.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Documented in <code>docs/data-privacy-and-phi.md</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <CardTitle>Supabase Architecture</CardTitle>
                <CardDescription>
                  PostgreSQL repository patterns, cookie session refresh, and private
                  storage buckets with time-limited signed URLs.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Documented in <code>docs/rls-and-storage-design.md</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <CardTitle>Official Cloud Integrations</CardTitle>
                <CardDescription>
                  Typed clients for Meta WhatsApp Cloud API and Google Forms & Sheets via
                  service account JWTs.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Documented in <code>docs/whatsapp-webhook-design.md</code>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/40 py-8">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            <span>NutriCare Clinical Foundation Scaffold • Node 20 LTS Pinned</span>
          </div>
          <div>
            All external integrations marked scaffolded until credentials supplied.
          </div>
        </div>
      </footer>
    </div>
  );
}
