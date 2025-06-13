import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Edit, 
  GripVertical, 
  Plus,
  Settings,
  Columns,
  Calendar,
  Clock,
  Star,
  Upload,
  MapPin,
  Sliders,
  ToggleLeft
} from "lucide-react";
import { FormField } from "@shared/schema";
import { createDragDropHandlers } from "@/lib/drag-drop";

interface MultiColumnCanvasProps {
  fields: FormField[];
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  onRemoveField: (fieldId: string) => void;
  onAddField: (fieldType: string, column?: number) => void;
  onReorderFields: (dragIndex: number, hoverIndex: number, fromColumn: number, toColumn: number) => void;
  columnCount: number;
  onColumnCountChange: (count: number) => void;
  themeColor: string;
}

export default function MultiColumnCanvas({ 
  fields, 
  onUpdateField, 
  onRemoveField, 
  onAddField,
  onReorderFields,
  columnCount,
  onColumnCountChange,
  themeColor
}: MultiColumnCanvasProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  const dragDropHandlers = createDragDropHandlers();

  // Group fields by column
  const fieldsByColumn = fields.reduce((acc, field) => {
    const column = field.column || 0;
    if (!acc[column]) acc[column] = [];
    acc[column].push(field);
    return acc;
  }, {} as Record<number, FormField[]>);

  // Sort fields within each column by order
  Object.keys(fieldsByColumn).forEach(column => {
    fieldsByColumn[parseInt(column)].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  const handleFieldDragStart = (e: React.DragEvent, field: FormField) => {
    setDraggedField(field.id);
    e.dataTransfer.setData("text/plain", field.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
    setDragOverColumn(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnIndex);
  };

  const handleColumnDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleColumnDrop = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData("text/plain");
    const fieldType = e.dataTransfer.getData("application/x-field-type");
    
    if (fieldType) {
      // Adding new field from palette
      onAddField(fieldType, columnIndex);
    } else if (fieldId && draggedField) {
      // Moving existing field
      const draggedFieldData = fields.find(f => f.id === fieldId);
      if (draggedFieldData) {
        const fromColumn = draggedFieldData.column || 0;
        const toColumn = columnIndex;
        const newOrder = (fieldsByColumn[toColumn] || []).length;
        
        onUpdateField(fieldId, { column: toColumn, order: newOrder });
      }
    }
    
    setDragOverColumn(null);
    setDraggedField(null);
  };

  const getFieldIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      text: <Edit size={16} />,
      email: <Edit size={16} />,
      number: <Edit size={16} />,
      textarea: <Edit size={16} />,
      select: <Settings size={16} />,
      radio: <Settings size={16} />,
      checkbox: <Checkbox className="w-4 h-4" />,
      phone: <Edit size={16} />,
      date: <Calendar size={16} />,
      time: <Clock size={16} />,
      rating: <Star size={16} />,
      file: <Upload size={16} />,
      address: <MapPin size={16} />,
      range: <Sliders size={16} />,
      toggle: <ToggleLeft size={16} />
    };
    return iconMap[type] || <Edit size={16} />;
  };

  const renderField = (field: FormField) => {
    const isEditing = editingField === field.id;
    
    return (
      <Card 
        key={field.id}
        className={`mb-3 transition-all duration-200 ${
          draggedField === field.id ? 'opacity-50 scale-95' : ''
        } ${isEditing ? 'ring-2 ring-primary' : ''} border border-slate-200 dark:border-slate-600`}
        draggable
        onDragStart={(e) => handleFieldDragStart(e, field)}
        onDragEnd={handleFieldDragEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <GripVertical className="cursor-grab text-slate-400" size={16} />
              {getFieldIcon(field.type)}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {field.label || `${field.type} field`}
              </span>
              {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setEditingField(isEditing ? null : field.id)}
              >
                <Edit className="text-slate-500 dark:text-slate-400" size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                onClick={() => onRemoveField(field.id)}
              >
                <Trash2 className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" size={12} />
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-600">
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400">Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                  className="mt-1"
                  placeholder="Field label"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400">Placeholder</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
                  className="mt-1"
                  placeholder="Placeholder text"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdateField(field.id, { required: !!checked })}
                />
                <Label htmlFor={`required-${field.id}`} className="text-xs text-slate-600 dark:text-slate-400">
                  Required field
                </Label>
              </div>
              {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Options (one per line)</Label>
                  <Textarea
                    value={(field.options || []).join('\n')}
                    onChange={(e) => onUpdateField(field.id, { 
                      options: e.target.value.split('\n').filter(opt => opt.trim()) 
                    })}
                    className="mt-1"
                    placeholder="Option 1\nOption 2\nOption 3"
                    rows={3}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {renderFieldPreview(field)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFieldPreview = (field: FormField) => {
    const baseClasses = "w-full text-sm";
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea 
            placeholder={field.placeholder || field.label}
            className={baseClasses}
            disabled
            rows={3}
          />
        );
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger className={baseClasses}>
              <SelectValue placeholder={field.placeholder || field.label} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || ['Option 1', 'Option 2']).map((option, idx) => (
                <SelectItem key={idx} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <RadioGroup disabled className="space-y-2">
            {(field.options || ['Option 1', 'Option 2']).map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                <Label htmlFor={`${field.id}-${idx}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(field.options || ['Option 1', 'Option 2']).map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${idx}`} disabled />
                <Label htmlFor={`${field.id}-${idx}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <Input 
            type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
            placeholder={field.placeholder || field.label}
            className={baseClasses}
            disabled
          />
        );
    }
  };

  const getColumnWidth = (columnCount: number) => {
    switch (columnCount) {
      case 1: return "w-full";
      case 2: return "w-1/2";
      case 3: return "w-1/3";
      case 4: return "w-1/4";
      default: return "w-full";
    }
  };

  return (
    <div className="space-y-6">
      {/* Column Count Selector */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Columns className="text-slate-600 dark:text-slate-400" size={20} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Form Layout</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(count => (
            <Button
              key={count}
              variant={columnCount === count ? "default" : "outline"}
              size="sm"
              onClick={() => onColumnCountChange(count)}
              className="w-8 h-8 p-0"
            >
              {count}
            </Button>
          ))}
        </div>
      </div>

      {/* Multi-Column Layout */}
      <div className={`grid gap-6 ${columnCount === 1 ? 'grid-cols-1' : columnCount === 2 ? 'grid-cols-2' : columnCount === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
        {Array.from({ length: columnCount }, (_, columnIndex) => (
          <div
            key={columnIndex}
            className={`min-h-96 p-4 border-2 border-dashed rounded-lg transition-colors ${
              dragOverColumn === columnIndex 
                ? 'border-primary bg-primary/5' 
                : 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50'
            }`}
            onDragOver={(e) => handleColumnDragOver(e, columnIndex)}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, columnIndex)}
          >
            <div className="text-center mb-4">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Column {columnIndex + 1}
              </h4>
              {fieldsByColumn[columnIndex]?.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Drag fields here
                </p>
              )}
            </div>
            
            {fieldsByColumn[columnIndex]?.map(field => renderField(field))}
            
            {fieldsByColumn[columnIndex]?.length === 0 && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => onAddField('text', columnIndex)}
                >
                  <Plus className="mr-2" size={16} />
                  Add Field
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}