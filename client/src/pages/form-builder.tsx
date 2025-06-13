import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Share, Eye, Box, List, BarChart } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FormField, Form } from "@shared/schema";
import FieldPalette from "@/components/form-builder/field-palette";
import FormCanvas from "@/components/form-builder/form-canvas";
import FormPreview from "@/components/form-builder/form-preview";
import ShareModal from "@/components/form-builder/share-modal";
import { nanoid } from "nanoid";

export default function FormBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentForm, setCurrentForm] = useState<{
    title: string;
    description: string;
    fields: FormField[];
    themeColor: string;
    isPublished: boolean;
  }>({
    title: "Untitled Form",
    description: "",
    fields: [],
    themeColor: "#6366F1",
    isPublished: false,
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const createFormMutation = useMutation({
    mutationFn: async (formData: typeof currentForm) => {
      const response = await apiRequest("POST", "/api/forms", formData);
      return response.json();
    },
    onSuccess: (data: Form) => {
      setCurrentFormId(data.id);
      setShareUrl(`${window.location.origin}/f/${data.shareId}`);
      toast({
        title: "Form saved successfully",
        description: "Your form has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async (formData: typeof currentForm) => {
      if (!currentFormId) throw new Error("No form ID");
      const response = await apiRequest("PUT", `/api/forms/${currentFormId}`, formData);
      return response.json();
    },
    onSuccess: (data: Form) => {
      setShareUrl(`${window.location.origin}/f/${data.shareId}`);
      toast({
        title: "Form updated successfully",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const publishFormMutation = useMutation({
    mutationFn: async () => {
      if (!currentFormId) {
        // Create form first if it doesn't exist
        const response = await apiRequest("POST", "/api/forms", {
          ...currentForm,
          isPublished: true,
        });
        return response.json();
      } else {
        // Update existing form
        const response = await apiRequest("PUT", `/api/forms/${currentFormId}`, {
          ...currentForm,
          isPublished: true,
        });
        return response.json();
      }
    },
    onSuccess: (data: Form) => {
      setCurrentFormId(data.id);
      setCurrentForm(prev => ({ ...prev, isPublished: true }));
      setShareUrl(`${window.location.origin}/f/${data.shareId}`);
      setShowShareModal(true);
      toast({
        title: "Form published successfully",
        description: "Your form is now live and ready to collect responses.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveForm = () => {
    if (currentFormId) {
      updateFormMutation.mutate(currentForm);
    } else {
      createFormMutation.mutate(currentForm);
    }
  };

  const handlePublishForm = () => {
    publishFormMutation.mutate();
  };

  const handleAddField = (fieldType: string) => {
    const newField: FormField = {
      id: nanoid(),
      type: fieldType as any,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: `Enter ${fieldType}`,
      required: false,
      options: fieldType === "select" || fieldType === "radio" || fieldType === "checkbox" 
        ? ["Option 1", "Option 2", "Option 3"] 
        : undefined,
    };

    setCurrentForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const handleRemoveField = (fieldId: string) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-600 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary-500 rounded-sm flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">OpenForms</h1>
            </button>
            <nav className="hidden md:flex space-x-6 border-l border-slate-200 dark:border-slate-600 pl-6">
              <button
                onClick={() => setLocation("/builder")}
                className="text-sm font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-2"
              >
                <Plus size={16} />
                Builder
              </button>
              <button
                onClick={() => setLocation("/forms")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
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
            <ThemeToggle />
            <Button onClick={() => setLocation("/forms")} variant="outline" size="sm" className="rounded-sm">
              <Plus className="mr-2" size={16} />
              New Form
            </Button>
            <div className="w-8 h-8 bg-slate-300 dark:bg-muted rounded-sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <FieldPalette 
          onAddField={handleAddField}
          currentForm={currentForm}
          onUpdateForm={(updates) => setCurrentForm(prev => ({ ...prev, ...updates }))}
        />

        {/* Form Builder */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="min-h-96 shadow-sm rounded-sm border border-slate-200 dark:border-slate-600">
                <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                  <Input
                    type="text"
                    value={currentForm.title}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, title: e.target.value }))}
                    className="text-2xl font-bold border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-slate-100"
                    placeholder="Untitled Form"
                  />
                  <Textarea
                    value={currentForm.description}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="text-slate-600 dark:text-slate-400 border-none p-0 mt-2 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Add a description..."
                    rows={2}
                  />
                </div>
                
                <FormCanvas
                  fields={currentForm.fields}
                  onUpdateField={handleUpdateField}
                  onRemoveField={handleRemoveField}
                  onAddField={handleAddField}
                />

                <div className="p-6 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm" className="rounded-sm">
                      <Eye className="mr-2" size={16} />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-sm"
                      onClick={handleSaveForm}
                      disabled={createFormMutation.isPending || updateFormMutation.isPending}
                    >
                      <Save className="mr-2" size={16} />
                      {createFormMutation.isPending || updateFormMutation.isPending ? "Saving..." : "Save Draft"}
                    </Button>
                  </div>
                  <Button 
                    onClick={handlePublishForm}
                    disabled={publishFormMutation.isPending}
                    size="sm"
                    className="rounded-sm"
                  >
                    <Share className="mr-2" size={16} />
                    {publishFormMutation.isPending ? "Publishing..." : "Publish & Share"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Live Preview */}
          <FormPreview form={currentForm} />
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
}
