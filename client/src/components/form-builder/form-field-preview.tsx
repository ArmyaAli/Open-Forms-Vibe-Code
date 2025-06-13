import { useState } from "react";
import { FormField } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { X, Settings, Plus, Minus } from "lucide-react";

interface FormFieldPreviewProps {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onRemove: (fieldId: string) => void;
}

export default function FormFieldPreview({ field, onUpdate, onRemove }: FormFieldPreviewProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleLabelChange = (label: string) => {
    onUpdate(field.id, { label });
  };

  const handlePlaceholderChange = (placeholder: string) => {
    onUpdate(field.id, { placeholder });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate(field.id, { required });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate(field.id, { options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options || []).length + 1}`];
    onUpdate(field.id, { options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(field.options || [])];
    newOptions.splice(index, 1);
    onUpdate(field.id, { options: newOptions });
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            disabled
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled
            rows={3}
          />
        );
      case "select":
        return (
          <Select disabled>
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
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input type="radio" disabled className="w-4 h-4" />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
            onClick={() => onRemove(field.id)}
          >
            <X size={14} />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            {showSettings ? (
              <Input
                value={field.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="font-medium"
              />
            ) : (
              field.label
            )}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          
          {showSettings ? (
            <div className="space-y-3 border-t pt-3 mt-3">
              <div className="space-y-2">
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) => handlePlaceholderChange(e.target.value)}
                  placeholder="Enter placeholder text"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Required field</Label>
                <Switch
                  checked={field.required}
                  onCheckedChange={handleRequiredChange}
                />
              </div>

              {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Options</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddOption}
                      className="h-6 w-6 p-0"
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="text-xs"
                        />
                        {field.options && field.options.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Minus size={12} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderFieldInput()
          )}
        </div>
      </CardContent>
    </Card>
  );
}
