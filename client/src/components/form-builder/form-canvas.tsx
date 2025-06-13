import { useState } from "react";
import { FormField } from "@shared/schema";
import FormFieldPreview from "./form-field-preview";
import { Plus } from "lucide-react";

interface FormCanvasProps {
  fields: FormField[];
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  onRemoveField: (fieldId: string) => void;
  onAddField: (fieldType: string) => void;
}

export default function FormCanvas({ 
  fields, 
  onUpdateField, 
  onRemoveField, 
  onAddField 
}: FormCanvasProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const fieldType = e.dataTransfer.getData("text/plain");
    if (fieldType) {
      onAddField(fieldType);
    }
  };

  return (
    <div className="p-6 min-h-80 space-y-4">
      {fields.map((field) => (
        <FormFieldPreview
          key={field.id}
          field={field}
          onUpdate={onUpdateField}
          onRemove={onRemoveField}
        />
      ))}
      
      <div
        className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary' 
            : 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-primary/50 hover:text-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Plus className="mx-auto mb-2" size={24} />
        <p>Drop form elements here or click to add</p>
      </div>
    </div>
  );
}
