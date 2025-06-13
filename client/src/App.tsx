import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionTimeoutModal } from "@/components/session-timeout-modal";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import FormBuilder from "@/pages/form-builder";
import MyForms from "@/pages/my-forms";
import Responses from "@/pages/responses";
import PublicForm from "@/pages/public-form";
import NotFound from "@/pages/not-found";

function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <SessionTimeoutModal 
        isAuthenticated={isAuthenticated} 
        onSessionExpired={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
          window.location.href = '/login';
        }} 
      />
      <Switch>
        {/* Public routes */}
        <Route path="/f/:shareId" component={PublicForm} />
        
        {/* Authentication routes - only for non-authenticated users */}
        {!isAuthenticated && (
          <>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/" component={Landing} />
          </>
        )}
        
        {/* Protected routes - only for authenticated users */}
        {isAuthenticated && (
          <>
            <Route path="/" component={MyForms} />
            <Route path="/builder" component={FormBuilder} />
            <Route path="/forms" component={MyForms} />
            <Route path="/responses" component={Responses} />
          </>
        )}
        
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="openforms-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
