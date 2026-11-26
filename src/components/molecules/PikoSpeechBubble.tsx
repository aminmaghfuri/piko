import React from 'react';
import { GameButton } from '../atoms/GameButton';

export interface PikoSpeechBubbleProps {
  message: string | null;
  onSpeak: () => void;
  onOpenSchedule: () => void;
  onClose: () => void;
}

export const PikoSpeechBubble: React.FC<PikoSpeechBubbleProps> = ({
  message,
  onSpeak,
  onOpenSchedule,
  onClose,
}) => {
  if (!message) return null;

  return (
    <div className="fixed top-16 right-3 max-w-[295px] bg-white border-[3px] border-sky-500 rounded-2xl p-3 shadow-[0_8px_22px_rgba(0,0,0,0.22)] z-20 pointer-events-auto text-sm text-slate-900">
      <div>
        <strong className="font-display text-sky-800">🤖 Piko:</strong> {message}
      </div>
      <div className="flex justify-end gap-1.5 mt-2">
        <GameButton variant="subtle" size="sm" onClick={onSpeak}>
          🔊 Dengar
        </GameButton>
        <GameButton variant="subtle" size="sm" onClick={onOpenSchedule}>
          📋 Jadwal
        </GameButton>
        <GameButton variant="subtle" size="sm" onClick={onClose}>
          Tutup
        </GameButton>
      </div>
    </div>
  );
};
