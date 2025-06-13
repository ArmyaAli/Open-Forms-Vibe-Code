import { useState, useEffect, useRef } from "react";
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
  const [dropAnimation, setDropAnimation] = useState(false);
  const [newFieldIds, setNewFieldIds] = useState<Set<string>>(new Set());
  const prevFieldCount = useRef(fields.length);

  useEffect(() => {
    if (fields.length > prevFieldCount.current) {
      const newField = fields[fields.length - 1];
      setNewFieldIds(prev => new Set(prev).add(newField.id));
      
      // Remove the animation class after animation completes
      setTimeout(() => {
        setNewFieldIds(prev => {
          const next = new Set(prev);
          next.delete(newField.id);
          return next;
        });
      }, 500);
    }
    prevFieldCount.current = fields.length;
  }, [fields]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set dragOver to false if we're actually leaving the drop zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setDropAnimation(true);
    
    const fieldType = e.dataTransfer.getData("text/plain");
    if (fieldType) {
      // Add a brief animation delay before adding the field
      setTimeout(() => {
        onAddField(fieldType);
        setDropAnimation(false);
      }, 200);
    } else {
      setDropAnimation(false);
    }
  };

  return (
    <div className="p-6 min-h-80 space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className={`${
            newFieldIds.has(field.id) 
              ? 'field-entrance' 
              : 'animate-in slide-in-from-top-2 fade-in duration-300'
          }`}
          style={{ animationDelay: newFieldIds.has(field.id) ? '0ms' : `${index * 50}ms` }}
        >
          <FormFieldPreview
            field={field}
            onUpdate={onUpdateField}
            onRemove={onRemoveField}
          />
        </div>
      ))}
      
      <div
        className={`relative border-2 border-dashed rounded-sm p-8 text-center transition-all duration-300 ${
          dragOver 
            ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary scale-[1.02] shadow-lg' 
            : dropAnimation
            ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 scale-[1.03] shadow-xl'
            : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-muted-foreground hover:border-primary/50 hover:text-primary hover:scale-[1.01]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Plus 
          className={`mx-auto mb-2 transition-all duration-300 ${
            dragOver ? 'rotate-90 scale-110' : dropAnimation ? 'rotate-180 scale-125' : ''
          }`} 
          size={24} 
        />
        <p className="transition-all duration-300">
          {dragOver 
            ? 'Release to add element' 
            : dropAnimation 
            ? 'Adding element...' 
            : 'Drop form elements here or click to add'
          }
        </p>
        {dragOver && (
          <div className="absolute inset-0 pointer-events-none rounded-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/20 to-transparent animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
}
