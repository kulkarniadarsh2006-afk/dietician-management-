export interface FormQuestionItem {
  id: string;
  title: string;
  description?: string;
  type: string;
}

export interface FormSubmissionRow {
  submissionId: string;
  submittedAt: string;
  responses: Record<string, string | string[]>;
}

export interface AppendRowOptions {
  spreadsheetId: string;
  range: string;
  values: (string | number | boolean)[][];
}

export interface AppendRowResult {
  updatedRange: string;
  updatedRows: number;
}
