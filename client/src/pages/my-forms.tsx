import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Box, 
  List, 
  BarChart, 
  Edit, 
  Share, 
  Trash2, 
  FileText,
  Users,
  Calendar
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import ShareModal from "@/components/form-builder/share-modal";
import { useState } from "react";

export default function MyForms() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      await apiRequest("DELETE", `/api/forms/${formId}`);
    },
    onSuccess: () => {
      toast({
        title: "Form deleted",
        description: "The form has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShareForm = (form: Form) => {
    setShareUrl(`${window.location.origin}/f/${form.shareId}`);
    setShareModalOpen(true);
  };

  const handleDeleteForm = (formId: number) => {
    if (confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      deleteFormMutation.mutate(formId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-600 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">FormCraft</h1>
            </div>
            <nav className="hidden md:flex space-x-6 border-l border-slate-200 dark:border-slate-600 pl-6">
              <button
                onClick={() => setLocation("/")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
              >
                <Plus size={16} />
                Builder
              </button>
              <button
                onClick={() => setLocation("/forms")}
                className="text-sm font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-2"
              >
                <List size={16} />
                My Forms
              </button>
              <button
                onClick={() => setLocation("/responses")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
              >
                <BarChart size={16} />
                Responses
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setLocation("/")} size="sm">
              <Plus className="mr-2" size={16} />
              Create New Form
            </Button>
            <div className="w-8 h-8 bg-slate-300 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Forms</h2>
            <p className="text-slate-600 dark:text-slate-400">Manage and organize your forms</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse border border-slate-200 dark:border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="flex space-x-1">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    </div>
                  </div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <Card className="text-center py-12 border border-slate-200 dark:border-slate-600">
            <CardContent>
              <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No forms yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first form to start collecting responses
              </p>
              <Button onClick={() => setLocation("/")}>
                <Plus className="mr-2" size={16} />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setLocation("/")}
                      >
                        <Edit className="text-slate-600 dark:text-slate-400" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleShareForm(form)}
                      >
                        <Share className="text-slate-600 dark:text-slate-400" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={() => handleDeleteForm(form.id)}
                        disabled={deleteFormMutation.isPending}
                      >
                        <Trash2 className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" size={14} />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{form.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {form.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      0 responses
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
                <div className="bg-slate-50 px-6 py-3 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${form.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs text-slate-600">
                        {form.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary-700 h-auto p-0"
                      onClick={() => setLocation("/responses")}
                    >
                      View Responses
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
}
