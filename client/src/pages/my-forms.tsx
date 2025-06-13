import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileMenu } from "@/components/user-profile-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Calendar,
  Download,
  Grid3X3,
  Table,
  MoreHorizontal
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import ShareModal from "@/components/form-builder/share-modal";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = 'grid' | 'list' | 'table';

export default function MyForms() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  });

  const { data: responses = [] } = useQuery<any[]>({
    queryKey: ["/api/responses"],
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      await apiRequest(`/api/forms/${formId}`, {
        method: "DELETE",
      });
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

  const getResponseCount = (formId: number) => {
    return (responses as any[]).filter((response: any) => response.formId === formId).length;
  };

  const handleDeleteForm = (formId: number) => {
    deleteFormMutation.mutate(formId);
  };

  // Automatically switch to list view when there are 5+ forms
  const shouldUseListView = forms.length >= 5;
  const effectiveViewMode = shouldUseListView && viewMode === 'grid' ? 'list' : viewMode;

  const handleExportFormCSV = async (formId: number, formTitle: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/responses/export/csv`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "No Responses",
            description: "This form has no responses to export yet.",
            variant: "destructive",
          });
          return;
        }
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-responses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "CSV Exported",
        description: "Form responses have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderActionButtons = (form: Form) => (
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setLocation(`/builder?formId=${form.id}`)}
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
        className="h-8 w-8 p-0"
        onClick={() => handleExportFormCSV(form.id, form.title)}
        title="Export CSV"
      >
        <Download className="text-slate-600 dark:text-slate-400" size={14} />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
            disabled={deleteFormMutation.isPending}
          >
            <Trash2 className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" size={14} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{form.title}"? This action cannot be undone and will permanently remove the form and all its responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteForm(form.id)}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderFormsView = () => {
    switch (effectiveViewMode) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                      <FileText className="text-white" size={20} />
                    </div>
                    {renderActionButtons(form)}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{form.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {form.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {getResponseCount(form.id)} responses
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-b-xl border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${form.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
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
        );

      case 'list':
        return (
          <div className="space-y-4">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-sm transition-shadow border border-slate-200 dark:border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {form.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${form.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {form.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {form.description || "No description"}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {getResponseCount(form.id)} responses
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {renderActionButtons(form)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'table':
        return (
          <Card className="border border-slate-200 dark:border-slate-600">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                    <th className="text-left p-4 font-medium text-slate-900 dark:text-slate-100">Form</th>
                    <th className="text-left p-4 font-medium text-slate-900 dark:text-slate-100">Status</th>
                    <th className="text-left p-4 font-medium text-slate-900 dark:text-slate-100">Responses</th>
                    <th className="text-left p-4 font-medium text-slate-900 dark:text-slate-100">Updated</th>
                    <th className="text-right p-4 font-medium text-slate-900 dark:text-slate-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form, index) => (
                    <tr 
                      key={form.id} 
                      className={`border-b border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        index === forms.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="text-white" size={16} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {form.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {form.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${form.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {form.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <Users size={14} />
                          {getResponseCount(form.id)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar size={14} />
                          {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          {renderActionButtons(form)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-600 px-4 lg:px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-8">
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">Open Forms</h1>
            </button>
            <nav className="hidden md:flex space-x-6 border-l border-slate-200 dark:border-slate-600 pl-6">
              <button
                onClick={() => setLocation("/builder")}
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
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button onClick={() => setLocation("/builder")} size="sm" className="hidden sm:flex">
              <Plus className="mr-2" size={16} />
              Create New Form
            </Button>
            <Button onClick={() => setLocation("/builder")} size="sm" className="sm:hidden">
              <Plus size={16} />
            </Button>
            <ThemeToggle />
            {user && <UserProfileMenu user={user} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">My Forms</h2>
            <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">Manage and organize your forms</p>
          </div>
          
          {forms.length > 0 && (
            <div className="flex items-center space-x-2">
              {shouldUseListView && (
                <Badge variant="secondary" className="text-xs">
                  Auto-switched to list view
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {effectiveViewMode === 'grid' && <Grid3X3 className="mr-2" size={16} />}
                    {effectiveViewMode === 'list' && <List className="mr-2" size={16} />}
                    {effectiveViewMode === 'table' && <Table className="mr-2" size={16} />}
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewMode('grid')}>
                    <Grid3X3 className="mr-2" size={16} />
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode('list')}>
                    <List className="mr-2" size={16} />
                    List View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode('table')}>
                    <Table className="mr-2" size={16} />
                    Table View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
              <Button onClick={() => setLocation("/builder")}>
                <Plus className="mr-2" size={16} />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          renderFormsView()
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
