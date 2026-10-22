"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, AlertCircle, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { FileDropzone, type SelectedFileMeta } from "@/components/common/file-dropzone";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getClients, getAllDietPlans } from "@/lib/data";
import type { Client, DietPlan } from "@/types";

export default function DietPlansPage() {
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");

  const [clients, setClients] = useState<Client[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preselectedClientId || ""
  );
  const [selectedFile, setSelectedFile] = useState<SelectedFileMeta | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deliveryFeedback, setDeliveryFeedback] = useState<{
    type: "notice" | "error";
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [clientsResult, plansResult] = await Promise.all([
        getClients({}, { page: 1, pageSize: 50 }),
        getAllDietPlans(),
      ]);
      setClients(clientsResult.data);
      setDietPlans(plansResult);
      if (preselectedClientId) {
        setSelectedClientId(preselectedClientId);
      }
    }
    loadData();
  }, [preselectedClientId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const canSend = Boolean(selectedClientId && selectedFile);

  const handleSendClick = () => {
    if (!canSend) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    // STRICT RULE: Do not simulate fake delivery or show "Sent" as if real!
    // Show a clear notice stating WhatsApp delivery is not connected yet; no message was sent.
    setDeliveryFeedback({
      type: "notice",
      message: "WhatsApp delivery is not connected yet; no message was sent.",
      details:
        "The Meta WhatsApp Cloud API credentials have not been configured. In later phases, this action will sign a time-limited download URL from private storage and dispatch the registered diet_plan_delivery_v1 template to the recipient's phone.",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Diet & Nutrition Plans"
        description="Stage clinical nutrition prescription PDFs and dispatch them to patients via the WhatsApp Cloud API."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Plan Staging & File Dropzone */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold">
                1. Select Patient Recipient
              </CardTitle>
              <CardDescription>
                Choose an active patient from your clinical caseload.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Select
                id="client-select"
                label="Assigned Patient"
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setDeliveryFeedback(null);
                }}
              >
                <option value="">
                  {clients.length === 0
                    ? "-- No clients available --"
                    : "-- Choose a patient --"}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — {c.id}
                  </option>
                ))}
              </Select>

              {selectedClient && (
                <div className="space-y-1 rounded-lg border bg-muted/40 p-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient Mobile:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedClient.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinical Goal:</span>
                    <span className="font-medium text-foreground">
                      {selectedClient.primaryGoal || "General nutrition"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Plan Status:</span>
                    <span className="font-semibold capitalize text-foreground">
                      {selectedClient.dietPlanStatus}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold">
                2. Upload Clinical PDF Plan
              </CardTitle>
              <CardDescription>
                Select or drag-and-drop the finalized nutritional guideline PDF (max 15
                MB).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <FileDropzone
                maxSizeBytes={15 * 1024 * 1024}
                onFileSelect={(meta) => {
                  setSelectedFile(meta);
                  setDeliveryFeedback(null);
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dispatch Panel & Feedback Area */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold">Delivery Staging</CardTitle>
              <CardDescription>Review recipient and attachment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="max-w-[140px] truncate text-right font-semibold text-foreground">
                    {selectedClient ? selectedClient.name : "None selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-1">
                  <span className="text-muted-foreground">Destination Phone:</span>
                  <span className="font-mono text-foreground">
                    {selectedClient ? selectedClient.phone : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-1">
                  <span className="text-muted-foreground">PDF Document:</span>
                  <span className="max-w-[140px] truncate text-right font-mono text-foreground">
                    {selectedFile ? selectedFile.name : "None selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="text-foreground">
                    {selectedFile ? selectedFile.formattedSize : "—"}
                  </span>
                </div>
              </div>

              {/* Delivery Action Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSendClick}
                  disabled={!canSend}
                  className="h-10 w-full gap-2 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>Send via WhatsApp</span>
                </Button>
                {!canSend && (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Select both a patient and a valid PDF to enable dispatch.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Feedback and Status Area */}
          {deliveryFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="animate-in fade-in space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {deliveryFeedback.message}
                  </h4>
                  {deliveryFeedback.details && (
                    <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                      {deliveryFeedback.details}
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-amber-500/20 pt-2 text-[10px] text-amber-700 dark:text-amber-400">
                Integration State: <strong>scaffolded, not configured or tested</strong>
              </div>
            </div>
          )}

          {/* Security & Private Storage Architecture Note */}
          <Card className="border-dashed bg-muted/20">
            <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldAlert className="h-4 w-4 text-primary" />
                <span>Private Storage Blueprint</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                PDF diet plans are designated for private Supabase Storage (
                <code>diet-plans-private</code>). When the WhatsApp integration is wired,
                patients receive authenticated, time-limited signed URLs that expire in 15
                minutes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prescribed Diet Plans List */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Prescribed Diet Plans</CardTitle>
          <CardDescription>
            Clinical nutrition prescriptions and uploaded PDF documents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {dietPlans.length === 0 ? (
            <EmptyState
              title="No diet plans available yet."
              className="rounded-none border-0 py-8"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Plan Title & PDF</th>
                    <th className="px-4 py-3">Assigned Date</th>
                    <th className="px-4 py-3">Calorie Target</th>
                    <th className="px-4 py-3">Macro Ratio</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">WhatsApp Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dietPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <div>{plan.title}</div>
                        <div className="font-mono text-[11px] font-normal text-muted-foreground">
                          {plan.filename} ({(plan.fileSizeBytes / 1024 / 1024).toFixed(1)}{" "}
                          MB)
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {plan.assignedDate}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {plan.calorieTarget
                          ? `${plan.calorieTarget} kcal`
                          : "Unspecified"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {plan.macroRatio
                          ? `${plan.macroRatio.proteinPercent}%P / ${plan.macroRatio.carbsPercent}%C / ${plan.macroRatio.fatPercent}%F`
                          : "Custom"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={plan.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={plan.deliveryStatus} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipient Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm WhatsApp Plan Dispatch"
        description="Verify the destination patient and document before dispatching via the WhatsApp Business Cloud API."
        confirmLabel="Confirm & Dispatch"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSend}
      >
        {selectedClient && selectedFile && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient Name:</span>
              <span className="font-semibold text-foreground">{selectedClient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">WhatsApp Number:</span>
              <span className="font-mono font-semibold text-foreground">
                {selectedClient.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attached Document:</span>
              <span className="max-w-[200px] truncate font-mono text-foreground">
                {selectedFile.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attachment Size:</span>
              <span className="text-foreground">{selectedFile.formattedSize}</span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
