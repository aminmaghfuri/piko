import React, { useEffect } from 'react';

export type ModalTheme = 'amber' | 'white-blue' | 'white-indigo' | 'white-pink' | 'blue' | 'indigo';

export interface ModalShellProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  theme?: ModalTheme;
  maxWidthClass?: string;
  zIndexClass?: string;
  centered?: boolean;
  children: React.ReactNode;
}

const THEME_CLASSES: Record<ModalTheme, string> = {
  amber: 'bg-amber-50 border-[5px] border-amber-500 shadow-[0_10px_0_#d97706,0_22px_45px_rgba(0,0,0,0.4)]',
  blue: 'bg-amber-50 border-[5px] border-sky-600 shadow-[0_10px_0_#0369a1,0_22px_45px_rgba(0,0,0,0.4)]',
  indigo: 'bg-amber-50 border-[5px] border-indigo-500 shadow-[0_10px_0_#4338ca,0_22px_45px_rgba(0,0,0,0.4)]',
  'white-blue': 'bg-white border-[5px] border-sky-600 shadow-[0_10px_0_#0369a1,0_22px_45px_rgba(0,0,0,0.4)]',
  'white-indigo': 'bg-white border-[5px] border-indigo-500 shadow-[0_10px_0_#4338ca,0_22px_45px_rgba(0,0,0,0.4)]',
  'white-pink': 'bg-white border-[5px] border-pink-500 shadow-[0_10px_0_#be185d,0_22px_45px_rgba(0,0,0,0.4)]',
};

export const ModalShell: React.FC<ModalShellProps> = ({
  open,
  onClose,
  title,
  subtitle,
  theme = 'amber',
  maxWidthClass = 'max-w-[620px]',
  zIndexClass = 'z-30',
  centered = false,
  children,
}) => {
  useEffect(() => {
    if (!open || !onClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 bg-slate-950/65 flex items-center justify-center p-3 touch-auto ${zIndexClass}`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-3xl p-5 touch-pan-y ${
          centered ? 'text-center' : 'text-left'
        } ${THEME_CLASSES[theme]}`}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-3 border-b-2 border-slate-200 pb-2.5 mb-3">
            <div>
              {title && (
                <h2 className="font-display text-lg md:text-xl font-bold text-slate-900 m-0">
                  {title}
                </h2>
              )}
              {subtitle && (
                <div className="text-xs md:text-sm font-semibold text-sky-700 mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 border-2 border-red-300 font-display font-bold flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
