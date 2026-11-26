import React from 'react';
import { ChildProfile } from '../../types/game';
import { GameButton } from '../atoms/GameButton';
import { ModalShell } from '../molecules/ModalShell';
import { ProfileCard } from '../molecules/ProfileCard';

export interface TitleScreenModalProps {
  open: boolean;
  childrenProfiles: ChildProfile[];
  activeChild: ChildProfile;
  onSelectProfile: (id: string) => void;
  onStartPlay: () => void;
  onOpenMap: () => void;
  onExitChildMode: () => void;
}

export const TitleScreenModal: React.FC<TitleScreenModalProps> = ({
  open,
  childrenProfiles,
  activeChild,
  onSelectProfile,
  onStartPlay,
  onOpenMap,
  onExitChildMode,
}) => {
  return (
    <ModalShell open={open} theme="amber" maxWidthClass="max-w-[630px]" centered>
      <div className="flex flex-col items-center mb-2">
        <svg
          viewBox="0 0 360 54"
          className="w-full max-w-[340px] h-auto mb-1"
          aria-label="Petualangan 6 Pulau Pintar"
        >
          <defs>
            <linearGradient id="islandTitleGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="26" r="16" fill="#fde047" stroke="#f59e0b" strokeWidth="3" />
          <path d="M13 31 Q24 20 35 31 Z" fill="#10b981" />
          <rect x="22" y="16" width="3.5" height="11" rx="1.5" fill="#78350f" />
          <path d="M23.5 16 Q16 12 13 17 Q18 17 23.5 16 Z" fill="#16a34a" />
          <path d="M24 16 Q31 12 34 17 Q29 17 24 16 Z" fill="#16a34a" />
          <text
            x="48"
            y="34"
            fontFamily="Fredoka, sans-serif"
            fontWeight="700"
            fontSize="24"
            fill="url(#islandTitleGrad)"
          >
            Petualangan Bocil
          </text>
        </svg>
        <p className="text-sm text-slate-700 leading-relaxed max-w-md m-0">
          Pilih profil kamu, lalu taklukkan <b>Pulau 1 hingga Pulau 6</b>! Karakter dapat dikustomisasi di dalam game.
        </p>
      </div>

      <div className="text-center font-display font-bold text-amber-900 text-sm mb-1.5">
        Pilih Profil Kamu:
      </div>
      <div className="flex flex-wrap justify-center gap-2.5 mb-4">
        {childrenProfiles.map((child) => (
          <ProfileCard
            key={child.id}
            profile={child}
            active={child.id === activeChild.id}
            onSelect={() => onSelectProfile(child.id)}
            className="w-[148px] sm:w-[168px]"
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2.5 flex-wrap mt-2">
        <GameButton variant="green" size="lg" onClick={onStartPlay}>
          Mulai Petualangan! 🚀
        </GameButton>
        <GameButton variant="orange" size="md" onClick={onOpenMap}>
          🗺️ Peta Pulau
        </GameButton>
        <GameButton variant="gray" size="md" onClick={onExitChildMode}>
          🚪 Keluar Mode Anak
        </GameButton>
      </div>

      <div className="bg-amber-100 border-2 border-amber-300 rounded-xl px-3.5 py-2.5 mt-3.5 text-xs text-amber-950 text-left">
        <b>Kontrol:</b> Keyboard <b>WASD / Panah</b> jalan, <b>Spasi</b> lompat, <b>Seret Mouse / Q E</b> putar kamera. Di HP gunakan <b>Joystick kiri</b> &amp; seret layar kanan.
      </div>
    </ModalShell>
  );
};
