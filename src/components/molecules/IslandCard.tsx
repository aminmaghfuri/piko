import React from 'react';
import { IslandTheme } from '../../types/game';

export interface IslandCardProps {
  theme: IslandTheme;
  unlocked: boolean;
  completed: boolean;
  current: boolean;
  onSelect: () => void;
}

export const IslandCard: React.FC<IslandCardProps> = ({
  theme,
  unlocked,
  completed,
  current,
  onSelect,
}) => {
  const statusLabel = completed
    ? '✅ Selesai'
    : current
      ? '🚩 Aktif'
      : unlocked
        ? '🔓 Terbuka'
        : '🔒 Terkunci';

  const cardStyle = !unlocked
    ? 'bg-slate-100 border-slate-300 opacity-65 cursor-not-allowed'
    : current
      ? 'bg-yellow-50 border-yellow-500 shadow-[0_4px_0_#ca8a04] cursor-pointer'
      : completed
        ? 'bg-emerald-50 border-emerald-500 shadow-[0_4px_0_#059669] cursor-pointer'
        : 'bg-white border-slate-300 hover:border-sky-400 cursor-pointer';

  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onSelect}
      className={`rounded-2xl border-[3px] p-3 flex flex-col items-center gap-1.5 text-center transition-all duration-150 ${cardStyle}`}
    >
      <span className="text-3xl leading-none" aria-hidden="true">
        {unlocked ? theme.icon : '🔒'}
      </span>
      <span className="font-display font-bold text-sm text-slate-900 leading-tight">
        Pulau {theme.id}: {theme.name}
      </span>
      <span className="text-xs text-slate-600 leading-snug">{theme.description}</span>
      <span className="text-xs font-display font-bold text-slate-800 mt-auto pt-1">
        {statusLabel}
      </span>
    </button>
  );
};
