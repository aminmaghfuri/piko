import React from 'react';

export type HudTone =
  | 'amber'
  | 'blue'
  | 'purple'
  | 'emerald'
  | 'pink'
  | 'gold'
  | 'piko'
  | 'shop'
  | 'sound';

export interface HudStatBoxProps {
  tone?: HudTone;
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  round?: boolean;
}

const TONE_CLASSES: Record<HudTone, string> = {
  amber: 'bg-white/95 border-[3px] border-amber-500 text-slate-800 shadow-[0_3px_0_#d97706]',
  blue: 'bg-white/95 border-[3px] border-sky-600 text-slate-800 shadow-[0_3px_0_#0369a1]',
  purple: 'bg-white/95 border-[3px] border-violet-500 text-slate-800 shadow-[0_3px_0_#6d28d9]',
  emerald: 'bg-white/95 border-[3px] border-emerald-500 text-slate-800 shadow-[0_3px_0_#059669]',
  pink: 'bg-white/95 border-[3px] border-pink-500 text-pink-950 shadow-[0_3px_0_#be185d]',
  gold: 'bg-gradient-to-b from-yellow-300 to-amber-500 border-[3px] border-white text-amber-950 shadow-[0_3px_0_#b45309]',
  piko: 'bg-gradient-to-b from-sky-400 to-sky-600 border-[3px] border-white text-white shadow-[0_3px_0_#0369a1]',
  shop: 'bg-gradient-to-b from-pink-400 to-pink-600 border-[3px] border-white text-white shadow-[0_3px_0_#9d174d]',
  sound: 'bg-white/95 border-[3px] border-emerald-500 text-slate-800 shadow-[0_3px_0_#059669]',
};

export const HudStatBox: React.FC<HudStatBoxProps> = ({
  tone = 'amber',
  onClick,
  title,
  children,
  className = '',
  round = false,
}) => {
  const baseClass = `font-display font-bold tabular-nums flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-transform duration-150 ${
    round
      ? 'rounded-full w-9 h-9 md:w-10 md:h-10 justify-center p-0 text-base'
      : 'rounded-2xl px-2.5 py-1 md:px-3 md:py-1.5 text-xs md:text-[13.5px]'
  } ${TONE_CLASSES[tone]} ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`${baseClass} pointer-events-auto cursor-pointer active:translate-y-[2px] focus-visible:outline-2 focus-visible:outline-white`}
      >
        {children}
      </button>
    );
  }

  return (
    <div title={title} className={baseClass}>
      {children}
    </div>
  );
};
