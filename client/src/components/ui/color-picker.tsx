import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [hexValue, setHexValue] = useState(value);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };

    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  };

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  // Convert Hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Update HSL values when hex value changes
  useEffect(() => {
    if (hexValue.match(/^#[0-9A-Fa-f]{6}$/)) {
      const [h, s, l] = hexToHsl(hexValue);
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, [hexValue]);

  // Update hex value when HSL changes
  useEffect(() => {
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    const hex = rgbToHex(r, g, b);
    setHexValue(hex);
    onChange(hex);
  }, [hue, saturation, lightness, onChange]);

  // Draw color picker canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient for saturation and lightness
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s = (x / width) * 100;
        const l = ((height - y) / height) * 100;
        const [r, g, b] = hslToRgb(hue, s, l);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  // Draw hue slider
  useEffect(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create hue gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 360; i += 60) {
      const [r, g, b] = hslToRgb(i, 100, 50);
      gradient.addColorStop(i / 360, `rgb(${r}, ${g}, ${b})`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = (x / canvas.width) * 100;
    const newLightness = ((canvas.height - y) / canvas.height) * 100;

    setSaturation(newSaturation);
    setLightness(newLightness);
  };

  const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newHue = (x / canvas.width) * 360;

    setHue(newHue);
  };

  const handleHexChange = (newHex: string) => {
    setHexValue(newHex);
    if (newHex.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(newHex);
    }
  };

  const presetColors = [
    "#6366F1", "#2563eb", "#22c55e", "#a855f7", "#ef4444",
    "#f97316", "#eab308", "#06b6d4", "#ec4899", "#10b981",
    "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6", "#06b6d4"
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
          {/* Main color picker */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={200}
              height={150}
              className="w-full h-32 cursor-crosshair border border-slate-200 rounded"
              onClick={handleCanvasClick}
            />
            {/* Selection indicator */}
            <div
              className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none shadow-sm"
              style={{
                left: `${(saturation / 100) * 200 - 6}px`,
                top: `${((100 - lightness) / 100) * 150 - 6}px`,
              }}
            />
          </div>

          {/* Hue slider */}
          <div className="relative">
            <canvas
              ref={hueCanvasRef}
              width={200}
              height={20}
              className="w-full h-5 cursor-pointer border border-slate-200 rounded"
              onClick={handleHueClick}
            />
            {/* Hue indicator */}
            <div
              className="absolute w-3 h-full border-2 border-white pointer-events-none"
              style={{
                left: `${(hue / 360) * 200 - 6}px`,
                top: 0,
              }}
            />
          </div>

          {/* Hex input */}
          <div className="flex items-center space-x-2">
            <Input
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 font-mono text-sm"
            />
            <div 
              className="w-8 h-8 border border-slate-200 rounded"
              style={{ backgroundColor: hexValue }}
            />
          </div>

          {/* Preset colors */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Preset Colors</p>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 border border-slate-200 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setHexValue(color);
                    onChange(color);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}