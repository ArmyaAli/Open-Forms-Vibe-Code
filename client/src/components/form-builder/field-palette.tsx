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

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Form Elements</h2>
        
        <div className="space-y-3">
          {fieldTypes.map((field) => {
            const IconComponent = field.icon;
            return (
              <div
                key={field.type}
                draggable
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-sm p-3 cursor-move transition-all"
                onClick={() => onAddField(field.type)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", field.type);
                  e.dataTransfer.effectAllowed = "copy";
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
                <div className="w-6 h-6 bg-primary rounded-sm cursor-pointer border-2 border-primary" />
                <div className="w-6 h-6 bg-green-500 rounded-sm cursor-pointer border-2 border-transparent hover:border-green-600" />
                <div className="w-6 h-6 bg-purple-500 rounded-sm cursor-pointer border-2 border-transparent hover:border-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
