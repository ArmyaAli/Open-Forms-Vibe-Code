import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Type, 
  Mail, 
  AlignLeft, 
  ChevronDown, 
  Circle, 
  CheckSquare, 
  Hash 
} from "lucide-react";

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void;
  currentForm?: {
    themeColor: string;
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
];

export default function FieldPalette({ onAddField, currentForm, onUpdateForm }: FieldPaletteProps) {
  return (
    <aside className="w-80 bg-white dark:bg-background border-r border-slate-200 dark:border-slate-600 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Form Elements</h2>
        
        <div className="space-y-3">
          {fieldTypes.map((field) => {
            const IconComponent = field.icon;
            return (
              <div
                key={field.type}
                draggable
                className="bg-slate-50 hover:bg-slate-100 dark:bg-muted dark:hover:bg-accent border border-slate-200 dark:border-slate-600 rounded-sm p-3 cursor-move transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                onClick={() => onAddField(field.type)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", field.type);
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
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{field.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{field.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Form Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-slate-700 dark:text-slate-300">Theme Color</Label>
              <div className="flex space-x-1">
                <div 
                  className={`w-6 h-6 bg-indigo-500 rounded-full cursor-pointer border-2 transition-all ${
                    currentForm?.themeColor === '#6366F1' ? 'border-indigo-700 scale-110' : 'border-transparent hover:border-indigo-600'
                  }`}
                  onClick={() => onUpdateForm({ themeColor: '#6366F1' })}
                />
                <div 
                  className={`w-6 h-6 bg-blue-600 rounded-full cursor-pointer border-2 transition-all ${
                    currentForm?.themeColor === '#2563eb' ? 'border-blue-800 scale-110' : 'border-transparent hover:border-blue-700'
                  }`}
                  onClick={() => onUpdateForm({ themeColor: '#2563eb' })}
                />
                <div 
                  className={`w-6 h-6 bg-green-500 rounded-full cursor-pointer border-2 transition-all ${
                    currentForm?.themeColor === '#22c55e' ? 'border-green-700 scale-110' : 'border-transparent hover:border-green-600'
                  }`}
                  onClick={() => onUpdateForm({ themeColor: '#22c55e' })}
                />
                <div 
                  className={`w-6 h-6 bg-purple-500 rounded-full cursor-pointer border-2 transition-all ${
                    currentForm?.themeColor === '#a855f7' ? 'border-purple-700 scale-110' : 'border-transparent hover:border-purple-600'
                  }`}
                  onClick={() => onUpdateForm({ themeColor: '#a855f7' })}
                />
                <div 
                  className={`w-6 h-6 bg-red-500 rounded-full cursor-pointer border-2 transition-all ${
                    currentForm?.themeColor === '#ef4444' ? 'border-red-700 scale-110' : 'border-transparent hover:border-red-600'
                  }`}
                  onClick={() => onUpdateForm({ themeColor: '#ef4444' })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
