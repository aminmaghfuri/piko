import React from 'react';
import { HudStatBox } from './HudStatBox';

export interface CompassIndicatorProps {
  angleDeg: number;
  distanceMeters: number | null;
}

export const CompassIndicator: React.FC<CompassIndicatorProps> = ({
  angleDeg,
  distanceMeters,
}) => {
  return (
    <HudStatBox tone="emerald" title="Arah kristal terdekat">
      <span
        className="inline-block text-[15px] transition-transform duration-75"
        style={{ transform: `rotate(${angleDeg}deg)` }}
        aria-hidden="true"
      >
        ⬆️
      </span>
      <span className="tabular-nums">
        {distanceMeters === null ? '✓' : `${distanceMeters}m`}
      </span>
    </HudStatBox>
  );
};
