import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-background">
      <Card className="w-full max-w-md mx-4 border border-slate-200 dark:border-slate-600">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
