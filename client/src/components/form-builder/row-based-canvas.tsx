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
    
    console.log('🎯 DROP EVENT:', { 
      rowId, 
      columnIndex, 
      fieldType, 
      fieldId, 
      draggedField,
      availableTypes: Array.from(e.dataTransfer.types)
    });
    
    if (fieldType && !fieldId) {
      // Adding new field from palette
      console.log('➕ Adding new field:', fieldType);
      onAddField(fieldType, rowId, columnIndex);
    } else if (fieldId) {
      // Moving existing field
      const currentField = fields.find(f => f.id === fieldId);
      console.log('🔄 Moving field:', fieldId, 'current:', currentField?.rowId, currentField?.columnIndex, 'to:', rowId, columnIndex);
      if (currentField && (currentField.rowId !== rowId || currentField.columnIndex !== columnIndex)) {
        console.log('✅ Updating field position');
        onUpdateField(fieldId, { rowId, columnIndex });
      } else {
        console.log('❌ Field position unchanged or field not found');
      }
    } else {
      console.log('⚠️ No valid drag data found');
    }
    
    setDragOverRow(null);
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
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400">Width</Label>
                <Select 
                  value={field.width?.toString() || "1"} 
                  onValueChange={(value) => onUpdateField(field.id, { width: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Column</SelectItem>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                  </SelectContent>
                </Select>
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
            variant="outline"
            onClick={onAddRow}
            className="flex items-center gap-2 h-10 px-4 text-sm font-medium"
          >
            <Plus size={16} />
            Add Row
          </Button>
        </div>
      ) : (
        /* Rows container */
        <div className="space-y-4">
          {/* Add Row Button at top */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onAddRow}
              className="flex items-center gap-2 h-9 px-3 text-xs font-medium"
            >
              <Plus size={14} />
              Add Row
            </Button>
          </div>

          {/* Rows */}
          {sortedRows.map((row, rowIndex) => (
            <Card key={row.id} className="border-2 border-dashed border-slate-300 dark:border-slate-600">
              <CardContent className="p-4">
                {/* Row Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <Columns className="text-slate-600 dark:text-slate-400" size={16} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Row {rowIndex + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Columns:</Label>
                      <Select 
                        value={row.columns.toString()} 
                        onValueChange={(value) => onUpdateRow(row.id, { columns: parseInt(value) })}
                      >
                        <SelectTrigger className="w-16 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onMoveRow(row.id, 'up')}
                      disabled={rowIndex === 0}
                    >
                      <ArrowUp size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onMoveRow(row.id, 'down')}
                      disabled={rowIndex === sortedRows.length - 1}
                    >
                      <ArrowDown size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => onRemoveRow(row.id)}
                      disabled={sortedRows.length === 1}
                    >
                      <Trash2 className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" size={12} />
                    </Button>
                  </div>
                </div>

                {/* Row Columns */}
                <div 
                  className={`grid gap-4 overflow-x-auto ${
                    row.columns > 3 ? 'grid-flow-col auto-cols-fr' : ''
                  }`}
                  style={{ 
                    gridTemplateColumns: row.columns <= 3 
                      ? `repeat(${row.columns}, minmax(200px, 1fr))`
                      : `repeat(${row.columns}, minmax(250px, 300px))`,
                    maxWidth: '100%'
                  }}
                >
                  {Array.from({ length: row.columns }, (_, columnIndex) => {
                    const columnsFields = fieldsByRow[row.id]?.filter(f => f.columnIndex === columnIndex) || [];
                    
                    return (
                      <div
                        key={columnIndex}
                        className={`min-h-32 p-3 border-2 border-dashed rounded-lg transition-colors ${
                          dragOverRow === row.id && dragOverColumn === columnIndex
                            ? 'border-primary bg-primary/5' 
                            : 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50'
                        }`}
                        onDragOver={(e) => handleColumnDragOver(e, row.id, columnIndex)}
                        onDragLeave={handleColumnDragLeave}
                        onDrop={(e) => handleColumnDrop(e, row.id, columnIndex)}
                      >
                        <div className="text-center mb-3">
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            Column {columnIndex + 1}
                          </span>
                        </div>
                        
                        {columnsFields.map(field => renderField(field))}
                        
                        {columnsFields.length === 0 && (
                          <div className="flex justify-center items-center h-20">
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              Drag fields here
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}