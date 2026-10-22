import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function ClientNotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-md">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <UserX className="h-7 w-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Client Record Not Found</CardTitle>
          <CardDescription>
            The patient identifier you requested does not exist in the caseload directory
            or may have been archived.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/clients">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Caseload Directory
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
