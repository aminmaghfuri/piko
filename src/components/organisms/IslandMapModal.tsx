import React from 'react';
import { ISLAND_THEMES } from '../../design/tokens';
import { ChildProfile } from '../../types/game';
import { IslandCard } from '../molecules/IslandCard';
import { ModalShell } from '../molecules/ModalShell';

export interface IslandMapModalProps {
  open: boolean;
  profile: ChildProfile;
  currentIsland: number;
  onSelectIsland: (islandId: number) => void;
  onClose: () => void;
}

export const IslandMapModal: React.FC<IslandMapModalProps> = ({
  open,
  profile,
  currentIsland,
  onSelectIsland,
  onClose,
}) => {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="🗺️ Peta 6 Pulau Petualangan"
      subtitle={`${profile.avatar} ${profile.name} (Kls ${profile.grade}) · Terbuka: ${profile.unlockedIsland}/6`}
      theme="amber"
      maxWidthClass="max-w-[620px]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {ISLANDS_ALIAS.map((theme) => (
          <IslandCard
            key={theme.id}
            theme={theme}
            unlocked={theme.id <= profile.unlockedIsland}
            completed={profile.completedIslands.includes(theme.id)}
            current={theme.id === currentIsland}
            onSelect={() => onSelectIsland(theme.id)}
          />
        ))}
      </div>
    </ModalShell>
  );
};

const ISLANDS_ALIAS = ISLAND_THEMES;
