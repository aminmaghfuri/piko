import React from 'react';
import { ISLAND_THEMES } from '../../design/tokens';
import { ChildProfile, CompassReadout, TimerState } from '../../types/game';
import { CompassIndicator } from '../atoms/CompassIndicator';
import { HudStatBox } from '../atoms/HudStatBox';
import { PikoSpeechBubble } from '../molecules/PikoSpeechBubble';
import { VirtualJoystick } from '../molecules/VirtualJoystick';

export interface GameHudProps {
  profile: ChildProfile;
  currentIsland: number;
  crystalsCollected: number;
  compass: CompassReadout;
  timer: TimerState;
  soundEnabled: boolean;
  pikoBubbleText: string | null;
  showTouchControls: boolean;
  onOpenProfileSwitch: () => void;
  onOpenMap: () => void;
  onOpenShop: () => void;
  onOpenAssistant: () => void;
  onExitChildMode: () => void;
  onToggleSound: () => void;
  onSpeakBubble: () => void;
  onCloseBubble: () => void;
  onJoystickChange: (active: boolean, x: number, y: number) => void;
  onJumpChange: (pressed: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function formatTimer(seconds: number): string {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export const GameHud: React.FC<GameHudProps> = ({
  profile,
  currentIsland,
  crystalsCollected,
  compass,
  timer,
  soundEnabled,
  pikoBubbleText,
  showTouchControls,
  onOpenProfileSwitch,
  onOpenMap,
  onOpenShop,
  onOpenAssistant,
  onExitChildMode,
  onToggleSound,
  onSpeakBubble,
  onCloseBubble,
  onJoystickChange,
  onJumpChange,
  onZoomIn,
  onZoomOut,
}) => {
  const theme = ISLAND_THEMES[currentIsland - 1] || ISLAND_THEMES[0];
  const doneTasks = profile.tasks.filter((t) => t.done).length;
  const showTimerBadge = timer.running || timer.remainingSeconds < timer.totalSeconds;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 sm:p-5 select-none z-10">
      <header className="flex items-center justify-between gap-2.5 flex-wrap pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <HudStatBox
            tone="emerald"
            onClick={onOpenProfileSwitch}
            title="Ganti Profil Anak"
          >
            <span aria-hidden="true">{profile.avatar}</span>
            <span className="truncate max-w-[110px]">{profile.name}</span>
            <span className="opacity-80">(Kls {profile.grade})</span>
          </HudStatBox>

          <HudStatBox tone="gold" onClick={onOpenMap} title="Buka Peta 6 Pulau">
            <span aria-hidden="true">{theme.icon}</span>
            <span>P.{currentIsland}/6</span>
          </HudStatBox>

          <HudStatBox tone="amber" title="Kristal pulau ini">
            <span aria-hidden="true">💎</span>
            <span>{crystalsCollected}/12</span>
          </HudStatBox>

          <CompassIndicator
            angleDeg={compass.angleDeg}
            distanceMeters={compass.distanceMeters}
          />

          <HudStatBox tone="blue" title="Total poin">
            <span aria-hidden="true">⭐</span>
            <span>{profile.score}</span>
          </HudStatBox>

          {showTimerBadge && (
            <HudStatBox tone="purple" title="Timer fokus">
              <span aria-hidden="true">⏱️</span>
              <span>{timer.label}:</span>
              <span>{formatTimer(timer.remainingSeconds)}</span>
            </HudStatBox>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl p-1 shadow-md border-2 border-slate-200">
            <button
              type="button"
              onClick={onZoomIn}
              title="Zoom In (Perbesar)"
              className="w-9 h-9 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-display font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
            >
              🔍+
            </button>
            <button
              type="button"
              onClick={onZoomOut}
              title="Zoom Out (Perkecil)"
              className="w-9 h-9 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-display font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
            >
              🔍-
            </button>
          </div>

          <HudStatBox tone="shop" onClick={onOpenShop} title="Ganti Karakter & Gaya">
            <span aria-hidden="true">🎒</span>
            <span>Gaya</span>
          </HudStatBox>

          <HudStatBox tone="piko" onClick={onOpenAssistant} title="Buka Asisten Piko (M)">
            <span aria-hidden="true">🤖</span>
            <span>Piko</span>
            <span className="bg-yellow-300 text-amber-950 rounded-md px-1.5 py-0.5 text-[11px] leading-none">
              {doneTasks}/{profile.tasks.length}
            </span>
          </HudStatBox>

          <HudStatBox
            tone="sound"
            round
            onClick={onToggleSound}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </HudStatBox>

          <HudStatBox
            tone="amber"
            onClick={onExitChildMode}
            title="Keluar dari Mode Anak"
          >
            <span aria-hidden="true">🚪</span>
            <span className="hidden sm:inline">Keluar</span>
          </HudStatBox>
        </div>
      </header>

      <PikoSpeechBubble
        message={pikoBubbleText}
        onSpeak={onSpeakBubble}
        onOpenSchedule={onOpenAssistant}
        onClose={onCloseBubble}
      />

      {!showTouchControls && (
        <div className="pointer-events-none flex justify-end mb-2">
          <div className="bg-slate-900/60 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl text-xs font-display flex items-center gap-3 shadow-lg pointer-events-auto">
            <span><b>WASD / Panah</b>: Jalan</span>
            <span><b>Spasi</b>: Lompat</span>
            <span><b>Q / E / Seret</b>: Putar</span>
            <span><b>Scroll / Tombol 🔍</b>: Zoom</span>
          </div>
        </div>
      )}

      {showTouchControls && (
        <VirtualJoystick
          onJoystickChange={onJoystickChange}
          onJumpChange={onJumpChange}
        />
      )}
    </div>
  );
};
