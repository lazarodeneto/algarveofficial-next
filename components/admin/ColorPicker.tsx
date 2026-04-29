import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/Button";
import { Pipette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const parseRgba = (color: string): RGBA => {
  // Try to parse rgba format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  
  // Try to parse hex format
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
      a: hexMatch[4] !== undefined ? parseInt(hexMatch[4], 16) / 255 : 1,
    };
  }
  
  // Default gold color
  return { r: 196, g: 155, b: 55, a: 1 };
};

const rgbaToString = (rgba: RGBA): string => {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
};

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [rgba, setRgba] = useState<RGBA>(() => parseRgba(value));
  const [isOpen, setIsOpen] = useState(false);
  const currentValue = useMemo(() => parseRgba(value), [value]);
  const activeRgba = isOpen ? rgba : currentValue;

  const handleSliderChange = (channel: keyof RGBA, newValue: number[]) => {
    const updatedRgba = { ...activeRgba, [channel]: newValue[0] };
    setRgba(updatedRgba);
    onChange(rgbaToString(updatedRgba));
  };

  const handleInputChange = (channel: keyof RGBA, inputValue: string) => {
    let numValue = parseFloat(inputValue);
    
    if (isNaN(numValue)) numValue = 0;
    
    if (channel === 'a') {
      numValue = Math.min(1, Math.max(0, numValue));
    } else {
      numValue = Math.min(255, Math.max(0, Math.round(numValue)));
    }
    
    const updatedRgba = { ...activeRgba, [channel]: numValue };
    setRgba(updatedRgba);
    onChange(rgbaToString(updatedRgba));
  };

  const colorPreview = rgbaToString(activeRgba);
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setRgba(currentValue);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-3 items-center">
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-10 h-10 p-0 border-border relative overflow-hidden"
              style={{ backgroundColor: colorPreview }}
            >
              <span className="sr-only">Pick color</span>
              {/* Checkered background for transparency */}
              <div 
                className="absolute inset-0 -z-10"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
                    linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
                    linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
                  `,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg border border-border relative overflow-hidden"
                  style={{ backgroundColor: colorPreview }}
                >
                  <div 
                    className="absolute inset-0 -z-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
                        linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
                        linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
                      `,
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Color Preview</p>
                  <p className="text-xs text-muted-foreground font-mono">{colorPreview}</p>
                </div>
                <Pipette className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Red Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-red-400">Red</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={activeRgba.r}
                    onChange={(e) => handleInputChange('r', e.target.value)}
                    className="w-16 h-7 text-xs bg-background"
                  />
                </div>
                <Slider
                  value={[activeRgba.r]}
                  min={0}
                  max={255}
                  step={1}
                  onValueChange={(val) => handleSliderChange('r', val)}
                  className="[&_[role=slider]]:bg-red-500 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-red-500"
                />
              </div>

              {/* Green Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-green-400">Green</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={activeRgba.g}
                    onChange={(e) => handleInputChange('g', e.target.value)}
                    className="w-16 h-7 text-xs bg-background"
                  />
                </div>
                <Slider
                  value={[activeRgba.g]}
                  min={0}
                  max={255}
                  step={1}
                  onValueChange={(val) => handleSliderChange('g', val)}
                  className="[&_[role=slider]]:bg-green-500 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-green-500"
                />
              </div>

              {/* Blue Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-blue-400">Blue</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={activeRgba.b}
                    onChange={(e) => handleInputChange('b', e.target.value)}
                    className="w-16 h-7 text-xs bg-background"
                  />
                </div>
                <Slider
                  value={[activeRgba.b]}
                  min={0}
                  max={255}
                  step={1}
                  onValueChange={(val) => handleSliderChange('b', val)}
                  className="[&_[role=slider]]:bg-blue-500 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-blue-500"
                />
              </div>

              {/* Alpha Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Alpha</Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={activeRgba.a}
                    onChange={(e) => handleInputChange('a', e.target.value)}
                    className="w-16 h-7 text-xs bg-background"
                  />
                </div>
                <Slider
                  value={[activeRgba.a]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(val) => handleSliderChange('a', val)}
                  className="[&_[role=slider]]:bg-white [&_.relative]:bg-gradient-to-r [&_.relative]:from-transparent [&_.relative]:to-foreground"
                />
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-border">
                <Label className="text-xs text-muted-foreground mb-2 block">Presets</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { color: 'rgba(196, 155, 55, 1)', name: 'Gold' },
                    { color: 'rgba(255, 255, 255, 1)', name: 'White' },
                    { color: 'rgba(0, 0, 0, 1)', name: 'Black' },
                    { color: 'rgba(59, 130, 246, 1)', name: 'Blue' },
                    { color: 'rgba(34, 197, 94, 1)', name: 'Green' },
                    { color: 'rgba(239, 68, 68, 1)', name: 'Red' },
                    { color: 'rgba(168, 85, 247, 1)', name: 'Purple' },
                    { color: 'rgba(249, 115, 22, 1)', name: 'Orange' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        const parsed = parseRgba(preset.color);
                        setRgba(parsed);
                        onChange(preset.color);
                      }}
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background flex-1 font-mono text-sm"
          placeholder="rgba(196, 155, 55, 1)"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use RGBA format: rgba(red, green, blue, alpha)
      </p>
    </div>
  );
}
