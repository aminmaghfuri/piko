import React from 'react';
import { ShopItem } from '../../types/game';
import { GameButton } from '../atoms/GameButton';

export interface ShopItemCardProps {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  onAction: () => void;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  owned,
  equipped,
  onAction,
}) => {
  const buttonVariant = equipped ? 'green' : owned ? 'sky' : 'orange';
  const buttonLabel = equipped ? '✅ Dipakai' : owned ? 'Pakai' : `Beli ⭐ ${item.cost}`;

  return (
    <div
      className={`rounded-2xl border-[3px] p-3 flex flex-col items-center text-center gap-1.5 transition-colors ${
        equipped
          ? 'bg-emerald-50 border-emerald-500 shadow-[0_4px_0_#059669]'
          : 'bg-white border-slate-300'
      }`}
    >
      <span className="text-3xl leading-none" aria-hidden="true">
        {item.icon}
      </span>
      <div className="font-display font-bold text-sm text-slate-900">{item.name}</div>
      <div className="text-xs text-slate-600 leading-snug mb-1">{item.description}</div>
      <div className="mt-auto w-full">
        <GameButton variant={buttonVariant} size="sm" fullWidth onClick={onAction}>
          {buttonLabel}
        </GameButton>
      </div>
    </div>
  );
};
