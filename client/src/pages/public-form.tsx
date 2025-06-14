import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Loader2, Star, Upload, CalendarIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormField, FormRow } from "@shared/schema";
import { format } from "date-fns";

export default function PublicForm() {
  const { shareId } = useParams<{ shareId: string }>();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: form, isLoading, error } = useQuery<Form>({
    queryKey: ["/api/forms/share/" + shareId],
    enabled: !!shareId,
  });

  const submitFormMutation = useMutation({
    mutationFn: async (responses: Record<string, any>) => {
      if (!form) throw new Error("Form not found");
      await apiRequest(`/api/forms/${form.id}/responses`, {
        method: "POST",
        body: JSON.stringify({ responses }),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      // Invalidate responses cache to refresh the responses page
      queryClient.invalidateQueries({ queryKey: ["/api/responses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/responses/stats"] });
      toast({
        title: "Response submitted successfully",
        description: "Thank you for your submission!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    // Validate required fields
    const requiredFields = form.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.id]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.map(f => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    submitFormMutation.mutate(formData);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case "phone":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="tel"
              placeholder={field.placeholder || "Enter phone number"}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              rows={4}
            />
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !formData[field.id] ? "text-muted-foreground" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData[field.id] 
                    ? format(new Date(formData[field.id]), "PPP")
                    : field.placeholder || "Pick a date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData[field.id] ? new Date(formData[field.id]) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      handleInputChange(field.id, format(date, "yyyy-MM-dd"));
                    } else {
                      handleInputChange(field.id, "");
                    }
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "time":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <input
              id={field.id}
              type="time"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={formData[field.id] || ""}
              onValueChange={(value) => handleInputChange(field.id, value)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={formData[field.id] || ""}
              onValueChange={(value) => handleInputChange(field.id, value)}
              required={field.required}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={(formData[field.id] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = formData[field.id] || [];
                      if (checked) {
                        handleInputChange(field.id, [...currentValues, option]);
                      } else {
                        handleInputChange(field.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "rating":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleInputChange(field.id, rating)}
                  className={`p-1 rounded transition-colors ${
                    (formData[field.id] || 0) >= rating
                      ? "text-yellow-400"
                      : "text-slate-300 hover:text-yellow-300"
                  }`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          </div>
        );

      case "file":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Click to upload or drag and drop
              </p>
              <Input
                id={field.id}
                type="file"
                className="hidden"
                onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
                required={field.required}
              />
              <Label
                htmlFor={field.id}
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                Choose File
              </Label>
            </div>
          </div>
        );

      case "address":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-3">
              <Input
                placeholder="Street Address"
                value={formData[`${field.id}-street`] || ""}
                onChange={(e) => handleInputChange(`${field.id}-street`, e.target.value)}
                required={field.required}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={formData[`${field.id}-city`] || ""}
                  onChange={(e) => handleInputChange(`${field.id}-city`, e.target.value)}
                  required={field.required}
                />
                <Input
                  placeholder="State"
                  value={formData[`${field.id}-state`] || ""}
                  onChange={(e) => handleInputChange(`${field.id}-state`, e.target.value)}
                  required={field.required}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="ZIP Code"
                  value={formData[`${field.id}-zip`] || ""}
                  onChange={(e) => handleInputChange(`${field.id}-zip`, e.target.value)}
                  required={field.required}
                />
                <Input
                  placeholder="Country"
                  value={formData[`${field.id}-country`] || ""}
                  onChange={(e) => handleInputChange(`${field.id}-country`, e.target.value)}
                  required={field.required}
                />
              </div>
            </div>
          </div>
        );

      case "range":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData[field.id] || 50]}
                onValueChange={(value) => handleInputChange(field.id, value[0])}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0</span>
                <span className="font-medium">{formData[field.id] || 50}</span>
                <span>100</span>
              </div>
            </div>
          </div>
        );

      case "toggle":
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={field.id}
                checked={formData[field.id] || false}
                onCheckedChange={(checked) => handleInputChange(field.id, checked)}
              />
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFormContent = () => {
    // If no rows exist, render fields in a simple list (backward compatibility)
    if (!form?.rows || form.rows.length === 0) {
      return form?.fields?.map(renderField);
    }

    // Sort rows by order
    const sortedRows = [...form.rows].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Group fields by row and column
    const fieldsByRow: Record<string, Record<number, FormField[]>> = {};
    form.fields.forEach(field => {
      if (field.rowId && field.columnIndex !== undefined) {
        if (!fieldsByRow[field.rowId]) {
          fieldsByRow[field.rowId] = {};
        }
        if (!fieldsByRow[field.rowId][field.columnIndex]) {
          fieldsByRow[field.rowId][field.columnIndex] = [];
        }
        fieldsByRow[field.rowId][field.columnIndex].push(field);
      }
    });

    return sortedRows.map((row) => (
      <div key={row.id} className="space-y-4">
        <div 
          className={`grid gap-4 ${
            (row.columns || 1) > 2 ? 'overflow-x-auto grid-flow-col auto-cols-fr lg:grid-flow-row lg:auto-cols-auto' : ''
          }`}
          style={{ 
            gridTemplateColumns: (row.columns || 1) <= 2 
              ? `repeat(${Math.min(row.columns || 1, 2)}, minmax(0, 1fr))`
              : window.innerWidth >= 1024 
                ? `repeat(${row.columns || 1}, minmax(200px, 1fr))`
                : `repeat(${row.columns || 1}, minmax(280px, 320px))`,
            maxWidth: '100%'
          }}
        >
          {Array.from({ length: row.columns || 1 }, (_, columnIndex) => {
            const columnFields = fieldsByRow[row.id]?.[columnIndex] || [];
            
            return (
              <div key={columnIndex} className="space-y-4">
                {columnFields.map(field => renderField(field))}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600 dark:text-slate-400">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 flex items-center justify-center">
        <Card className="max-w-md mx-4 border border-slate-200 dark:border-slate-600">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Form Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400">
              The form you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 flex items-center justify-center">
        <Card className="max-w-md mx-4 border border-slate-200 dark:border-slate-600">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Thank You!</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your response has been submitted successfully. We appreciate your time!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 lg:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
          <div 
            className="px-6 lg:px-8 py-6 text-white"
            style={{ backgroundColor: form.themeColor }}
          >
            <h1 className="text-xl lg:text-2xl font-bold">{form.title}</h1>
            {form.description && (
              <p className="mt-2 opacity-90 text-sm lg:text-base">{form.description}</p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
            {renderFormContent()}
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={submitFormMutation.isPending}
              style={{ backgroundColor: form.themeColor }}
            >
              {submitFormMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
          
          <div className="bg-slate-50 px-8 py-4 text-center">
            <p className="text-xs text-slate-500">
              Powered by <span className="font-medium text-primary">OpenForms</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}