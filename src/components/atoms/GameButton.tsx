import React from 'react';

export type GameButtonVariant =
  | 'green'
  | 'orange'
  | 'indigo'
  | 'pink'
  | 'gold'
  | 'sky'
  | 'gray'
  | 'danger'
  | 'subtle';

export type GameButtonSize = 'sm' | 'md' | 'lg';

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<GameButtonVariant, string> = {
  green: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_#047857]',
  orange: 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_0_#b45309]',
  indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_0_#3730a3]',
  pink: 'bg-pink-600 hover:bg-pink-700 text-white shadow-[0_4px_0_#9d174d]',
  gold: 'bg-gradient-to-b from-yellow-300 to-amber-500 text-amber-950 border-2 border-white shadow-[0_4px_0_#b45309]',
  sky: 'bg-sky-600 hover:bg-sky-700 text-white shadow-[0_4px_0_#0369a1]',
  gray: 'bg-slate-400 hover:bg-slate-500 text-white shadow-[0_4px_0_#64748b]',
  danger: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 shadow-none',
  subtle: 'bg-sky-100 hover:bg-sky-200 text-sky-800 shadow-none',
};

const SIZE_CLASSES: Record<GameButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-2xl',
  lg: 'px-5 py-3 text-[15.5px] rounded-2xl',
};

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'green',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`font-display font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer select-none transition-transform duration-150 active:translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
