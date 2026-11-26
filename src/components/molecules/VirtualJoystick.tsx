import React, { useRef, useState } from 'react';

export interface VirtualJoystickProps {
  onJoystickChange: (active: boolean, x: number, y: number) => void;
  onJumpChange: (pressed: boolean) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onJoystickChange,
  onJumpChange,
}) => {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateStick = (clientX: number, clientY: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const maxR = 38;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnobOffset({ x: dx, y: dy });
    onJoystickChange(true, dx / maxR, dy / maxR);
  };

  const resetStick = () => {
    activeTouchIdRef.current = null;
    setKnobOffset({ x: 0, y: 0 });
    onJoystickChange(false, 0, 0);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-15 md:hidden">
      <div
        ref={zoneRef}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const t = e.changedTouches[0];
          activeTouchIdRef.current = t.identifier;
          updateStick(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
          for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === activeTouchIdRef.current) {
              updateStick(t.clientX, t.clientY);
            }
          }
        }}
        onTouchEnd={(e) => {
          for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
              resetStick();
            }
          }
        }}
        onTouchCancel={resetStick}
        className="pointer-events-auto relative w-[118px] h-[118px] rounded-full bg-white/30 border-[3px] border-white/75 touch-none"
      >
        <div
          style={{ transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)` }}
          className="pointer-events-none absolute top-[30px] left-[30px] w-[52px] h-[52px] rounded-full bg-white/95 border-[3px] border-sky-600 shadow-md"
        />
      </div>

      <button
        type="button"
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onJumpChange(true);
        }}
        onTouchEnd={() => onJumpChange(false)}
        onTouchCancel={() => onJumpChange(false)}
        onPointerDown={() => onJumpChange(true)}
        onPointerUp={() => onJumpChange(false)}
        onPointerCancel={() => onJumpChange(false)}
        className="pointer-events-auto w-[78px] h-[78px] rounded-full bg-yellow-400/95 border-4 border-yellow-700 font-display font-bold text-xs text-yellow-950 shadow-[0_4px_0_#a16207] active:translate-y-[3px] touch-none"
      >
        LOMPAT
      </button>
    </div>
  );
};
