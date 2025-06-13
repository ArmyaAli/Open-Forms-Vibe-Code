import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FormBuilder from "@/pages/form-builder";
import MyForms from "@/pages/my-forms";
import Responses from "@/pages/responses";
import PublicForm from "@/pages/public-form";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={FormBuilder} />
      <Route path="/forms" component={MyForms} />
      <Route path="/responses" component={Responses} />
      <Route path="/f/:shareId" component={PublicForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
