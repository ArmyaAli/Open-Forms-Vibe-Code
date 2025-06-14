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
  ChevronLeft, 
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
  ToggleLeft,
  User,
  Building,
  Briefcase,
  DollarSign,
  CreditCard,
  Percent,
  Image,
  Video,
  Music,
  FileText,
  Link,
  Share,
  Lock,
  Eye,
  Globe,
  Tag,
  Search,
  Plus,
  Palette,
  Edit,
  Heart,
  ThumbsUp,
  Target,
  Package,
  Truck,
  Gift,
  GraduationCap,
  Award,
  School,
  Calculator,
  Grid,
  List
} from "lucide-react";

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void;
  currentForm?: {
    themeColor: string;
    fields: Array<{ type?: string }>;
  };
  onUpdateForm: (updates: { themeColor: string }) => void;
  isPaletteCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
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
  // Personal Information
  {
    type: "name",
    label: "Full Name",
    description: "First and last name",
    icon: Type,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "company",
    label: "Company",
    description: "Organization name",
    icon: Type,
    color: "bg-gray-100 text-gray-600",
  },
  {
    type: "job",
    label: "Job Title",
    description: "Position or role",
    icon: Type,
    color: "bg-brown-100 text-brown-600",
  },
  // Financial
  {
    type: "currency",
    label: "Currency",
    description: "Money amount field",
    icon: Hash,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "payment",
    label: "Payment Method",
    description: "Credit card details",
    icon: CheckSquare,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "percentage",
    label: "Percentage",
    description: "Percentage input",
    icon: Hash,
    color: "bg-orange-100 text-orange-600",
  },
  // Media & Upload
  {
    type: "image",
    label: "Image Upload",
    description: "Image file upload",
    icon: Upload,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "video",
    label: "Video Upload",
    description: "Video file upload",
    icon: Upload,
    color: "bg-red-100 text-red-600",
  },
  {
    type: "audio",
    label: "Audio Upload",
    description: "Audio file upload",
    icon: Upload,
    color: "bg-purple-100 text-purple-600",
  },
  {
    type: "document",
    label: "Document",
    description: "Document upload",
    icon: Upload,
    color: "bg-blue-100 text-blue-600",
  },
  // Web & Links
  {
    type: "url",
    label: "Website URL",
    description: "Website address",
    icon: Type,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "social",
    label: "Social Media",
    description: "Social media link",
    icon: Type,
    color: "bg-pink-100 text-pink-600",
  },
  // Security
  {
    type: "password",
    label: "Password",
    description: "Secure password input",
    icon: Type,
    color: "bg-red-100 text-red-600",
  },
  {
    type: "captcha",
    label: "Captcha",
    description: "Security verification",
    icon: CheckSquare,
    color: "bg-orange-100 text-orange-600",
  },
  // Location
  {
    type: "country",
    label: "Country",
    description: "Country selection",
    icon: ChevronDown,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "city",
    label: "City",
    description: "City selection",
    icon: ChevronDown,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "zipcode",
    label: "ZIP Code",
    description: "Postal code input",
    icon: MapPin,
    color: "bg-purple-100 text-purple-600",
  },
  // Advanced Selection
  {
    type: "multiselect",
    label: "Multi-Select",
    description: "Multiple option selection",
    icon: CheckSquare,
    color: "bg-teal-100 text-teal-600",
  },
  {
    type: "autocomplete",
    label: "Autocomplete",
    description: "Type-ahead search",
    icon: Type,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "tags",
    label: "Tags",
    description: "Tag input field",
    icon: Type,
    color: "bg-yellow-100 text-yellow-600",
  },
  // Interactive Elements
  {
    type: "stepper",
    label: "Number Stepper",
    description: "Increment/decrement",
    icon: Hash,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    type: "color",
    label: "Color Picker",
    description: "Color selection",
    icon: Circle,
    color: "bg-rainbow-100 text-rainbow-600",
  },
  {
    type: "signature",
    label: "Signature",
    description: "Digital signature pad",
    icon: Type,
    color: "bg-gray-100 text-gray-600",
  },
  // Feedback & Rating
  {
    type: "emoji",
    label: "Emoji Rating",
    description: "Emoji feedback",
    icon: Star,
    color: "bg-pink-100 text-pink-600",
  },
  {
    type: "thumbs",
    label: "Thumbs Rating",
    description: "Like/dislike",
    icon: Star,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "nps",
    label: "NPS Score",
    description: "Net Promoter Score",
    icon: Hash,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "scale",
    label: "Scale Rating",
    description: "1-10 scale",
    icon: Sliders,
    color: "bg-purple-100 text-purple-600",
  },
  // Date & Time Variants
  {
    type: "datetime",
    label: "Date & Time",
    description: "Combined date/time",
    icon: Calendar,
    color: "bg-purple-100 text-purple-600",
  },
  {
    type: "daterange",
    label: "Date Range",
    description: "Start and end dates",
    icon: Calendar,
    color: "bg-pink-100 text-pink-600",
  },
  {
    type: "month",
    label: "Month",
    description: "Month selection",
    icon: Calendar,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "year",
    label: "Year",
    description: "Year selection",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
  },
  // E-commerce
  {
    type: "product",
    label: "Product",
    description: "Product selection",
    icon: CheckSquare,
    color: "bg-orange-100 text-orange-600",
  },
  {
    type: "shipping",
    label: "Shipping",
    description: "Shipping address",
    icon: MapPin,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "coupon",
    label: "Coupon Code",
    description: "Discount code",
    icon: Type,
    color: "bg-yellow-100 text-yellow-600",
  },
  // Education
  {
    type: "quiz",
    label: "Quiz Question",
    description: "Multiple choice quiz",
    icon: Circle,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "skill",
    label: "Skill Level",
    description: "Proficiency rating",
    icon: Star,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    type: "grade",
    label: "Grade",
    description: "Educational level",
    icon: ChevronDown,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "language",
    label: "Language",
    description: "Language selection",
    icon: ChevronDown,
    color: "bg-blue-100 text-blue-600",
  },
  // Numbers & Math
  {
    type: "decimal",
    label: "Decimal",
    description: "Decimal number",
    icon: Hash,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    type: "integer",
    label: "Integer",
    description: "Whole number",
    icon: Hash,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "calculator",
    label: "Calculator",
    description: "Built-in calculator",
    icon: Hash,
    color: "bg-gray-100 text-gray-600",
  },
  // Special Fields
  {
    type: "matrix",
    label: "Matrix Question",
    description: "Grid of questions",
    icon: CheckSquare,
    color: "bg-purple-100 text-purple-600",
  },
  {
    type: "ranking",
    label: "Ranking",
    description: "Drag to rank items",
    icon: AlignLeft,
    color: "bg-orange-100 text-orange-600",
  },
  {
    type: "slider",
    label: "Slider",
    description: "Value slider",
    icon: Sliders,
    color: "bg-pink-100 text-pink-600",
  },
  {
    type: "progress",
    label: "Progress Bar",
    description: "Progress indicator",
    icon: Sliders,
    color: "bg-green-100 text-green-600",
  },
];

export default function FieldPalette({ onAddField, currentForm, onUpdateForm, onToggleCollapse }: FieldPaletteProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <aside className="w-full lg:w-80 bg-white dark:bg-background border-r lg:border-r border-b lg:border-b-0 border-slate-200 dark:border-slate-600 h-auto lg:h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Form Elements</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isExpanded ? "Collapse elements" : "Expand elements"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCollapse?.(true)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Collapse panel"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
        
      {/* Scrollable Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:space-y-0">
            {fieldTypes.map((field) => {
            const IconComponent = field.icon;
            
            return (
              <div
                key={field.type}
                draggable={true}
                className="border border-slate-200 dark:border-slate-600 rounded-sm p-3 transition-all duration-200 bg-slate-50 hover:bg-slate-100 dark:bg-muted dark:hover:bg-accent cursor-move hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                onClick={(e) => {
                  e.preventDefault();
                  onAddField(field.type);
                }}
                onDragStart={(e) => {
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
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {field.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {field.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          
          {/* Form Settings Section */}
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
        </div>
      )}
    </aside>
  );
}
