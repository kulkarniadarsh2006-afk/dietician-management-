import React from "react";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="mt-1 text-muted-foreground">
            Protected Health Information (PHI) management and clinical caseload.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" /> Add Patient (Later Phase)
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <CardTitle>Patient Records Layer Scaffolded</CardTitle>
          <CardDescription className="mx-auto max-w-md">
            Data access repository (<code>PatientRepository</code>) and server boundaries
            are prepared. Patient list and intake flows belong to subsequent prompts.
          </CardDescription>
          <div className="flex justify-center gap-2 pt-4">
            <Badge variant="outline">BaseRepository: Ready</Badge>
            <Badge variant="outline">RLS Blueprint: Defined</Badge>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
