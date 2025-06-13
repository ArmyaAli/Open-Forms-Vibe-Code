import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Mail, 
  AlignLeft, 
  ChevronDown,
  ChevronUp, 
  Circle, 
  CheckSquare, 
  Hash,
  Phone,
  Calendar,
  Star,
  Upload,
  Clock,
  MapPin,
  Sliders,
  ToggleLeft
} from "lucide-react";

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void;
  currentForm?: {
    themeColor: string;
    fields: Array<{ type?: string }>;
  };
  onUpdateForm: (updates: { themeColor: string }) => void;
}

const fieldTypes = [
  {
    type: "text",
    label: "Text Input",
    description: "Single line text field",
    icon: Type,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "email",
    label: "Email",
    description: "Email address field",
    icon: Mail,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multi-line text field",
    icon: AlignLeft,
    color: "bg-purple-100 text-purple-600",
  },
  {
    type: "select",
    label: "Dropdown",
    description: "Selection from options",
    icon: ChevronDown,
    color: "bg-orange-100 text-orange-600",
  },
  {
    type: "radio",
    label: "Radio Button",
    description: "Single choice selection",
    icon: Circle,
    color: "bg-red-100 text-red-600",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "Multiple choice selection",
    icon: CheckSquare,
    color: "bg-teal-100 text-teal-600",
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input field",
    icon: Hash,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    type: "phone",
    label: "Phone Number",
    description: "Phone number with validation",
    icon: Phone,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    type: "date",
    label: "Date Picker",
    description: "Date selection field",
    icon: Calendar,
    color: "bg-pink-100 text-pink-600",
  },
  {
    type: "time",
    label: "Time Picker",
    description: "Time selection field",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    type: "rating",
    label: "Star Rating",
    description: "5-star rating system",
    icon: Star,
    color: "bg-amber-100 text-amber-600",
  },
  {
    type: "file",
    label: "File Upload",
    description: "File attachment field",
    icon: Upload,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    type: "address",
    label: "Address",
    description: "Full address input",
    icon: MapPin,
    color: "bg-violet-100 text-violet-600",
  },
  {
    type: "range",
    label: "Range Slider",
    description: "Numeric range selector",
    icon: Sliders,
    color: "bg-rose-100 text-rose-600",
  },
  {
    type: "toggle",
    label: "Toggle Switch",
    description: "On/off toggle control",
    icon: ToggleLeft,
    color: "bg-lime-100 text-lime-600",
  },
];

export default function FieldPalette({ onAddField, currentForm, onUpdateForm }: FieldPaletteProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Get list of field types already added to the form
  const existingFieldTypes = currentForm?.fields?.map(field => field.type).filter(Boolean) || [];
  
  return (
    <aside className="w-full lg:w-80 bg-white dark:bg-background border-r lg:border-r border-b lg:border-b-0 border-slate-200 dark:border-slate-600 h-auto lg:h-full overflow-y-auto">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Form Elements</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:space-y-0">
            {fieldTypes.map((field) => {
            const IconComponent = field.icon;
            const isAlreadyAdded = existingFieldTypes.includes(field.type);
            
            return (
              <div
                key={field.type}
                draggable={!isAlreadyAdded}
                className={`border border-slate-200 dark:border-slate-600 rounded-sm p-3 transition-all duration-200 ${
                  isAlreadyAdded 
                    ? "bg-slate-100 dark:bg-slate-800 opacity-50 cursor-not-allowed" 
                    : "bg-slate-50 hover:bg-slate-100 dark:bg-muted dark:hover:bg-accent cursor-move hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                }`}
                onClick={(e) => {
                  if (isAlreadyAdded) return;
                  e.preventDefault();
                  onAddField(field.type);
                }}
                onDragStart={(e) => {
                  if (isAlreadyAdded) {
                    e.preventDefault();
                    return;
                  }
                  console.log('Drag start for field type:', field.type);
                  e.dataTransfer.setData("application/x-field-type", field.type);
                  e.dataTransfer.effectAllowed = "copy";
                  
                  // Create a custom drag image with animation
                  const dragElement = e.currentTarget as HTMLElement;
                  const rect = dragElement.getBoundingClientRect();
                  
                  // Add drag state styling
                  dragElement.style.transform = "scale(0.98) rotate(1deg)";
                  dragElement.style.opacity = "0.9";
                  
                  // Create ghost element
                  const ghost = dragElement.cloneNode(true) as HTMLElement;
                  ghost.style.position = "absolute";
                  ghost.style.top = "-1000px";
                  ghost.style.transform = "scale(0.9) rotate(1deg)";
                  ghost.style.opacity = "0.9";
                  ghost.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.3)";
                  ghost.style.zIndex = "1000";
                  document.body.appendChild(ghost);
                  
                  e.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);
                  
                  // Clean up after drag
                  setTimeout(() => {
                    document.body.removeChild(ghost);
                  }, 100);
                }}
                onDragEnd={(e) => {
                  const dragElement = e.currentTarget as HTMLElement;
                  dragElement.style.transform = "";
                  dragElement.style.opacity = "";
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${field.color}`}>
                    <IconComponent size={16} />
                  </div>
                  <div>
                    <h3 className={`font-medium ${isAlreadyAdded ? "text-slate-500 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
                      {field.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAlreadyAdded ? "Already added" : field.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {isExpanded && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Form Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-700 dark:text-slate-300">Theme Color</Label>
                <ColorPicker
                  value={currentForm?.themeColor || '#6366F1'}
                  onChange={(color) => onUpdateForm({ themeColor: color })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
