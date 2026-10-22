import { Key, Server } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="mt-1 text-muted-foreground">
          Infrastructure health, environment boundaries, and security parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Runtime Environment</CardTitle>
            </div>
            <CardDescription>System execution context and Node pinning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Pinned Node Version:</span>
              <span className="font-mono text-xs">20 LTS (.nvmrc)</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Framework:</span>
              <span className="text-xs font-medium">Next.js 14 App Router</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">TypeScript:</span>
              <span className="text-xs font-medium">Strict Mode Enabled</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Logging Standard:</span>
              <Badge variant="success" className="text-[10px]">
                Zero-PHI Redaction
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Secret Boundaries</CardTitle>
            </div>
            <CardDescription>Server/client secret isolation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Service Role Key:</span>
              <Badge variant="outline">server-only Guarded</Badge>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">WhatsApp Secret:</span>
              <Badge variant="outline">server-only Guarded</Badge>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Google Private Key:</span>
              <Badge variant="outline">server-only Guarded</Badge>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Public Variables:</span>
              <span className="font-mono text-xs text-muted-foreground">
                NEXT_PUBLIC_* only
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
