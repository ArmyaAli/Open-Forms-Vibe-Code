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
import { FormField, FormRow, Form, User } from "@shared/schema";
import FieldPalette from "@/components/form-builder/field-palette";
import RowBasedCanvas from "@/components/form-builder/row-based-canvas";
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
    rows: FormRow[];
    themeColor: string;
    isPublished: boolean;
    shareId: string;
  }>({
    title: "Untitled Form",
    description: "",
    fields: [],
    rows: [{ id: nanoid(), order: 0, columns: 1 }], // Start with one row
    themeColor: "#6366F1",
    isPublished: false,
    shareId: nanoid(),
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [loadedFormData, setLoadedFormData] = useState<Form | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Load existing form if formId is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('formId');
    
    if (formId) {
      fetch(`/api/forms/${formId}`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then((form: Form) => {
          // Store the original form data for metadata display
          setLoadedFormData(form);
          
          // Migrate form if it doesn't have rows
          const migratedForm = {
            title: form.title,
            description: form.description || "",
            fields: form.fields || [],
            rows: form.rows && form.rows.length > 0 
              ? form.rows 
              : [{ id: nanoid(), order: 0, columns: 1 }],
            themeColor: form.themeColor || "#6366F1",
            isPublished: form.isPublished || false,
            shareId: form.shareId,
          };
          
          // Ensure fields have rowId and columnIndex for backward compatibility
          if (migratedForm.fields.length > 0 && !migratedForm.fields[0].rowId) {
            migratedForm.fields = migratedForm.fields.map((field, index) => ({
              ...field,
              rowId: migratedForm.rows[0].id,
              columnIndex: index % (migratedForm.rows[0].columns || 1),
            }));
          }
          
          setCurrentForm(migratedForm);
          setCurrentFormId(parseInt(formId));
        })
        .catch(error => {
          console.error('Failed to load form:', error);
          toast({
            title: "Error",
            description: "Failed to load form. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [toast]);

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

    publishFormMutation.mutate();
  };

  const handleAddField = (fieldType: string, rowId: string, columnIndex: number) => {
    const newField: FormField = {
      id: nanoid(),
      type: fieldType as any,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: `Enter ${fieldType}`,
      required: false,
      rowId,
      columnIndex,
      width: 1,
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

  const handleUpdateRow = (rowId: string, updates: Partial<FormRow>) => {
    setCurrentForm(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId ? { ...row, ...updates } : row
      ),
    }));
  };

  const handleAddRow = () => {
    const newRow: FormRow = {
      id: nanoid(),
      order: currentForm.rows.length,
      columns: 1,
    };

    setCurrentForm(prev => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  const handleRemoveRow = (rowId: string) => {
    setCurrentForm(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== rowId),
      fields: prev.fields.filter(field => field.rowId !== rowId),
    }));
  };

  const handleMoveRow = (rowId: string, direction: 'up' | 'down') => {
    setCurrentForm(prev => {
      const rows = [...prev.rows].sort((a, b) => a.order - b.order);
      const currentIndex = rows.findIndex(row => row.id === rowId);
      
      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === rows.length - 1)
      ) {
        return prev;
      }
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Swap orders
      const currentRow = rows[currentIndex];
      const targetRow = rows[targetIndex];
      
      const updatedRows = prev.rows.map(row => {
        if (row.id === currentRow.id) {
          return { ...row, order: targetRow.order };
        }
        if (row.id === targetRow.id) {
          return { ...row, order: currentRow.order };
        }
        return row;
      });
      
      return {
        ...prev,
        rows: updatedRows,
      };
    });
  };

  const handleExportPDF = () => {
    try {
      exportFormAsPDF({
        title: currentForm.title,
        description: currentForm.description,
        fields: currentForm.fields,
        rows: currentForm.rows,
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
          
          {/* Form Information Section - Only show when editing existing form */}
          {currentFormId && (
            <div className="flex flex-col items-center justify-center px-4 md:px-6 border-l border-r border-slate-200 dark:border-slate-600 min-w-0">
              <div className="text-center">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <span className="truncate max-w-[150px] md:max-w-[200px]" title={currentForm.title}>
                    {currentForm.title || "Untitled Form"}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentForm.isPublished 
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                  }`}>
                    {currentForm.isPublished ? "Published" : "Draft"}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>ID: {currentFormId}</span>
                  {currentForm.shareId && (
                    <span className="truncate max-w-[80px] md:max-w-[100px]" title={currentForm.shareId}>
                      Share: {currentForm.shareId}
                    </span>
                  )}
                  {loadedFormData?.updatedAt && (
                    <span className="hidden sm:inline">
                      Updated: {new Date(loadedFormData.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              onClick={async () => {
                if (!currentForm.title.trim()) return;
                
                // Save form first if not saved
                if (!currentFormId) {
                  try {
                    const newForm = await createFormMutation.mutateAsync(currentForm);
                    setCurrentFormId(newForm.id);
                    setCurrentForm(prev => ({ ...prev, shareId: newForm.shareId }));
                    // Use the shareId from the server response
                    window.open(`/f/${newForm.shareId}`, '_blank');
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to save form. Please try again.",
                      variant: "destructive",
                    });
                  }
                } else {
                  // Update existing form first
                  try {
                    const updatedForm = await updateFormMutation.mutateAsync(currentForm);
                    setCurrentForm(prev => ({ ...prev, shareId: updatedForm.shareId }));
                    window.open(`/f/${updatedForm.shareId}`, '_blank');
                  } catch (error) {
                    toast({
                      title: "Error", 
                      description: "Failed to update form. Please try again.",
                      variant: "destructive",
                    });
                  }
                }
              }} 
              variant="outline" 
              size="sm" 
              className="rounded-sm"
              disabled={!currentForm.title.trim() || createFormMutation.isPending || updateFormMutation.isPending}
            >
              <Eye className="mr-2" size={16} />
              {createFormMutation.isPending || updateFormMutation.isPending ? "Saving..." : "Live Preview"}
            </Button>
            <Button 
              onClick={async () => {
                if (!currentForm.title.trim()) return;
                
                const updatedForm = { 
                  ...currentForm, 
                  isPublished: !currentForm.isPublished 
                };
                
                if (currentFormId) {
                  await updateFormMutation.mutateAsync(updatedForm);
                } else {
                  const newForm = await createFormMutation.mutateAsync(updatedForm);
                  setCurrentFormId(newForm.id);
                  setCurrentForm(prev => ({ ...prev, shareId: newForm.shareId }));
                }
              }}
              variant={currentForm.isPublished ? "secondary" : "default"}
              size="sm" 
              className="rounded-sm"
              disabled={!currentForm.title.trim() || createFormMutation.isPending || updateFormMutation.isPending}
            >
              <Share className="mr-2" size={16} />
              {currentForm.isPublished ? "Unpublish" : "Publish & Share"}
            </Button>
            <Button onClick={() => setLocation("/forms")} variant="outline" size="sm" className="rounded-sm">
              <Plus className="mr-2" size={16} />
              New Form
            </Button>
            {user && <UserProfileMenu user={user} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Mobile/Tablet Field Palette - Top */}
        <div className="lg:hidden">
          <FieldPalette 
            onAddField={(fieldType) => {
              // Add to first row, first column by default
              const firstRow = currentForm.rows[0];
              if (firstRow) {
                handleAddField(fieldType, firstRow.id, 0);
              }
            }}
            currentForm={currentForm}
            onUpdateForm={(updates) => setCurrentForm(prev => ({ ...prev, ...updates }))}
          />
        </div>

        {/* Desktop Field Palette - Sidebar */}
        <div className="hidden lg:block">
          <FieldPalette 
            onAddField={(fieldType) => {
              // Add to first row, first column by default
              const firstRow = currentForm.rows[0];
              if (firstRow) {
                handleAddField(fieldType, firstRow.id, 0);
              }
            }}
            currentForm={currentForm}
            onUpdateForm={(updates) => setCurrentForm(prev => ({ ...prev, ...updates }))}
          />
        </div>

        {/* Form Builder */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
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
                
                <RowBasedCanvas
                  fields={currentForm.fields}
                  rows={currentForm.rows}
                  onUpdateField={handleUpdateField}
                  onRemoveField={handleRemoveField}
                  onAddField={handleAddField}
                  onUpdateRow={handleUpdateRow}
                  onAddRow={handleAddRow}
                  onRemoveRow={handleRemoveRow}
                  onMoveRow={handleMoveRow}
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
                  (() => {
                    // Sort rows by order
                    const sortedRows = [...currentForm.rows].sort((a, b) => a.order - b.order);
                    
                    // Group fields by row
                    const fieldsByRow = currentForm.fields.reduce((acc, field) => {
                      if (!acc[field.rowId]) acc[field.rowId] = [];
                      acc[field.rowId].push(field);
                      return acc;
                    }, {} as Record<string, FormField[]>);
                    
                    // Sort fields within each row by columnIndex
                    Object.keys(fieldsByRow).forEach(rowId => {
                      fieldsByRow[rowId].sort((a, b) => a.columnIndex - b.columnIndex);
                    });
                    
                    return sortedRows.map((row) => {
                      const rowFields = fieldsByRow[row.id] || [];
                      
                      return (
                        <div key={row.id} className="space-y-4">
                          <div className={`grid gap-4 grid-cols-${row.columns}`}>
                            {Array.from({ length: row.columns }, (_, columnIndex) => {
                              const columnsFields = rowFields.filter(field => field.columnIndex === columnIndex);
                              
                              return (
                                <div key={columnIndex} className="space-y-4">
                                  {columnsFields.map((field) => (
                                    <div key={field.id} className="space-y-2">
                                      <Label className="text-sm font-medium">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                      </Label>
                                      {renderPreviewField(field)}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()
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
