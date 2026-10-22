import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            WhatsApp Patient Messaging
          </h1>
          <p className="mt-1 text-muted-foreground">
            Meta Business Platform Cloud API messaging hub.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Status: scaffolded, not configured or tested
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outbound Cloud API Wrapper</CardTitle>
            <CardDescription>
              Direct HTTP integration using official Meta Graph API v20.0 endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              • Typed payload builders for text and registered template notifications.
            </p>
            <p>
              • Strict server-only wrapper preventing token leakage to browser clients.
            </p>
            <p>• Error translation and logging sanitized of patient telephone numbers.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inbound Webhook Security</CardTitle>
            <CardDescription>
              HMAC-SHA256 signature verification and verification challenge flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              • Verification endpoint stub located at <code>/api/webhooks/whatsapp</code>.
            </p>
            <p>• Constant-time cryptographic signature checks prevent timing analysis.</p>
            <p>
              • Idempotent deduplication design documented in{" "}
              <code>docs/whatsapp-webhook-design.md</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
