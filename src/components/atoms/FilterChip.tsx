import React from 'react';

export interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({ active, onClick, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-xl border-2 text-xs font-display font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 ${
        active
          ? 'bg-amber-100 border-amber-500 text-amber-900'
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
};
