import React from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Appointments & Consultations
          </h1>
          <p className="mt-1 text-muted-foreground">
            Clinical consultation schedule, reminders, and patient booking slots.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" /> Schedule Visit (Later Phase)
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Calendar className="h-6 w-6" />
          </div>
          <CardTitle>Appointment Scheduling Scaffolded</CardTitle>
          <CardDescription className="mx-auto max-w-md">
            Repository stubs (<code>AppointmentRepository</code>) ready. WhatsApp reminder
            dispatch will integrate with this scheduling layer.
          </CardDescription>
          <div className="flex justify-center gap-2 pt-4">
            <Badge variant="outline">Appointments Schema: Blueprint</Badge>
            <Badge variant="outline">Meta Reminder Templates: Ready</Badge>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
