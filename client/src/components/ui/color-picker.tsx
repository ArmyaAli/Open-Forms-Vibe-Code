import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleColorSelect = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (newValue.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(newValue);
    }
  };

  const presetColors = [
    "#6366F1", "#2563eb", "#22c55e", "#a855f7", "#ef4444",
    "#f97316", "#eab308", "#06b6d4", "#ec4899", "#10b981",
    "#8b5cf6", "#f59e0b", "#64748b", "#3b82f6", "#84cc16",
    "#f43f5e", "#14b8a6", "#f97316", "#8b5cf6", "#06b6d4"
  ];

  const gradientColors = [
    "#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00",
    "#00ff80", "#00ffff", "#0080ff", "#0000ff", "#8000ff",
    "#ff00ff", "#ff0080", "#000000", "#404040", "#808080",
    "#c0c0c0", "#ffffff", "#800000", "#808000", "#008000"
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-8 h-8 p-0 border-2">
          <div 
            className="w-4 h-4 rounded-sm border border-slate-300"
            style={{ backgroundColor: value }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          {/* Color input */}
          <div className="flex items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 font-mono text-sm"
            />
            <div 
              className="w-8 h-8 border border-slate-200 rounded"
              style={{ backgroundColor: inputValue }}
            />
          </div>

          {/* Preset colors */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Popular Colors</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {presetColors.slice(0, 15).map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 border border-slate-200 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>

          {/* More colors */}
          <div>
            <p className="text-xs text-slate-500 mb-2">More Colors</p>
            <div className="grid grid-cols-5 gap-2">
              {gradientColors.map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 border border-slate-200 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>

          {/* HTML5 Color Input */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Custom Color</p>
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}