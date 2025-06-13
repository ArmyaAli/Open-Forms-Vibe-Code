import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Share, Eye, Box, List, BarChart, Download } from "lucide-react";
import { exportFormAsPDF } from "@/lib/pdf-export";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FormField, Form, User } from "@shared/schema";
import FieldPalette from "@/components/form-builder/field-palette";
import MultiColumnCanvas from "@/components/form-builder/multi-column-canvas";
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
    columnCount: number;
  }>({
    title: "Untitled Form",
    description: "",
    fields: [],
    themeColor: "#6366F1",
    isPublished: false,
    columnCount: 1,
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const createFormMutation = useMutation({
    mutationFn: async (formData: typeof currentForm) => {
      return await apiRequest("/api/forms", {
        method: "POST",
        body: JSON.stringify(formData),
      });
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
      return await apiRequest(`/api/forms/${currentFormId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
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
        return await apiRequest("/api/forms", {
          method: "POST",
          body: JSON.stringify({
            ...currentForm,
            isPublished: true,
          }),
        });
      } else {
        // Update existing form
        return await apiRequest(`/api/forms/${currentFormId}`, {
          method: "PUT",
          body: JSON.stringify({
            ...currentForm,
            isPublished: true,
          }),
        });
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
    if (!currentForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your form before saving.",
        variant: "destructive",
      });
      return;
    }

    if (currentForm.title.trim() === "Untitled Form") {
      toast({
        title: "Custom Title Required",
        description: "Please change the form title from 'Untitled Form' before saving.",
        variant: "destructive",
      });
      return;
    }

    if (currentFormId) {
      updateFormMutation.mutate(currentForm);
    } else {
      createFormMutation.mutate(currentForm);
    }
  };

  const handlePublishForm = () => {
    if (!currentForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your form before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (currentForm.title.trim() === "Untitled Form") {
      toast({
        title: "Custom Title Required",
        description: "Please change the form title from 'Untitled Form' before publishing.",
        variant: "destructive",
      });
      return;
    }

    publishFormMutation.mutate();
  };

  const handleAddField = (fieldType: string, column: number = 0) => {
    const fieldsInColumn = currentForm.fields.filter(f => (f.column || 0) === column);
    const newField: FormField = {
      id: nanoid(),
      type: fieldType as any,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: `Enter ${fieldType}`,
      required: false,
      column: column,
      order: fieldsInColumn.length,
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

  const handleReorderFields = (dragIndex: number, hoverIndex: number, fromColumn: number, toColumn: number) => {
    setCurrentForm(prev => {
      const newFields = [...prev.fields];
      const draggedField = newFields[dragIndex];
      
      // Update field's column and order
      draggedField.column = toColumn;
      draggedField.order = hoverIndex;
      
      // Update order of other fields in the target column
      newFields.forEach(field => {
        if (field.id !== draggedField.id && (field.column || 0) === toColumn && (field.order || 0) >= hoverIndex) {
          field.order = (field.order || 0) + 1;
        }
      });
      
      return {
        ...prev,
        fields: newFields,
      };
    });
  };

  const handleColumnCountChange = (count: number) => {
    setCurrentForm(prev => ({
      ...prev,
      columnCount: count,
    }));
  };

  const handleExportPDF = () => {
    try {
      exportFormAsPDF({
        title: currentForm.title,
        description: currentForm.description,
        fields: currentForm.fields,
        themeColor: currentForm.themeColor,
      });
      toast({
        title: "PDF exported successfully",
        description: "Your form has been exported as a PDF file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your form as PDF.",
        variant: "destructive",
      });
    }
  };

  const renderPreviewField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            className="w-full resize-none"
            rows={3}
            disabled
          />
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <RadioGroup disabled>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${index}`} disabled />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case "date":
        return (
          <Input
            type="date"
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
      case "time":
        return (
          <Input
            type="time"
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
      case "range":
        return (
          <Input
            type="range"
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <Label>{field.placeholder || "Toggle option"}</Label>
          </div>
        );
      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
    }
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Open Forms</h1>
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
            {user && <UserProfileMenu user={user} />}
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Form Title</span>
                      <span className="text-red-500 text-sm">*</span>
                    </div>
                    <Input
                      type="text"
                      value={currentForm.title}
                      onChange={(e) => setCurrentForm(prev => ({ ...prev, title: e.target.value }))}
                      className={`text-2xl font-bold border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-slate-100 ${
                        !currentForm.title.trim() ? 'placeholder:text-red-300 dark:placeholder:text-red-400' : ''
                      }`}
                      placeholder="Enter form title (required)"
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
                    <Textarea
                      value={currentForm.description}
                      onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="text-slate-600 dark:text-slate-400 border-none p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Add an optional description..."
                      rows={2}
                    />
                  </div>
                </div>
                
                <MultiColumnCanvas
                  fields={currentForm.fields}
                  onUpdateField={handleUpdateField}
                  onRemoveField={handleRemoveField}
                  onAddField={handleAddField}
                  onReorderFields={handleReorderFields}
                  columnCount={currentForm.columnCount || 1}
                  onColumnCountChange={handleColumnCountChange}
                  themeColor={currentForm.themeColor}
                />

                <div className="p-6 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-sm"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <Eye className="mr-2" size={16} />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-sm"
                      onClick={handleExportPDF}
                    >
                      <Download className="mr-2" size={16} />
                      Export PDF
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-sm"
                          onClick={handleSaveForm}
                          disabled={createFormMutation.isPending || updateFormMutation.isPending || !currentForm.title.trim()}
                        >
                          <Save className="mr-2" size={16} />
                          {createFormMutation.isPending || updateFormMutation.isPending ? "Saving..." : "Save Draft"}
                        </Button>
                      </TooltipTrigger>
                      {!currentForm.title.trim() && (
                        <TooltipContent>
                          <p>Enter a form title to save</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handlePublishForm}
                        disabled={publishFormMutation.isPending || !currentForm.title.trim()}
                        size="sm"
                        className="rounded-sm"
                      >
                        <Share className="mr-2" size={16} />
                        {publishFormMutation.isPending ? "Publishing..." : "Publish & Share"}
                      </Button>
                    </TooltipTrigger>
                    {!currentForm.title.trim() && (
                      <TooltipContent>
                        <p>Enter a form title to publish</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
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

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Card className="shadow-sm">
              <CardHeader 
                className="text-white"
                style={{ backgroundColor: currentForm.themeColor }}
              >
                <CardTitle className="text-xl font-bold">
                  {currentForm.title || "Untitled Form"}
                </CardTitle>
                {currentForm.description && (
                  <p className="opacity-90 mt-2">{currentForm.description}</p>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {currentForm.fields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No fields added yet. Add some fields to see the preview.
                  </p>
                ) : (
                  currentForm.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderPreviewField(field)}
                    </div>
                  ))
                )}
                
                {currentForm.fields.length > 0 && (
                  <Button 
                    className="w-full mt-6"
                    style={{ backgroundColor: currentForm.themeColor }}
                    disabled
                  >
                    Submit
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
