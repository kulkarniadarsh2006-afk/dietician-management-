import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IntakeFormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intake Forms & Sheets</h1>
          <p className="mt-1 text-muted-foreground">
            Google Forms questionnaires and Google Sheets clinical sync.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Status: scaffolded, not configured or tested
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Google Sheets Ingestion</CardTitle>
            </div>
            <CardDescription>
              Service Account JWT integration for bi-directional sheet updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              • Method <code>appendSheetRows</code> appends new intake submissions safely.
            </p>
            <p>
              • Scoped strictly to spreadsheets defined in{" "}
              <code>GOOGLE_SHEETS_SPREADSHEET_ID</code>.
            </p>
            <p>• Automatic newline normalization for RSA private keys.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Google Forms Ingestion</CardTitle>
            </div>
            <CardDescription>
              Official Google Forms v1 API client for reading form questionnaires.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              • Method <code>getFormMetadata</code> fetches questions and structure.
            </p>
            <p>
              • Scopes: <code>forms.body.readonly</code> and{" "}
              <code>forms.responses.readonly</code>.
            </p>
            <p>• Ready for patient intake parsing pipeline in subsequent prompts.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
