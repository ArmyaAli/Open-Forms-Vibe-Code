import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@shared/schema";
import { Smartphone, Monitor, ChevronRight } from "lucide-react";
import { useState } from "react";

interface FormPreviewProps {
  form: {
    title: string;
    description: string;
    fields: FormField[];
    rows: Array<{ id: string; order?: number; columns?: number }>;
    themeColor: string;
  };
  isPreviewCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export default function FormPreview({ form, isPreviewCollapsed, onToggleCollapse }: FormPreviewProps) {
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
    <div className="hidden lg:block w-80 bg-white dark:bg-card border-l border-slate-200 dark:border-slate-600 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Preview</h3>
        <div className="flex items-center space-x-1">
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
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCollapse(true)}
              className="h-6 w-6 p-0 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Collapse Preview"
            >
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-slate-100 dark:bg-muted rounded-sm p-4 max-h-96 overflow-y-auto">
        <Card className={`shadow-sm rounded-sm border border-slate-200 dark:border-slate-600 transition-all duration-200 ${
          viewMode === "mobile" ? "max-w-xs mx-auto" : "w-full"
        }`}>
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
              (() => {
                // If no rows exist, render fields in a simple list (backward compatibility)
                if (!form.rows || form.rows.length === 0) {
                  return form.fields.map(renderPreviewField);
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
                  <div key={row.id} className="space-y-2">
                    <div 
                      className="grid gap-2"
                      style={{ 
                        gridTemplateColumns: `repeat(${row.columns || 1}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: row.columns || 1 }, (_, columnIndex) => {
                        const columnFields = fieldsByRow[row.id]?.[columnIndex] || [];
                        
                        return (
                          <div key={columnIndex} className="space-y-2">
                            {columnFields.map(renderPreviewField)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
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
