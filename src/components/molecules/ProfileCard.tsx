import React from 'react';
import { ChildProfile } from '../../types/game';
import { AvatarGlyph } from '../atoms/AvatarGlyph';

export interface ProfileCardProps {
  profile: ChildProfile;
  active: boolean;
  onSelect: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  active,
  onSelect,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`rounded-2xl border-[3px] p-2.5 flex flex-col items-center gap-1 text-center cursor-pointer transition-all duration-150 ${
        active
          ? 'bg-emerald-50 border-emerald-500 shadow-[0_4px_0_#059669]'
          : 'bg-white border-slate-300 hover:border-slate-400'
      } ${className}`}
    >
      <div className="pt-1">
        <AvatarGlyph avatar={profile.avatar} size="md" colorDot={profile.color} />
      </div>
      <div className="font-display font-bold text-sm text-slate-900 truncate max-w-full">
        {profile.name}
      </div>
      <div className="text-[11.5px] text-slate-600 tabular-nums">
        Kls {profile.grade} · Pulau {profile.currentIsland}/6
      </div>
      <div className="text-xs font-bold text-amber-700 tabular-nums">
        ⭐ {profile.score} Poin
      </div>
    </button>
  );
};
