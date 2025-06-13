import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@shared/schema";
import { Smartphone, Monitor } from "lucide-react";
import { useState } from "react";

interface FormPreviewProps {
  form: {
    title: string;
    description: string;
    fields: FormField[];
    themeColor: string;
  };
}

export default function FormPreview({ form }: FormPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const renderPreviewField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {field.label}
            </Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              className="text-xs rounded-sm"
              disabled
            />
          </div>
        );
      case "textarea":
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {field.label}
            </Label>
            <Textarea
              placeholder={field.placeholder}
              className="text-xs resize-none rounded-sm"
              rows={2}
              disabled
            />
          </div>
        );
      case "select":
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {field.label}
            </Label>
            <Select disabled>
              <SelectTrigger className="text-xs rounded-sm">
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
          <div key={field.id} className="space-y-1">
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {field.label}
            </Label>
            <div className="space-y-1">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input type="radio" disabled className="w-3 h-3" />
                  <span className="text-xs dark:text-slate-400">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "checkbox":
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {field.label}
            </Label>
            <div className="space-y-1">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox disabled className="w-3 h-3" />
                  <span className="text-xs dark:text-slate-400">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Preview</h3>
        <div className="flex space-x-1">
          <Button
            variant={viewMode === "mobile" ? "default" : "ghost"}
            size="sm"
            className="h-6 w-6 p-0 rounded-sm"
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone size={14} />
          </Button>
          <Button
            variant={viewMode === "desktop" ? "default" : "ghost"}
            size="sm"
            className="h-6 w-6 p-0 rounded-sm"
            onClick={() => setViewMode("desktop")}
          >
            <Monitor size={14} />
          </Button>
        </div>
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-800 rounded-sm p-4 max-h-96 overflow-y-auto">
        <Card className="shadow-sm rounded-sm">
          <CardHeader 
            className="p-4 text-white rounded-t-sm"
            style={{ backgroundColor: form.themeColor }}
          >
            <CardTitle className="text-sm font-bold">
              {form.title || "Untitled Form"}
            </CardTitle>
            {form.description && (
              <p className="text-xs opacity-90 mt-1">{form.description}</p>
            )}
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {form.fields.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                No fields added yet
              </p>
            ) : (
              form.fields.map(renderPreviewField)
            )}
            
            {form.fields.length > 0 && (
              <Button 
                className="w-full text-xs font-medium py-2 rounded-sm"
                style={{ backgroundColor: form.themeColor }}
                disabled
              >
                Submit
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
