import React, { useEffect, useState } from 'react';
import { ISLAND_THEMES } from '../../design/tokens';
import { ChildProfile } from '../../types/game';
import { GameButton } from '../atoms/GameButton';
import { ModalShell } from '../molecules/ModalShell';
import { ProfileCard } from '../molecules/ProfileCard';

export interface ProfileSwitchModalProps {
  open: boolean;
  childrenProfiles: ChildProfile[];
  activeChildId: string;
  onSelectProfile: (childId: string) => void;
  onExitChildMode: () => void;
  onClose: () => void;
}

export const ProfileSwitchModal: React.FC<ProfileSwitchModalProps> = ({
  open,
  childrenProfiles,
  activeChildId,
  onSelectProfile,
  onExitChildMode,
  onClose,
}) => {
  return (
    <ModalShell open={open} theme="amber" maxWidthClass="max-w-[510px]" centered>
      <h2 className="font-display text-xl font-bold text-slate-900 mb-3">
        👥 Ganti Profil Pemain
      </h2>
      <div className="flex flex-wrap justify-center gap-2.5 mb-4">
        {childrenProfiles.map((child) => (
          <ProfileCard
            key={child.id}
            profile={child}
            active={child.id === activeChildId}
            onSelect={() => onSelectProfile(child.id)}
            className="w-[144px] sm:w-[152px]"
          />
        ))}
      </div>
      <div className="flex justify-center gap-2.5 flex-wrap">
        <GameButton variant="orange" onClick={onExitChildMode}>
          🚪 Keluar Mode Anak
        </GameButton>
        <GameButton variant="gray" onClick={onClose}>
          Lanjut Main
        </GameButton>
      </div>
    </ModalShell>
  );
};

export interface PinPromptModalProps {
  open: boolean;
  expectedPin: string;
  onSuccess: () => void;
  onWrongPin: () => void;
  onCancel: () => void;
}

export const PinPromptModal: React.FC<PinPromptModalProps> = ({
  open,
  expectedPin,
  onSuccess,
  onWrongPin,
  onCancel,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPinInput('');
      setError('');
    }
  }, [open]);

  const verify = () => {
    if (pinInput.trim() === expectedPin) {
      onSuccess();
    } else {
      setError('PIN salah! (default: 1234)');
      onWrongPin();
    }
  };

  return (
    <ModalShell
      open={open}
      theme="indigo"
      maxWidthClass="max-w-[360px]"
      zIndexClass="z-45"
      centered
    >
      <h2 className="font-display text-xl font-bold text-indigo-900 mb-1">
        🔐 Keluar Mode Anak
      </h2>
      <p className="text-sm text-slate-700 mb-3">
        Masukkan PIN Orang Tua untuk keluar dari Mode Anak dan masuk ke Mode Ortu.
        <br />
        <small className="text-slate-500">(Default: <b>1234</b>)</small>
      </p>

      <input
        type="password"
        inputMode="numeric"
        maxLength={6}
        value={pinInput}
        onChange={(e) => setPinInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') verify();
        }}
        className="w-40 text-center text-xl tracking-[4px] px-3 py-2 rounded-xl border-2 border-slate-300 bg-white"
        autoFocus
      />

      <div className="text-xs font-bold text-red-600 min-h-[20px] mt-1.5">{error}</div>

      <div className="flex justify-center gap-2.5 mt-2">
        <GameButton variant="indigo" onClick={verify}>
          Keluar ke Mode Ortu
        </GameButton>
        <GameButton variant="gray" onClick={onCancel}>
          Batal
        </GameButton>
      </div>
    </ModalShell>
  );
};

export interface VictoryModalProps {
  open: boolean;
  islandId: number;
  profileName: string;
  score: number;
  onNextIsland: () => void;
  onOpenMap: () => void;
  onReplayIsland: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  open,
  islandId,
  profileName,
  score,
  onNextIsland,
  onOpenMap,
  onReplayIsland,
}) => {
  const isFinal = islandId >= 6;
  const nextTheme = !isFinal ? ISLAND_THEMES[islandId] : null;

  return (
    <ModalShell open={open} theme="amber" maxWidthClass="max-w-[540px]" centered>
      <h1 className="font-display text-2xl font-bold text-amber-700 mb-2">
        {isFinal ? '🏆 JUARA 6 PULAU!' : `🎉 Pulau ${islandId} Selesai!`}
      </h1>
      <p className="text-sm md:text-base text-slate-700 mb-3">
        {isFinal ? (
          <>
            Luar biasa <b>{profileName}</b>! Semua 6 Pulau Pintar sudah kamu taklukkan!
          </>
        ) : (
          <>
            Hebat <b>{profileName}</b>! Pulau {islandId + 1} (<b>{nextTheme?.name}</b>{' '}
            {nextTheme?.icon}) sekarang terbuka!
          </>
        )}
      </p>

      <div className="inline-flex items-center gap-1.5 bg-white border-[3px] border-amber-500 rounded-2xl px-4 py-1.5 font-display font-bold text-slate-900 shadow-[0_3px_0_#d97706] mb-4 tabular-nums">
        ⭐ Total Poin: {score}
      </div>

      <div className="flex justify-center gap-2.5 flex-wrap">
        <GameButton variant="green" onClick={onNextIsland}>
          {isFinal ? 'Main Lagi dari Pulau 1 🌟' : `Lanjut ke Pulau ${islandId + 1} ➡️`}
        </GameButton>
        <GameButton variant="orange" onClick={onOpenMap}>
          🗺️ Peta Pulau
        </GameButton>
        <GameButton variant="gray" onClick={onReplayIsland}>
          Ulangi Pulau 🔄
        </GameButton>
      </div>
    </ModalShell>
  );
};
