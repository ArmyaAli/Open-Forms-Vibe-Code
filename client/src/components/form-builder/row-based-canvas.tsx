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
  Calendar,
  Clock,
  Star,
  Upload,
  MapPin,
  Sliders,
  ToggleLeft,
  Columns,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { FormField, FormRow } from "@shared/schema";
import { nanoid } from "nanoid";

interface RowBasedCanvasProps {
  fields: FormField[];
  rows: FormRow[];
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  onRemoveField: (fieldId: string) => void;
  onAddField: (fieldType: string, rowId: string, columnIndex: number) => void;
  onUpdateRow: (rowId: string, updates: Partial<FormRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onMoveRow: (rowId: string, direction: 'up' | 'down') => void;
  themeColor: string;
}

export default function RowBasedCanvas({ 
  fields, 
  rows,
  onUpdateField, 
  onRemoveField, 
  onAddField,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onMoveRow,
  themeColor
}: RowBasedCanvasProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverRow, setDragOverRow] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  // Sort rows by order
  const sortedRows = [...rows].sort((a, b) => a.order - b.order);

  // Group fields by row
  const fieldsByRow = fields.reduce((acc, field) => {
    if (field.rowId) {
      if (!acc[field.rowId]) acc[field.rowId] = [];
      acc[field.rowId].push(field);
    }
    return acc;
  }, {} as Record<string, FormField[]>);

  // Sort fields within each row by columnIndex
  Object.keys(fieldsByRow).forEach(rowId => {
    fieldsByRow[rowId].sort((a, b) => (a.columnIndex || 0) - (b.columnIndex || 0));
  });

