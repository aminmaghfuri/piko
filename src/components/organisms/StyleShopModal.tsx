import React, { useState } from 'react';
import { SHOP_ITEMS } from '../../design/tokens';
import { CharacterPresetId, ChildProfile, ShopItem } from '../../types/game';
import { CharacterPresetPicker } from '../molecules/CharacterPresetPicker';
import { ModalShell } from '../molecules/ModalShell';
import { ShopItemCard } from '../molecules/ShopItemCard';

export interface StyleShopModalProps {
  open: boolean;
  initialTab?: 'character' | 'accessories';
  profile: ChildProfile;
  onClose: () => void;
  onSelectCharacter: (chr: CharacterPresetId) => void;
  onSelectColor: (color: string) => void;
  onShopAction: (item: ShopItem) => void;
}

export const StyleShopModal: React.FC<StyleShopModalProps> = ({
  open,
  initialTab = 'character',
  profile,
  onClose,
  onSelectCharacter,
  onSelectColor,
  onShopAction,
}) => {
  const [tab, setTab] = useState<'character' | 'accessories'>(initialTab);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="🎒 Ganti Karakter & Toko Gaya"
      theme="white-pink"
      maxWidthClass="max-w-[560px]"
      zIndexClass="z-35"
    >
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setTab('character')}
          className={`flex-1 py-2 px-3 rounded-xl border-2 font-display font-bold text-xs sm:text-sm cursor-pointer transition-colors ${
            tab === 'character'
              ? 'bg-pink-600 border-pink-600 text-white'
              : 'bg-slate-50 border-slate-300 text-slate-700'
          }`}
        >
          👤 Karakter &amp; Warna
        </button>
        <button
          type="button"
          onClick={() => setTab('accessories')}
          className={`flex-1 py-2 px-3 rounded-xl border-2 font-display font-bold text-xs sm:text-sm cursor-pointer transition-colors ${
            tab === 'accessories'
              ? 'bg-pink-600 border-pink-600 text-white'
              : 'bg-slate-50 border-slate-300 text-slate-700'
          }`}
        >
          👑 Toko Aksesoris
        </button>
      </div>

      {tab === 'character' ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 m-0">
            Pilih model karakter 3D &amp; warna baju atau hijab:
          </p>
          <CharacterPresetPicker
            selectedCharacter={profile.character}
            onSelectCharacter={onSelectCharacter}
            selectedColor={profile.color}
            onSelectColor={onSelectColor}
            showColorBar
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-700 m-0">
            Poin kamu: <b className="text-pink-600 tabular-nums">⭐ {profile.score} Poin</b>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SHOP_ITEMS.map((item) => {
              const owned = profile.ownedItems.includes(item.id);
              const equipped =
                (item.type === 'hat' && profile.hat === item.id) ||
                (item.type === 'cape' && profile.cape) ||
                (item.type === 'turbo' && profile.turbo);
              return (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  owned={owned}
                  equipped={equipped}
                  onAction={() => onShopAction(item)}
                />
              );
            })}
          </div>
        </div>
      )}
    </ModalShell>
  );
};
