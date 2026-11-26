import React from 'react';
import { CHARACTER_PRESETS, OUTFIT_COLORS } from '../../design/tokens';
import { CharacterPresetId } from '../../types/game';
import { ColorSwatch } from '../atoms/ColorSwatch';

export interface CharacterPresetPickerProps {
  selectedCharacter: CharacterPresetId;
  onSelectCharacter: (id: CharacterPresetId) => void;
  selectedColor?: string;
  onSelectColor?: (color: string) => void;
  showColorBar?: boolean;
}

export const CharacterPresetPicker: React.FC<CharacterPresetPickerProps> = ({
  selectedCharacter,
  onSelectCharacter,
  selectedColor,
  onSelectColor,
  showColorBar = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CHARACTER_PRESETS.map((preset) => {
          const active = selectedCharacter === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectCharacter(preset.id)}
              aria-pressed={active}
              className={`rounded-2xl border-[3px] px-2 py-2.5 font-display font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 ${
                active
                  ? 'bg-pink-50 border-pink-500 text-pink-900 shadow-[0_3px_0_#db2777]'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
              }`}
            >
              <span
                className="text-2xl leading-none inline-flex items-center justify-center h-7"
                aria-hidden="true"
              >
                {preset.id === 'peci' ? (
                  <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
                    {/* Ears */}
                    <circle cx="8" cy="22" r="3" fill="#f3be8d" />
                    <circle cx="28" cy="22" r="3" fill="#f3be8d" />
                    {/* Face */}
                    <circle cx="18" cy="22" r="9.5" fill="#fbd3a8" stroke="#e0a973" strokeWidth="1" />
                    {/* Side hair */}
                    <path d="M8.5 19c0-2 1.2-4 2.5-4.5v5.5H8.5v-1z" fill="#3b2314" />
                    <path d="M27.5 19c0-2-1.2-4-2.5-4.5v5.5h2.5v-1z" fill="#3b2314" />
                    {/* Black Indonesian Peci */}
                    <path
                      d="M9 14.5C9 10.5 10.2 5.5 11.5 5h13c1.3.5 2.5 5.5 2.5 9.5 0 1.2-4 2-9 2s-9-.8-9-2z"
                      fill="#1e293b"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <path d="M11.5 7.5c3.5.7 9.5.7 13 0" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Eyes & Smile */}
                    <circle cx="14.5" cy="21.5" r="1.4" fill="#1e293b" />
                    <circle cx="21.5" cy="21.5" r="1.4" fill="#1e293b" />
                    <circle cx="12.3" cy="23.8" r="1.3" fill="#fda4af" opacity="0.7" />
                    <circle cx="23.7" cy="23.8" r="1.3" fill="#fda4af" opacity="0.7" />
                    <path d="M15 25.2c1 1.2 5 1.2 6 0" stroke="#9a3412" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ) : (
                  preset.avatar
                )}
              </span>
              <span className="whitespace-nowrap">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {showColorBar && onSelectColor && (
        <div className="flex items-center gap-2.5 flex-wrap bg-pink-50 border border-pink-200 px-3 py-2.5 rounded-2xl">
          <span className="text-xs font-display font-bold text-pink-900">
            🎨 Warna Baju / Hijab:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {OUTFIT_COLORS.map((hex) => (
              <ColorSwatch
                key={hex}
                color={hex}
                active={selectedColor === hex}
                onSelect={onSelectColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