  const handleFieldDragStart = (e: React.DragEvent, field: FormField) => {
    setDraggedField(field.id);
    e.dataTransfer.setData("text/plain", field.id);
    e.dataTransfer.setData("application/x-field-id", field.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragEnd = () => {
    setTimeout(() => {
      setDraggedField(null);
      setDragOverRow(null);
      setDragOverColumn(null);
    }, 50);
  };

  const handleColumnDragOver = (e: React.DragEvent, rowId: string, columnIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fieldType = e.dataTransfer.types.includes("application/x-field-type");
    const fieldId = e.dataTransfer.types.includes("application/x-field-id") || e.dataTransfer.types.includes("text/plain");
    
    if (fieldType || fieldId) {
      e.dataTransfer.dropEffect = fieldId ? "move" : "copy";
      setDragOverRow(rowId);
      setDragOverColumn(columnIndex);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverRow(null);
      setDragOverColumn(null);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, rowId: string, columnIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fieldType = e.dataTransfer.getData("application/x-field-type");
    const fieldId = e.dataTransfer.getData("application/x-field-id") || e.dataTransfer.getData("text/plain");
    
    if (fieldType && !fieldId) {
      // Adding new field from palette
      onAddField(fieldType, rowId, columnIndex);
    } else if (fieldId) {
      // Moving existing field
      const currentField = fields.find(f => f.id === fieldId);
      if (currentField && (currentField.rowId !== rowId || currentField.columnIndex !== columnIndex)) {
        onUpdateField(fieldId, { rowId, columnIndex });
      }
    }
    
    setDragOverRow(null);
    setDragOverColumn(null);
    setDraggedField(null);
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': case 'email': case 'phone': return '📝';
      case 'textarea': return '📄';
      case 'select': case 'radio': return '📋';
      case 'checkbox': return '☑️';
      case 'number': case 'range': return '🔢';
      case 'date': return <Calendar size={16} />;
      case 'time': return <Clock size={16} />;
      case 'rating': return <Star size={16} />;
      case 'file': return <Upload size={16} />;
      case 'address': return <MapPin size={16} />;
      case 'toggle': return <ToggleLeft size={16} />;
      default: return '📝';
    }
  };

  const renderField = (field: FormField) => {
    const isEditing = editingField === field.id;
    const isDragging = draggedField === field.id;

    return (
      <div
        key={field.id}
        className={`group relative bg-white dark:bg-card border border-slate-200 dark:border-slate-600 rounded p-3 transition-all ${
          isDragging ? 'opacity-50' : 'hover:border-blue-300 dark:hover:border-blue-600'
        }`}
        draggable
        onDragStart={(e) => handleFieldDragStart(e, field)}
        onDragEnd={handleFieldDragEnd}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs">{getFieldIcon(field.type)}</span>
            {isEditing ? (
              <Input
                value={field.label}
                onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                className="text-sm font-medium h-6 py-0"
                autoFocus
              />
            ) : (
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {field.label || field.type}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setEditingField(field.id)}
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={() => onRemoveField(field.id)}
            >
              <Trash2 size={12} />
            </Button>
            <div className="cursor-move">
              <GripVertical size={12} className="text-slate-400" />
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex space-x-3">
            <label className="flex items-center space-x-1">
              <Checkbox
                checked={field.required}
                onCheckedChange={(checked) => onUpdateField(field.id, { required: !!checked })}
              />
              <span>Required</span>
            </label>
            <label className="flex items-center space-x-1">
              <Checkbox
                checked={field.placeholder !== undefined}
                onCheckedChange={(checked) => 
                  onUpdateField(field.id, { placeholder: checked ? '' : undefined })
                }
              />
              <span>Placeholder</span>
            </label>
          </div>
          {field.placeholder !== undefined && (
            <Input
              value={field.placeholder || ''}
              onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
              className="text-xs h-6"
            />
          )}
        </div>
      </div>
    );
  };

  const renderFieldPreview = (field: FormField) => {
    const commonProps = {
      className: "w-full text-sm",
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'text': case 'email': case 'phone':
        return <Input {...commonProps} type={field.type} />;
      case 'textarea':
        return <Textarea {...commonProps} rows={3} />;
      case 'select':
        return (
          <Select>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'number': case 'range':
        return <Input {...commonProps} type="number" />;
      case 'date':
        return <Input {...commonProps} type="date" />;
      case 'time':
        return <Input {...commonProps} type="time" />;
      case 'checkbox':
        return (
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Option 1</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Option 2</span>
            </label>
          </div>
        );
      case 'radio':
        return (
          <RadioGroup defaultValue="option1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option1" id="r1" />
              <Label htmlFor="r1" className="text-sm">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option2" id="r2" />
              <Label htmlFor="r2" className="text-sm">Option 2</Label>
            </div>
          </RadioGroup>
        );
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} className="text-yellow-400 fill-current" />
            ))}
          </div>
        );
      case 'file':
        return <Input type="file" className="text-sm" />;
      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="toggle" />
            <span className="text-sm">Toggle option</span>
          </div>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  const getColumnWidth = (columnCount: number, columnIndex: number, field?: FormField) => {
    const fieldWidth = field?.width || 1;
    const baseWidth = 100 / columnCount;
    const actualWidth = Math.min(fieldWidth * baseWidth, 100);
    return `${actualWidth}%`;
  };

  return (
    <div className="relative min-h-[200px] p-6">
      {sortedRows.length === 0 ? (
        /* Add Row Button - Centered when no rows exist */
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={onAddRow}
            variant="outline"
            className="border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Row
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRows.map((row, rowIndex) => {
            const rowFields = fieldsByRow[row.id] || [];
            
            return (
              <Card key={row.id} className="border border-slate-200 dark:border-slate-600">
                <CardContent className="p-4">
                  {/* Row Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-600">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        Row {rowIndex + 1}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Columns size={14} />
                        <select
                          value={row.columns}
                          onChange={(e) => onUpdateRow(row.id, { columns: parseInt(e.target.value) })}
                          className="text-xs border border-slate-200 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                        >
                          <option value={1}>1 Column</option>
                          <option value={2}>2 Columns</option>
                          <option value={3}>3 Columns</option>
                          <option value={4}>4 Columns</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onMoveRow(row.id, 'up')}
                        disabled={rowIndex === 0}
                      >
                        <ArrowUp size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onMoveRow(row.id, 'down')}
                        disabled={rowIndex === sortedRows.length - 1}
                      >
                        <ArrowDown size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => onRemoveRow(row.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Row Columns */}
                  <div className={`grid gap-3 grid-cols-${row.columns}`}>
                    {Array.from({ length: row.columns }, (_, columnIndex) => {
                      const columnFields = rowFields.filter(f => f.columnIndex === columnIndex);
                      const isDropTarget = dragOverRow === row.id && dragOverColumn === columnIndex;
                      
                      return (
                        <div
                          key={`${row.id}-${columnIndex}`}
                          className={`min-h-[100px] border-2 border-dashed rounded-lg p-3 transition-colors ${
                            isDropTarget 
                              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onDragOver={(e) => handleColumnDragOver(e, row.id, columnIndex)}
                          onDragLeave={handleColumnDragLeave}
                          onDrop={(e) => handleColumnDrop(e, row.id, columnIndex)}
                        >
                          {columnFields.length === 0 ? (
                            <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">
                              Drop a field here or click to add
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {columnFields.map(renderField)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Row Button - Below existing rows */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onAddRow}
              variant="outline"
              className="border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Plus size={16} className="mr-2" />
              Add Row
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}