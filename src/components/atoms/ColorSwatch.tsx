import React from 'react';

export interface ColorSwatchProps {
  color: string;
  active: boolean;
  onSelect: (color: string) => void;
  label?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  active,
  onSelect,
  label,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(color)}
      aria-label={label || `Pilih warna ${color}`}
      aria-pressed={active}
      style={{ backgroundColor: color }}
      className={`w-7 h-7 rounded-full border-2 border-white cursor-pointer transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        active
          ? 'ring-[3px] ring-indigo-600 scale-110'
          : 'ring-2 ring-slate-300 hover:scale-105'
      }`}
    />
  );
};
