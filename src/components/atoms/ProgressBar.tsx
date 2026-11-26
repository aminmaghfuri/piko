import React from 'react';

export interface ProgressBarProps {
  percent: number;
  heightClass?: string;
  trackClass?: string;
  fillClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  heightClass = 'h-2.5',
  trackClass = 'bg-sky-100',
  fillClass = 'bg-emerald-500',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={`w-full rounded-full overflow-hidden ${heightClass} ${trackClass}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${fillClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
