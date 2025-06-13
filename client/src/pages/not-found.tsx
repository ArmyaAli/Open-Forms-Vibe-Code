import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-background">
      <Card className="w-full max-w-md mx-4 border border-slate-200 dark:border-slate-600">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Page Not Found</h2>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <Home size={16} />
              Go Home
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by <span className="font-medium text-primary">Open Forms</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
