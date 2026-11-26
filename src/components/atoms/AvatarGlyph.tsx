import React from 'react';

export interface AvatarGlyphProps {
  avatar: string;
  size?: 'sm' | 'md' | 'lg';
  colorDot?: string;
}

const SIZE_MAP = {
  sm: 'text-xl',
  md: 'text-[28px]',
  lg: 'text-4xl',
};

export const AvatarGlyph: React.FC<AvatarGlyphProps> = ({
  avatar,
  size = 'md',
  colorDot,
}) => {
  return (
    <span className="relative inline-flex items-center justify-center leading-none">
      <span className={SIZE_MAP[size]} aria-hidden="true">
        {avatar}
      </span>
      {colorDot && (
        <span
          className="absolute -top-1 -right-2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: colorDot }}
          aria-hidden="true"
        />
      )}
    </span>
  );
};
