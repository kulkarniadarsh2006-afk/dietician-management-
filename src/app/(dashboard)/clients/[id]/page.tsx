import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Heart,
  AlertTriangle,
  FileText,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClientById, getDietPlansByClientId, getMessagesByClientId } from "@/lib/data";

interface ClientPageProps {
  params: {
    id: string;
  };
}

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const client = await getClientById(params.id);

  if (!client) {
    notFound();
  }

  const [dietPlans, messages] = await Promise.all([
    getDietPlansByClientId(client.id),
    getMessagesByClientId(client.id),
  ]);

  return (
    <div className="space-y-8">
      {/* Back button & Header */}
      <div>
        <Link
          href="/clients"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Caseload Directory</span>
        </Link>

        <PageHeader
          title={client.name}
          description={`Clinical Chart: ${client.id} • Registered on ${client.registrationDate}`}
          showSampleDataBadge
        >
          <div className="flex items-center gap-2">
            <Link href={`/diet-plans?client=${client.id}`}>
              <Button size="sm" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                <span>Assign & Dispatch Plan</span>
              </Button>
            </Link>
          </div>
        </PageHeader>
      </div>

      {/* Grid: Demographic & Contact Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Contact Info Card */}
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Contact & Demographics
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-mono text-xs">{client.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="break-all text-xs">{client.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-xs">
                Age: {client.age || "N/A"} • Gender: {client.gender || "Not specified"}
              </span>
            </div>
            <div className="border-t pt-2 text-xs">
              <span className="text-muted-foreground">Assigned Clinician:</span>
              <p className="mt-0.5 font-semibold text-foreground">
                {client.assignedDietitian || "Unassigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences and Goals */}
        <Card className="md:col-span-2">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Dietary Profile & Goals
              </CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-sm">
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Primary Clinical Goal
              </span>
              <p className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-sm font-medium text-foreground">
                {client.primaryGoal || "No primary goal recorded."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Allergies &
                  Intolerances
                </span>
                {client.allergies && client.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {client.allergies.map((a) => (
                      <Badge
                        key={a}
                        variant="destructive"
                        className="text-xs font-normal"
                      >
                        {a}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No known allergies reported
                  </span>
                )}
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dietary Preferences
                </span>
                {client.dietaryPreferences && client.dietaryPreferences.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {client.dietaryPreferences.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs font-normal">
                        {p}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Standard omnivore diet
                  </span>
                )}
              </div>
            </div>

            {client.notes && (
              <div className="border-t pt-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Practitioner Clinical Notes
                </span>
                <p className="text-xs italic leading-relaxed text-muted-foreground">
                  &ldquo;{client.notes}&rdquo;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Intake Information Section */}
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Intake Form Information
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Synchronized from Google Forms clinical intake questionnaire
              </p>
            </div>
            <Badge variant={client.intakeCompleted ? "success" : "warning"}>
              {client.intakeCompleted ? "Intake Completed" : "Intake Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <span className="block text-muted-foreground">Submission Timestamp:</span>
              <span className="font-semibold text-foreground">
                {client.intakeDate || "Awaiting questionnaire submission"}
              </span>
            </div>
            <div>
              <span className="block text-muted-foreground">
                Medical Conditions Noted:
              </span>
              <span className="font-semibold text-foreground">
                {client.medicalConditions && client.medicalConditions.length > 0
                  ? client.medicalConditions.join(", ")
                  : "None flagged"}
              </span>
            </div>
            <div>
              <span className="block text-muted-foreground">Source Integration:</span>
              <span className="font-mono text-muted-foreground">
                Google Forms v1 (Mock-backed)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Diet Plans Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Assigned Diet Plans</CardTitle>
            <p className="text-xs text-muted-foreground">
              Clinical nutrition prescriptions and PDF menus
            </p>
          </div>
          <Link href={`/diet-plans?client=${client.id}`}>
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <span>Upload New PDF</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {dietPlans.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No diet plans assigned yet</p>
              <p className="mt-0.5">
                Upload a PDF nutrition plan to stage and deliver to this client.
              </p>
            </div>
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

      {/* WhatsApp Delivery History Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              WhatsApp Delivery History
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Official Cloud API outbound notification trail
            </p>
          </div>
          <SampleDataBadge label="Simulated History" />
        </CardHeader>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No message history</p>
              <p className="mt-0.5">
                No WhatsApp dispatches recorded for this client telephone number.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Message Type</th>
                    <th className="px-4 py-3">Payload / Template</th>
                    <th className="px-4 py-3">Recipient Phone</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium capitalize">
                        {msg.messageType}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {msg.documentName || msg.templateName || "Standard Notification"}
                      </td>
                      <td className="px-4 py-3 font-mono">{msg.recipientPhone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{msg.timestamp}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={msg.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
