import React from "react";
import { Utensils, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DietPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diet & Nutrition Plans</h1>
          <p className="mt-1 text-muted-foreground">
            Clinical macronutrient targets, meal templates, and patient meal guidance.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" /> Create Plan (Later Phase)
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Utensils className="h-6 w-6" />
          </div>
          <CardTitle>Diet Plan Module Foundation</CardTitle>
          <CardDescription className="mx-auto max-w-md">
            Repository stubs and private storage architecture for generated PDFs and
            nutritional guidelines are scaffolded.
          </CardDescription>
          <div className="flex justify-center gap-2 pt-4">
            <Badge variant="outline">Storage: diet-plans-private</Badge>
            <Badge variant="outline">Signed URLs: Enabled</Badge>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
