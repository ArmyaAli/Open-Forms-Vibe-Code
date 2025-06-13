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
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormField } from "@shared/schema";

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
      await apiRequest("POST", `/api/forms/${form.id}/responses`, { responses });
    },
    onSuccess: () => {
      setSubmitted(true);
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

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={formData[field.id] || ""}
              onValueChange={(value) => handleInputChange(field.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
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
                    checked={formData[field.id]?.includes(option) || false}
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

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Form Not Found</h2>
            <p className="text-slate-600">
              The form you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h2>
            <p className="text-slate-600">
              Your response has been submitted successfully. We appreciate your time!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-0 overflow-hidden">
          <div 
            className="px-8 py-6 text-white"
            style={{ backgroundColor: form.themeColor }}
          >
            <h1 className="text-2xl font-bold">{form.title}</h1>
            {form.description && (
              <p className="mt-2 opacity-90">{form.description}</p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {form.fields.map(renderField)}
            
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
              Powered by <span className="font-medium text-primary">FormCraft</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
